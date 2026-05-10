import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";

const PROVINCES_API = "https://provinces.open-api.vn/api/p/";

/**
 * Normalizes text for matching (removes diacritics, lowercases)
 */
export const normalizeLocationText = (value) =>
    value
        ? value
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
        : "";

/**
 * Finds a province by name (supports matching with/without diacritics)
 */
export const findProvinceByName = (provinces, name) => {
    if (!provinces?.length || !name) return null;

    const target = normalizeLocationText(name);
    if (!target) return null;

    return provinces.find((item) => {
        const itemName = normalizeLocationText(item.name);
        const withType = normalizeLocationText(item.name_with_type || "");
        const slug = normalizeLocationText(item.slug || "");
        return itemName === target || withType === target || slug === target;
    });
};

/**
 * Finds a district by name or code
 */
export const findDistrictByNameOrCode = (districts, nameOrCode) => {
    if (!districts?.length || !nameOrCode) return null;

    // Try matching by code first
    const codeStr = String(nameOrCode);
    const byCode = districts.find((item) => String(item.code) === codeStr);
    if (byCode) return byCode;

    // Fall back to name matching
    const target = normalizeLocationText(nameOrCode);
    if (!target) return null;

    return districts.find((item) => {
        const itemName = normalizeLocationText(item.name);
        const withType = normalizeLocationText(item.name_with_type || "");
        const slug = normalizeLocationText(item.slug || "");
        return itemName === target || withType === target || slug === target;
    });
};

/**
 * Fetches all provinces/cities
 * @param {Object} options - Query options
 * @param {Function} options.onFetched - Callback khi data được fetch thành công
 */
export const useProvinces = ({ onFetched, ...queryOptions } = {}) => {
    const query = useQuery({
        queryKey: ["vn-provinces"],
        queryFn: async () => {
            const response = await fetch(PROVINCES_API);
            if (!response.ok) {
                throw new Error("Failed to fetch provinces");
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 2 * 60 * 60 * 1000, // 2 hours
        retry: 1,
        ...queryOptions,
    });

    // Track previous data để chỉ gọi callback khi data thực sự thay đổi
    const prevDataRef = useRef(null);

    useEffect(() => {
        if (
            query.isSuccess &&
            query.data &&
            query.data !== prevDataRef.current &&
            onFetched
        ) {
            prevDataRef.current = query.data;
            onFetched(query.data);
        }
    }, [query.isSuccess, query.data, onFetched]);

    // Helper: Tìm province theo code và trả về thông tin đầy đủ
    const getProvinceByCode = useCallback(
        (code) => {
            if (!query.data?.length || !code) return null;
            return query.data.find((p) => String(p.code) === String(code));
        },
        [query.data]
    );

    // Helper: Tìm province theo tên
    const getProvinceByName = useCallback(
        (name) => {
            if (!query.data?.length || !name) return null;
            return findProvinceByName(query.data, name);
        },
        [query.data]
    );

    return {
        ...query,
        provinces: query.data ?? [],
        getProvinceByCode,
        getProvinceByName,
    };
};

/**
 * Fetches districts for a given province code
 * @param {string} provinceCode - The province code
 * @param {Object} options - Query options
 * @param {Function} options.onFetched - Callback khi data được fetch thành công
 */
export const useDistricts = (
    provinceCode,
    { onFetched, ...queryOptions } = {}
) => {
    const query = useQuery({
        queryKey: ["vn-districts", provinceCode],
        queryFn: async () => {
            if (!provinceCode) {
                return [];
            }
            const response = await fetch(
                `${PROVINCES_API}${provinceCode}?depth=2`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch districts");
            }
            const data = await response.json();
            return Array.isArray(data?.districts) ? data.districts : [];
        },
        enabled: Boolean(provinceCode),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 1,
        ...queryOptions,
    });

    // Track previous data và provinceCode để chỉ gọi callback khi cần
    const prevRef = useRef({ data: null, provinceCode: null });

    useEffect(() => {
        const hasNewData =
            query.isSuccess &&
            query.data &&
            (query.data !== prevRef.current.data ||
                provinceCode !== prevRef.current.provinceCode);

        if (hasNewData && onFetched) {
            prevRef.current = { data: query.data, provinceCode };
            onFetched(query.data, provinceCode);
        }
    }, [query.isSuccess, query.data, provinceCode, onFetched]);

    // Helper: Tìm district theo code
    const getDistrictByCode = useCallback(
        (code) => {
            if (!query.data?.length || !code) return null;
            return query.data.find((d) => String(d.code) === String(code));
        },
        [query.data]
    );

    // Helper: Tìm district theo tên hoặc code
    const getDistrictByNameOrCode = useCallback(
        (nameOrCode) => {
            if (!query.data?.length || !nameOrCode) return null;
            return findDistrictByNameOrCode(query.data, nameOrCode);
        },
        [query.data]
    );

    return {
        ...query,
        districts: query.data ?? [],
        getDistrictByCode,
        getDistrictByNameOrCode,
    };
};
