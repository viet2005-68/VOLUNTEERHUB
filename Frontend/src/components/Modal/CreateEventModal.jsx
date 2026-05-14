import React from "react";
import { X } from "lucide-react";
import CreateEvent from "../Form/CreateEvent";
import toast from "react-hot-toast";

function CreateEventModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    toast.success("Event created successfully!");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-forest/65 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-foudre-pink/25 bg-pale-canvas">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 z-20 float-right rounded-full bg-bubblegum-blush p-2 text-deep-forest transition hover:bg-foudre-pink hover:text-pale-canvas"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Form */}
        <div className="p-4 sm:p-6">
          <CreateEvent onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
