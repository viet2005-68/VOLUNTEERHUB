import React from "react";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  X,
} from "lucide-react";

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const slugify = (value = "certificate") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "certificate";

const limitText = (value = "", limit = 56) => {
  const text = String(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
};

const todayLabel = () =>
  new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const buildCertificateSvg = ({
  participantName,
  title,
  organization,
  date,
  hours,
  certificateId,
}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" viewBox="0 0 1600 1120">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff8f6"/>
      <stop offset="1" stop-color="#fce5df"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00522d"/>
      <stop offset="0.55" stop-color="#0d7a49"/>
      <stop offset="1" stop-color="#db3c8a"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#00522d" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="1600" height="1120" fill="#eef8f3"/>
  <rect x="88" y="88" width="1424" height="944" rx="28" fill="url(#paper)" filter="url(#softShadow)"/>
  <rect x="128" y="128" width="1344" height="864" rx="20" fill="none" stroke="#00522d" stroke-width="8"/>
  <rect x="162" y="162" width="1276" height="796" rx="16" fill="none" stroke="#f29ebd" stroke-width="3"/>
  <path d="M128 238 H1472" stroke="url(#accent)" stroke-width="16" stroke-linecap="round"/>
  <circle cx="800" cy="253" r="92" fill="#fff8f6" stroke="#00522d" stroke-width="8"/>
  <circle cx="800" cy="253" r="62" fill="#00522d"/>
  <path d="M770 254l20 22 44-54" fill="none" stroke="#fff8f6" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="800" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#00522d" letter-spacing="4">CERTIFICATE OF COMPLETION</text>
  <text x="800" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#5e8b75">This certificate is proudly presented to</text>
  <text x="800" y="575" text-anchor="middle" font-family="Georgia, serif" font-size="74" font-weight="700" fill="#00522d">${escapeXml(participantName)}</text>
  <path d="M500 612 H1100" stroke="#db3c8a" stroke-width="5" stroke-linecap="round"/>
  <text x="800" y="690" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#00522d">for completing volunteer service in</text>
  <text x="800" y="755" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#00522d">${escapeXml(limitText(title, 46))}</text>
  <text x="800" y="814" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#5e8b75">${escapeXml(limitText(organization, 28))} • ${escapeXml(limitText(date, 34))} • ${escapeXml(hours)}</text>
  <rect x="220" y="875" width="1160" height="1" fill="#00522d" opacity="0.18"/>
  <text x="320" y="930" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#00522d">VolunteerHub</text>
  <text x="320" y="964" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#5e8b75">Issuing Organization</text>
  <text x="800" y="930" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#00522d">${escapeXml(todayLabel())}</text>
  <text x="800" y="964" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#5e8b75">Issue Date</text>
  <text x="1280" y="930" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#00522d">#${escapeXml(certificateId)}</text>
  <text x="1280" y="964" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#5e8b75">Certificate ID</text>
</svg>`;

export default function CertificateModal({
  open,
  onClose,
  participantName,
  title,
  organization,
  date,
  hours,
  certificateId,
}) {
  if (!open) return null;

  const certificateData = {
    participantName,
    title,
    organization,
    date,
    hours,
    certificateId,
  };

  const downloadSvg = () => {
    const blob = new Blob([buildCertificateSvg(certificateData)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(title)}-${slugify(participantName)}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printCertificate = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Certificate</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #eef8f3; }
            svg { width: 100%; height: auto; max-height: 96vh; }
          </style>
        </head>
        <body>${buildCertificateSvg(certificateData)}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Certificate"
      className="fixed inset-0 z-[1000] flex min-h-dvh flex-col bg-[#eef8f3] text-deep-forest"
    >
      <div className="flex items-center justify-between border-b border-deep-forest/10 bg-pale-canvas px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep-forest text-pale-canvas">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-deep-forest/55">
              VolunteerHub Certificate
            </p>
            <h3 className="truncate text-xl font-bold leading-tight text-deep-forest sm:text-2xl">
              {title}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ash-whisper bg-pale-canvas text-deep-forest transition-colors hover:bg-ash-whisper"
          aria-label="Close certificate"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={downloadSvg}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-deep-forest px-4 py-2 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink"
          >
            <Download className="h-4 w-4" />
            Download SVG
          </button>
          <button
            type="button"
            onClick={printCertificate}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-deep-forest/15 bg-pale-canvas px-4 py-2 text-sm font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        <div className="mx-auto w-full max-w-[1120px]">
          <div className="relative aspect-[1.414/1] overflow-hidden rounded-[22px] border-[10px] border-deep-forest bg-pale-canvas shadow-2xl shadow-deep-forest/15">
            <div className="absolute inset-[18px] rounded-[14px] border-2 border-bubblegum-blush" />
            <div className="absolute left-0 right-0 top-[58px] h-3 bg-gradient-to-r from-deep-forest via-[#0d7a49] to-foudre-pink" />

            <div className="relative z-10 flex h-full flex-col items-center px-[7%] py-[6%] text-center">
              <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-[6px] border-deep-forest bg-pale-canvas max-sm:h-[62px] max-sm:w-[62px]">
                <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-deep-forest text-pale-canvas max-sm:h-[40px] max-sm:w-[40px]">
                  <CheckCircle2 className="h-9 w-9 max-sm:h-6 max-sm:w-6" />
                </div>
              </div>

              <p className="mt-5 font-serif text-[clamp(22px,4vw,54px)] font-bold uppercase tracking-[0.12em] text-deep-forest">
                Certificate of Completion
              </p>
              <p className="mt-3 text-[clamp(12px,1.8vw,18px)] font-semibold text-deep-forest/60">
                This certificate is proudly presented to
              </p>
              <p className="mt-5 max-w-full border-b-4 border-foudre-pink px-8 pb-2 font-serif text-[clamp(34px,7vw,76px)] font-bold leading-none text-deep-forest">
                {participantName}
              </p>
              <p className="mt-6 text-[clamp(13px,2vw,22px)] font-semibold text-deep-forest">
                for completing volunteer service in
              </p>
              <p className="mt-3 max-w-[82%] text-[clamp(18px,3.4vw,38px)] font-bold leading-tight text-deep-forest">
                {title}
              </p>

              <div className="mt-auto grid w-full grid-cols-3 gap-3 border-t border-deep-forest/15 pt-5 text-left text-[clamp(10px,1.4vw,15px)] font-semibold text-deep-forest/70">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-deep-forest">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{organization}</span>
                  </div>
                  <p className="mt-1 text-deep-forest/50">Organization</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-deep-forest">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="truncate">{date}</span>
                  </div>
                  <p className="mt-1 text-deep-forest/50">Event Date</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-deep-forest">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="truncate">{hours}</span>
                  </div>
                  <p className="mt-1 text-deep-forest/50">
                    Certificate #{certificateId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
