"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

interface CompareSliderProps {
  before: string;
  after: string;
}

export default function CompareSlider({ before, after }: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { updatePosition(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 cursor-col-resize select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (full width behind) */}
      <Image src={after} alt="Com recomendações" fill className="object-cover" />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div className="relative w-full h-full" style={{ width: containerRef.current?.offsetWidth ?? 400 }}>
          <Image src={before} alt="Original" fill className="object-cover" />
        </div>
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-3 text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded-full pointer-events-none">
        Original
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded-full pointer-events-none">
        Com recomendações
      </div>
    </div>
  );
}
