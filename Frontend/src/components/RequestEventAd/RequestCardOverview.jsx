import React from "react";
import ModalActivity from "../ModalActivity/ModalActivity";
import RequestCard from "./RequestCard";
import { usePendingRegistrationsTop3ByNameAsc } from "../../hook/useRegistration";
import { Skeleton } from "@mui/material";
import { BellOff } from "lucide-react";

const SkeletonRequestCard = () => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border rounded-xl shadow-sm mb-3 gap-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex flex-col gap-1">
        <Skeleton variant="text" width={160} height={20} />
        <Skeleton variant="text" width={120} height={16} />
      </div>
    </div>
    <div className="flex flex-row items-center gap-2">
      <Skeleton variant="rectangular" width={90} height={34} />
      <Skeleton variant="rectangular" width={80} height={34} />
    </div>
  </div>
);

function RequestCardOverview() {
  const { data, isLoading, isFetching, isError, error } =
    usePendingRegistrationsTop3ByNameAsc();

  const items = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  const loading = isLoading || isFetching;

  return (
    <div>
      <ModalActivity
        title="Join Requests"
        subtile="Join Requests"
        viewMore={true}
        path="/dashboard/approve-registration"
        className="flex flex-col justify-start"
      >
        {loading && [0, 1, 2, 3].map((i) => <SkeletonRequestCard key={i} />)}

        {!loading && isError && (
          <div className="text-sm text-red-600">
            Error: {error?.message || "Error undefined"}
          </div>
        )}

        {!loading && !isError && items.length === 0 && (
          <div className="text-sm text-gray-500 flex flex-col gap-2 mt-5 items-center justify-center flex-1">
            <div className="w-12 h-12 mx-auto">
              <BellOff className="w-full h-full text-gray-500" />
            </div>
            <div>No new requests.</div>
          </div>
        )}

        {!loading &&
          !isError &&
          items.map((item, idx) => (
            <RequestCard
              key={item.id ?? item.registrationId ?? idx}
              data={item}
            />
          ))}
      </ModalActivity>
    </div>
  );
}

export default RequestCardOverview;
