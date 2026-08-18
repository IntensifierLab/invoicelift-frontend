"use client";

import { useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
  unreadCount,
  type AppNotification,
} from "@/lib/notifications/store";
import styles from "./notifications.module.css";

const TYPE_LABEL: Record<AppNotification["type"], string> = {
  invoice_verified: "Verified",
  payment_due: "Payment due",
  repayment_received: "Repayment",
  default_flagged: "Default",
};

/** Bell icon with unread badge and notification drawer (issue #21). */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [count, setCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setNotifications(getNotifications());
    setCount(unreadCount());
  };

  useEffect(() => {
    refresh();
    return subscribeToNotifications(refresh);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className={styles.bellWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        aria-expanded={open}
      >
        🔔
        {count > 0 && (
          <span className={styles.badge} aria-hidden>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.drawer} role="dialog" aria-label="Notifications">
          <div className={styles.drawerHeader}>
            <strong>Notifications</strong>
            {count > 0 && (
              <button type="button" className={styles.markAll} onClick={() => markAllRead()}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No notifications yet.</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => (
                <li key={n.id} className={`${styles.item} ${!n.read ? styles.unread : ""}`}>
                  <span className={`${styles.dot} ${n.read ? styles.dotRead : ""}`} aria-hidden />
                  <div className={styles.itemBody}>
                    <p className={styles.itemMessage}>{n.message}</p>
                    <p className={styles.itemMeta}>
                      {TYPE_LABEL[n.type]} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {!n.read && (
                      <button type="button" className={styles.markOne} onClick={() => markRead(n.id)}>
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
