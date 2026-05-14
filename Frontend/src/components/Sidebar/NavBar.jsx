import { BellDot } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";
import { useNavigate } from "react-router-dom";
import { Logo } from "../../assets/img/index";
import DropDown from "../Dropdown/DropDown";
import DropDownItem from "../Dropdown/DropDownItem";
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
    <div className="flex flex-row justify-between w-full text-deep-forest">
      <div className="flex items-center -space-x-1">
        <span className="w-12">
          <img src={Logo} alt="logo" className="max-h-max" />
        </span>
        <span className="max-sm:hidden font-beni text-4xl leading-[0.7] text-foudre-pink uppercase max-sm:text-3xl">
          VolunteerHub
        </span>
      </div>
      <div className="self-center">
        <ul className="hidden md:flex items-center gap-8 max-w-1/2 text-sm font-bold uppercase text-deep-forest">
          <li
            onClick={() => {
              navigate("/dashboard");
              setNavChoice("Dashboard");
            }}
            className={`cursor-pointer rounded-[10px] px-4 py-3 transition-colors hover:bg-ash-whisper ${
              navChoice === "Dashboard"
                ? "bg-deep-forest text-pale-canvas"
                : "text-deep-forest"
            }`}
          >
            DashBoard
          </li>
          <li
            onClick={() => {
              navigate("/opportunities");
              setNavChoice("Opportunities");
            }}
            className={`cursor-pointer rounded-[10px] px-4 py-3 transition-colors hover:bg-ash-whisper ${
              navChoice === "Opportunities"
                ? "bg-deep-forest text-pale-canvas"
                : "text-deep-forest"
            }`}
          >
            Opportunities
          </li>

          <li
            onClick={() => {
              navigate("/leaderboard");
              setNavChoice("Leaderboard");
            }}
            className={`cursor-pointer rounded-[10px] px-4 py-3 transition-colors hover:bg-ash-whisper ${
              navChoice === "Leaderboard"
                ? "bg-deep-forest text-pale-canvas"
                : "text-deep-forest"
            }`}
          >
            Leaderboard
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-8">
        <BellDot
          className="cursor-pointer text-deep-forest transition-colors hover:text-foudre-pink"
          onClick={() => navigate("/dashboard/notifications")}
        />
        <DropDown
          trigger={
            <div className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full border-2 border-ash-whisper bg-pale-canvas">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${displayName}`}
                  alt="avatar"
                  className="w-6 h-6 object-container"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-deep-forest">{displayName}</span>
                <span className="text-deep-forest/65 text-sm">{roleLabel}</span>
              </div>
            </div>
          }
        >
          <DropDownItem
            className="cursor-pointer text-deep-forest hover:text-foudre-pink"
            handleClick={() => navigate("/setting")}
          >
            <span>Setting</span>
          </DropDownItem>
          <DropDownItem
            className="cursor-pointer text-deep-forest hover:text-foudre-pink"
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
