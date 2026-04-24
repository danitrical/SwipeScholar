"use client";

import { useEffect, useRef, useState } from "react";
import { ScoredProfessor } from "@/lib/types";
import ProfCard from "./ProfCard";

interface SwipeStackProps {
  professors: ScoredProfessor[];
  onSave: (prof: ScoredProfessor) => void;
  onSkip: (prof: ScoredProfessor) => void;
  onDone: () => void;
  savedCount: number;
}

export default function SwipeStack({
  professors,
  onSave,
  onSkip,
  onDone,
  savedCount,
}: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = professors[currentIndex];
  const next = professors[currentIndex + 1];
  const done = currentIndex >= professors.length;

  const swipe = (dir: "left" | "right") => {
    if (isAnimating || done) return;
    setExitDir(dir);
    setIsAnimating(true);
    if (dir === "right") onSave(current);
    else onSkip(current);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setExitDir(null);
      setIsAnimating(false);
      setDragX(0);
    }, 320);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") swipe("left");
      if (e.key === "ArrowRight") swipe("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Touch/mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - dragStartX.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > 100) {
      swipe(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
  };

  const cardTransform = () => {
    if (exitDir === "right") return "translate(150%, -10px) rotate(20deg)";
    if (exitDir === "left") return "translate(-150%, -10px) rotate(-20deg)";
    if (isDragging || dragX !== 0) {
      const rot = dragX * 0.08;
      return `translate(${dragX}px, 0) rotate(${rot}deg)`;
    }
    return "translate(0, 0) rotate(0deg)";
  };

  const cardOpacity = () => {
    if (exitDir) return 0;
    if (isDragging) return 1 - Math.abs(dragX) / 400;
    return 1;
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center px-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All done!</h2>
        <p className="text-gray-500 mb-6">
          You saved <span className="font-bold text-[#D85A30]">{savedCount}</span> professor
          {savedCount !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onDone}
          className="px-8 py-3 rounded-xl font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#D85A30" }}
        >
          View my matches →
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Progress */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4 px-1">
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {professors.length}
        </span>
        <span className="text-sm font-semibold" style={{ color: "#D85A30" }}>
          ❤️ {savedCount} saved
        </span>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[480px]">
        {/* Next card (behind) */}
        {next && (
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{
              transform: "scale(0.95) translateY(12px)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            <ProfCard professor={next} />
          </div>
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            transform: cardTransform(),
            opacity: cardOpacity(),
            transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease",
            zIndex: 2,
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ProfCard professor={current} />

          {/* Drag hint overlays */}
          {isDragging && dragX > 30 && (
            <div className="absolute top-6 left-6 z-10 bg-[#639922] text-white text-lg font-bold px-4 py-2 rounded-xl rotate-[-8deg] shadow-lg">
              SAVE ❤️
            </div>
          )}
          {isDragging && dragX < -30 && (
            <div className="absolute top-6 right-6 z-10 bg-gray-500 text-white text-lg font-bold px-4 py-2 rounded-xl rotate-[8deg] shadow-lg">
              SKIP ✕
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-8 mt-6">
        <button
          onClick={() => swipe("left")}
          disabled={isAnimating}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
          title="Skip (←)"
        >
          ✕
        </button>
        <button
          onClick={() => swipe("right")}
          disabled={isAnimating}
          className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: "#D85A30", color: "white" }}
          title="Save (→)"
        >
          ❤
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Drag, click buttons, or use ← → arrow keys
      </p>
    </div>
  );
}
