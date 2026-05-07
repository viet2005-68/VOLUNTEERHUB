import React from "react";
import UserCard from "../User/UserCard";

function VoluteerList({ userList, loadMore, end }) {
  return (
    <div>
      <div className="flex flex-col gap-5 max-sm:gap-2 max-sm:px-4 max-sm:mt-5">
        <div>
          <p className="font-semibold">Other Volunteer</p>
          <p className="text-gray-600 text-sm">See who else is participating</p>
        </div>
        <div className="flex flex-col gap-4 md:gap-4">
          {userList.map((item) => (
            <UserCard key={item.id} data={item} />
          ))}
        </div>
        <p
          className="font-light text-xs mt-2 hover:cursor-pointer mb-2 hover:text-blue-600"
          onClick={loadMore}
        >
          {end ? "No more volunteers" : "More volunteers"}
        </p>
      </div>
    </div>
  );
}

export default VoluteerList;
