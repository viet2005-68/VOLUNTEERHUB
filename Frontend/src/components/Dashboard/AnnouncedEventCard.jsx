import React from "react";
import Card from "../Card.jsx/Card";
import { formatDateTime } from "../../utils/date";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AnnouncedEventCard({
  id,
  title,
  date,
  location,
  capacity = 200,
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
      <Card className="min-h-[154px] cursor-pointer border-2 border-ash-whisper bg-pale-canvas shadow-sm transition-all hover:-translate-y-0.5 hover:border-bubblegum-blush hover:shadow-md">
        <div className="grid min-h-[112px] grid-cols-[minmax(0,1fr)_96px] items-center gap-5 max-sm:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <p className="line-clamp-2 text-lg font-bold leading-[1.08] text-deep-forest">
                {title}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-deep-forest/45">
                Recently announced
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm font-bold text-deep-forest/70 max-sm:grid-cols-1">
              <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-ash-whisper/55 px-3 py-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-deep-forest" />
                <span className="truncate">{dateNorm}</span>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-[10px] bg-ash-whisper/55 px-3 py-2">
                <Users className="h-4 w-4 shrink-0 text-deep-forest" />
                <span className="truncate">{capacity}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm font-medium leading-[1.25] text-deep-forest/65">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foudre-pink" />
              <span className="line-clamp-2">{location || "No location provided"}</span>
            </div>
          </div>

          <div className="aspect-square w-24 shrink-0 justify-self-end overflow-hidden rounded-2xl border border-ash-whisper bg-ash-whisper max-sm:w-full">
            <img
              src={urlImg}
              alt={title}
              className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AnnouncedEventCard;
