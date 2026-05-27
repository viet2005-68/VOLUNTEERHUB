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
          className="w-full border border-ash-whisper bg-pale-canvas rounded-2xl backdrop-blur px-5 pr-24 py-3 text-base text-deep-forest outline-none focus:ring-1 focus:ring-bubblegum-blush focus:border-foudre-pink shadow-sm transition-all placeholder-deep-forest/45"
          placeholder="Comment here..."
        />
        <div className="absolute inset-y-0 right-2 flex items-center space-x-3">
          {upLoadImg && (
            <button
              type="button"
              onClick={upLoadImg}
              className="p-2 text-deep-forest hover:text-foudre-pink hover:bg-ash-whisper rounded-full transition-colors"
              title="Thêm ảnh"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            className="p-2 bg-deep-forest text-white hover:bg-foudre-pink rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
