import React from "react";
import ModalActivity from "../../components/ModalActivity/ModalActivity";
import AnnouncedEventCard from "../../components/Dashboard/AnnouncedEventCard";
import { useApprovedEventsTop2ByName } from "../../hook/useEvent";
import { BellOff } from "lucide-react";

const SkeletonAnnouncedEventCard = () => (
  <div className="min-h-[154px] rounded-2xl border border-deep-forest/10 bg-white/55 p-5 shadow-sm">
    <div className="grid min-h-[112px] animate-pulse grid-cols-[minmax(0,1fr)_96px] items-center gap-5 max-sm:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="space-y-2">
          <div className="h-5 w-2/3 rounded-full bg-deep-forest/10" />
          <div className="h-3 w-32 rounded-full bg-deep-forest/10" />
        </div>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <div className="h-10 rounded-[10px] bg-deep-forest/10" />
          <div className="h-10 rounded-[10px] bg-deep-forest/10" />
        </div>
        <div className="h-4 w-5/6 rounded-full bg-deep-forest/10" />
      </div>
      <div className="aspect-square w-24 justify-self-end rounded-2xl bg-deep-forest/10 max-sm:w-full" />
    </div>
  </div>
);

function NewEventsAnnounced({ className }) {
  const { data, isLoading, isError } = useApprovedEventsTop2ByName();

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
      typeof event?.participantCount === "number"
        ? event.participantCount
        : typeof event?.registrationCount === "number"
        ? event.registrationCount
        : 0,
    capacity: typeof event?.capacity === "number" ? event.capacity : 0,
    urlImg: normalizeImageUrl(event?.imageUrl),
  }));

  return (
    <div className={`h-full ${className || ""}`}>
      <ModalActivity
        title="New Events Announced"
        subtile="Recently Announced"
        viewMore={true}
        path="/dashboard/eventmanager"
        className="min-h-[470px]"
      >
        {isLoading && (
          <>
            {[0, 1].map((i) => (
              <SkeletonAnnouncedEventCard key={i} />
            ))}
          </>
        )}
        {isError && (
          <div className="text-sm font-bold text-foudre-pink">
            Failed to load new announcements.
          </div>
        )}
        {!isLoading && !isError && cards.length === 0 && (
          <div className="text-sm text-deep-forest/65 flex flex-col gap-6 mt-5 items-center">
            <div className="mx-auto flex h-[64px] w-[64px] items-center justify-center rounded-full bg-deep-forest/5">
              <BellOff className="h-[32px] w-[32px] text-deep-forest/45" />
            </div>
            <div>No new announcements.</div>
          </div>
        )}
        {!isLoading &&
          !isError &&
          cards.length > 0 &&
          cards.map((card, idx) => (
            <AnnouncedEventCard key={`${card.title}-${idx}`} {...card} />
          ))}
      </ModalActivity>
    </div>
  );
}

export default NewEventsAnnounced;
