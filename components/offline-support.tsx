"use client";

import { useEffect, useState } from "react";

const QUEUE_KEY = "invoicelift:submission-queue";

type QueuedSubmission = {
  url: string;
  method: string;
  body: string;
  queuedAt: number;
};

/** Read the offline submission queue from localStorage. */
function readQueue(): QueuedSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedSubmission[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSubmission[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Queue a form submission for delivery when the app is back online. Callers use
 * this instead of a bare `fetch` for any mutation that must survive a dropped
 * connection; it sends immediately when online and buffers otherwise.
 */
export async function queueSubmission(url: string, body: unknown): Promise<"sent" | "queued"> {
  const payload = JSON.stringify(body);
  if (navigator.onLine) {
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      return "sent";
    } catch {
      // fall through to queue on failure
    }
  }
  const queue = readQueue();
  queue.push({ url, method: "POST", body: payload, queuedAt: Date.now() });
  writeQueue(queue);
  return "queued";
}

async function flushQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;
  const remaining: QueuedSubmission[] = [];
  for (const item of queue) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.body,
      });
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
  return queue.length - remaining.length;
}

/**
 * Registers the service worker, shows an offline banner, and flushes any queued
 * submissions when connectivity returns (issue #31). Rendered once from the
 * root layout.
 */
export function OfflineSupport() {
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; the app still works online */
      });
    }

    const sync = () => {
      setOffline(!navigator.onLine);
      setPending(readQueue().length);
    };
    sync();

    const handleOnline = async () => {
      setOffline(false);
      await flushQueue();
      setPending(readQueue().length);
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <span className="offline-dot" aria-hidden />
      You are offline — showing the last synced data.
      {pending > 0 ? ` ${pending} submission${pending === 1 ? "" : "s"} will send when you reconnect.` : ""}
    </div>
  );
}
