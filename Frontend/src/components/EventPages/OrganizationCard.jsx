import React from "react";
import Card from "../Card.jsx/Card";
import { CiCircleCheck } from "react-icons/ci";
import { FaCircle, FaCircleCheck } from "react-icons/fa6";
function OrganizationCard({ data }) {
  console.log("Organization data:", data);
  const { fullName, description, avatarUrl, totalEvent, totalVolunteer } =
    data || {};
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
            Total Event: <span>{totalEvent}</span>
          </p>
          <p className="inline-flex justify-between gap-4">
            Total Volunteer: <span>{totalVolunteer}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default OrganizationCard;
