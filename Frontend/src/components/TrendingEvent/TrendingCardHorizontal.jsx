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
      className="flex flex-col sm:flex-row bg-gradient-to-br from-red-100 via-orange-100 to-pink-100 transition-all duration-300 shadow-md hover:shadow-xl min-w-[280px] sm:min-w-[400px] md:min-w-[450px] p-4 sm:space-x-5 space-y-3 sm:space-y-0 rounded-2xl border-2 border-red-300 snap-start cursor-pointer hover:border-orange-400"
      ref={ref}
    >
      <div className="w-full sm:w-32 sm:h-32 h-48 rounded-xl overflow-hidden shadow-sm flex-shrink-0 items-center justify-center flex self-center">
        <img
          src={thumbnail || futureVolunteer}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col justify-between flex-1 py-1">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-gray-800 line-clamp-1 text-center sm:text-left">
            {name}
          </p>
          <div className="flex flex-col sm:gap-4 text-sm text-gray-700 justify-start">
            <p className="flex items-center justify-center sm:justify-start gap-1">
              <span className="text-red-600 w-4">
                <MapPin className="w-full" />
              </span>
              <span className="truncate">{location}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1">
              <span className="text-orange-600 w-4">
                <Calendar className="w-full" />
              </span>
              {date}
            </p>
          </div>
        </div>
        <div className="flex flex-row mt-3 sm:mt-2 justify-around gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm basis-1/2 min-w-0 border border-red-200">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-600 text-center">Posts</span>
              <span className="text-sm font-semibold text-red-600">
                +{post}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm basis-1/2 min-w-0 border border-orange-200">
            <span className="text-orange-600">
              <MessageCircle className="w-4 h-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-600 text-center">
                Comments
              </span>
              <span className="text-sm font-semibold text-orange-600">
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
