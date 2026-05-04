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
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading users: {error.message}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm gap-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">User Manager</h2>
        <p className="text-gray-500">Manage all users</p>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative">
        {/* Search */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Filter & Export */}
      <div className="flex flex-row gap-3 items-center justify-end flex-wrap">
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Avatar
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date of Birth
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
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.items && data.items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-4">
          <p className="text-sm text-gray-500">
            Showing {data.items.length} of {data.totalItems} users
          </p>
          <Pagination
            count={data.totalPages}
            page={page}
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

export default UserManager;
