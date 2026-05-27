import React from "react";

const getUserName = (user) =>
  user?.fullName || user?.name || user?.username || user?.email || "Volunteer";

const getAvatarUrl = (user) =>
  user?.avatarUrl ||
  "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
    encodeURIComponent(getUserName(user));

function VolunteerCard({ user, index }) {
  const name = getUserName(user);

  return (
    <div
      className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-pale-canvas bg-ash-whisper shadow-sm"
      style={{ zIndex: 20 - index }}
      title={name}
    >
      <img
        src={getAvatarUrl(user)}
        alt={name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function VolunteerHero({ userList = [], totalCount = 0, hasMore, onShowMore }) {
  const visibleUsers = userList.slice(0, 5);
  const remainingCount = Math.max(totalCount - visibleUsers.length, 0);

  if (visibleUsers.length === 0) return null;

  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-[14px] bg-ash-whisper/45 px-3 py-2 text-deep-forest">
      <div className="flex shrink-0 -space-x-3">
        {visibleUsers.map((user, index) => (
          <VolunteerCard key={user.id || user.email || index} user={user} index={index} />
        ))}
        {hasMore && remainingCount > 0 && (
          <button
            type="button"
            onClick={onShowMore}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-pale-canvas bg-bubblegum-blush text-sm font-black text-deep-forest shadow-sm transition hover:bg-foudre-pink hover:text-pale-canvas"
            style={{ zIndex: 20 - visibleUsers.length }}
            title="Show more volunteers"
          >
            +{remainingCount}
          </button>
        )}
      </div>
      <p className="min-w-0 text-sm font-bold leading-[1.15] text-deep-forest/70 sm:text-base">
        {totalCount} volunteer{totalCount > 1 ? "s" : ""} joined
      </p>
    </div>
  );
}

export default VolunteerHero;
