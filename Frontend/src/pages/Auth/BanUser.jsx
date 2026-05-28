import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { AlertTriangle, Ban, LogOut, Mail, Phone, ShieldAlert } from "lucide-react";
import storage from "../../utils/storage";
import logo from "../../assets/img/volunteerhub-icon.png";

function BanUser() {
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      storage.clearToken();
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  return (
    <main className="bg-soft-gradient flex min-h-dvh items-center justify-center px-4 py-10 text-deep-forest sm:px-6">
      <section className="w-full max-w-5xl overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-pale-canvas/95 shadow-xl shadow-deep-forest/10">
        <div className="grid min-h-[560px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex flex-col justify-between overflow-hidden bg-deep-forest p-8 text-pale-canvas sm:p-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-foudre-pink/25" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-bubblegum-blush/20" />

            <div className="relative z-10 flex items-center gap-3">
              <img
                src={logo}
                alt="VolunteerHub"
                className="h-12 w-12 rounded-[14px] bg-pale-canvas p-1.5"
              />
              <div>
                <p className="font-beni text-[38px] font-black uppercase leading-[0.72]">
                  VolunteerHub
                </p>
                <p className="text-sm font-bold leading-[1.2] text-pale-canvas/70">
                  Account access notice
                </p>
              </div>
            </div>

            <div className="relative z-10 py-12">
              <div className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-pale-canvas text-foudre-pink">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="max-w-[520px] font-beni text-[62px] font-black uppercase leading-[0.72] text-pale-canvas sm:text-[82px] lg:text-[92px]">
                Account Suspended
              </h1>
              <p className="mt-6 max-w-md text-base font-medium leading-[1.35] text-pale-canvas/78">
                Your account has been suspended by an administrator and cannot
                access VolunteerHub at this time.
              </p>
            </div>

            <div className="relative z-10 rounded-[20px] border border-pale-canvas/20 bg-pale-canvas/10 p-4 text-sm font-medium leading-[1.3] text-pale-canvas/80">
              If you believe this is a mistake, contact support with the email
              associated with your account.
            </div>
          </div>

          <div className="flex flex-col gap-6 p-7 sm:p-9 lg:p-10">
            <div className="rounded-[20px] border-2 border-foudre-pink/20 bg-ash-whisper/55 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-foudre-pink text-pale-canvas">
                  <Ban className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black leading-[1.05] text-deep-forest">
                    Access has been restricted
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-[1.35] text-deep-forest/72">
                    You no longer have permission to use VolunteerHub features
                    until this suspension is reviewed or lifted.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-deep-forest/10 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-ash-whisper text-deep-forest">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-beni text-[44px] font-black uppercase leading-[0.72] text-deep-forest">
                    Need Help?
                  </h3>
                  <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">
                    Appeal this decision through support.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="mailto:support@volunteerhub.com"
                  className="flex items-center gap-3 rounded-[14px] border border-deep-forest/10 bg-white/60 px-4 py-3 text-sm font-bold text-deep-forest transition-colors hover:border-foudre-pink hover:text-foudre-pink"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">
                    support@volunteerhub.com
                  </span>
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 rounded-[14px] border border-deep-forest/10 bg-white/60 px-4 py-3 text-sm font-bold text-deep-forest transition-colors hover:border-foudre-pink hover:text-foudre-pink"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+1 (234) 567-890</span>
                </a>
              </div>
            </div>

            <div className="border-t border-deep-forest/10 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-foudre-pink" />
                <h3 className="text-base font-black leading-[1.2] text-deep-forest">
                  Common reasons for account suspension
                </h3>
              </div>
              <div className="grid gap-3 text-sm font-medium leading-[1.3] text-deep-forest/72 sm:grid-cols-2">
                <p className="rounded-[14px] bg-ash-whisper/70 px-4 py-3">
                  Community guideline violations
                </p>
                <p className="rounded-[14px] bg-ash-whisper/70 px-4 py-3">
                  Harassment or inappropriate behavior
                </p>
                <p className="rounded-[14px] bg-ash-whisper/70 px-4 py-3">
                  Fraudulent activity or platform misuse
                </p>
                <p className="rounded-[14px] bg-ash-whisper/70 px-4 py-3">
                  Multiple policy violations
                </p>
              </div>
            </div>

            <div className="mt-auto border-t border-deep-forest/10 pt-6">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>

              <p className="mt-5 text-center text-xs font-bold leading-[1.2] text-deep-forest/45">
                Thank you for your understanding.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BanUser;
