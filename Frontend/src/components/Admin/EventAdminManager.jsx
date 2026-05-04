import React, { useEffect, useState, useRef } from "react";
import DropdownSelect from "../Dropdown/DropdownSelect";
import { Download, Search, ChevronDown } from "lucide-react";
import EventManagerCardAd from "./EventManagerCardAd";
import Pagination from "@mui/material/Pagination";
import {
  useEventPaginationAdmin,
  useSearchEventByName,
} from "../../hook/useEvent";
import AnalysisService from "../../services/analysisService";

const PAGE_SIZE = 5;

function EventAdminManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const isFirstLoad = useRef(true);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(0);
  }, [filterStatus, searchTerm]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest(".relative")) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  // Check if in search mode
  const isSearchMode = searchTerm.trim().length > 0;

  // Hook cho filtered pagination (khi không search)
  const filterQuery = useEventPaginationAdmin({
    pageNum: page,
    pageSize: PAGE_SIZE,
    status: filterStatus === "all" ? undefined : filterStatus.toUpperCase(),
  });

  // Hook cho search by name (khi có search query)
  const searchQuery = useSearchEventByName({
    keyword: searchTerm,
    pageNum: page,
    pageSize: PAGE_SIZE,
    enabled: isSearchMode,
  });

  // Chọn data source dựa trên mode
  const activeQuery = isSearchMode ? searchQuery : filterQuery;
  const { data, isLoading, isFetching, isError, error } = activeQuery;

  // Track first successful
  useEffect(() => {
    if (data && isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [data]);

  const showFullLoading = isLoading && isFirstLoad.current;

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let response;
      let filename;
      let mimeType;

      if (format === "csv") {
        response = await AnalysisService.exportAllEventsCsv();
        filename = `events_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        response = await AnalysisService.exportAllEventsJson();
        filename = `events_export_${
          new Date().toISOString().split("T")[0]
        }.json`;
        mimeType = "application/json;charset=utf-8;";
        response = JSON.stringify(response, null, 2);
      }

      // Create blob and download
      const blob = new Blob([response], { type: mimeType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting events as ${format}:`, error);
      alert(`Failed to export events: ${error.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (showFullLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading events: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm gap-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isSearchMode ? `Search: "${searchTerm}"` : "Event Manager"}
        </h2>
        <p className="text-gray-500">
          {isSearchMode
            ? `Found ${data?.meta?.totalElements || 0} events`
            : "Manage all events"}
        </p>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative">
        {/* Search */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search events by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Loading indicator for search */}
        {isSearchMode && isFetching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {/* Filter & Export */}
      <div className="flex flex-row gap-3 items-center justify-end flex-wrap">
        <DropdownSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            <span className="max-sm:hidden">
              {isExporting ? "Exporting..." : "Export Events"}
            </span>
            <span className="sm:hidden">
              {isExporting ? "Export..." : "Export"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showExportMenu && !isExporting && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={() => handleExport("csv")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-t-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport("json")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-b-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="max-lg:hidden">
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Event
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Location
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Volunteers
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={
              isFetching
                ? "opacity-50 transition-opacity"
                : "transition-opacity"
            }
          >
            {data?.data && data.data.length > 0 ? (
              data.data.map((event) => (
                <EventManagerCardAd key={event.id} data={event} />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">No events found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.data && data.data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-4">
          <p className="text-sm text-gray-500">
            Showing {data.data.length} of {data.meta?.totalElements || 0} events
          </p>
          <Pagination
            count={data.meta?.totalPages || 0}
            page={page + 1}
            onChange={handlePageChange}
            sx={{
              "& .MuiPaginationItem-root": {
                "&.Mui-selected": {
                  backgroundColor: "#f87171",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#ef4444",
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default EventAdminManager;
