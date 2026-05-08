import React from "react";
import { Camera, Send } from "lucide-react";

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  upLoadImg,
  deleteImg,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-3 w-full px-4 py-2"
    >
      <div className="flex flex-1 relative">
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          className="w-full border border-blue-200 bg-gray-200/20 rounded-2xl backdrop-blur px-5 pr-24 py-3 text-base text-gray-800 outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition-all placeholder-gray-500"
          placeholder="Comment here..."
        />
        <div className="absolute inset-y-0 right-2 flex items-center space-x-3">
          {upLoadImg && (
            <button
              type="button"
              onClick={upLoadImg}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="Thêm ảnh"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!value.trim()}
            title="Send comment"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
