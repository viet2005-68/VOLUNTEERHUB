import React from "react";

function EventCard({ label, value, icon, growth, unit }) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value.trim())
      ? Number(value)
      : null;
  const displayValue =
    numericValue !== null && Number.isFinite(numericValue)
      ? new Intl.NumberFormat("en-US", {
          maximumFractionDigits: numericValue % 1 === 0 ? 0 : 1,
        }).format(numericValue)
      : "—";

  return (
    <div className="h-full text-deep-forest">
      <div className="h-full min-h-40 overflow-hidden rounded-2xl border border-deep-forest/15 bg-pale-canvas p-5">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-base font-bold text-deep-forest/55 max-sm:text-sm">
              {label}
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-ash-whisper text-deep-forest [&_svg]:h-7 [&_svg]:w-7 [&_svg]:text-deep-forest">
              {icon}
            </div>
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <div className="max-w-full truncate text-4xl font-bold leading-none text-deep-forest max-sm:text-2xl">
              {displayValue}
            </div>
            {unit && (
              <span className="shrink-0 text-sm font-bold text-deep-forest/55">
                {unit}
              </span>
            )}
            {growth && (
              <span className="shrink-0 text-sm font-bold text-deep-forest">
                {growth}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
