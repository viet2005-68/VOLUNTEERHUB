import React from "react";
import ModalActivity from "../../components/ModalActivity/ModalActivity";
import PendingEventCard from "../../components/Admin/PendingEventCard";
import { usePendingEventsTop3 } from "../../hook/useEvent";
import { Clock } from "lucide-react";

function PendingEventAd({ className }) {
  const { data, isLoading, isError } = usePendingEventsTop3();

  const raw = data;
  const items = Array.isArray(raw) ? raw : raw?.data ?? raw?.content ?? [];

  const normalizeImageUrl = (url) => {
    if (typeof url !== "string") return undefined;
    return url.replace(/`/g, "").trim();
  };

  const formatLocation = (address) => {
    if (!address) return "";
    const parts = [address.street, address.district, address.province].filter(
      Boolean
    );
    return parts.join(", ");
  };

  const cards = items.slice(0, 3).map((event) => ({
    id: event?.id || "",
    title: event?.name || "Untitled Event",
    date: event?.startTime || null,
    starttime: event?.startTime || null,
    endtime: event?.endTime || null,
    location: formatLocation(event?.address) || event?.location || "",
    joined:
      typeof event?.currentRegistrations === "number"
        ? event.currentRegistrations
        : typeof event?.participantCount === "number"
        ? event.participantCount
        : typeof event?.registrationCount === "number"
        ? event.registrationCount
        : 0,
    capacity: typeof event?.capacity === "number" ? event.capacity : 0,
    urlImg: normalizeImageUrl(event?.imageUrl),
    category: event?.category?.name || "",
  }));

  return (
    <div className={className}>
      <ModalActivity
        title="Pending Events"
        subtile="Awaiting Approval"
        viewMore={true}
        path="/dashboard/eventmanager"
      >
        {isLoading && (
          <>
            <PendingEventCard
              title="Loading..."
              date={null}
              starttime={null}
              endtime={null}
              location=""
              joined={0}
              capacity={0}
            />
            <PendingEventCard
              title="Loading..."
              date={null}
              starttime={null}
              endtime={null}
              location=""
              joined={0}
              capacity={0}
            />
            <PendingEventCard
              title="Loading..."
              date={null}
              starttime={null}
              endtime={null}
              location=""
              joined={0}
              capacity={0}
            />
          </>
        )}
        {isError && (
          <div className="text-sm text-red-500">
            Failed to load pending events.
          </div>
        )}
        {!isLoading && !isError && cards.length === 0 && (
          <div className="text-sm text-gray-500 flex flex-col gap-6 mt-5 items-center">
            <div className="w-12 h-12 mx-auto">
              <Clock className="w-full h-full text-gray-500" />
            </div>
            <div>No pending events.</div>
          </div>
        )}
        {!isLoading &&
          !isError &&
          cards.length > 0 &&
          cards.map((card, idx) => (
            <PendingEventCard key={`${card.id}-${idx}`} {...card} />
          ))}
      </ModalActivity>
    </div>
  );
}

export default PendingEventAd;
