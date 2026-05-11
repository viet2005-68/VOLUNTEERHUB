import DashBoardOverview from "../../components/Dashboard/DashBoardOverview";
import ModalConfirm from "../../components/Modal/ModalConfirm";
import DashboardLayout from "../DashBoard/DashboardLayout";

import QuickActionsUser from "../../components/QuickActionButton/QuickActionsUser";
import UpcomingEvents from "../../components/ModalActivity/UpcomingEvents";
import RecentActivity from "../../components/ModalActivity/RecentActivity";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-10">
      <DashboardLayout />
      <DashBoardOverview />
      <QuickActionsUser />
      <div className="w-full">
        <div className="grid grid-cols-2 gap-10 max-lg:block">
          <UpcomingEvents className="basis-1/2" />
          <RecentActivity className="basis-1/2" />
        </div>
      </div>
    </div>
  );
}
