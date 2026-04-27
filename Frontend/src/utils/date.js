// utils/dateUtils.js

/**
 * Parse input thành Date hợp lệ.
 * Accept: Date object, ISO string, timestamp (number).
 */
function toDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return dateInput;
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Format helper cho custom token and separator.
 * Supported tokens:
 *  - DD, MM, YYYY, HH (24h), hh (12h), mm, ss, A (AM/PM)
 */
function formatWithTokens(date, tokenStr = "DD/MM/YYYY HH:mm", opts = {}) {
    const {
        separator = "/",
        use12Hour = false,
        pad = true
    } = opts;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours24 = date.getHours();
    const hours12 = ((hours24 + 11) % 12) + 1; // 1..12
    const hours24Str = pad ? String(hours24).padStart(2, "0") : String(hours24);
    const hours12Str = pad ? String(hours12).padStart(2, "0") : String(hours12);
    const minutes = pad ? String(date.getMinutes()).padStart(2, "0") : String(date.getMinutes());
    const seconds = pad ? String(date.getSeconds()).padStart(2, "0") : String(date.getSeconds());
    const ampm = hours24 >= 12 ? "PM" : "AM";

    // If use12Hour is true, automatically convert HH to hh and ensure A is present
    let processedTokenStr = tokenStr;
    if (use12Hour) {
        // Convert HH to hh for 12-hour format
        processedTokenStr = processedTokenStr.replace(/HH/g, "hh");
        // If format contains hour token (hh) but no A (AM/PM), add it after the time
        if (processedTokenStr.includes("hh") && !processedTokenStr.includes("A")) {
            // Find where to insert " A" - after the last time token (mm or ss, or hh if no mm/ss)
            const hasMinutes = processedTokenStr.includes("mm");
            const hasSeconds = processedTokenStr.includes("ss");

            if (hasSeconds) {
                // Insert " A" after the last "ss"
                processedTokenStr = processedTokenStr.replace(/ss(?!.*ss)/, "ss A");
            } else if (hasMinutes) {
                // Insert " A" after the last "mm"
                processedTokenStr = processedTokenStr.replace(/mm(?!.*mm)/, "mm A");
            } else {
                // Only hours, insert " A" after "hh"
                processedTokenStr = processedTokenStr.replace(/hh(?!.*hh)/, "hh A");
            }
        }
    }

    // replace common date token with separator-aware MM/DD etc.
    let out = processedTokenStr
        .replace(/DD/g, day)
        .replace(/MM/g, month)
        .replace(/YYYY/g, year)
        .replace(/HH/g, hours24Str)
        .replace(/hh/g, hours12Str)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds)
        .replace(/A/g, ampm);

    // allow simple token for separators: if user uses "/" in tokenStr we leave it,
    // otherwise if tokenStr contains "DD-MM-YYYY" they likely provided separator already.
    // We also replace any occurrence of "{sep}" with provided separator for flexibility.
    out = out.replace(/\{sep\}/g, separator);

    return out;
}

/**
 * formatDateTime
 * - dateInput: Date | string | number
 * - options:
 *    withTime: boolean (default true)
 *    timeOnly: boolean (default false)
 *    locale: string (used for toLocale* when not using customFormat)
 *    format: "short" | "long" (affects month form when using locale-based formatting)
 *    customFormat: string (if provided, tokens will be used and take precedence)
 *    separator: string ("/" | "-" | "." etc) used by customFormat fallback
 *    use12Hour: boolean (whether to use 12-hour format in custom formatting)
 *    timeZone: string (IANA timeZone passed to Intl; default undefined -> runtime locale)
 */
export function formatDateTime(
    dateInput,
    options = {}
) {
    const defaults = {
        withTime: true,
        timeOnly: false,
        locale: "vi-VN",
        format: "short", // short | long
        customFormat: null, // e.g. "DD{sep}MM{sep}YYYY HH:mm" or "DD-MM-YYYY hh:mm A"
        separator: "/",
        use12Hour: false,
        timeZone: undefined, // e.g. "Asia/Ho_Chi_Minh"
    };

    const opts = { ...defaults, ...options };
    const date = toDate(dateInput);
    if (!date) return "";

    // If customFormat provided -> manual token formatting
    if (opts.customFormat) {
        // If customFormat contains tokens for locale-aware month names, we could extend later.
        return formatWithTokens(date, opts.customFormat, {
            separator: opts.separator,
            use12Hour: opts.use12Hour
        });
    }

    // If only time
    if (opts.timeOnly) {
        return date.toLocaleTimeString(opts.locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: opts.use12Hour,
            timeZone: opts.timeZone
        });
    }

    // If only date (no time) -> use Intl for locale-aware formatting
    if (!opts.withTime) {
        return date.toLocaleDateString(opts.locale, {
            year: "numeric",
            month: opts.format === "long" ? "long" : "2-digit",
            day: "2-digit",
            timeZone: opts.timeZone
        });
    }

    // Default: both date + time using locale
    return date.toLocaleString(opts.locale, {
        year: "numeric",
        month: opts.format === "long" ? "long" : "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: opts.use12Hour,
        timeZone: opts.timeZone
    });
}

/**
 * formatTimeRange
 * - start & end: Date | string | number
 * - options: same as formatDateTime plus:
 *    showDateIfDifferent: boolean (if true and start/end on different days, include dates)
 *    shortenIfSameDay: boolean (if true and same day, only show date once)
 *
 * Examples:
 *  formatTimeRange(start, end) -> "15/09/2025 08:00 - 12:00"
 *  formatTimeRange(start, end, { use12Hour: true }) -> "15/09/2025 8:00 AM - 12:00 PM"
 */
export function formatTimeRange(startInput, endInput, options = {}) {
    const defaults = {
        showDateIfDifferent: true,
        shortenIfSameDay: true,
        ...options
    };

    const start = toDate(startInput);
    const end = toDate(endInput);
    if (!start || !end) return "";

    // If same moment
    if (start.getTime() === end.getTime()) {
        return formatDateTime(start, options);
    }

    const sameDay = start.getFullYear() === end.getFullYear()
        && start.getMonth() === end.getMonth()
        && start.getDate() === end.getDate();

    // time strings
    const timeOpts = { ...options, timeOnly: true };
    const startTimeStr = formatDateTime(start, timeOpts);
    const endTimeStr = formatDateTime(end, timeOpts);

    if (sameDay && defaults.shortenIfSameDay) {
        // show "DD/MM/YYYY HH:mm - HH:mm"
        const datePart = formatDateTime(start, { ...options, withTime: false });
        return `${datePart} ${startTimeStr} - ${endTimeStr}`;
    }

    // different days: either show both full datetimes or include date for each
    if (!sameDay && defaults.showDateIfDifferent) {
        const startFull = formatDateTime(start, options);
        const endFull = formatDateTime(end, options);
        return `${startFull} - ${endFull}`;
    }

    // fallback
    return `${formatDateTime(start, options)} - ${formatDateTime(end, options)}`;
}


/**
 * calculateDuration
 * Calculate duration between start and end time
 * Returns formatted string like "2 days 3 hours" or "5 hours 30 minutes"
 * 
 * @param {Date|string|number} startInput - Start time
 * @param {Date|string|number} endInput - End time
 * @returns {string} Formatted duration string
 */
export function calculateDuration(startInput, endInput) {
    const start = toDate(startInput);
    const end = toDate(endInput);

    if (!start || !end) return "";

    // Calculate difference in milliseconds
    const diff = end.getTime() - start.getTime();

    if (diff <= 0) return "0 minutes";

    // Convert to time units
    const totalMinutes = Math.floor(diff / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const days = totalDays;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    // Build result string
    const parts = [];

    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }

    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }

    if (minutes > 0 && days === 0) { // Only show minutes if less than a day
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    return parts.join(' ') || "0 minutes";
}

/**
* ========================================
* HƯỚNG DẪN SỬ DỤNG
* ========================================
* 
* Import các hàm:
* import { formatDateTime, formatTimeRange } from "./utils/date";
* 
* 
* ========================================
* formatDateTime - Format ngày giờ
* ========================================
* 
* 1. Format mặc định (có ngày và giờ):
* formatDateTime("2025-09-15T08:00:00Z");
* // -> "15/09/2025, 15:00" (tuỳ timezone môi trường)
* 
* formatDateTime(new Date("2025-09-15T08:00:00Z"));
* // -> "15/09/2025, 15:00"
* 
* formatDateTime(1726387200000); // timestamp
* // -> "15/09/2025, 15:00"
* 
* 
* 2. Chỉ hiển thị ngày (không có giờ):
* formatDateTime("2025-09-15T08:00:00Z", { withTime: false });
* // -> "15/09/2025"
* 
* formatDateTime("2025-09-15T08:00:00Z", { 
*     withTime: false, 
*     format: "long" 
* });
* // -> "15 tháng 9, 2025" (locale vi-VN)
* 
* 
* 3. Chỉ hiển thị giờ (không có ngày):
* formatDateTime("2025-09-15T08:00:00Z", { timeOnly: true });
* // -> "15:00"
* 
* formatDateTime("2025-09-15T08:00:00Z", { 
*     timeOnly: true, 
*     use12Hour: true 
* });
* // -> "03:00 CH" (hoặc "03:00 PM" tuỳ locale)
* 
* 
* 4. Sử dụng timezone cụ thể:
* formatDateTime("2025-09-15T08:00:00Z", { 
*     timeZone: "Asia/Ho_Chi_Minh" 
* });
* // -> "15/09/2025, 15:00" (UTC+7)
* 
* formatDateTime("2025-09-15T08:00:00Z", { 
*     timeZone: "America/New_York" 
* });
* // -> "15/09/2025, 04:00" (UTC-4)
* 
* 
* 5. Custom format với tokens:
* // Format với dấu gạch ngang
* formatDateTime("2025-09-15T08:00:00Z", { 
*     separator: "-", 
*     customFormat: "DD{sep}MM{sep}YYYY HH:mm" 
* });
* // -> "15-09-2025 15:00"
* 
* // Format với dấu chấm
* formatDateTime("2025-09-15T08:00:00Z", { 
*     separator: ".", 
*     customFormat: "DD{sep}MM{sep}YYYY" 
* });
* // -> "15.09.2025"
* 
* // Format 12 giờ với AM/PM
* formatDateTime("2025-09-15T08:00:00Z", { 
*     customFormat: "DD/MM/YYYY hh:mm A", 
*     use12Hour: true 
* });
* // -> "15/09/2025 03:00 PM"
* 
* // Format có giây
* formatDateTime("2025-09-15T08:30:45Z", { 
*     customFormat: "DD/MM/YYYY HH:mm:ss" 
* });
* // -> "15/09/2025 15:30:45"
* 
* // Format 12 giờ tự động thêm AM/PM
* formatDateTime("2025-09-15T08:00:00Z", { 
*     customFormat: "DD/MM/YYYY hh:mm", 
*     use12Hour: true 
* });
* // -> "15/09/2025 03:00 PM" (tự động thêm A)
* 
* 
* 6. Thay đổi locale:
* formatDateTime("2025-09-15T08:00:00Z", { 
*     locale: "en-US" 
* });
* // -> "9/15/2025, 3:00 PM"
* 
* formatDateTime("2025-09-15T08:00:00Z", { 
*     locale: "en-US", 
*     format: "long" 
* });
* // -> "September 15, 2025 at 3:00 PM"
* 
* 
* 7. Kết hợp nhiều options:
* formatDateTime("2025-09-15T08:00:00Z", { 
*     customFormat: "DD{sep}MM{sep}YYYY hh:mm A", 
*     separator: "-", 
*     use12Hour: true,
*     timeZone: "Asia/Ho_Chi_Minh" 
* });
* // -> "15-09-2025 03:00 PM"
* 
* 
* ========================================
* formatTimeRange - Format khoảng thời gian
* ========================================
* 
* 1. Cùng ngày (mặc định rút gọn):
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T12:00:00Z"
* );
* // -> "15/09/2025 15:00 - 19:00"
* 
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T12:00:00Z",
*     { timeZone: "Asia/Ho_Chi_Minh" }
* );
* // -> "15/09/2025 08:00 - 12:00"
* 
* 
* 2. Cùng ngày với 12 giờ:
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T12:00:00Z",
*     { use12Hour: true, timeZone: "Asia/Ho_Chi_Minh" }
* );
* // -> "15/09/2025 08:00 SA - 12:00 CH"
* 
* 
* 3. Khác ngày (hiển thị đầy đủ cả 2 ngày):
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-16T12:00:00Z"
* );
* // -> "15/09/2025, 15:00 - 16/09/2025, 19:00"
* 
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-16T12:00:00Z",
*     { timeZone: "Asia/Ho_Chi_Minh" }
* );
* // -> "15/09/2025, 08:00 - 16/09/2025, 12:00"
* 
* 
* 4. Tắt rút gọn (luôn hiển thị đầy đủ):
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T12:00:00Z",
*     { shortenIfSameDay: false }
* );
* // -> "15/09/2025, 15:00 - 15/09/2025, 19:00"
* 
* 
* 5. Tắt hiển thị ngày khi khác ngày:
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-16T12:00:00Z",
*     { showDateIfDifferent: false }
* );
* // -> "15:00 - 19:00" (chỉ hiển thị giờ)
* 
* 
* 6. Custom format cho time range:
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T12:00:00Z",
*     { 
*         customFormat: "DD{sep}MM{sep}YYYY HH:mm", 
*         separator: "-",
*         timeZone: "Asia/Ho_Chi_Minh"
*     }
* );
* // -> "15-09-2025 08:00 - 12:00"
* 
* 
* 7. Cùng thời điểm (trả về formatDateTime):
* formatTimeRange(
*     "2025-09-15T08:00:00Z", 
*     "2025-09-15T08:00:00Z"
* );
* // -> "15/09/2025, 15:00"
* 
* 
* ========================================
* CÁC TOKEN HỖ TRỢ TRONG customFormat
* ========================================
* 
* - DD: Ngày (01-31)
* - MM: Tháng (01-12)
* - YYYY: Năm (2025)
* - HH: Giờ 24h (00-23)
* - hh: Giờ 12h (01-12)
* - mm: Phút (00-59)
* - ss: Giây (00-59)
* - A: AM/PM
* - {sep}: Separator động (thay bằng separator option)
* 
* Ví dụ tokens:
* "DD/MM/YYYY HH:mm"        -> "15/09/2025 14:30"
* "DD{sep}MM{sep}YYYY"      -> "15-09-2025" (với separator: "-")
* "YYYY-MM-DD HH:mm:ss"     -> "2025-09-15 14:30:45"
* "hh:mm A"                 -> "02:30 PM"
* "DD/MM/YYYY hh:mm A"      -> "15/09/2025 02:30 PM"
* 
*/