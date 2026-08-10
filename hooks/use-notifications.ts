"use client";

import { useState } from "react";

export type NotificationEvent =
  | "invoice_verified"
  | "payment_due"
  | "repayment_received"
  | "default_flagged";

export interface Notification {
  id: string;
  type: NotificationEvent;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "ifl_notifications";

const EVENT_LABELS: Record<NotificationEvent, { title: string; body: string }> = {
  invoice_verified: { title: "Invoice Verified", body: "Your invoice has been verified and added to the registry." },
  payment_due: { title: "Payment Due", body: "A payment is due soon on your financed invoice." },
  repayment_received: { title: "Repayment Received", body: "A repayment has been received for your invoice." },
  default_flagged: { title: "Default Flagged", body: "An invoice has been flagged as defaulted." },
};

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(ns: Notification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ns));
  } catch {
    // silently ignore
  }
}

/** Generate a few sample notifications for demo purposes. */
function seedNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      type: "invoice_verified",
      title: EVENT_LABELS.invoice_verified.title,
      body: EVENT_LABELS.invoice_verified.body,
      timestamp: now - 1000 * 60 * 5,
      read: false,
    },
    {
      id: "n2",
      type: "payment_due",
      title: EVENT_LABELS.payment_due.title,
      body: EVENT_LABELS.payment_due.body,
      timestamp: now - 1000 * 60 * 30,
      read: false,
    },
    {
      id: "n3",
      type: "repayment_received",
      title: EVENT_LABELS.repayment_received.title,
      body: EVENT_LABELS.repayment_received.body,
      timestamp: now - 1000 * 60 * 120,
      read: true,
    },
  ];
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = loadNotifications();
    return stored.length > 0 ? stored : seedNotifications();
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  }

  function markAllRead() {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }

  function addNotification(type: NotificationEvent) {
    const label = EVENT_LABELS[type];
    const n: Notification = {
      id: `n${Date.now()}`,
      type,
      title: label.title,
      body: label.body,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => {
      const next = [n, ...prev];
      saveNotifications(next);
      return next;
    });
  }

  return { notifications, unreadCount, markRead, markAllRead, addNotification };
}