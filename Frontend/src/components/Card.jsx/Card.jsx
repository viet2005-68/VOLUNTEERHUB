import React from "react";

function Card({ children, animate = false, className = "" }) {
  return (
    <div
      className={`border border-deep-forest/15 p-5 rounded-2xl bg-pale-canvas text-deep-forest ${
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
