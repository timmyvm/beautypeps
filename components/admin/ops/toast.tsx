"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/*
 * Tiny toast store. Toasts outlive the form that raised them, so a status
 * change that re-renders the page (and unmounts its form) still shows feedback.
 */
type Toast = { id: number; message: string; ok: boolean };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, ok = true) {
  toasts = [...toasts.slice(-3), { id: nextId++, message, ok }];
  emit();
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => toasts;
const EMPTY: Toast[] = [];
const getServerSnapshot = () => EMPTY;

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2 print:hidden" aria-live="polite">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t }: { toast: Toast }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), t.ok ? 4500 : 8000);
    return () => clearTimeout(timer);
  }, [t.id, t.ok]);

  const Icon = t.ok ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={t.ok ? "status" : "alert"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 border px-4 py-3 text-sm shadow-lg shadow-ink/10 animate-fade-up", // taste-skill-ignore: a toast floats over the screen
        t.ok ? "border-sage/30 bg-white text-ink" : "border-danger/30 bg-danger-light text-danger",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", t.ok ? "text-sage" : "text-danger")} aria-hidden />
      <p className="flex-1">{t.message}</p>
      <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-ink">
        <X className="size-4" />
      </button>
    </div>
  );
}
