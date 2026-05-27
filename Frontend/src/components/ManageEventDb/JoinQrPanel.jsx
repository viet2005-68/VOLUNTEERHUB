import React, { useMemo, useState } from "react";
import { Ban, CheckCircle, Clipboard, Loader2, QrCode, RotateCcw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import {
  useCreateJoinQrCode,
  useJoinQrCodes,
  useRevokeJoinQrCode,
} from "../../hook/useRegistration";

const formatDateTime = (value) => {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const buildJoinUrl = (qr) => {
  if (!qr?.token) return "";
  return `${window.location.origin}/qr/join?token=${encodeURIComponent(qr.token)}`;
};

export default function JoinQrPanel({ eventId, eventStatus }) {
  const { data: qrCodes = [], isLoading } = useJoinQrCodes(eventId);
  const createMutation = useCreateJoinQrCode();
  const revokeMutation = useRevokeJoinQrCode();
  const [generatedQr, setGeneratedQr] = useState(null);

  const activeQr = useMemo(
    () => qrCodes.find((item) => item.status === "ACTIVE"),
    [qrCodes]
  );
  const currentQr = generatedQr?.status === "ACTIVE" ? generatedQr : activeQr;
  const joinUrl = buildJoinUrl(generatedQr);
  const canGenerate = eventStatus === "APPROVED";

  const handleGenerate = () => {
    createMutation.mutate(
      { eventId, payload: {} },
      {
        onSuccess: (data) => {
          setGeneratedQr(data);
        },
      }
    );
  };

  const handleRevoke = () => {
    const qrCodeId = currentQr?.id;
    if (!qrCodeId) return;
    revokeMutation.mutate(
      { eventId, qrCodeId },
      {
        onSuccess: () => {
          if (generatedQr?.id === qrCodeId) {
            setGeneratedQr(null);
          }
        },
      }
    );
  };

  const handleCopy = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Join QR link copied.");
    } catch {
      toast.error("Could not copy QR link.");
    }
  };

  return (
    <section className="rounded-2xl border border-deep-forest/15 bg-pale-canvas p-5 text-deep-forest shadow-[0_14px_34px_rgba(0,82,45,0.08)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-deep-forest text-pale-canvas shadow-sm">
            <QrCode className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-beni text-5xl uppercase leading-[0.75] text-deep-forest sm:text-6xl">
              Join QR
            </h3>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-[1.35] text-deep-forest/65">
              Scan-to-join link for this event. Regenerate to reveal a fresh web QR when needed.
            </p>
            {currentQr && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-deep-forest/65">
                <span className="inline-flex items-center gap-1 rounded-full bg-deep-forest/10 px-3 py-1.5 text-deep-forest">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {currentQr.status}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5">
                  Uses: {currentQr.useCount ?? 0}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5">
                  Expires: {formatDateTime(currentQr.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate || createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-deep-forest px-4 py-3 text-sm font-bold text-pale-canvas transition hover:bg-deep-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {currentQr ? "Regenerate" : "Generate"}
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={!currentQr || revokeMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {revokeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Revoke
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-deep-forest/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading QR codes...
        </div>
      )}

      {joinUrl ? (
        <div className="mt-5 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="w-fit rounded-xl border border-deep-forest/15 bg-white p-3 shadow-sm">
            <QRCodeCanvas value={joinUrl} size={176} includeMargin />
          </div>
          <div className="min-w-0 rounded-lg border border-deep-forest/10 bg-white p-4">
            <p className="text-xs font-bold uppercase leading-[1] text-deep-forest/55">
              Web scan URL
            </p>
            <p className="mt-2 break-all text-sm font-medium text-deep-forest/75">
              {joinUrl}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-deep-forest/15 px-3 py-2 text-sm font-bold text-deep-forest transition hover:bg-deep-forest hover:text-pale-canvas"
            >
              <Clipboard className="h-4 w-4" />
              Copy link
            </button>
          </div>
        </div>
      ) : (
        currentQr && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            This QR already exists, but its secret token is only shown when it is generated. Regenerate it to display a web-scannable code.
          </div>
        )
      )}

      {!canGenerate && (
        <div className="mt-5 rounded-lg border border-deep-forest/10 bg-white px-4 py-3 text-sm font-medium text-deep-forest/65">
          Join QR can be generated after the event is approved.
        </div>
      )}
    </section>
  );
}
