import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Keyboard,
  Loader2,
  QrCode,
  RotateCcw,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { extractQrToken } from "../../utils/qrToken";

const QR_REGION_ID = "web-qr-reader";

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.message || fallback;

  if (/not registered/i.test(message)) return "You are not registered for this event.";
  if (/Only approved registrations/i.test(message)) return "Your registration is not approved yet.";
  if (/deadline/i.test(message)) return "This event is no longer accepting QR joins.";
  if (/capacity/i.test(message)) return "This event is already full.";
  if (/expired/i.test(message)) return "This QR code has expired.";
  if (/revoked/i.test(message)) return "This QR code has been revoked.";
  if (/usage limit/i.test(message)) return "This QR code has reached its usage limit.";
  if (/Invalid QR token/i.test(message)) return "This QR code is invalid.";
  return message;
};

export default function QrActionPage({
  mode,
  title,
  subtitle,
  initialMessage,
  processingMessage,
  successMessage,
  alreadyDoneMessage,
  invalidMessage,
  fallbackErrorMessage,
  useMutationHook,
  resultCtaLabel,
  resultCtaPath,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const mutation = useMutationHook();
  const hasSubmittedRef = useRef(false);
  const scannerRef = useRef(null);
  const [scannerKey, setScannerKey] = useState(0);
  const [manualValue, setManualValue] = useState("");
  const [status, setStatus] = useState(tokenFromUrl ? "processing" : "scanning");
  const [message, setMessage] = useState(
    tokenFromUrl ? processingMessage : initialMessage
  );
  const [result, setResult] = useState(null);

  const submitQrValue = useCallback(
    (value) => {
      if (hasSubmittedRef.current) return;
      const token = extractQrToken(value);
      if (!token || !token.includes(".")) {
        setStatus("error");
        setMessage(invalidMessage);
        return;
      }

      hasSubmittedRef.current = true;
      setStatus("processing");
      setMessage(processingMessage);

      mutation.mutate(token, {
        onSuccess: (data) => {
          setResult(data);
          setStatus("success");
          setMessage(data?.alreadyCompleted ? alreadyDoneMessage : successMessage);
        },
        onError: (error) => {
          hasSubmittedRef.current = false;
          setResult(null);
          setStatus("error");
          setMessage(getErrorMessage(error, fallbackErrorMessage));
        },
      });
    },
    [
      alreadyDoneMessage,
      fallbackErrorMessage,
      invalidMessage,
      mutation,
      processingMessage,
      successMessage,
    ]
  );

  useEffect(() => {
    if (tokenFromUrl) {
      submitQrValue(tokenFromUrl);
    }
  }, [submitQrValue, tokenFromUrl]);

  useEffect(() => {
    if (tokenFromUrl || status !== "scanning") {
      return undefined;
    }

    let isMounted = true;
    const html5QrCode = new Html5Qrcode(`${QR_REGION_ID}-${mode}`);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setStatus("scanning");
        setMessage(initialMessage);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
          async (decodedText) => {
            if (!isMounted || hasSubmittedRef.current) return;
            try {
              if (html5QrCode.isScanning) {
                await html5QrCode.stop();
              }
            } catch {
              // Scanner may already be stopped after a successful read.
            }
            submitQrValue(decodedText);
          }
        );
      } catch (error) {
        if (!isMounted) return;
        setStatus("camera-error");
        setMessage(
          error?.message || "Camera permission was denied or no camera is available."
        );
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      Promise.resolve()
        .then(() => (scanner.isScanning ? scanner.stop() : undefined))
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [initialMessage, mode, scannerKey, status, submitQrValue, tokenFromUrl]);

  const resetScanner = () => {
    hasSubmittedRef.current = false;
    setManualValue("");
    setResult(null);
    setStatus("scanning");
    setMessage(initialMessage);
    setScannerKey((prev) => prev + 1);
  };

  const statusIcon =
    status === "success" ? (
      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
    ) : status === "processing" ? (
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    ) : status === "error" || status === "camera-error" ? (
      <TriangleAlert className="h-8 w-8 text-amber-600" />
    ) : (
      <ScanLine className="h-8 w-8 text-emerald-600" />
    );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bubblegum-blush">
            <QrCode className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-beni text-[56px] font-black uppercase leading-[0.72] text-foudre-pink">
              {title}
            </h1>
            <p className="mt-2 text-sm font-medium leading-[1.2] text-deep-forest/70">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[25px] border-2 border-ash-whisper bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {statusIcon}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="text-base font-semibold text-slate-800">{message}</p>
          </div>
        </div>

        {!tokenFromUrl && status !== "success" && (
          <>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-2">
              <div
                key={scannerKey}
                id={`${QR_REGION_ID}-${mode}`}
                className="min-h-[320px] overflow-hidden rounded-lg bg-black text-white"
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Keyboard className="h-4 w-4" />
                Paste QR link or token
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={manualValue}
                  onChange={(event) => setManualValue(event.target.value)}
                  placeholder="https://your-site.com/qr/join?token=..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => submitQrValue(manualValue)}
                  disabled={mutation.isPending}
                  className="rounded-lg bg-deep-forest px-4 py-2 text-sm font-bold text-pale-canvas transition hover:bg-foudre-pink disabled:opacity-60"
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}

        {result && (
          <div className="mt-5 grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 sm:grid-cols-2">
            <div>
              <p className="font-semibold">Event ID</p>
              <p>{result.eventId}</p>
            </div>
            <div>
              <p className="font-semibold">Registration status</p>
              <p>{result.status}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {(status === "error" || status === "camera-error" || status === "success") && (
            <button
              type="button"
              onClick={resetScanner}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] border-2 border-deep-forest bg-pale-canvas px-4 py-3 text-sm font-bold text-deep-forest transition hover:bg-ash-whisper"
            >
              <RotateCcw className="h-4 w-4" />
              Scan again
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(resultCtaPath)}
            className="flex-1 rounded-[10px] border-2 border-deep-forest bg-deep-forest px-4 py-3 text-sm font-bold text-pale-canvas transition hover:bg-foudre-pink"
          >
            {resultCtaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
