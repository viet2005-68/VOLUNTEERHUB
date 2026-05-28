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
  const events = data?.data || [];
  const totalElements = data?.meta?.totalElements ?? events.length;
  const totalPages = data?.meta?.totalPages || 0;
  const hasExactTotal = data?.meta?.hasExactTotal !== false;
  const showingStart = events.length > 0 ? page * PAGE_SIZE + 1 : 0;
  const showingEnd = page * PAGE_SIZE + events.length;

  useEffect(() => {
    if (!isLoading && !isFetching && data && page > 0 && events.length === 0) {
      setPage((currentPage) => Math.max(currentPage - 1, 0));
    }
  }, [data, events.length, isFetching, isLoading, page]);

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
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm font-bold leading-[1.2] text-deep-forest/70">
            Loading events...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="rounded-[10px] bg-ash-whisper px-5 py-3 text-sm font-bold leading-[1.2] text-foudre-pink">
            Error loading events: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[25px] border border-ash-whisper bg-pale-canvas/90 px-7 pb-7 pt-10 text-deep-forest sm:gap-8 sm:border-2 sm:px-8 sm:pb-8 sm:pt-12 md:px-10 md:pb-10 md:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-3 pl-1">
        <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
          {isSearchMode ? `Search: "${searchTerm}"` : "Event Manager"}
        </h2>
        <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
          {isSearchMode
            ? `Found ${data?.meta?.totalElements || 0} events`
            : "Manage all events"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-[20px] border-2 border-ash-whisper bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Search events by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas/80 px-4 py-4 pl-[48px] pr-10 text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-foudre-pink focus:outline-none"
          />
          {/* Loading indicator for search */}
          {isSearchMode && isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foudre-pink border-t-transparent" />
            </div>
          )}
        </div>

        {/* Filter & Export */}
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
          <DropdownSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            className="w-[160px]"
          />

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span className="max-sm:hidden">
                {isExporting ? "Exporting..." : "Export Events"}
              </span>
              <span className="sm:hidden">
                {isExporting ? "Export..." : "Export"}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && !isExporting && (
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-[10px] border border-ash-whisper bg-pale-canvas shadow-lg">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={() => handleExport("json")}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[20px] border-2 border-ash-whisper bg-white">
        <table className="w-full text-left text-sm">
          <thead className="max-lg:hidden">
            <tr className="bg-ash-whisper/70">
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Event
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Volunteers
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
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
            {events.length > 0 ? (
              events.map((event) => (
                <EventManagerCardAd key={event.id} data={event} />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">
                      No events found
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {events.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-deep-forest/10 pt-5 sm:flex-row">
          <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
            Showing {showingStart}-{showingEnd}
            {hasExactTotal ? ` of ${totalElements}` : ""} events
          </p>
          {totalPages > 0 && (
            <Pagination
              count={totalPages}
              page={Math.min(page + 1, totalPages)}
              onChange={handlePageChange}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#00522d",
                  fontFamily: "Clash Grotesk, sans-serif",
                  fontWeight: 700,
                  "&.Mui-selected": {
                    backgroundColor: "#00522d",
                    color: "#fff8f6",
                    "&:hover": {
                      backgroundColor: "#00522d",
                    },
                  },
                },
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default EventAdminManager;
