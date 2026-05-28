import Swal from "sweetalert2";

/**
 * Unified confirmation dialog utility using SweetAlert2
 * Replaces all window.confirm() with a consistent, beautiful modal
 */

const popupClass =
    "font-jost rounded-[20px] border-2 border-ash-whisper bg-pale-canvas px-6 pb-6 pt-5 text-center text-deep-forest shadow-xl";
const iconClass =
    "mx-auto my-0 !h-14 !w-14 border-2 text-[30px]";
const titleClass =
    "mt-4 text-center font-jost text-xl font-black normal-case leading-[1.1] text-deep-forest";
const bodyClass =
    "mx-auto mt-3 max-w-[320px] text-center text-sm font-medium leading-[1.35] text-deep-forest/70";
const actionsClass = "mt-6 flex w-full items-center justify-center gap-3";
const cancelButtonClass =
    "inline-flex min-h-[44px] items-center justify-center rounded-[10px] border-2 border-deep-forest/15 bg-pale-canvas px-5 py-3 text-sm font-bold text-deep-forest transition-colors hover:border-deep-forest hover:bg-ash-whisper focus:outline-none";

const applyCompactDialogStyles = (popup) => {
    if (!popup) return;

    const icon = popup.querySelector(".swal2-icon");
    const iconContent = popup.querySelector(".swal2-icon-content");
    const title = popup.querySelector(".swal2-title");
    const htmlContainer = popup.querySelector(".swal2-html-container");
    const actions = popup.querySelector(".swal2-actions");

    if (icon) {
        icon.style.width = "56px";
        icon.style.height = "56px";
        icon.style.minWidth = "56px";
        icon.style.margin = "0 auto";
        icon.style.fontSize = "30px";
    }

    if (iconContent) {
        iconContent.style.fontSize = "42px";
        iconContent.style.lineHeight = "1";
    }

    if (title) {
        title.style.padding = "0";
        title.style.margin = "16px 0 0";
        title.style.fontFamily = "Jost, sans-serif";
        title.style.fontSize = "20px";
        title.style.fontWeight = "900";
        title.style.lineHeight = "1.1";
    }

    if (htmlContainer) {
        htmlContainer.style.padding = "0";
        htmlContainer.style.margin = "12px auto 0";
    }

    if (actions) {
        actions.style.margin = "24px 0 0";
    }
};

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
        width: 420,
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
        didOpen: applyCompactDialogStyles,
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
        width: 420,
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
        didOpen: applyCompactDialogStyles,
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
        width: 420,
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
        didOpen: applyCompactDialogStyles,
    });
};
