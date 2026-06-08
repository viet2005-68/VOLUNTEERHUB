import { Search } from "lucide-react";
import DropdownSelect from "../Dropdown/DropdownSelect";

export default function RegistrationFilters({
  filters,
  setFilters,
  eventOptions = [],
}) {
  const eventDropdownOptions = [
    { value: "all", label: "All" },
    ...eventOptions.map((eventName) => ({
      value: eventName.toLowerCase(),
      label: eventName,
    })),
  ];

  const statusDropdownOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md sm:flex-1">
        <input
          type="text"
          placeholder="Find by name, email, or event..."
          className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas/80 px-4 py-4 pl-[48px] pr-10 text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-foudre-pink focus:outline-none"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <DropdownSelect
          value={filters.event}
          onChange={(value) => setFilters({ ...filters, event: value })}
          options={eventDropdownOptions}
          placeholder="All"
          className="w-[120px]"
        />

        <DropdownSelect
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          options={statusDropdownOptions}
          placeholder="All Status"
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
