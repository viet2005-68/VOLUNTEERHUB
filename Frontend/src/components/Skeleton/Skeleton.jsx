import React from "react";

// Hàm tiện ích để nối class
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-200 rounded-md", className)}
      {...props}
    />
  );
};

export default Skeleton;
