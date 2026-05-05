import { useState, useRef, useEffect } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { useUpdatePost } from "../../hook/useCommunity";
import toast from "react-hot-toast";

export default function EditPostModal({ post, eventId, onClose, onSuccess }) {
  const [text, setText] = useState(post?.text || post?.content || "");
  const [images, setImages] = useState([]); // {file, url, isExisting}
  const [existingImages, setExistingImages] = useState(
    Array.isArray(post?.images) ? post.images : []
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: updatePost, isPending } = useUpdatePost(eventId, post?.id);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleImageChange = (e) => {
    if (isPending) return;
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 6));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isPending) return;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const newImages = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 6));
  };

  const removeNewImage = (index) => {
    if (isPending) return;
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const removeExistingImage = (index) => {
    if (isPending) return;
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const content = text.trim();
    const newImageFiles = images.map((i) => i.file).filter(Boolean);

    if (!content && existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error("Post must have content or at least one image");
      return;
    }

    const formData = new FormData();
    formData.append(
      "postRequest",
      new Blob([JSON.stringify({ content })], { type: "application/json" })
    );

    newImageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    // If user removed existing images, we might need to handle that
    // For now, we'll just send new content and new images
    updatePost(formData, {
      onSuccess: () => {
        toast.success("Post updated successfully");
        images.forEach((img) => img?.url && URL.revokeObjectURL(img.url));
        if (onSuccess) onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error("Failed to update post");
      },
    });
  };

  const totalImages = existingImages.length + images.length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-xl shadow-lg flex flex-col sm:max-h-[90vh]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-center pr-8">Edit Post</h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full resize-none rounded-lg p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                disabled={isPending}
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group">
                      <img
                        src={url}
                        alt={`existing-${idx}`}
                        className="h-24 w-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        disabled={isPending}
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 p-1 hover:bg-red-500 rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Images
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                      <img
                        src={img.url}
                        alt={`preview-${idx}`}
                        className="h-24 w-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        disabled={isPending}
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-6 h-6 p-1 hover:bg-red-500 rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            {totalImages < 6 && (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span>Add Images ({totalImages}/6)</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop or click to select
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 pb-6 sm:pb-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || (!text.trim() && totalImages === 0)}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Updating..." : "Update Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
