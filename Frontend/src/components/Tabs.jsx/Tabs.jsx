import React from "react";
import { NavLink } from "react-router-dom";

export default function Tabs({
  items = [],
  asLink = false,
  activeKey: controlledActive,
  defaultKey,
  onChange,
  variant = "header",
}) {
  const [active, setActive] = React.useState(
    defaultKey || (items[0] && items[0].key)
  );

  const isControlled =
    controlledActive !== undefined && controlledActive !== null;
  const current = isControlled ? controlledActive : active;

  function handleSelect(key) {
    if (!isControlled) setActive(key);
    onChange?.(key);
  }

  const baseClass =
    variant === "header"
      ? "w-full rounded-[20px] bg-ash-whisper p-1.5 flex flex-1 items-center justify-around gap-2 overflow-x-auto text-center"
      : "inline-flex gap-2 items-center";

  const tabClass = (isActive) =>
    [
      "flex-1 min-w-fit px-5 py-3 rounded-[10px] text-sm font-bold leading-[0.85] text-center max-sm:text-xs transition-colors",
      isActive
        ? "bg-bubblegum-blush text-pale-canvas"
        : "text-deep-forest hover:bg-bubblegum-blush/40",
    ].join(" ");

  return (
    <div className={baseClass} role="tablist" aria-label="Tabs">
      {items.map((it) => {
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
      })}
    </div>
  );
}
