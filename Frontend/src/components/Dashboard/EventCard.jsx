import React from "react";

function EventCard({ label, value, icon, growth }) {
  const displayValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim())
      ? value
      : "—";

  return (
    <div className="h-full text-deep-forest">
      <div className="h-full min-h-40 overflow-hidden rounded-2xl border border-deep-forest/15 bg-pale-canvas p-5">
        <div className="flex h-full justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-deep-forest/55 max-sm:text-sm">
              {label}
            </div>
            <div className="mt-3 flex min-w-0 items-baseline gap-2">
              <div className="max-w-full truncate text-4xl font-bold leading-none text-deep-forest max-sm:text-2xl">
                {displayValue}
              </div>
              {growth && (
                <span className="shrink-0 text-sm font-bold text-foudre-pink">
                  {growth}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-end text-foudre-pink">{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
