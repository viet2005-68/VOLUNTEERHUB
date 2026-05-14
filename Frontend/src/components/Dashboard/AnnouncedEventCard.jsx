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
  console.log("ididid", id);

  return (
    <div
      className="bg-ash-whisper rounded-2xl"
      onClick={(e) => {
        e.stopPropagation();
        console.log("/dashboard/eventmanager/", id);
        navigate(`/dashboard/eventmanager/${id}`);
      }}
    >
      <Card className>
        <div className="flex justify-between relative">
          <div className="text-md max-sm:text-sm flex flex-col gap-2 pl-5">
            <p className="font-medium inline-flex items-center relative">
              {/* Ping indicator */}
              <span className="absolute -left-9 top-0 flex text-foudre-pink">
                <span className="bg-foudre-pink text-pale-canvas text-xs font-bold rounded-lg px-1 py-1 max-sm:py-0 flex-shrink-0 max-sm:px-1 m">
                  New
                </span>
              </span>

              {/* Title text */}
              <span className="ml-1 mb-1">{title}</span>
            </p>

            <div className="flex flex-row gap-5 text-deep-forest/65">
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
            <div className="flex flex-1 gap-1 items-center-safe text-deep-forest/65">
              <span>
                <TfiLocationPin className="text-foudre-pink" />
              </span>
              <span>{location}</span>
            </div>
          </div>

          <div className="flex self-center rounded-2xl w-24 max-md:w-20 max-sm:max-w-25 max-sm:max-h-25 bg-bubblegum-blush">
            <img
              src={urlImg}
              className="object-cover w-full h-full object-center aspect-square rounded-2xl"
            ></img>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AnnouncedEventCard;
