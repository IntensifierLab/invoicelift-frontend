"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchPositionsSnapshot, INITIAL_POSITIONS } from "@/lib/repayments/mock-source";
import type { ConnectionState, LenderPosition, RepaymentEvent } from "@/lib/repayments/types";

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 16000;
const POLL_INTERVAL_MS = 5000;
/** How often a polling client retries the WebSocket to recover to "live". */
const WS_RETRY_FROM_POLLING_MS = 30000;

function backoffDelay(attempt: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** attempt, MAX_BACKOFF_MS);
}

function isRepaymentEvent(value: unknown): value is RepaymentEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "repayment.updated" &&
    typeof (value as { position?: unknown }).position === "object"
  );
}

type RepaymentContextValue = {
  positions: LenderPosition[];
  connectionState: ConnectionState;
};

const RepaymentContext = createContext<RepaymentContextValue | undefined>(undefined);

/**
 * Provides live lender-position updates over a WebSocket (issue #29), with
 * exponential-backoff reconnect and an automatic fallback to REST polling if
 * the socket can't be established after `MAX_RECONNECT_ATTEMPTS`. While
 * polling, it periodically retries the WebSocket in the background so the UI
 * can recover to "live" without a manual refresh.
 *
 * Control flow (poll-vs-reconnect, attempt counts) is tracked in refs rather
 * than React state, since it's read from inside long-lived WebSocket event
 * callbacks where a state closure would go stale; `connectionState` state is
 * only ever written, never branched on, so it's safe for rendering.
 */
export function RepaymentWsProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<LenderPosition[]>(INITIAL_POSITIONS);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const isPollingRef = useRef(false);
  const positionsRef = useRef(positions);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRetryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  /** Stable indirection so timer callbacks always invoke the latest `connect`. */
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  const applyPosition = useCallback((incoming: LenderPosition) => {
    setPositions((prev) => {
      const idx = prev.findIndex((p) => p.poolId === incoming.poolId);
      if (idx === -1) return [...prev, incoming];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  }, []);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (wsRetryTimerRef.current) {
      clearInterval(wsRetryTimerRef.current);
      wsRetryTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    isPollingRef.current = true;
    setConnectionState("polling");

    if (!pollTimerRef.current) {
      pollTimerRef.current = setInterval(() => {
        fetchPositionsSnapshot(positionsRef.current).then((next) => {
          if (mountedRef.current) setPositions(next);
        });
      }, POLL_INTERVAL_MS);
    }

    if (!wsRetryTimerRef.current) {
      wsRetryTimerRef.current = setInterval(() => {
        attemptRef.current = 0;
        connectRef.current();
      }, WS_RETRY_FROM_POLLING_MS);
    }
  }, []);

  const scheduleReconnectOrPoll = useCallback(() => {
    if (!mountedRef.current) return;

    if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      startPolling();
      return;
    }

    setConnectionState("reconnecting");
    const delay = backoffDelay(attemptRef.current);
    attemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => connectRef.current(), delay);
  }, [startPolling]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const wsUrl =
      process.env.NEXT_PUBLIC_REPAYMENTS_WS_URL ??
      (typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/repayments`
        : undefined);

    if (!wsUrl) {
      startPolling();
      return;
    }

    if (!isPollingRef.current) setConnectionState("connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
    } catch {
      scheduleReconnectOrPoll();
      return;
    }
    socketRef.current = socket;

    socket.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      stopPolling();
      setConnectionState("live");
    };

    socket.onmessage = (event) => {
      try {
        const parsed: unknown = JSON.parse(event.data);
        if (isRepaymentEvent(parsed)) applyPosition(parsed.position);
      } catch {
        // Ignore malformed frames; the connection itself is still healthy.
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      socketRef.current = null;
      if (!mountedRef.current) return;
      // A background recovery attempt failed while already polling — the
      // poll interval and the next retry timer tick are still doing their
      // job, so there's nothing more to do here.
      if (isPollingRef.current) return;
      scheduleReconnectOrPoll();
    };
  }, [applyPosition, scheduleReconnectOrPoll, startPolling, stopPolling]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connectRef.current();

    return () => {
      mountedRef.current = false;
      socketRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (wsRetryTimerRef.current) clearInterval(wsRetryTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RepaymentContext.Provider value={{ positions, connectionState }}>
      {children}
    </RepaymentContext.Provider>
  );
}

/** Live lender positions and the current transport state (live/polling/etc). */
export function useRepayments(): RepaymentContextValue {
  const ctx = useContext(RepaymentContext);
  if (!ctx) throw new Error("useRepayments must be used within a RepaymentWsProvider");
  return ctx;
}
