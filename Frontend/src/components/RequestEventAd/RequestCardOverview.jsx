import React from "react";
import ModalActivity from "../ModalActivity/ModalActivity";
import RequestCard from "./RequestCard";
import { usePendingRegistrationsTop3ByNameAsc } from "../../hook/useRegistration";
import { BellOff } from "lucide-react";

const SkeletonRequestCard = () => (
  <div className="min-h-[154px] rounded-2xl border border-deep-forest/10 bg-white/55 p-5 shadow-sm">
    <div className="flex min-h-[112px] animate-pulse flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-deep-forest/10" />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="h-5 w-44 max-w-full rounded-full bg-deep-forest/10" />
          <div className="h-4 w-56 max-w-full rounded-full bg-deep-forest/10" />
          <div className="h-8 w-28 rounded-[10px] bg-deep-forest/10" />
        </div>
      </div>
      <div className="flex gap-3 sm:min-w-[240px]">
        <div className="h-11 flex-1 rounded-[10px] bg-deep-forest/10" />
        <div className="h-11 flex-1 rounded-[10px] bg-deep-forest/10" />
      </div>
    </div>
  </div>
);

function RequestCardOverview({ className }) {
  const { data, isLoading, isFetching, isError, error } =
    usePendingRegistrationsTop3ByNameAsc();

  const items = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];
  const overviewItems = items.slice(0, 2);

  const loading = isLoading || isFetching;

  return (
    <div className={`h-full ${className || ""}`}>
      <ModalActivity
        title="Join Requests"
        subtile="Join Requests"
        viewMore={true}
        path="/dashboard/approve-registration"
        className="flex flex-col justify-start min-h-[470px]"
      >
        {loading && [0, 1].map((i) => <SkeletonRequestCard key={i} />)}

        {!loading && isError && (
          <div className="text-sm font-bold text-foudre-pink">
            Error: {error?.message || "Error undefined"}
          </div>
        )}

        {!loading && !isError && overviewItems.length === 0 && (
          <div className="text-sm text-deep-forest/60 flex flex-col gap-2 mt-5 items-center justify-center flex-1">
            <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-deep-forest/5">
              <BellOff className="h-[32px] w-[32px] text-deep-forest/45" />
            </div>
            <div>No new requests.</div>
          </div>
        )}

        {!loading &&
          !isError &&
          overviewItems.map((item, idx) => (
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
