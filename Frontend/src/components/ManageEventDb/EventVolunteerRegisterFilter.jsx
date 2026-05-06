import { Search } from "lucide-react";

export default function EventVolunteerRegisterFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center max-sm:gap-5">
      <div className="relative">
        <input
          type="text"
          placeholder="Find by name..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <div className="flex max-sm:flex-row justify-end gap-5 basis-1/2">
        <select
          className="border rounded-2xl p-2 border-gray-600/20 bg-gray-200"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="pending">Pending</option>

          <option value="rejected">Reject</option>
        </select>
      </div>
    </div>
  );
}
