"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny external store. Server renders always see `initial`; the browser loads
 * the persisted value after hydration (useSyncExternalStore handles the swap
 * without a hydration mismatch). Optional localStorage persistence with
 * cross-tab sync.
 */
export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
  initial: T;
}

export function createStore<T>(initial: T, opts: { key?: string; validate?: (v: unknown) => T | null } = {}): Store<T> {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T | null => {
    if (!opts.key) return null;
    try {
      const raw = window.localStorage.getItem(opts.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      return opts.validate ? opts.validate(parsed) : (parsed as T);
    } catch {
      return null;
    }
  };

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    const v = read();
    if (v !== null) state = v;
    if (opts.key) {
      window.addEventListener("storage", (e) => {
        if (e.key !== opts.key) return;
        const next = read();
        state = next ?? initial;
        listeners.forEach((l) => l());
      });
    }
  };

  return {
    initial,
    get: () => {
      load();
      return state;
    },
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (opts.key) {
        try {
          window.localStorage.setItem(opts.key, JSON.stringify(state));
        } catch {
          /* storage full or blocked: keep in memory */
        }
      }
      listeners.forEach((l) => l());
    },
    subscribe: (fn) => {
      load();
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** Subscribe to a store. Selectors must return stable values (primitives or existing references). */
export function useStore<T, S = T>(store: Store<T>, selector?: (s: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => (selector ? selector(store.get()) : (store.get() as unknown as S)),
    () => (selector ? selector(store.initial) : (store.initial as unknown as S)),
  );
}

/** True only after hydration — for UI that must wait for client-only data. */
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
