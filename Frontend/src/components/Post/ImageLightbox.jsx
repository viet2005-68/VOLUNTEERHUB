import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const normalizeIndex = (value, total) => {
  if (!Number.isFinite(value) || total <= 0) return 0;
  const mod = ((value % total) + total) % total;
  return mod;
};

export default function ImageLightbox({
  images = [],
  startIndex = 0,
  currentIndex,
  onIndexChange,
  className = "",
}) {
  const total = images.length;
  const isControlled = currentIndex !== undefined;

  const [internalIndex, setInternalIndex] = useState(() =>
    normalizeIndex(startIndex, total)
  );

  useEffect(() => {
    if (!isControlled) {
      setInternalIndex((prev) => {
        const next = normalizeIndex(startIndex, total);
        return prev === next ? prev : next;
      });
    }
  }, [isControlled, startIndex, total]);

  const activeIndex = useMemo(() => {
    if (total === 0) return 0;
    const base = isControlled
      ? normalizeIndex(currentIndex ?? 0, total)
      : internalIndex;
    return base;
  }, [currentIndex, internalIndex, isControlled, total]);

  const setActiveIndex = useCallback(
    (value) => {
      if (total === 0) return;
      const nextIndex =
        typeof value === "function" ? value(activeIndex) : value;
      const normalized = normalizeIndex(nextIndex, total);

      if (!isControlled) {
        setInternalIndex((prev) => (prev === normalized ? prev : normalized));
      }

      if (onIndexChange && normalized !== activeIndex) {
        onIndexChange(normalized);
      }
    },
    [activeIndex, isControlled, onIndexChange, total]
  );

  // Keyboard navigation
  useEffect(() => {
    if (total <= 1) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => i - 1);
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveIndex, total]);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Không có ảnh
      </div>
    );
  }

  const goToPrevious = () => {
    setActiveIndex((i) => i - 1);
  };

  const goToNext = () => {
    setActiveIndex((i) => i + 1);
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-md ${className}`}
    >
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-10"
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
        </button>
      )}

      <img
        src={images[activeIndex]}
        alt={`Ảnh ${activeIndex + 1} / ${images.length}`}
        className="max-h-[50vh] md:max-h-[85vh] max-w-full w-auto h-auto object-contain select-none"
        draggable={false}
      />

      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-10"
          aria-label="next-image"
        >
          <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs md:text-sm font-medium">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
