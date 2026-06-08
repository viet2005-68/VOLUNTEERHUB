import { Search } from "lucide-react";
import DropdownSelect from "../Dropdown/DropdownSelect";

export default function EventVolunteerRegisterFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md sm:flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
        <input
          type="text"
          placeholder="Find by name..."
          className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas/80 px-4 py-4 pl-[48px] text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-foudre-pink focus:outline-none"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-end">
        <DropdownSelect
          value={filters.status}
          onChange={(status) => setFilters({ ...filters, status })}
          options={[
            { value: "pending", label: "Pending" },
            { value: "rejected", label: "Reject" },
          ]}
          className="w-full sm:w-[160px]"
        />
      </div>
    </div>
  );
}
