import React, { useEffect, useState } from "react";
import NavBar from "../components/Sidebar/NavBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../components/Sidebar/BottomNav";
import { useNavbar } from "../hook/useNavbar";
import { useAuth } from "../hook/useAuth";
import { LOGIN_LINK } from "../constant/constNavigate";
import { getUserInfo } from "../services/userService";
import { useProfileCompleteness } from "../hook/useUser";
import ProfileCompletionBanner from "../components/Banner/ProfileCompletionBanner";
import NotificationPermissionPrompt from "../components/Notification/NotificationPermissionPrompt";
import { ArrowUp } from "lucide-react";

export default function MainLayout() {
  const { showNavbar } = useNavbar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingBan, setIsCheckingBan] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Check profile completeness (only fetch once user is loaded and not banned)
  const { data: profileValidation, isLoading: isLoadingProfile } =
    useProfileCompleteness();

  console.log("==== MainLayout Check ====");
  console.log("MainLayout user:", user);

  useEffect(() => {
    if (!user) {
      console.log("MainLayout: No user found, redirecting to LOGIN_LINK");
      window.location.href = LOGIN_LINK;
      return;
    }

    // Check if user is banned
    const checkBanStatus = async () => {
      try {
        const userInfo = await getUserInfo();
        console.log("User info from /me:", userInfo);

        if (userInfo?.status === "BANNED" || userInfo?.status === "banned") {
          console.log("User is banned, redirecting to /banned");
          navigate("/banned", { replace: true });
          return;
        }

        setIsCheckingBan(false);
      } catch (error) {
        console.error("Error checking ban status:", error);
        // If error, continue anyway (don't block user)
        setIsCheckingBan(false);
      }
    };

    checkBanStatus();
  }, [user, navigate]);

  // Check if user dismissed banner
  useEffect(() => {
    const dismissed = localStorage.getItem("profileBannerDismissed");
    const skipped = localStorage.getItem("profileSkipped");
    if (dismissed || skipped) {
      setShowBanner(false);
    }
  }, []);

  const handleDismissBanner = () => {
    localStorage.setItem("profileBannerDismissed", "true");
    setShowBanner(false);
  };

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Don't show banner on complete-profile page or banned page
  // Also don't show while still loading profile data
  const shouldShowBanner =
    showBanner &&
    !isLoadingProfile &&
    profileValidation &&
    !profileValidation.isComplete &&
    profileValidation.missingFields?.length > 0 &&
    location.pathname !== "/complete-profile" &&
    location.pathname !== "/banned";

  if (!user || isCheckingBan) {
    // Chờ redirect hoặc check ban status
    console.log("MainLayout: Waiting for user or checking ban status");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-soft-gradient flex flex-col overflow-x-hidden">
      {/* Navbar fixed (desktop / tablet) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-white border-b-gray-400/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <NavBar />
        </div>
      </header>

      {/* Profile Completion Banner */}
      {shouldShowBanner && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <ProfileCompletionBanner
            missingFields={profileValidation.missingFields}
            onDismiss={handleDismissBanner}
          />
        </div>
      )}

      {/* Nội dung chính */}
      <main
        className={`flex-1 px-4 sm:px-6 lg:px-8 pb-20 ${
          shouldShowBanner ? "pt-32" : "pt-20"
        }`}
      >
        {/* thêm pb-20 để tránh bị che bởi BottomNav */}
        <div className="max-w-7xl mx-auto relative">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (mobile only) */}
      {showNavbar && <BottomNav />}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt />
    </div>
  );
}
