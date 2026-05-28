import { BellDot } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";
import { useLocation, useNavigate } from "react-router-dom";
import { VolunteerHubIcon } from "../../assets/img/index";
import DropDown from "../Dropdown/DropDown";
import DropDownItem from "../Dropdown/DropDownItem";
import { LOGIN_LINK } from "../../constant/constNavigate";
export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);

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
  const canUseChat = user?.role !== ROLES.ADMIN;
  const avatarSrc = useMemo(() => {
    if (avatarFailed) return "";

    return (
      user?.avatarUrl ||
      user?.urlAvatar ||
      user?.urlAvartar ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
        displayName
      )}`
    );
  }, [avatarFailed, displayName, user?.avatarUrl, user?.urlAvatar, user?.urlAvartar]);
  const avatarInitial = displayName?.trim()?.charAt(0)?.toUpperCase() || "G";
  const isActiveNav = (key) => {
    if (key === "Dashboard") return location.pathname === "/dashboard";
    if (key === "Opportunities") return location.pathname.startsWith("/opportunities");
    if (key === "Messages") {
      return location.pathname === "/dashboard/messages" || location.pathname.startsWith("/dashboard/event-chat");
    }
    return false;
  };
  const navItemClass = (key) =>
    [
      "cursor-pointer rounded-[10px] px-4 py-3 text-deep-forest transition-colors",
      "hover:bg-ash-whisper hover:text-deep-forest",
      isActiveNav(key) ? "bg-bubblegum-blush/35" : "",
    ]
      .filter(Boolean)
      .join(" ");
  return (
    <div className="flex flex-row justify-between w-full text-deep-forest">
      <div className="flex items-center gap-2">
        <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-pale-canvas">
          <img
            src={VolunteerHubIcon}
            alt="VolunteerHub logo"
            className="h-full w-full object-cover"
          />
        </span>
        <span className="max-sm:hidden font-beni text-4xl leading-[0.7] text-deep-forest uppercase max-sm:text-3xl">
          VolunteerHub
        </span>
      </div>
      <div className="self-center">
        <ul className="hidden md:flex items-center gap-8 max-w-1/2 text-sm font-bold uppercase text-deep-forest">
          <li
            onClick={() => {
              navigate("/dashboard");
            }}
            className={navItemClass("Dashboard")}
          >
            DashBoard
          </li>
          <li
            onClick={() => {
              navigate("/opportunities");
            }}
            className={navItemClass("Opportunities")}
          >
            Opportunities
          </li>

          {canUseChat && (
            <li
              onClick={() => {
                navigate("/dashboard/messages");
              }}
              className={navItemClass("Messages")}
            >
              Messages
            </li>
          )}
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ash-whisper bg-pale-canvas">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <span className="text-sm font-black text-deep-forest">
                    {avatarInitial}
                  </span>
                )}
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
