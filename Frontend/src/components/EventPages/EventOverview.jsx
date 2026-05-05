import React, { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import Card from "../Card.jsx/Card";
import { FaLocationPin } from "react-icons/fa6";
import { formatDateTime } from "../../utils/date";
import { Book, BookOpen } from "lucide-react";

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
    <div className="p-4 flex gap-4 flex-col">
      {/* Make cards equal height */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <Card className="h-full">
          <div className="flex items-start gap-3 h-full flex-col justify-between">
            <div className="flex items-start gap-3">
              <FiCalendar className="text-blue-500 text-2xl flex-shrink-0" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-semibold">
                  {startTime ? formatDateTime(startTime) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full">
          <div className="flex items-start gap-3 h-full flex-col justify-between">
            <div className="flex items-start gap-3">
              <FiCalendar className="text-red-500 text-2xl flex-shrink-0" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-semibold">
                  {endTime ? formatDateTime(endTime) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full">
          <div className="flex items-start gap-3 h-full flex-col justify-between">
            <div className="flex items-start gap-3">
              <FaLocationPin className="text-yellow-400 text-2xl flex-shrink-0" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-sm break-words">
                  {location || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5 border border-gray-300 p-4 rounded-2xl duration-300 mt-5">
        <p className="text-md font-semibold  flex items-center gap-1">
          <span className="text-blue-500 w-4">
            <Book className="w-full" />
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
            className="text-blue-500 cursor-pointer"
          >
            {showMore ? "Show less ↑" : "Show more ↓"}
          </span>
        )}
      </div>
      {/* <div>
        <Card>
          <div className="flex flex-col gap-5 max-sm:gap-2">
            <div>
              <p className="font-semibold">Other Volunteer</p>
              <p className="text-gray-600 text-sm">
                See who else is participating
              </p>
            </div>
            <div className="flex flex-col gap-1 md:gap-4">
              {dumpData.slice(0, 5).map((item) => (
                <UserCard key={item.id} {...item} />
              ))}
            </div>
            <p className="font-light text-xs mt-2">More volunteers</p>
          </div>
        </Card>
      </div> */}
    </div>
  );
}

export default EventOverview;
