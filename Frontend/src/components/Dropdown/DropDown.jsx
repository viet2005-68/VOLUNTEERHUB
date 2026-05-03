import React, { useState } from "react";
import useClickOutside from "../../hook/ClickOutside";

function DropDown({ children, trigger }) {
  const [show, setShow] = useState(false);
  const dropRef = useClickOutside(() => setShow(false));
  return (
    <div
      onClick={() => setShow((curr) => !curr)}
      className="w-fit relative"
      ref={dropRef}
    >
      <div>{trigger}</div>
      {show && (
        <ul
          className={`w-full absolute left-0 mt-2 bg-white rounded-md shadow-md overflow-hidden`}
        >
          {children}
        </ul>
      )}
    </div>
  );
}

export default DropDown;
