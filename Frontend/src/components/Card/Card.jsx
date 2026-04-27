import React from "react";

function Card({ children, animate = false, className = "" }) {
  return (
    <div
      className={`border-1 border-gray-600/20 p-5 rounded-xl bg-white shadow-md shadow-gray-400/20 ${
        animate
          ? "hover:sm:scale-101 sm:transition-all sm:duration-500 sm:active:duration-300 sm:ease-in-out sm:active:scale-98"
          : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default Card;
