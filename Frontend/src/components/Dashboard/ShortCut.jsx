import React from "react";
import { Md18UpRating } from "react-icons/md";

function ShortCut({ title = "Ho", icon = <Md18UpRating />, link }) {
  return (
    <div className="max-w-1/2 ">
      <div className="flex flex-col gap-4 bg-pale-canvas font-bold rounded-2xl p-4 border border-deep-forest/15 text-deep-forest place-items-center hover:bg-ash-whisper duration-100 ease-in-out">
        <div>{title}</div>
        <div className="scale-250">{icon}</div>
      </div>
    </div>
  );
}

export default ShortCut;
