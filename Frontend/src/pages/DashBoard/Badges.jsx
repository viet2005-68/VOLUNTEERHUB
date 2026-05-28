import React from "react";
import Badge from "../../components/Badge/Badge";
import { BADGE_CATALOG } from "../../constant/badgeCatalog";
import { useMyBadges } from "../../hook/useUser";

export default function Badges() {
  const { data: userBadges = [], isLoading, isError } = useMyBadges();
  const earnedIds = new Set(userBadges.map((badge) => Number(badge.badgeId)));

  return (
    <div className="rounded-2xl border border-deep-forest/15 bg-pale-canvas p-5 flex flex-col gap-10 text-deep-forest">
      <div>
        <p className="text-2xl font-bold max-sm:text-md">
          Achievement Badges
        </p>
        <p className="text-deep-forest/65">
          Your volunteer milestones and recognition
        </p>
      </div>
      {isLoading && (
        <div className="rounded-lg border border-deep-forest/10 bg-white/55 px-4 py-3 text-sm text-deep-forest/65">
          Loading your badges...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load your badges right now.
        </div>
      )}
      <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1 max-sm:gap-8 lg:gap-10 px-10 gap-5 max-sm:px-20">
        {BADGE_CATALOG.map((item) => (
          <Badge key={item.id} {...item} active={earnedIds.has(item.id)} />
        ))}
      </div>
    </div>
  );
}
