import React, { useState, useEffect, useMemo } from "react";
import ProjectCard from "../../components/Project/card";
import FilterHorizontal from "../../components/Filter/FilterHorizontal";
import TrendingScrollList from "../../components/TrendingEvent/TrendingScrollList";
import { useEventPagination, useSearchEventByName } from "../../hook/useEvent";
import { Pagination, Skeleton } from "@mui/material";

const categories = [
  "education",
  "health",
  "environment",
  "community",
  "animal",
  "sport",
];

// Helper function format Date theo api format
const formatToLocalDateTime = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper function để tính startAfter và endBefore từ timeRange sau sẽ đưa vào utils
const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  let startAfter = null;
  let endBefore = null;

  switch (preset) {
    case "today":
      startAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endBefore = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
      break;
    case "this_week": {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startAfter = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + diffToMonday
      );
      endBefore = new Date(startAfter);
      endBefore.setDate(endBefore.getDate() + 6);
      endBefore.setHours(23, 59, 59);
      break;
    }
    case "this_month":
      startAfter = new Date(now.getFullYear(), now.getMonth(), 1);
      endBefore = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );
      break;
    case "this_year":
      startAfter = new Date(now.getFullYear(), 0, 1);
      endBefore = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case "upcoming":
      startAfter = now;
      endBefore = null; // Không giới hạn
      break;
    default:
      return { startAfter: null, endBefore: null };
  }

  return {
    startAfter: formatToLocalDateTime(startAfter),
    endBefore: formatToLocalDateTime(endBefore),
  };
};

function OpportunitiesEvent() {
  const [pageNum, setPageNum] = useState(0);
  const [pageSize] = useState(6);

  // Filter states
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("APPROVED");
  const [timeRange, setTimeRange] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("Date"); // Date, Name
  const [order, setOrder] = useState("asc"); // asc, desc

  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const getSortBy = () => {
    switch (sortBy) {
      case "Date":
        return "startTime";
      case "Name":
        return "name";
      case "Capacity":
        return "capacity";
      default:
        return "startTime";
    }
  };

  // Tính toán startAfter và endBefore dựa trên timeRange
  const dateRange = useMemo(() => {
    if (timeRange === "custom") {
      return {
        startAfter: customStartDate
          ? formatToLocalDateTime(new Date(customStartDate + "T00:00:00"))
          : null,
        endBefore: customEndDate
          ? formatToLocalDateTime(new Date(customEndDate + "T23:59:59"))
          : null,
      };
    }
    return getDateRangeFromPreset(timeRange);
  }, [timeRange, customStartDate, customEndDate]);

  // Debounce filter params để tránh gọi API quá nhiều
  const [debouncedParams, setDebouncedParams] = useState({
    status: status === "" ? undefined : status,
    sortedBy: getSortBy(),
    order,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    startAfter: dateRange.startAfter,
    endBefore: dateRange.endBefore,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams({
        status: status === "APPROVED" ? undefined : status,
        sortedBy: getSortBy(),
        order,
        category:
          selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        startAfter: dateRange.startAfter,
        endBefore: dateRange.endBefore,
      });
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [status, sortBy, order, selectedCategories, dateRange]);

  // check search or not
  const isSearchMode = query.trim().length > 0;

  // Hook cho filtered pagination (khi không search)
  const filterQuery = useEventPagination({
    pageNum,
    pageSize,
    ...debouncedParams,
    status: "APPROVED",
    order: "desc",
  });

  // Hook cho search by name
  const searchQuery = useSearchEventByName({
    keyword: query,
    pageNum,
    pageSize,
    enabled: isSearchMode,
    status: "APPROVED",
  });

  //  mode search hay không
  const activeQuery = isSearchMode ? searchQuery : filterQuery;
  const { data, isLoading, isFetching, isError, error, isPlaceholderData } =
    activeQuery;

  // Reset pageNum
  useEffect(() => {
    setPageNum(0);
  }, [
    query,
    status,
    sortBy,
    order,
    selectedCategories,
    timeRange,
    customStartDate,
    customEndDate,
  ]);

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading opportunities: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }
  console.log("Active query data:", data, "isSearchMode:", isSearchMode);

  const events = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;
  const totalElements = data?.meta?.totalElements || 0;

  // Category options
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setStatus("APPROVED");
    setTimeRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("Date");
    setOrder("asc");
    setPageNum(0);
  };

  const handlePageChange = (event, value) => {
    setPageNum(value - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-2 p-5 sm:mb-20">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-bold text-md">Volunteer Opportunities</p>
        <p className="text-sm text-gray-600 mb-4">
          Discover meaningful ways to make a difference
        </p>
      </div>

      <FilterHorizontal
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        categories={categories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
        resetFilters={resetFilters}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
      />

      {/* Chỉ hiển thị Trending khi không ở chế độ search */}
      {!isSearchMode && (
        <div>
          <TrendingScrollList />
        </div>
      )}

      <div className="flex justify-between items-center px-4 mb-4">
        <div className="text-xl font-bold">
          {isSearchMode ? `Search results for "${query}"` : "All Opportunities"}
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {isFetching && (
            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? "Loading..." : `${totalElements} events found`}
        </div>
      </div>

      {isLoading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {[...Array(pageSize)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <Skeleton variant="rectangular" height={180} animation="wave" />
              <div className="p-4">
                <Skeleton
                  variant="text"
                  width="60%"
                  height={24}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  animation="wave"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && events.length === 0 && (
        <div className="flex items-center justify-center h-64 transition-opacity duration-300">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <p className="text-gray-500">No opportunities found</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {(events.length > 0 || isPlaceholderData) && (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr transition-opacity duration-300 ease-in-out ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
            style={{ pointerEvents: isFetching ? "none" : "auto" }}
          >
            {events.map((item, index) => (
              <div
                key={item.id}
                className="transform transition-all duration-300 ease-out"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <ProjectCard {...item} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                count={totalPages}
                page={pageNum + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
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
        </>
      )}
    </div>
  );
}

export default OpportunitiesEvent;
