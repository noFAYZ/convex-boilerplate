"use client";

import { useState, useCallback, useEffect } from "react";

export type Toast = {
  id: string;
  type: "success" | "error" | "loading" | "info";
  title: string;
  description?: string;
  progress?: number; // 0-100
  duration?: number; // ms
};

type Listener = (toasts: Toast[]) => void;

class ToastStore {
  private toasts: Toast[] = [];
  private listeners: Set<Listener> = new Set();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  private generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  private scheduleRemove(id: string, duration: number) {
    if (duration === Infinity) return;

    const existingTimeout = this.timeouts.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.timeouts.set(id, timeout);
  }

  private add(toast: Toast) {
    this.toasts.push(toast);
    this.notify();

    if (toast.duration !== undefined && toast.duration !== Infinity) {
      this.scheduleRemove(toast.id, toast.duration);
    }
  }

  success(title: string, description?: string) {
    const id = this.generateId();
    this.add({
      id,
      type: "success",
      title,
      description,
      duration: 4000,
    });
    return id;
  }

  error(title: string, description?: string) {
    const id = this.generateId();
    this.add({
      id,
      type: "error",
      title,
      description,
      duration: 5000,
    });
    return id;
  }

  loading(title: string, description?: string) {
    const id = this.generateId();
    this.add({
      id,
      type: "loading",
      title,
      description,
      duration: Infinity,
    });
    return id;
  }

  info(title: string, description?: string) {
    const id = this.generateId();
    this.add({
      id,
      type: "info",
      title,
      description,
      duration: 4000,
    });
    return id;
  }

  progress(id: string, progress: number, title?: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast) {
      toast.progress = progress;
      if (title) toast.title = title;
      this.notify();
    }
  }

  dismiss(id: string) {
    const timeout = this.timeouts.get(id);
    if (timeout) clearTimeout(timeout);
    this.timeouts.delete(id);

    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.toasts = [];
    this.notify();
  }
}

const store = new ToastStore();

export function useToastStore() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = store.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return toasts;
}

export const toast = {
  success: (title: string, description?: string) => store.success(title, description),
  error: (title: string, description?: string) => store.error(title, description),
  loading: (title: string, description?: string) => store.loading(title, description),
  info: (title: string, description?: string) => store.info(title, description),
  progress: (id: string, progress: number, title?: string) => store.progress(id, progress, title),
  dismiss: (id: string) => store.dismiss(id),
  clear: () => store.clear(),
};
