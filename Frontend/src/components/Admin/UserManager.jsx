import React, { useState, useEffect, useRef } from "react";
import DropdownSelect from "../Dropdown/DropdownSelect";
import { Download, Search, ChevronDown } from "lucide-react";
import UserCard from "./UserCard";
import Pagination from "@mui/material/Pagination";
import { useAllUsers, useBanUser, useUnbanUser } from "../../hook/useUser";
import AnalysisService from "../../services/analysisService";

const PAGE_SIZE = 6;

function UserManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const isFirstLoad = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

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

  const { data, isLoading, isFetching, isError, error } = useAllUsers({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: filterStatus,
  });

  // Track first successful load
  useEffect(() => {
    if (data && isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [data]);

  const showFullLoading = isLoading && isFirstLoad.current;

  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleBanUser = async (id) => {
    banUserMutation.mutate(id);
  };

  const handleUnbanUser = async (id) => {
    unbanUserMutation.mutate(id);
  };

  const handleView = (id) => {
    console.log(`View user ${id}`);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      let response;
      let filename;
      let mimeType;

      if (format === "csv") {
        response = await AnalysisService.exportAllUsersCsv();
        filename = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else {
        response = await AnalysisService.exportAllUsersJson();
        filename = `users_export_${
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
      console.error(`Error exporting users as ${format}:`, error);
      alert(`Failed to export users: ${error.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (showFullLoading) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
        <div className="flex h-64 items-center justify-center rounded-[20px] bg-white">
          <div className="font-bold text-deep-forest/70">Loading users...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
        <div className="flex h-64 items-center justify-center rounded-[20px] bg-white">
          <div className="font-bold text-red-700">
            Error loading users: {error.message}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-foudre-pink">
          Admin Control
        </p>
        <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[82px]">
          User Manager
        </h2>
        <p className="max-w-xl text-sm font-medium text-deep-forest/70">
          Search, filter, export, and manage every volunteer account from one clean view.
        </p>
      </div>
      {/* Toolbar */}
      <div className="rounded-[20px] border-2 border-ash-whisper bg-white p-4">
        <div className="relative">
          {/* Search */}
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[10px] border-2 border-ash-whisper bg-pale-canvas py-4 pl-12 pr-4 text-sm font-bold text-deep-forest outline-none transition-colors placeholder:text-deep-forest/40 focus:border-deep-forest"
          />
        </div>
      </div>
      {/* Filter & Export */}
      <div className="flex flex-row flex-wrap items-center justify-end gap-3 rounded-[20px] border-2 border-ash-whisper bg-white p-4">
        <DropdownSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "active", label: "Active" },
            { value: "banned", label: "Banned" },
          ]}
        />

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-deep-forest px-4 py-3 font-bold text-pale-canvas transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span className="max-sm:hidden">
              {isExporting ? "Exporting..." : "Export Users"}
            </span>
            <span className="sm:hidden">
              {isExporting ? "Export..." : "Export"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showExportMenu && !isExporting && (
            <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-[10px] border-2 border-ash-whisper bg-pale-canvas">
              <button
                onClick={() => handleExport("csv")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
              >
                <Download className="w-4 h-4" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport("json")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
              >
                <Download className="w-4 h-4" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-[20px] border-2 border-ash-whisper bg-white">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="max-lg:hidden">
            <tr className="border-b-2 border-ash-whisper bg-ash-whisper/65">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Avatar
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Phone Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
                Date of Birth
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-deep-forest">
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
            {data?.items && data.items.length > 0 ? (
              data.items.map((user) => (
                <UserCard
                  key={user.id}
                  data={user}
                  onBanUser={handleBanUser}
                  onUnbanUser={handleUnbanUser}
                  onView={handleView}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 rounded-[20px] bg-pale-canvas py-8">
                    <p className="font-bold text-deep-forest/65">No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.items && data.items.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-[20px] border-2 border-ash-whisper bg-white p-4 sm:flex-row">
          <p className="text-sm font-bold text-deep-forest/65">
            Showing {data.items.length} of {data.totalItems} users
          </p>
          <Pagination
            count={data.totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPaginationItem-root": {
                "&.Mui-selected": {
                  backgroundColor: "#00522d",
                  color: "#fff8f6",
                  "&:hover": {
                    backgroundColor: "#006b3b",
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

export default UserManager;
