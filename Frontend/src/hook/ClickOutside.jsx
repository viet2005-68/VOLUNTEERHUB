import { useEffect, useRef } from "react";

// Hook tùy chỉnh
export default function useClickOutside(callbackFn) {
  // Tạo một ref để gắn vào phần tử cần theo dõi
  const domNodeRef = useRef();

  useEffect(() => {
    // Hàm xử lý khi click
    const handler = (event) => {
      // Nếu ref tồn tại và phần tử click KHÔNG nằm trong nó
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        callbackFn(); // Gọi callback được truyền vào
      }
    };

    // Gắn listener khi component mount
    document.addEventListener("mousedown", handler);

    // Hủy listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [callbackFn]);

  // Trả ref để component khác gắn vào phần tử
  return domNodeRef;
}
