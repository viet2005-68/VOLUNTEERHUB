import Swal from "sweetalert2";

/**
 * Unified confirmation dialog utility using SweetAlert2
 * Replaces all window.confirm() with a consistent, beautiful modal
 */

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
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor: "#d33",
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        customClass: {
            popup: "rounded-xl",
            confirmButton: "px-6 py-2.5 rounded-lg font-medium",
            cancelButton: "px-6 py-2.5 rounded-lg font-medium",
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
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        customClass: {
            popup: "rounded-xl",
            confirmButton: "px-6 py-2.5 rounded-lg font-medium",
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
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
            popup: "rounded-xl",
            confirmButton: "px-6 py-2.5 rounded-lg font-medium",
        },
    });
};

