"use client";

// Client-side notification store for the notification centre (issue #21).
// Persisted to localStorage ("backend" in the acceptance-criteria sense —
// there is no notifications API/table in invoicelift-backend yet, so this
// is the pragmatic client-persisted stand-in other features in this app use
// (see lib/offline-support's submission queue for the same pattern).
const KEY = "invoicelift:notifications";
const CHANGE_EVENT = "invoicelift:notifications-changed";

export type NotificationType =
  | "invoice_verified"
  | "payment_due"
  | "repayment_received"
  | "default_flagged";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
}

const SEED: Omit<AppNotification, "id" | "createdAt" | "read">[] = [
  { type: "invoice_verified", message: "Invoice INV-1042 was verified by the buyer." },
  { type: "payment_due", message: "Invoice INV-1038 payment is due in 3 days." },
  { type: "repayment_received", message: "Repayment of 4,200 USDC received on Lagos Trade Finance Pool." },
  { type: "default_flagged", message: "Invoice INV-0997 was flagged as in default." },
];

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = SEED.map((n, i) => ({
        ...n,
        id: `seed-${i}`,
        createdAt: new Date(Date.now() - i * 3_600_000).toISOString(),
        read: false,
      }));
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function writeAll(notifications: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getNotifications(): AppNotification[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(): number {
  return readAll().filter((n) => !n.read).length;
}

export function markRead(id: string) {
  const all = readAll();
  const target = all.find((n) => n.id === id);
  if (target) target.read = true;
  writeAll(all);
}

export function markAllRead() {
  const all = readAll().map((n) => ({ ...n, read: true }));
  writeAll(all);
}

/** Re-invokes `callback` whenever the notification store changes, in this tab or another. */
export function subscribeToNotifications(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
