import React from "react";
import Card from "../Card.jsx/Card";
import { FaCircleCheck } from "react-icons/fa6";
function OrganizationCard({ data, totalEvents, totalVolunteers }) {
  const { fullName, description, avatarUrl } = data || {};
  const eventCount = totalEvents ?? data?.totalEvents ?? data?.totalEvent ?? 0;
  const volunteerCount =
    totalVolunteers ?? data?.totalVolunteers ?? data?.totalVolunteer ?? 0;
  return (
    <Card className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas">
      <div className="flex flex-col gap-5 text-deep-forest">
        <div className="flex flex-row items-center gap-3">
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-12 w-12 rounded-full bg-bubblegum-blush object-cover ring-2 ring-foudre-pink/40"
          />
          <div className="min-w-0 font-bold">
            <p className="inline-flex items-center gap-2 truncate text-base leading-[1.2]">
              {fullName}
              <span>
                <FaCircleCheck className="text-foudre-pink" />
              </span>
            </p>
          </div>
        </div>

        {description && (
          <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
            {description}
          </p>
        )}
        <div className="flex flex-col gap-3 text-base font-bold leading-[1.2]">
          <p className="inline-flex justify-between gap-4">
            Total Event: <span>{eventCount}</span>
          </p>
          <p className="inline-flex justify-between gap-4">
            Total Volunteer: <span>{volunteerCount}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default OrganizationCard;
