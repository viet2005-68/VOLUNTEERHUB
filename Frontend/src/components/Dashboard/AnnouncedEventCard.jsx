import React from "react";
import Card from "../Card.jsx/Card";
import { formatDateTime } from "../../utils/date";
import { FiCalendar } from "react-icons/fi";
import { User, Users } from "lucide-react";
import { TfiLocationPin } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";

function AnnouncedEventCard({
  id,
  title,
  date,
  starttime,
  endtime,
  location,
  capacity = 200,
  category = "Unknown",

  urlImg = "https://static.vecteezy.com/ti/vetor-gratis/p1/15779127-maos-de-multidao-voluntaria-colorida-voluntariado-de-rotulacao-de-desenho-de-mao-silhuetas-de-mao-levantada-maquete-de-cartaz-de-educacao-voluntaria-doacao-e-conceito-de-caridade-vetor.jpg",
}) {
  const dateNorm = formatDateTime(date, {
    separator: "-",
    customFormat: "DD{sep}MM{sep}YYYY",
  });
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/dashboard/eventmanager/${id}`);
      }}
    >
      <Card className="min-h-[142px] cursor-pointer border-2 border-ash-whisper bg-pale-canvas transition-all hover:border-bubblegum-blush hover:shadow-md">
        <div className="flex min-h-[100px] justify-between gap-5 relative">
          <div className="text-md max-sm:text-sm flex min-w-0 flex-1 flex-col gap-3 pl-5">
            <p className="font-bold inline-flex items-center relative text-deep-forest">
              {/* Ping indicator */}
              <span className="absolute -left-9 top-0 flex text-foudre-pink">
                <span className="bg-foudre-pink text-pale-canvas text-xs font-bold rounded-lg px-2 py-1 max-sm:py-0 flex-shrink-0 max-sm:px-1">
                  New
                </span>
              </span>

              {/* Title text */}
              <span className="ml-1 mb-1 line-clamp-2">{title}</span>
            </p>

            <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 text-deep-forest/65">
              <div className="flex flex-1 gap-2 items-center">
                <span>
                  <FiCalendar className="text-green-600" />
                </span>
                <span>{dateNorm}</span>
              </div>
              <div className="flex flex-1 flex-row items-center-safe">
                <p className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span className>
                    <User className="w-4 h-4 text-yellow-600" />
                  </span>
                  <span>
                    <span>{capacity}</span>
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-1 gap-2 items-start text-deep-forest/65">
              <span>
                <TfiLocationPin className="text-foudre-pink" />
              </span>
              <span className="line-clamp-2">{location}</span>
            </div>
          </div>

          <div className="flex h-24 w-24 shrink-0 self-center overflow-hidden rounded-2xl bg-bubblegum-blush max-md:h-20 max-md:w-20">
            <img
              src={urlImg}
              alt={title}
              className="object-cover w-full h-full object-center"
            ></img>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AnnouncedEventCard;
