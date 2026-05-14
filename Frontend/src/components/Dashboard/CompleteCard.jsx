import React, { useState } from "react";
import Card from "../Card.jsx/Card";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Calendar, Clock, Building2, Check } from "lucide-react";
import { useAuth } from "../../hook/useAuth";

function CompleteCard({
  title,
  organization,
  date,
  hours,
  thumbnail = "https://tse1.mm.bing.net/th/id/OIP.lTwHCqIOO3-hgviQYUXMjQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
}) {
  const [open, setOpen] = useState(false);
  const user = useAuth();
  console.log("user", user);
  return (
    <Card>
      <div className="flex flex-row justify-between px-3 py-2 max-sm:flex-col max-sm:gap-2">
        {/* THUMBNAIL + TITLE */}
        <div className="flex flex-row flex-1 gap-3">
          <img
            src={thumbnail}
            alt={title}
            className="w-20 h-20 object-cover rounded-2xl sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer"
          />

          {/* DESKTOP INFO */}
          <div className="hidden sm:flex flex-col justify-center gap-1 cursor-pointer flex-1">
            <div className="font-semibold text-[18px]">{title}</div>
            <div className="flex items-center gap-2 text-deep-forest/65 text-sm">
              <Building2 size={16} className="flex-shrink-0" />
              <span>{organization}</span>
            </div>
            <div className="flex items-center gap-2 text-deep-forest/65 text-sm">
              <Calendar size={16} className="flex-shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-deep-forest/65 text-sm">
              <Clock size={16} className="flex-shrink-0" />
              <span>{hours}</span>
            </div>
          </div>

          {/* MOBILE TITLE + CHEVRON */}
          <div className="flex flex-col justify-center sm:hidden flex-1">
            <div className="flex justify-between items-center w-full gap-2">
              <p className="font-semibold text-[16px] break-words flex-1 cursor-pointer">
                {title}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
                className="text-deep-forest/65 flex-shrink-0 p-2 -m-2 hover:bg-ash-whisper rounded-lg transition-colors"
              >
                {open ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* STATUS BUTTON */}
        <div className="flex flex-row gap-2 justify-around max-sm:self-start max-sm:mt-2 items-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bubblegum-blush border border-deep-forest/15">
            <Check className="w-4 h-4 text-deep-forest" />
            <span className="text-deep-forest font-bold text-sm">
              Completed
            </span>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="px-4 py-1.5 rounded-lg bg-deep-forest text-pale-canvas hover:bg-foudre-pink transition-colors cursor-pointer text-sm font-bold"
          >
            View Certificate
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN INFO */}
      {open && (
        <div className="sm:hidden px-3 pt-2 pb-3 text-deep-forest/65 text-sm border-t border-deep-forest/15 mt-2 space-y-1">
          <p>
            <b>Organization:</b> {organization}
          </p>
          <p>
            <b>Date:</b> {date}
          </p>
          <p>
            <b>Hours:</b> {hours}
          </p>
        </div>
      )}
    </Card>
  );
}

export default CompleteCard;
