import { CircleCheckBig, ClockFading, Pencil, ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

function ManagerDbHero({
  thumbnail,
  title,
  subtitle,
  status = "pending",
  onEditImage,
}) {
  const navigate = useNavigate();
  const icon =
    status === "PENDING" ? (
      <ClockFading className="w-full h-full" />
    ) : (
      <CircleCheckBig />
    );
  const color =
    status === "PENDING"
      ? "text-yellow-500 bg-yellow-500/20"
      : "text-green-600 bg-green-500/20 ";
  return (
    <div className="p-0 flex flex-col w-full shadow-2xl rounded-2xl">
      <div className="w-full aspect-[16/5] max-h-[380px] md:max-h-[280px] overflow-hidden rounded-t-xl bg-gray-100 mb-4 relative group">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover object-top"
        />
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all flex items-center gap-2"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        {/* Edit Button Overlay */}
        <button
          onClick={onEditImage}
          className="absolute top-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100"
          title="Edit image"
        >
          <Pencil size={20} />
        </button>
      </div>
      <div className="flex flex-row max-lg:flex-col items-start max-sm:gap-2 max-sm:text-sm justify-between px-4 pb-5">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div
            className={`text-2xl font-bold flex gap-5 items-center flex-wrap`}
          >
            <p className="text-4xl not-only:max-md:text-[1rem] break-all line-clamp-2 min-w-0">
              {title}
            </p>

            <div
              className={`${color} flex items-center gap-3 rounded-2xl py-1 px-2 self-centere  flex-shrink-0`}
            >
              <span className="w-4">{icon}</span>
              <span className="text-sm">
                {status === "PENDING" ? "Pending" : "Approved"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm break-all">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDbHero;
