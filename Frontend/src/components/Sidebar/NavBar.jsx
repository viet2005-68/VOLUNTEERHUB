import { BellDot } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../assets/img/index";
import { LOGIN_LINK } from "../../constant/constNavigate";
export default function NavBar() {
  const navigate = useNavigate();
  const [navChoice, setNavChoice] = useState("Dashboard");
  const { user, logout } = useAuth();

  console.log("==== NavBar Check ====");
  console.log("NavBar user:", user);

  // Early return khi chưa có user để tránh lỗi null reference
  if (!user) {
    console.log("NavBar: No user, returning null");
    return null;
  }

  const normalizeRole = (role) => {
    if (role === ROLES.ADMIN) return "Admin";
    if (role === ROLES.MANAGER) return "Manager";
    if (role === ROLES.USER) return "Volunteer";
  };

  const displayName = user?.name ?? "Guest";
  const roleLabel = user?.role ? normalizeRole(user.role) : "Guest";
  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex items-center -space-x-1">
        <span className="w-12">
          <img src={Logo} alt="logo" className="max-h-max" />
        </span>
        <span className="max-sm:hidden font-semibold font-lobster text-2xl max-sm:text-xl">
          VolunteerHub
        </span>
      </div>
      <div className="self-center">
        <ul className="hidden md:flex items-center gap-8 max-w-1/2 text-lg  text-gray-700">
          <li
            onClick={() => {
              navigate("/dashboard");
              setNavChoice("Dashboard");
            }}
            className={`cursor-pointer hover:underline hover:decoration-red-500 decoration-2 underline-offset-4 transform duration-150 ${
              navChoice === "Dashboard"
                ? "underline decoration-red-400 underline-offset-2"
                : ""
            }`}
          >
            DashBoard
          </li>
          <li
            onClick={() => {
              navigate("/opportunities");
              setNavChoice("Opportunities");
            }}
            className={`cursor-pointer hover:underline hover:decoration-red-500 decoration-2 underline-offset-4 ${
              navChoice === "Opportunities"
                ? "underline decoration-red-400 underline-offset-2"
                : ""
            }`}
          >
            Opportunities
          </li>

          <li
            onClick={() => {
              navigate("/leaderboard");
              setNavChoice("Leaderboard");
            }}
            className={`cursor-pointer hover:underline hover:decoration-red-500 decoration-2 underline-offset-4 ${
              navChoice === "Leaderboard"
                ? "underline decoration-red-400 underline-offset-2"
                : ""
            }`}
          >
            Leaderboard
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-8">
        <BellDot
          className="cursor-pointer hover:text-red-400"
          onClick={() => navigate("/dashboard/notifications")}
        />
        <DropDown
          trigger={
            <div className="flex flex-row items-center gap-3">
              <div className="bg-red-400 flex items-center flex-col rounded-full w-10 h-10 justify-center">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${displayName}`}
                  alt="avatar"
                  className="w-6 h-6 object-container"
                />
              </div>
              <div className="flex flex-col text-left">
                <span>{displayName}</span>
                <span className="text-gray-700 text-sm">{roleLabel}</span>
              </div>
            </div>
          }
        >
          <DropDownItem
            className="cursor-pointer"
            handleClick={() => navigate("/setting")}
          >
            <span>Setting</span>
          </DropDownItem>
          <DropDownItem
            className="cursor-pointer"
            handleClick={async () => {
              try {
                console.log("[NavBar] Calling logout()...");
                await logout();

                await new Promise((resolve) => setTimeout(resolve, 1000));

                console.log("[NavBar] Now redirecting to:", LOGIN_LINK);
                // Force reload to clear all state and redirect to login
                window.location.href = LOGIN_LINK;
              } catch (error) {
                console.error("[NavBar] Logout error:", error);
              }
            }}
          >
            <span>Logout</span>
          </DropDownItem>
        </DropDown>
      </div>
    </div>
  );
}
