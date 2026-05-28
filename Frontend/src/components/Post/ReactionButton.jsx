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
  const popupRef = useRef(null);
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
    const popupEl = popupRef.current;
    if (popupEl && nextTarget && popupEl.contains(nextTarget)) {
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
          ref={popupRef}
          className="absolute bottom-[calc(100%+18px)] left-0 z-[100] select-none"
          onPointerEnter={onBarPointerEnter}
          onPointerLeave={onBarPointerLeave}
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-[18px] left-0 right-0 h-[18px]"
          />
          <div
            ref={barRef}
            className="bg-pale-canvas rounded-3xl px-2 py-3 shadow-2xl border border-ash-whisper flex items-center gap-3"
            onPointerMove={onBarPointerMove}
            onPointerUp={onBarPointerUp}
          >
            {REACTIONS.map((r, i) => {
              const isHover = i === hoverIndex;
              return (
                <div
                  key={r.key}
                  className={`w-12 h-12 flex items-center justify-center text-2xl transition-all duration-200 rounded-full ${
                    isHover
                      ? "transform -translate-y-3 scale-125 bg-ash-whisper"
                      : "hover:bg-ash-whisper/70"
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
        className={`inline-flex min-h-[48px] items-center gap-3 rounded-[10px] px-5 py-2.5 transition-all duration-200 ${
          current
            ? "bg-ash-whisper text-deep-forest shadow-sm"
            : "bg-pale-canvas hover:bg-ash-whisper text-deep-forest/75 hover:text-deep-forest"
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
