import React from "react";
import { formatDateTime } from "../../utils/date";

function UserCard({ data }) {
  console.log("UserCard data:", data);
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="rounded-full">
        <img
          src={data?.avatarUrl}
          alt={data?.fullName}
          className="w-10 h-10 rounded-full bg-white border-2 border-purple-200 object-cover"
        />
      </div>
      <div className="text-gray-600 text-sm">
        <p>{data?.fullName}</p>
        <p>{data?.email || ""}</p>
      </div>
    </div>
  );
}

export default UserCard;
