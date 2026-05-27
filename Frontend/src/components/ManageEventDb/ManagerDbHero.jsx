import { ArrowLeft, CircleCheckBig, ClockFading, Image as ImageIcon, Pencil } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function ManagerDbHero({ thumbnail, title, status = "pending", onEditImage }) {
  const navigate = useNavigate();
  const normalizedStatus = String(status || "pending").toUpperCase();
  const isPending = normalizedStatus === "PENDING";
  const isApproved = normalizedStatus === "APPROVED";

  const StatusIcon = isPending ? ClockFading : CircleCheckBig;
  const statusLabel = isPending ? "Pending" : isApproved ? "Approved" : normalizedStatus;
  const statusClass = isPending
    ? "border-amber-200 bg-amber-100 text-amber-800"
    : "border-emerald-200 bg-emerald-100 text-emerald-800";

  return (
    <section className="overflow-hidden rounded-2xl border border-deep-forest/15 bg-pale-canvas shadow-[0_18px_45px_rgba(0,82,45,0.10)]">
      <div className="relative aspect-[16/5] min-h-[220px] w-full overflow-hidden bg-deep-forest/10 max-sm:aspect-[4/3] max-sm:min-h-[240px]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-deep-forest/45">
            <ImageIcon className="h-16 w-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/78 via-deep-forest/18 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-pale-canvas/95 text-deep-forest shadow-lg transition hover:bg-deep-forest hover:text-pale-canvas"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          onClick={onEditImage}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-pale-canvas/95 text-deep-forest shadow-lg transition hover:bg-deep-forest hover:text-pale-canvas"
          title="Edit image"
          aria-label="Edit image"
        >
          <Pencil className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="max-w-4xl font-beni text-6xl uppercase leading-[0.75] text-pale-canvas drop-shadow-sm sm:text-7xl md:text-8xl">
              {title}
            </h1>
            <span
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold uppercase leading-none shadow-sm ${statusClass}`}
            >
              <StatusIcon className="h-4 w-4" />
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagerDbHero;
