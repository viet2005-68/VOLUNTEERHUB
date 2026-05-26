import React from "react";
import QuickActionButton from "./QuickActionButton";
import { useAuth } from "../../hook/useAuth";
import { quickActionsConfig } from "../../constant/quickActionsConfig";

export default function QuickActionsUser() {
  const { user } = useAuth();

  // Get actions based on user role
  const actions = quickActionsConfig[user?.role] || quickActionsConfig.USER;

  return (
    <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
      <h4 className="font-beni text-[46px] font-black uppercase leading-[0.7] text-deep-forest">
        Quick Actions
      </h4>
      <p className="mt-3 mb-6 text-sm font-medium leading-[1.2] text-deep-forest/70">
        Common tasks and shortcuts
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {actions.map((action) => (
          <QuickActionButton key={action.id} {...action} />
        ))}
      </div>
    </div>
  );
}
