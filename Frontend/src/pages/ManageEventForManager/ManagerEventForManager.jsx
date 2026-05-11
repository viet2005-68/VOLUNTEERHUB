import React, { useState } from "react";
import ManagerDbHero from "../../components/ManageEventDb/ManagerDbHero";
import Tabs from "../../components/Tabs.jsx/Tabs";
import { Outlet, useParams } from "react-router-dom";
import { useEventDetail, useUpdateEvent } from "../../hook/useEvent";
import { Link, LockKeyhole, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hook/useAuth";
import { useNavigate } from "react-router-dom";

function ManagerEventForManager() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { user } = useAuth();

  // Fetch event data once at parent level
  const { data: eventData, isLoading, error, refetch } = useEventDetail(id);

  const updateEventMutation = useUpdateEvent({
    onSuccess: () => {
      toast.success("Image updated successfully");
      setShowImageModal(false);
      setImageFile(null);
      setPreviewImage(null);
      refetch();
    },
  });

  const headerItems = [
    { key: "overview", label: "Overview", to: "overview" },
    {
      key: "manage-volunteers",
      label: "Manage Volunteers",
      to: "manage-volunteers",
    },
    {
      key: "verify-registration",
      label: "Verify Registration",
      to: "verify-registration",
    },
    {
      key: "mark-completion",
      label: "Mark Completion",
      to: "mark-completion",
    },
  ];

  const handleEditImage = () => {
    setShowImageModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageFile(null);
    setPreviewImage(null);
  };

  // Handle save image
  const handleSaveImage = () => {
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append(
      "eventRequest",
      new Blob([JSON.stringify({})], { type: "application/json" })
    );

    formData.append("imageFile", imageFile);

    updateEventMutation.mutate({ eventId: id, payload: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading event: {error.message}</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  // Access validation: only owner can access
  const hasAccess = !!user && String(eventData.ownerId) === String(user.id);
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="bg-red-200 rounded-full p-5 mb-5">
          <LockKeyhole className="w-12 h-12 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-red-500 font-medium">Access Denied</p>
          <p className="text-gray-500">
            You don't have permission to manage this event.
            <br />
            Only the event owner can access this section.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log("Event Data in ManagerEventForManager:", eventData);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ManagerDbHero
          thumbnail={eventData.imageUrl}
          title={eventData.name}
          subtitle={eventData.description}
          status={eventData.status}
          date={eventData.startTime}
          id={eventData.id}
          onEditImage={handleEditImage}
        />
      </div>
      <div>
        <Tabs items={headerItems} variant="header" asLink />
      </div>

      {/* Pass eventData to child routes via context */}
      <div className="mt-4">
        <Outlet context={{ eventId: id, eventData }} />
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Update Event Image
                </h3>
                <button
                  onClick={handleCloseImageModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Image */}
                {eventData.imageUrl && !previewImage && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Current Image
                    </p>
                    <img
                      src={eventData.imageUrl}
                      alt="Current event"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Preview New Image */}
                {previewImage && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview New Image
                    </p>
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    <span className="text-gray-600">
                      {previewImage ? "Change Image" : "Select Image"}
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseImageModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveImage}
                    disabled={!imageFile || updateEventMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateEventMutation.isPending
                      ? "Uploading..."
                      : "Upload Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerEventForManager;
