import React, { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import Card from "../Card.jsx/Card";
import { FaLocationPin } from "react-icons/fa6";
import { formatDateTime } from "../../utils/date";
import { Book } from "lucide-react";

function EventOverview({ description, location, startTime, endTime }) {
  const [showMore, setShowMore] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const descriptionRef = React.useRef(null);

  React.useEffect(() => {
    if (descriptionRef.current && description) {
      const lineHeight = parseFloat(
        getComputedStyle(descriptionRef.current).lineHeight
      );
      const height = descriptionRef.current.scrollHeight;
      const lines = Math.ceil(height / lineHeight);
      setShouldShowButton(lines > 5);
    }
  }, [description]);

  const toggleShowMore = () => setShowMore(!showMore);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Make cards equal height */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="h-full border-deep-forest/10 bg-pale-canvas p-6">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex items-start gap-4">
              <FiCalendar className="h-[34px] w-[34px] flex-shrink-0 text-deep-forest" />
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">Start Time</p>
                <p className="text-lg font-bold leading-[1.1] text-deep-forest">
                  {startTime ? formatDateTime(startTime) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full border-deep-forest/10 bg-pale-canvas p-6">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex items-start gap-4">
              <FiCalendar className="h-[34px] w-[34px] flex-shrink-0 text-foudre-pink" />
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">End Time</p>
                <p className="text-lg font-bold leading-[1.1] text-deep-forest">
                  {endTime ? formatDateTime(endTime) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full border-deep-forest/10 bg-pale-canvas p-6">
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex items-start gap-4">
              <FaLocationPin className="h-[34px] w-[34px] flex-shrink-0 text-deep-forest" />
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">Location</p>
                <p className="max-w-[28ch] break-words text-base font-bold leading-[1.18] text-deep-forest">
                  {location || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5 border border-deep-forest/15 p-4 rounded-2xl duration-300 mt-5">
        <p className="text-md font-semibold  flex items-center gap-1">
          <span className="inline-flex h-[18px] w-[18px] text-deep-forest">
            <Book className="h-full w-full" />
          </span>
          Description
        </p>
        <p
          ref={descriptionRef}
          className={`whitespace-pre-line ${
            !showMore && shouldShowButton ? "line-clamp-5" : ""
          }`}
        >
          {description || "No description available"}
        </p>
        {shouldShowButton && (
          <span
            onClick={toggleShowMore}
            className="cursor-pointer font-bold text-foudre-pink"
          >
            {showMore ? "Show less ↑" : "Show more ↓"}
          </span>
        )}
      </div>
    </div>
  );
}

export default EventOverview;
