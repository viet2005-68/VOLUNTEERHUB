import React, { useState } from "react";
import { FaEarthAfrica } from "react-icons/fa6";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VolunteerHero from "./VolunteerHero";
import { useConstUserApprovedList } from "../../hook/useRegistration";

function EventHero({ id, imgURL, organizerName, eventName }) {
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState(8);

  // Fetch all approved users
  const { data: approvedUsers, isLoading } = useConstUserApprovedList(id);
  console.log("Approved users for event:", approvedUsers);

  const userList = approvedUsers || [];
  const displayedUsers = userList.slice(0, displayCount);
  const hasMore = userList.length > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative mb-6 flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-[25px] bg-ash-whisper md:min-h-[360px]">
        {imgURL ? (
          <img
            src={imgURL}
            alt="Event Hero"
            className="h-full max-h-[360px] w-full object-cover object-center"
          />
        ) : (
          <div className="font-beni text-[80px] font-black uppercase leading-[0.75] text-foudre-pink/35">
            Event
          </div>
        )}
        {/* Back Button */}
        <button
          onClick={() => navigate("/opportunities")}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-pale-canvas p-3 text-deep-forest transition-colors hover:bg-bubblegum-blush"
          title="Back to Opportunities"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="mb-6 text-deep-forest">
        <p className="mb-2 text-3xl font-bold leading-[1.2] max-sm:px-3">
          {eventName}
        </p>

        <p className="mb-4 inline-flex items-center gap-2 text-base font-medium leading-[1.2] text-deep-forest/70 max-md:text-sm max-sm:px-3">
          <span>
            <FaEarthAfrica />
          </span>
          <span>{organizerName}</span>
        </p>
        {isLoading ? (
          <div className="text-sm font-medium leading-[1.2] text-deep-forest/65">Loading volunteers...</div>
        ) : userList.length > 0 ? (
          <div className="max-sm:px-3">
            <VolunteerHero
              userList={displayedUsers}
              totalCount={userList.length}
              hasMore={hasMore}
              onShowMore={handleShowMore}
            />
          </div>
        ) : (
          <div className="text-sm font-medium leading-[1.2] text-deep-forest/65">No volunteers yet</div>
        )}
      </div>
    </div>
  );
}
export default EventHero;
