import React, { useState } from "react";
import { FiSearch, FiCalendar } from "react-icons/fi";
import DropdownSelect from "../Dropdown/DropdownSelect";

export default function FilterHorizontal({
  query,
  setQuery,
  status,
  setStatus,
  timeRange,
  setTimeRange,
  categories,
  selectedCategories,
  toggleCategory,
  sortBy,
  setSortBy,
  order,
  setOrder,
  resetFilters,
  // Custom date range props
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}) {
  const [openFilter, setOpenFilter] = useState(false);

  const timeRangeOptions = [
    { value: "all", label: "Any time" },
    { value: "today", label: "Today" },
    { value: "this_week", label: "This week" },
    { value: "this_month", label: "This month" },
    { value: "this_year", label: "This year" },
    { value: "upcoming", label: "Upcoming" },
    { value: "custom", label: "Custom range" },
  ];

  return (
    <div className="rounded-[20px] border border-deep-forest/15 bg-pale-canvas p-4 text-deep-forest">
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-deep-forest/55" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full rounded-[10px] border border-deep-forest/15 bg-pale-canvas px-4 py-3 pl-10 text-sm font-bold text-deep-forest caret-foudre-pink outline-none transition placeholder:text-deep-forest/45 focus:border-foudre-pink focus:ring-4 focus:ring-foudre-pink/15"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <DropdownSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All status" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ]}
              className="min-w-[150px] flex-1 lg:max-w-[180px]"
            />

            <DropdownSelect
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                // Reset custom dates khi chọn preset khác
                if (value !== "custom") {
                  setCustomStartDate?.("");
                  setCustomEndDate?.("");
                }
              }}
              options={timeRangeOptions}
              className="min-w-[150px] flex-1 lg:max-w-[190px]"
            />

            {/* Custom Date Range Pickers */}
            {timeRange === "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-deep-forest/50" />
                  <input
                    type="date"
                    value={customStartDate || ""}
                    onChange={(e) => setCustomStartDate?.(e.target.value)}
                    className="rounded-[10px] border border-deep-forest/15 bg-pale-canvas py-2 pl-9 pr-3 text-sm font-bold text-deep-forest outline-none focus:border-foudre-pink focus:ring-4 focus:ring-foudre-pink/15"
                    placeholder="Start date"
                  />
                </div>
                <span className="font-bold text-deep-forest/45">→</span>
                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-deep-forest/50" />
                  <input
                    type="date"
                    value={customEndDate || ""}
                    onChange={(e) => setCustomEndDate?.(e.target.value)}
                    min={customStartDate || undefined}
                    className="rounded-[10px] border border-deep-forest/15 bg-pale-canvas py-2 pl-9 pr-3 text-sm font-bold text-deep-forest outline-none focus:border-foudre-pink focus:ring-4 focus:ring-foudre-pink/15"
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="max-md:justify-end flex">
            <button
              onClick={() => setOpenFilter(!openFilter)}
              className="rounded-[10px] bg-bubblegum-blush px-5 py-3 text-sm font-bold text-pale-canvas transition hover:bg-foudre-pink active:scale-95"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Categories & Sort */}
        {openFilter && (
          <div className="grid gap-5 rounded-[20px] bg-ash-whisper/45 px-4 py-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0">
              <p className="text-sm font-bold leading-[1.2] text-deep-forest">Category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = selectedCategories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 text-sm font-bold capitalize transition ${active ? "border-deep-forest bg-deep-forest text-pale-canvas" : "border-deep-forest/10 bg-pale-canvas text-deep-forest hover:bg-ash-whisper"}`}
                    >
                      <span className={active ? "h-[8px] w-[8px] rounded-full bg-pale-canvas" : "h-[8px] w-[8px] rounded-full bg-foudre-pink"} />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-sm font-bold leading-[1.2] text-deep-forest">Sort By</p>
              <DropdownSelect
                className="w-full mb-3"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "Date", label: "Date" },
                  { value: "Name", label: "Name" },
                  { value: "Capacity", label: "Capacity" },
                ]}
              />
              <p className="mb-2 text-sm font-bold leading-[1.2] text-deep-forest">Order</p>
              <DropdownSelect
                className="w-full"
                value={order}
                onChange={setOrder}
                options={[
                  { value: "asc", label: "Ascending" },
                  { value: "desc", label: "Descending" },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
