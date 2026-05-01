import { useState } from "react";
import { useProfileCompleteness } from "./useUser";

/**
 * Hook to guard actions that require complete profile
 * Returns a function to check profile before executing action
 */
export const useProfileGuard = () => {
    const { data: profileValidation, isLoading } = useProfileCompleteness();
    const [showModal, setShowModal] = useState(false);

    /**
     * Check if profile is complete before executing action
     * @param {Function} action - The action to execute if profile is complete
     * @returns {boolean} - true if action was executed, false if blocked
     */
    const checkProfile = (action) => {
        // If still loading, wait
        if (isLoading) {
            console.log("Profile validation still loading...");
            return false;
        }

        // If profile is complete, execute action immediately
        if (profileValidation?.isComplete) {
            action();
            return true;
        }

        // Profile is incomplete, show modal
        console.log("Profile incomplete, showing modal");
        setShowModal(true);
        return false;
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return {
        checkProfile,
        showModal,
        closeModal,
        missingFields: profileValidation?.missingFields || [],
        isProfileComplete: profileValidation?.isComplete || false,
    };
};

