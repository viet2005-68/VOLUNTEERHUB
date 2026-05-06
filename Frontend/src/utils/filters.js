/** Lọc theo chuỗi tìm kiếm (name/title/location...) */
export function filterByQuery(item, query, keys = ["name", "title", "location"]) {
    if (!query) return true;
    const q = query.toLowerCase();
    return keys.some((key) => item[key]?.toLowerCase().includes(q));
}

/** Lọc theo danh mục */
export function filterByCategories(item, selected, key = "category") {
    return selected.length === 0 || selected.includes(item[key]);
}

/** Lọc theo trạng thái */
export function filterByStatus(item, status, key = "status") {
    return status === "all" || item[key] === status;
}

/** Lọc theo kích thước hoặc giá trị số (ví dụ file size, duration...) */
export function filterByRange(item, min, max, key = "size") {
    const value = Number(item[key]);
    if (isNaN(value)) return false;
    if (min != null && value < min) return false;
    if (max != null && value > max) return false;
    return true;
}

/** Lọc theo thời gian */
export function filterByTimeRange(itemDateISO, range) {
    if (!range || range === "all") return true;
    const itemDate = new Date(itemDateISO);
    const now = new Date();

    if (range === "today") {
        return (
            itemDate.getFullYear() === now.getFullYear() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getDate() === now.getDate()
        );
    }

    if (range === "this_week") {
        const start = new Date(now);
        const day = start.getDay();
        const diffToMonday = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return itemDate >= start && itemDate < end;
    }

    if (range === "this_month") {
        return (
            itemDate.getFullYear() === now.getFullYear() &&
            itemDate.getMonth() === now.getMonth()
        );
    }

    return true;
}

/** Bộ lọc tổng hợp — có thể dùng cho bất kỳ kiểu dữ liệu nào */
export function applyFilters(items, filters = {}) {
    const {
        query,
        queryKeys,
        selectedCategories,
        categoryKey,
        status,
        statusKey,
        timeRange,
        dateKey = "date",
        sizeRange, // { min, max }
        sizeKey,
    } = filters;

    return items.filter((item) => {
        return (
            filterByQuery(item, query, queryKeys) &&
            filterByCategories(item, selectedCategories ?? [], categoryKey) &&
            filterByStatus(item, status, statusKey) &&
            filterByTimeRange(item[dateKey], timeRange) &&
            (!sizeRange ||
                filterByRange(item, sizeRange.min, sizeRange.max, sizeKey))
        );
    });
}


/*
How to use this 
import { applyFilters } from "../../utils/filters";

const filtered = React.useMemo(() => {
  return applyFilters(events, {
    query,
    queryKeys: ["title", "location"],
    selectedCategories,
    categoryKey: "category",
    status,
    statusKey: "status",
    timeRange,
    dateKey: "date",
  });
}, [events, query, selectedCategories, status, timeRange]);

*/