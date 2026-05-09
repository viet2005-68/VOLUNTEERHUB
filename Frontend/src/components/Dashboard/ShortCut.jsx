import React from "react";
import { Md18UpRating } from "react-icons/md";

function ShortCut({ title = "Ho", icon = <Md18UpRating />, link }) {
  return (
    <div className="max-w-1/2 ">
      <div className="flex flex-col gap-4 bg-white font-medium rounded-2xl p-4 border-2 text-black place-items-center hover:bg-gray-100/98 duration-100 ease-in-out hover:shadow-2xs hover:shadow-gray-500/50">
        <div>{title}</div>
        <div className="scale-250">{icon}</div>
      </div>
    </div>
  );
}

export default ShortCut;
