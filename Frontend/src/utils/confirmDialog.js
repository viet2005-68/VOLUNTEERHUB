import Swal from "sweetalert2";

/**
 * Unified confirmation dialog utility using SweetAlert2
 * Replaces all window.confirm() with a consistent, beautiful modal
 */

const popupClass =
    "font-clash-grotesk rounded-[24px] border-2 border-ash-whisper bg-pale-canvas px-8 pb-7 pt-6 text-center text-deep-forest shadow-2xl";
const iconClass =
    "mx-auto mt-2 !h-[72px] !w-[72px] border-2 text-[40px]";
const titleClass =
    "mt-2 text-center font-clash-grotesk text-2xl font-bold normal-case leading-[1.05] text-deep-forest";
const bodyClass =
    "mx-auto mt-3 max-w-[390px] text-center text-sm font-medium leading-[1.4] text-deep-forest/70";
const actionsClass = "mt-7 flex w-full items-center justify-center gap-3";
const cancelButtonClass =
    "inline-flex min-h-[44px] items-center justify-center rounded-[10px] border-2 border-deep-forest/15 bg-pale-canvas px-5 py-3 text-sm font-bold text-deep-forest transition-colors hover:border-deep-forest hover:bg-ash-whisper focus:outline-none";

/**
 * Show a confirmation dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title
 * @param {string} options.text - Dialog message
 * @param {string} options.icon - Icon type: 'warning', 'error', 'success', 'info', 'question'
 * @param {string} options.confirmButtonText - Text for confirm button
 * @param {string} options.cancelButtonText - Text for cancel button
 * @param {string} options.confirmButtonColor - Color for confirm button
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export const showConfirmDialog = async ({
    title = "Are you sure?",
    text = "",
    icon = "warning",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    confirmButtonColor = "#3085d6",
}) => {
    const isDanger = ["#ef4444", "#d33", "#dc2626"].includes(confirmButtonColor);
    const confirmButtonClass = isDanger
        ? "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-foudre-pink px-5 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-deep-forest focus:outline-none"
        : "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-deep-forest px-5 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink focus:outline-none";

    const result = await Swal.fire({
        title,
        text,
        icon,
        iconColor: isDanger ? "#db3c8a" : "#00522d",
        background: "#fff8f6",
        color: "#00522d",
        width: 520,
        showCancelButton: true,
        buttonsStyling: false,
        focusConfirm: false,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        backdrop: "rgba(0, 82, 45, 0.42)",
        customClass: {
            popup: popupClass,
            icon: iconClass,
            title: titleClass,
            htmlContainer: bodyClass,
            actions: actionsClass,
            confirmButton: confirmButtonClass,
            cancelButton: cancelButtonClass,
        },
    });

    return result.isConfirmed;
};

/**
 * Confirm delete action
 */
export const confirmDelete = async (itemName = "this item") => {
    return showConfirmDialog({
        title: "Delete Confirmation",
        text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        icon: "warning",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444",
    });
};

/**
 * Confirm approve action
 */
export const confirmApprove = async (itemName = "this item") => {
    return showConfirmDialog({
        title: "Approve Confirmation",
        text: `Are you sure you want to approve "${itemName}"?`,
        icon: "question",
        confirmButtonText: "Yes, approve it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#22c55e",
    });
};

/**
 * Confirm cancel/close action
 */
export const confirmCancel = async (itemName = "this event", additionalInfo = "") => {
    return showConfirmDialog({
        title: "Cancel Confirmation",
        text: `Are you sure you want to cancel "${itemName}"?${additionalInfo ? `\n\n${additionalInfo}` : ""
            }`,
        icon: "warning",
        confirmButtonText: "Yes, cancel it",
        cancelButtonText: "No, keep it",
        confirmButtonColor: "#f59e0b",
    });
};

/**
 * Confirm close registration action
 */
export const confirmCloseRegistration = async (eventName = "this event") => {
    return showConfirmDialog({
        title: "Close Registration",
        text: `Are you sure you want to close registration for "${eventName}"? No new volunteers will be able to register.`,
        icon: "warning",
        confirmButtonText: "Yes, close it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f59e0b",
    });
};

/**
 * Show success message
 */
export const showSuccess = async (title = "Success!", text = "") => {
    return Swal.fire({
        title,
        text,
        icon: "success",
        iconColor: "#00522d",
        background: "#fff8f6",
        color: "#00522d",
        width: 480,
        confirmButtonText: "OK",
        buttonsStyling: false,
        backdrop: "rgba(0, 82, 45, 0.32)",
        customClass: {
            popup: popupClass,
            icon: iconClass,
            title: titleClass,
            htmlContainer: bodyClass,
            actions: actionsClass,
            confirmButton:
                "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-deep-forest px-6 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink focus:outline-none",
        },
    });
};

/**
 * Show error message
 */
export const showError = async (title = "Error!", text = "") => {
    return Swal.fire({
        title,
        text,
        icon: "error",
        iconColor: "#db3c8a",
        background: "#fff8f6",
        color: "#00522d",
        width: 480,
        confirmButtonText: "OK",
        buttonsStyling: false,
        backdrop: "rgba(0, 82, 45, 0.32)",
        customClass: {
            popup: popupClass,
            icon: iconClass,
            title: titleClass,
            htmlContainer: bodyClass,
            actions: actionsClass,
            confirmButton:
                "inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-foudre-pink px-6 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-deep-forest focus:outline-none",
        },
    });
};
