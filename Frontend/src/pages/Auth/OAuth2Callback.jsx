import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LOGIN_LINK } from "../../constant/constNavigate";
import { ROLES } from "../../constant/role";
import storage from "../../utils/storage";
import {
  createUserProfile,
  getUserInfo,
  getProfileCompleteness,
} from "../../services/userService";

/**
 * OAuth authorization codes are single-use. React 18 Strict Mode runs effects
 * twice in development, which would exchange the same code twice → invalid_grant.
 * Reuse the same in-flight promise per code + flow.
 */
const tokenExchangeInflight = new Map();

function exchangeCodeForToken(code, isGoogleOAuth) {
  const key = `${isGoogleOAuth ? "google" : "volunteerhub"}:${code}`;
  if (tokenExchangeInflight.has(key)) {
    return tokenExchangeInflight.get(key);
  }

  const promise = (async () => {
    if (isGoogleOAuth) {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: import.meta.env.VITE_GG_CLIENT_ID,
          client_secret: import.meta.env.VITE_GG_CLIENT_SECRET,
          redirect_uri: "http://localhost:3000/login/oauth2/code/google",
        }),
      });
      const tokenData = await tokenResponse.json();
      return { ok: tokenResponse.ok, tokenData };
    }

    const oauthClientId =
      import.meta.env.VITE_OAUTH_CLIENT_ID ||
      "7fcdbb6c-fc1d-4921-a52d-0466557b6132";
    const oauthClientSecret =
      import.meta.env.VITE_OAUTH_CLIENT_SECRET ||
      "f584278e-be8a-4f55-9c64-8e7be8f9e846";
    const oauthRedirectUri =
      import.meta.env.VITE_OAUTH_REDIRECT_URI ||
      "http://localhost:3000/login/oauth2/code/volunteerhub";
    const authServerBaseUrl =
      import.meta.env.VITE_API_LOGIN || "http://localhost:7070";

    const tokenResponse = await fetch(`${authServerBaseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(`${oauthClientId}:${oauthClientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: oauthRedirectUri,
      }),
    });

    let tokenData = {};
    try {
      tokenData = await tokenResponse.json();
    } catch {
      /* ignore non-JSON bodies */
    }
    return { ok: tokenResponse.ok, tokenData };
  })();

  tokenExchangeInflight.set(key, promise);
  promise.finally(() => {
    setTimeout(() => tokenExchangeInflight.delete(key), 5 * 60 * 1000);
  });

  return promise;
}

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple executions (React Strict Mode)
    if (hasProcessed) {
      return;
    }

    const handleCallback = async () => {
      setHasProcessed(true);
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const currentPath = window.location.pathname;

      // Check for OAuth2 error
      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setLoading(false);
        setTimeout(() => (window.location.href = LOGIN_LINK), 3000);
        return;
      }

      // Check for authorization code
      if (!code) {
        setError("No authorization code received");
        setLoading(false);
        setTimeout(() => (window.location.href = LOGIN_LINK), 3000);
        return;
      }

      try {
        console.log("Exchanging authorization code for token...");
        console.log("Current callback path:", currentPath);

        // Determine if this is Google OAuth or custom OAuth
        const isGoogleOAuth = currentPath.includes("/login/oauth2/code/google");

        const { ok: tokenOk, tokenData } = await exchangeCodeForToken(
          code,
          isGoogleOAuth
        );

        if (!tokenOk) {
          console.error("Token exchange failed:", tokenData);
          throw new Error(
            tokenData.error_description ||
              tokenData.error ||
              "Failed to exchange code for token"
          );
        }
        console.log("Token received successfully", tokenData);

        let userInfo;
        let finalToken;

        if (isGoogleOAuth) {
          // Google OAuth flow: Parse id_token to get user info
          if (!tokenData.id_token) {
            throw new Error("No id_token received from Google");
          }

          console.log("Parsing Google id_token...");
          userInfo = parseJwt(tokenData.id_token);
          console.log("Google user info from id_token:", userInfo);

          // Use id_token as the main token for authentication
          finalToken = tokenData.id_token;

          // Store access_token separately if available for calling Google APIs
          if (tokenData.access_token) {
            localStorage.setItem("google_access_token", tokenData.access_token);
            console.log("Google access_token stored in localStorage");
          }
        } else {
          // VolunteerHub OAuth - token is already JWT
          finalToken = tokenData.access_token;
          userInfo = parseJwt(finalToken);
          console.log("User info from JWT:", userInfo);
        }

        // Save tokens using storage utility
        storage.setToken(finalToken);
        if (tokenData.refresh_token) {
          localStorage.setItem("refresh_token", tokenData.refresh_token);
        }

        // Extract role from token or set default for Google users
        let role;
        if (isGoogleOAuth) {
          // For Google OAuth, try to get role from backend token, otherwise default to USER
          if (finalToken !== tokenData.id_token) {
            const tokenInfo = parseJwt(finalToken);
            role =
              tokenInfo.roles?.[0]?.role || tokenInfo.roles?.[0] || ROLES.USER;
          } else {
            role = ROLES.USER;
          }
        } else {
          // VolunteerHub OAuth - roles from custom claims
          role = userInfo.roles?.[0]?.role || userInfo.roles?.[0];
        }

        // Validate role - only allow ADMIN, USER, MANAGER
        const allowedRoles = [ROLES.ADMIN, ROLES.USER, ROLES.MANAGER];
        if (!role || !allowedRoles.includes(role)) {
          console.error("Invalid or unauthorized role:", role);
          throw new Error(
            "Unauthorized role. Only ADMIN, USER, and MANAGER roles are allowed."
          );
        }

        // Try to get or create user profile in UserService
        try {
          console.log("Checking if user profile exists...");
          const existingProfile = await getUserInfo();
          console.log("User profile already exists:", existingProfile);

          // Check if user is banned
          if (
            existingProfile?.status === "BANNED" ||
            existingProfile?.status === "banned"
          ) {
            console.log("User is banned, redirecting to banned page");
            setError(
              "Your account has been suspended. Please contact support."
            );
            setLoading(false);
            setTimeout(() => {
              window.location.href = "/banned";
            }, 2000);
            return;
          }
        } catch (error) {
          // Check if user is banned (403 Forbidden)
          if (error.response?.status === 403) {
            console.log(
              "User is banned (403 Forbidden), redirecting to banned page"
            );
            setError(
              "Your account has been suspended. Please contact support."
            );
            setLoading(false);
            setTimeout(() => {
              window.location.href = "/banned";
            }, 2000);
            return;
          }

          // If user profile doesn't exist (404 or 500), try to create it
          if (
            error.response?.status === 404 ||
            error.response?.status === 500 ||
            error.message?.includes("not found")
          ) {
            console.log("User profile not found, creating new profile...");
            try {
              // Prepare user data for profile creation
              const profileData = {
                username:
                  userInfo.username ||
                  userInfo.preferred_username ||
                  userInfo.email?.split("@")[0] ||
                  userInfo.name?.replace(/\s+/g, "").toLowerCase(),
                name:
                  userInfo.name ||
                  (userInfo.given_name && userInfo.family_name
                    ? `${userInfo.given_name} ${userInfo.family_name}`
                    : "User"),
                email: userInfo.email,
                roles: role,
                authProvider: isGoogleOAuth
                  ? "google"
                  : userInfo.iss || "oauth2",
              };

              // Add optional fields if available (from Google)
              if (userInfo.picture) {
                profileData.avatarUrl = userInfo.picture;
              }

              const newProfile = await createUserProfile(profileData);
              console.log("User profile created successfully:", newProfile);
            } catch (createError) {
              // Check if create user also returns 403 (banned)
              if (createError.response?.status === 403) {
                console.log(
                  "User is banned during creation (403), redirecting to banned page"
                );
                setError(
                  "Your account has been suspended. Please contact support."
                );
                setLoading(false);
                setTimeout(() => {
                  window.location.href = "/banned";
                }, 2000);
                return;
              }

              console.error("Failed to create user profile:", createError);
              console.warn(
                "Continuing login without user profile - you may need to complete your profile later"
              );
              // Continue anyway - we can still use info from token
              // User can complete profile later through settings
            }
          } else {
            console.error("Error checking user profile:", error);
            console.warn("Continuing login without profile check");
            // Continue anyway - non-blocking error
          }
        }

        // Update auth store
        const user = {
          id: userInfo.user_id || userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          role: role,
        };
        console.log(user);

        console.log("==== DEBUG: Setting user to Zustand ====");
        console.log("User object:", user);
        console.log("User role:", user.role);

        setUser(user);

        console.log("User logged in:", user);

        // Wait a bit for profile creation to complete before checking
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check profile completeness before redirecting
        try {
          const profileValidation = await getProfileCompleteness();
          console.log("Profile validation:", profileValidation);

          // If profile is incomplete, redirect to complete profile page
          if (
            !profileValidation.isComplete &&
            profileValidation.missingFields?.length > 0
          ) {
            console.log("Profile incomplete, redirecting to complete profile");
            setTimeout(() => {
              navigate("/complete-profile");
            }, 500);
            return;
          }
        } catch (validationError) {
          console.warn(
            "Could not validate profile completeness:",
            validationError
          );
          // Continue to dashboard even if validation fails
        }

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } catch (err) {
        console.error("OAuth2 callback error:", err);
        setError(
          err.message || "Failed to complete authentication. Please try again."
        );
        setLoading(false);
        setTimeout(() => (window.location.href = LOGIN_LINK), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, hasProcessed]);

  // Helper to decode JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return {};
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        {error ? (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 font-['Beni','Bebas_Neue',Impact,ui-sans-serif] text-[44px] font-black uppercase leading-[0.75] text-[#00522d]">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        ) : loading ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-16 w-16 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="mb-2 font-['Beni','Bebas_Neue',Impact,ui-sans-serif] text-[44px] font-black uppercase leading-[0.75] text-[#00522d]">
              Completing sign&nbsp;in...
            </h2>
            <p className="text-gray-600">Please wait while we log you in</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 font-['Beni','Bebas_Neue',Impact,ui-sans-serif] text-[44px] font-black uppercase leading-[0.75] text-[#00522d]">
              Success!
            </h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
