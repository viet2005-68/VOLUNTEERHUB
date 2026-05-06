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
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-600/20">
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full rounded-xl px-4 py-3 pl-10 bg-gray-50 border border-gray-200 focus:ring focus:ring-blue-200 caret-blue-600"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between gap-2 max-sm:block flex-row">
          <div className="flex items-center gap-4 flex-4/5 flex-wrap">
            <DropdownSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All status" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ]}
              className="flex-1 max-sm:block lg:max-w-32"
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
              className="flex-1 max-sm:block lg:max-w-36"
            />

            {/* Custom Date Range Pickers */}
            {timeRange === "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  <input
                    type="date"
                    value={customStartDate || ""}
                    onChange={(e) => setCustomStartDate?.(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 text-sm"
                    placeholder="Start date"
                  />
                </div>
                <span className="text-gray-400">→</span>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  <input
                    type="date"
                    value={customEndDate || ""}
                    onChange={(e) => setCustomEndDate?.(e.target.value)}
                    min={customStartDate || undefined}
                    className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 text-sm"
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="max-md:justify-end flex">
            <button
              onClick={() => setOpenFilter(!openFilter)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg max-sm:mt-2"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Categories & Sort */}
        {openFilter && (
          <div className="flex flex-row bg-gray-100 py-4 px-4 rounded-xl">
            <div className="basis-1/2 max-md:basis-3/4 flex-col">
              <p className="font-bold">Category</p>
              <div className="mt-3 md:flex flex-col overflow-y-auto scroll-smooth max-h-[200px] scrollbar-thin scrollbar-thumb-red-400/20 scrollbar-track-white">
                {categories.map((c) => {
                  const active = selectedCategories.includes(c);
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-3 bg-gray-100${
                        active ? "" : "bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={c}
                        onChange={(e) => toggleCategory(e.target.value)}
                        checked={active}
                        className=""
                      />
                      <span className="text-gray-600">{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="basis-1/2 max-md:basis-1/4 pl-10 max-md:pl-0">
              <p className="font-bold mb-2">Sort By</p>
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
              <p className="font-bold mb-2">Order</p>
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
