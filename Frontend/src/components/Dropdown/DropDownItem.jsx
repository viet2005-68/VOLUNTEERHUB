import React from "react";

function DropDownItem({ children, handleClick }) {
  return (
    <li
      className={`flex gap-3 items-center px-4 py-2 text-gray-800 hover:bg-gray-50 cursor-pointer`}
      onClick={handleClick}
    >
      {children}
    </li>
  );
}

export default DropDownItem;
