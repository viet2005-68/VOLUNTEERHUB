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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-20 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Form */}
        <div className="p-6">
          <CreateEvent onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
