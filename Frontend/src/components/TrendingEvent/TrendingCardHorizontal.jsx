import React from "react";
import {
  Calendar,
  CircleArrowLeft,
  CircleArrowRight,
  FlameKindling,
  MapPin,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { futureVolunteer } from "../../assets/img";
import { useNavigate } from "react-router-dom";

function TrendingCardHorizontal({
  id,
  name,
  location,
  date,
  thumbnail = "https://tse3.mm.bing.net/th/id/OIP.X4rVMWiixU1OHHX6qFCm4wHaE7?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
  post,
  comment,
  ref,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/opportunities/overview/${id}`);
    }
  };
  return (
    <div
      onClick={handleClick}
      className="flex min-w-[280px] cursor-pointer snap-start flex-col rounded-[20px] border border-pale-canvas/25 bg-pale-canvas p-4 text-deep-forest transition-colors duration-300 hover:border-bubblegum-blush sm:min-w-[400px] sm:flex-row sm:space-x-5 sm:space-y-0 md:min-w-[450px]"
      ref={ref}
    >
      <div className="flex h-48 w-full flex-shrink-0 items-center justify-center self-center overflow-hidden rounded-[10px] sm:h-[128px] sm:w-[128px]">
        <img
          src={thumbnail || futureVolunteer}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col justify-between flex-1 py-1">
        <div className="space-y-1">
          <p className="line-clamp-1 text-center text-lg font-bold leading-[1.05] text-deep-forest sm:text-left">
            {name}
          </p>
          <div className="flex flex-col justify-start text-sm font-medium text-deep-forest/70 sm:gap-4">
            <p className="flex items-center justify-center sm:justify-start gap-1">
              <span className="inline-flex h-[18px] w-[18px] text-foudre-pink">
                <MapPin className="h-full w-full" />
              </span>
              <span className="truncate">{location}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1">
              <span className="inline-flex h-[18px] w-[18px] text-foudre-pink">
                <Calendar className="h-full w-full" />
              </span>
              {date}
            </p>
          </div>
        </div>
        <div className="flex flex-row mt-3 sm:mt-2 justify-around gap-2">
          <div className="flex min-w-0 basis-1/2 items-center gap-2 rounded-[10px] border border-deep-forest/10 bg-ash-whisper/55 px-3 py-2">
            <TrendingUp className="h-[18px] w-[18px] text-foudre-pink" />
            <div className="flex flex-col">
              <span className="text-center text-xs text-deep-forest/60">Posts</span>
              <span className="text-sm font-bold text-deep-forest">
                +{post}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 basis-1/2 items-center gap-2 rounded-[10px] border border-deep-forest/10 bg-ash-whisper/55 px-3 py-2">
            <span className="text-foudre-pink">
              <MessageCircle className="h-[18px] w-[18px]" />
            </span>
            <div className="flex flex-col">
              <span className="text-center text-xs text-deep-forest/60">
                Comments
              </span>
              <span className="text-sm font-bold text-deep-forest">
                +{comment}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendingCardHorizontal;
