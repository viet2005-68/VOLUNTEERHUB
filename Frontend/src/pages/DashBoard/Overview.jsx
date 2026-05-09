import React from "react";
import DashBoardOverview from "../../components/Dashboard/DashBoardOverview";
import QuickActionsUser from "../../components/QuickActionButton/QuickActionsUser";
import UpcomingEvents from "../../components/ModalActivity/UpcomingEvents";
import RecentActivity from "../../components/ModalActivity/RecentActivity";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";
import NewEventsAnnounced from "./NewEventsAnnounced";
import PendingEventAd from "./PendingEventAd";
import TrendingEvent from "../../components/TrendingEvent/TrendingEvent";


export default function Overview() {
  const { user } = useAuth();
  console.log(user.role + " hhh");
  return (
    <div className="flex flex-col gap-10">
      <DashBoardOverview />
      <QuickActionsUser />
      <div className="grid grid-cols-2 gap-10 max-lg:grid-cols-1 items-stretch">
        {user.role === ROLES.USER && (
          <>
            <UpcomingEvents className="h-full" />
            <RecentActivity className="h-full" />
          </>
        )}
        {user.role === ROLES.MANAGER && (
          <>
            <NewEventsAnnounced className="basis-1/2" />
            <RequestCardOverview className="basis-1/2" />
          </>
        )}
        {user.role === ROLES.ADMIN && (
          <>
            <PendingEventAd className="basis-1/2" />
            <GrowthMetric className="basis-1/2" />
          </>
        )}
      </div>
      <TrendingEvent />
    </div>
  );
}
