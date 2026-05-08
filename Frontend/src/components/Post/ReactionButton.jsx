// ReactionButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";

const REACTIONS = [
  { key: "like", label: "👍", text: "Like" },
  { key: "love", label: "❤️", text: "Love" },
  { key: "haha", label: "😂", text: "Haha" },
  { key: "wow", label: "😮", text: "Wow" },
  { key: "sad", label: "😢", text: "Sad" },
  { key: "angry", label: "😡", text: "Angry" },
];

export default function ReactionButton({
  initialReaction = null,
  onReact,
  small = false,
}) {
  const [current, setCurrent] = useState(initialReaction);
  const [showBar, setShowBar] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const holderRef = useRef(null);
  const barRef = useRef(null);
  const pressTimer = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    setCurrent(initialReaction);
  }, [initialReaction]);

  useEffect(() => {
    return () => {
      clearTimeout(pressTimer.current);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const cancelHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const choose = (key) => {
    setCurrent(key);
    setShowBar(false);
    setHoverIndex(-1);
    onReact?.(key);
  };

  const clear = () => {
    setCurrent(null);
    onReact?.(null);
  };

  const closeBar = () => {
    cancelHideTimer();
    setShowBar(false);
    setHoverIndex(-1);
  };

  const closeBarSoon = () => {
    cancelHideTimer();
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setShowBar(false);
      setHoverIndex(-1);
    }, 150);
  };

  // toggle on quick click
  const handleClick = () => {
    // if bar was open (due to hover)
    if (showBar) return;
    if (current) {
      clear();
    } else {
      choose("like"); // Add like reaction
    }
  };

  // pointer (long-press) logic
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelHideTimer();
    pressTimer.current = setTimeout(() => {
      setShowBar(true);
      updateHoverFromPointer(e);
    }, 350);
    holderRef.current?.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e) => {
    clearTimeout(pressTimer.current);
    if (showBar) {
      if (hoverIndex >= 0) choose(REACTIONS[hoverIndex].key);
      else closeBar();
    } else {
      // handled in onClick
    }
    try {
      holderRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore if pointer capture was not set */
    }
  };
  const onPointerMove = (e) => {
    if (!showBar) return;
    updateHoverFromPointer(e);
  };
  const onPointerCancel = () => {
    clearTimeout(pressTimer.current);
    closeBar();
  };

  // hover for desktop: show popup after small delay on hover
  const hoverTimer = useRef(null);
  const onMouseEnter = () => {
    cancelHideTimer();
    hoverTimer.current = setTimeout(() => setShowBar(true), 400);
  };
  const onMouseLeave = (e) => {
    clearTimeout(hoverTimer.current);
    const nextTarget = e.relatedTarget;
    const barEl = barRef.current;
    if (barEl && nextTarget && barEl.contains(nextTarget)) {
      return;
    }
    closeBarSoon();
  };

  const updateHoverFromPointer = (e) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX;
    const rel = Math.max(0, Math.min(rect.width, x - rect.left));
    const itemW = rect.width / REACTIONS.length;
    const centerIdx = Math.floor((rel + itemW / 2) / itemW);
    setHoverIndex(Math.max(0, Math.min(REACTIONS.length - 1, centerIdx)));
  };

  const onBarPointerMove = (e) => {
    updateHoverFromPointer(e);
  };

  const onBarPointerEnter = () => {
    cancelHideTimer();
  };

  const onBarPointerLeave = (e) => {
    const holderEl = holderRef.current;
    if (holderEl && e.relatedTarget && holderEl.contains(e.relatedTarget)) {
      setHoverIndex(-1);
      return;
    }
    closeBarSoon();
  };

  const onBarPointerUp = () => {
    if (hoverIndex >= 0) choose(REACTIONS[hoverIndex].key);
    else closeBar();
  };

  return (
    <div className="relative inline-block z-10">
      {/* Reaction popup */}
      {showBar && (
        <div
          ref={barRef}
          className="absolute bottom-full mb-3 left-0 select-none z-100"
          onPointerEnter={onBarPointerEnter}
          onPointerMove={onBarPointerMove}
          onPointerLeave={onBarPointerLeave}
          onPointerUp={onBarPointerUp}
        >
          <div className="bg-white rounded-3xl px-2 py-3 shadow-2xl border border-blue-200 flex items-center gap-3">
            {REACTIONS.map((r, i) => {
              const isHover = i === hoverIndex;
              return (
                <div
                  key={r.key}
                  className={`w-12 h-12 flex items-center justify-center text-2xl transition-all duration-200 rounded-full ${
                    isHover
                      ? "transform -translate-y-3 scale-125 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Button holder */}
      <div
        ref={holderRef}
        role="button"
        tabIndex={0}
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
          current
            ? "bg-blue-100 text-blue-700 shadow-md"
            : "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
        } cursor-pointer select-none font-semibold`}
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerCancel={onPointerCancel}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={`w-7 h-7 flex items-center justify-center text-xl`}>
          {current ? (
            // Show emoji for current reaction
            <span>
              {REACTIONS.find((r) => r.key === current)?.label || "👍"}
            </span>
          ) : (
            // Show ThumbsUp icon when no reaction
            <ThumbsUp className="w-5 h-5" />
          )}
        </div>
        <span>
          {small
            ? ""
            : current
            ? REACTIONS.find((r) => r.key === current)?.text || "Like"
            : "Like"}
        </span>
      </div>
    </div>
  );
}
