import React, { useMemo, useState } from "react";
import { Ban, CheckCircle, Clipboard, Loader2, QrCode, RotateCcw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  useCompletionQrCodes,
  useCreateCompletionQrCode,
  useRevokeCompletionQrCode,
} from "../../hook/useRegistration";
import toast from "react-hot-toast";

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

const buildCompletionUrl = (qr) => {
  if (!qr) return "";
  if (qr.token) {
    return `${window.location.origin}/qr/complete?token=${encodeURIComponent(
      qr.token
    )}`;
  }
  return qr.qrPayload || "";
};

export default function CompletionQrPanel({ eventId, eventStatus }) {
  const { data: qrCodes = [], isLoading } = useCompletionQrCodes(eventId);
  const createMutation = useCreateCompletionQrCode();
  const revokeMutation = useRevokeCompletionQrCode();
  const [generatedQr, setGeneratedQr] = useState(null);

  const activeQr = useMemo(
    () => qrCodes.find((item) => item.status === "ACTIVE"),
    [qrCodes]
  );
  const currentQr = generatedQr?.status === "ACTIVE" ? generatedQr : activeQr;
  const completionUrl = buildCompletionUrl(generatedQr);
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
    if (!completionUrl) return;
    try {
      await navigator.clipboard.writeText(completionUrl);
      toast.success("QR link copied.");
    } catch {
      toast.error("Could not copy QR link.");
    }
  };

  return (
    <section className="rounded-2xl border border-deep-forest/15 bg-pale-canvas p-5 shadow-[0_14px_34px_rgba(0,82,45,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-deep-forest text-pale-canvas">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-beni text-5xl uppercase leading-[0.75] text-deep-forest sm:text-6xl">
              Completion QR
            </h3>
            <p className="mt-1 text-sm font-medium text-deep-forest/65">
              Volunteers with approved registrations can scan this code to mark
              themselves as completed.
            </p>
            {currentQr && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-deep-forest/65">
                <span className="inline-flex items-center gap-1 rounded-full bg-deep-forest/10 px-3 py-1.5 font-bold text-deep-forest">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {currentQr.status}
                </span>
                <span>Uses: {currentQr.useCount ?? 0}</span>
                <span>Expires: {formatDateTime(currentQr.expiresAt)}</span>
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
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      {completionUrl ? (
        <div className="mt-5 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="w-fit rounded-xl border border-gray-200 bg-white p-3">
            <QRCodeCanvas value={completionUrl} size={176} includeMargin />
          </div>
          <div className="min-w-0 rounded-lg border border-deep-forest/10 bg-white p-3">
            <p className="text-xs font-bold uppercase leading-[1] text-deep-forest/55">
              Scan URL
            </p>
            <p className="mt-2 break-all text-sm font-medium text-deep-forest/75">
              {completionUrl}
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
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            This QR already exists, but its secret token is only shown when it is
            generated. Regenerate it to display a scannable code.
          </div>
        )
      )}

      {!canGenerate && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-deep-forest/65">
          Completion QR can be generated after the event is approved.
        </div>
      )}
    </section>
  );
}
