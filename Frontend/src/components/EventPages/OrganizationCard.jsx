import React from "react";
import Card from "../Card.jsx/Card";
import { CiCircleCheck } from "react-icons/ci";
import { FaCircle, FaCircleCheck } from "react-icons/fa6";
function OrganizationCard({ data }) {
  console.log("Organization data:", data);
  const { fullName, description, avatarUrl, totalEvent, totalVolunteer } =
    data || {};
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-10 h-10 rounded-full bg-red-400 object-cover ring-1 ring-red-950"
          />
          <div className="font-semibold">
            <p className="inline-flex items-center gap-2">
              {fullName}
              <span>
                <FaCircleCheck className="text-green-500" />
              </span>
            </p>
          </div>
        </div>

        <p>{description}</p>
        <div className="flex flex-col gap-1">
          <p className="inline-flex justify-between">
            Total Event: <span>{totalEvent}</span>
          </p>
          <p className="inline-flex justify-between">
            Total Volunteer: <span>{totalVolunteer}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default OrganizationCard;
