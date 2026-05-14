// src/components/BottomNav/BottomNav.jsx
import React, { useState } from "react";
import {
  Home,
  MessageSquare,
  Trophy,
  User,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import CreateEventModal from "../Modal/CreateEventModal";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      key: "events",
      label: "Events",
      icon: Home,
      to: "/opportunities",
    },
    {
      key: "leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      to: "/leaderboard",
    },
    {
      key: "profile",
      label: "Profile",
      icon: User,
      to: "/Setting",
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-pale-canvas/95 border-t border-deep-forest/15 backdrop-blur-xl z-50">
      <div className="max-w-3xl mx-auto flex justify-between items-center px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center text-xs font-bold focus:outline-none transition-colors ${
                isActive(item.to) ? "text-foudre-pink" : "text-deep-forest/65"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />

                {item.key === "messages" && (
                  <span className="absolute -top-2 -right-3 bg-foudre-pink text-pale-canvas text-[10px] rounded-lg px-1">
                    {/* Replace with real unread count */}3
                  </span>
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}

        {/* Floating action button for Manager only - Create Event */}
        {user && user.role === "MANAGER" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-bubblegum-blush hover:bg-foudre-pink text-deep-forest hover:text-pale-canvas rounded-full w-14 h-14 flex items-center justify-center border border-foudre-pink/30 transition-all duration-200 active:scale-95"
            aria-label="Create Event"
            title="Create Event"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </nav>
  );
}
