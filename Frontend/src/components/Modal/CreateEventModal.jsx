import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import CreateEvent from "../Form/CreateEvent";
import toast from "react-hot-toast";

function CreateEventModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    toast.success("Event created successfully!");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-deep-forest/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-[24px] border border-foudre-pink/25 bg-pale-canvas shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:max-w-4xl sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-bubblegum-blush p-2 text-deep-forest transition hover:bg-foudre-pink hover:text-pale-canvas"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-7 sm:p-6">
          <CreateEvent onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default CreateEventModal;
