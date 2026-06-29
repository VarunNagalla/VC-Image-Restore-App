"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CompareSliderProps {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  initialPosition?: number;
}

/** A draggable before/after comparison slider. Works with mouse, touch, and keyboard. */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
  initialPosition = 50,
}: CompareSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(initialPosition);
  const draggingRef = React.useRef(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  React.useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      updateFromClientX(e.clientX);
    }
    function onUp() {
      draggingRef.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-border bg-surface-muted",
        className
      )}
      onPointerDown={(e) => {
        draggingRef.current = true;
        updateFromClientX(e.clientX);
      }}
    >
      <div className="absolute inset-0">{after}</div>
      <span className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        {afterLabel}
      </span>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {before}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {beforeLabel}
        </span>
      </div>

      <div
        className="absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M8 5L2 12L8 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 5L22 12L16 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Comparison slider position"
        className="absolute inset-x-0 bottom-2 z-30 mx-auto w-1/2 opacity-0 sm:opacity-0"
      />
    </div>
  );
}
