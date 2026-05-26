import React, { useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import useClickOutside from "../../hook/ClickOutside";

export default function DropdownSelect({
  value,
  onChange,
  options = [],
  className = "",
  placeholder = "Select...",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-[10px] border-2 border-ash-whisper bg-pale-canvas px-4 py-4 text-left text-sm font-bold leading-[0.85] text-deep-forest transition-colors hover:bg-ash-whisper focus:outline-none focus-visible:border-foudre-pink disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? "border-foudre-pink bg-ash-whisper" : ""
        }`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={`w-4 h-4 ml-2 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-[10050] mt-2 max-h-64 w-full overflow-y-auto rounded-[10px] border-2 border-ash-whisper bg-pale-canvas py-2 text-sm font-bold leading-[1.2] text-deep-forest">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex cursor-pointer items-center justify-between px-4 py-3 font-medium transition-colors hover:bg-ash-whisper ${
                opt.value === value ? "bg-ash-whisper text-foudre-pink" : ""
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <FiCheck className="h-4 w-4 shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
