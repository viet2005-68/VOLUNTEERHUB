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
    <div className="flex flex-col sm:flex-row justify-between sm:items-center max-sm:gap-5">
      <div className="relative">
        <input
          type="text"
          placeholder="Find by name, email, or event..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <div className="flex max-sm:flex-row justify-end gap-5 basis-1/2">
        <DropdownSelect
          value={filters.event}
          onChange={(value) => setFilters({ ...filters, event: value })}
          options={eventDropdownOptions}
          placeholder="All"
        />

        <DropdownSelect
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          options={statusDropdownOptions}
          placeholder="All Status"
        />
      </div>
    </div>
  );
}
