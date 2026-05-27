import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Tabs({
  items = [],
  asLink = false,
  activeKey: controlledActive,
  defaultKey,
  onChange,
  variant = "header",
}) {
  const scrollerRef = React.useRef(null);
  const [active, setActive] = React.useState(
    defaultKey || (items[0] && items[0].key)
  );
  const [showScrollButtons, setShowScrollButtons] = React.useState(false);

  const isControlled =
    controlledActive !== undefined && controlledActive !== null;
  const current = isControlled ? controlledActive : active;

  const updateScrollButtonVisibility = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setShowScrollButtons(scroller.scrollWidth > scroller.clientWidth + 2);
  }, []);

  React.useEffect(() => {
    const frame = requestAnimationFrame(updateScrollButtonVisibility);
    window.addEventListener("resize", updateScrollButtonVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateScrollButtonVisibility);
    };
  }, [items.length, updateScrollButtonVisibility]);

  function handleSelect(key) {
    if (!isControlled) setActive(key);
    onChange?.(key);
  }

  function scrollTabs(direction) {
    scrollerRef.current?.scrollBy({
      left: direction * 180,
      behavior: "smooth",
    });
  }

  const baseClass =
    variant === "header"
      ? "flex flex-1 items-center justify-around gap-2 overflow-x-auto text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      : "inline-flex gap-2 items-center";

  const tabClass = (isActive) =>
    [
      "flex-1 min-w-fit px-5 py-3 rounded-[10px] text-sm font-bold leading-[0.85] text-center max-sm:text-xs transition-colors",
      isActive
        ? "bg-bubblegum-blush text-deep-forest"
        : "text-deep-forest hover:bg-bubblegum-blush/40",
    ].join(" ");

  const tabItems = items.map((it) => {
    const displayLabel = it.shortLabel ? (
      <>
        <span className="hidden md:inline">{it.label}</span>
        <span className="md:hidden">{it.shortLabel}</span>
      </>
    ) : (
      it.label
    );

    if (asLink && it.to) {
      return (
        <NavLink
          key={it.key}
          to={it.to}
          className={({ isActive }) => tabClass(isActive)}
          end
        >
          <div className="px-[0px]">{displayLabel}</div>
        </NavLink>
      );
    }

    const isActive = current === it.key;
    return (
      <button
        key={it.key}
        role="tab"
        aria-selected={isActive}
        className={tabClass(isActive)}
        onClick={() => handleSelect(it.key)}
      >
        {displayLabel}
      </button>
    );
  });

  if (variant !== "header") {
    return (
      <div className={baseClass} role="tablist" aria-label="Tabs">
        {tabItems}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-[20px] bg-ash-whisper p-1.5">
      {showScrollButtons && (
        <button
          type="button"
          onClick={() => scrollTabs(-1)}
          className="absolute left-1 top-1/2 z-10 inline-flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-pale-canvas text-deep-forest md:hidden"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
      )}
      <div
        ref={scrollerRef}
        className={`${baseClass} ${showScrollButtons ? "px-[34px]" : "px-0"} md:px-0`}
        role="tablist"
        aria-label="Tabs"
      >
        {tabItems}
      </div>
      {showScrollButtons && (
        <button
          type="button"
          onClick={() => scrollTabs(1)}
          className="absolute right-1 top-1/2 z-10 inline-flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-pale-canvas text-deep-forest md:hidden"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
}
