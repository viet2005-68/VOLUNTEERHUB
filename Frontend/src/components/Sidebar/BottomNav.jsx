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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-3xl mx-auto flex justify-between items-center px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center text-xs focus:outline-none ${
                isActive(item.to) ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />

                {item.key === "messages" && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] rounded-full px-1">
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
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
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
