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
      ? "w-full rounded-full bg-blue-100  py-1 flex flex-1 items-center justify-around max-sm:py-0.5 max-sm:gap-0.5 text-center"
      : "inline-flex gap-2 items-center";

  const tabClass = (isActive) =>
    [
      "flex-1 ml-1 mr-1 py-1 rounded-2xl text-sm font-medium text-center max-sm:text-xs",
      isActive ? "bg-white shadow-sm" : "text-gray-700",
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
