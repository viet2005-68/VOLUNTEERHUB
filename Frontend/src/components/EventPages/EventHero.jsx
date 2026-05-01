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
    <div className="flex flex-col w-full ">
      <div className="w-full aspect-[16/5] max-h-[380px] overflow-hidden rounded-xl bg-gray-100 mb-4 relative">
        <img
          src={imgURL}
          alt="Event Hero"
          className="w-full h-full object-cover object-center"
        />
        {/* Back Button */}
        <button
          onClick={() => navigate("/opportunities")}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all flex items-center gap-2"
          title="Back to Opportunities"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="text-black mb-4">
        <p className="text-2xl font-bold mb-1 max-sm:px-3">{eventName}</p>

        <p className="max-md:text-sm max-sm:px-3 inline-flex items-center gap-2 text-gray-600/80 mb-3">
          <span>
            <FaEarthAfrica />
          </span>
          <span>{organizerName}</span>
        </p>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading volunteers...</div>
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
          <div className="text-sm text-gray-500">No volunteers yet</div>
        )}
      </div>
    </div>
  );
}
export default EventHero;
