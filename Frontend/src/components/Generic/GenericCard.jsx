// GenericCard.jsx
export default function GenericCard({
  children,
  className = "",
  badge,
  badgeClass = "",
  actions,
}) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0">{children}</div>
        {badge && (
          <span
            className={`text-sm px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}
