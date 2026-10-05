import { ArrowRight, Clock3, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import type { Flight } from "../types/flight";

interface Props {
  flight: Flight;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function FlightCard({ flight }: Props) {
  return (
    <article className="result-flight-card">
      <div className="result-flight-top">
        <div className="result-airline">
          <span className="result-airline-icon">
            <Plane size={20} />
          </span>

          <div>
            <strong>
              {flight.airline?.name ?? "Hãng hàng không"}
            </strong>

            <small>{flight.flight_number}</small>
          </div>
        </div>

        <span className="result-status">
          {flight.status === "SCHEDULED"
            ? "Đang mở bán"
            : flight.status}
        </span>
      </div>

      <div className="result-flight-route">
        <div>
          <strong>{formatTime(flight.departure_time)}</strong>
          <span>
            {flight.departure_airport?.code ?? "—"}
          </span>
          <small>{formatDate(flight.departure_time)}</small>
        </div>

        <div className="result-flight-middle">
          <Clock3 size={16} />
          <span>Bay thẳng</span>
          <div className="result-route-line">
            <Plane size={18} />
          </div>
        </div>

        <div>
          <strong>{formatTime(flight.arrival_time)}</strong>
          <span>
            {flight.arrival_airport?.code ?? "—"}
          </span>
          <small>{formatDate(flight.arrival_time)}</small>
        </div>
      </div>

      <div className="result-flight-bottom">
        <div>
          <small>Máy bay</small>
          <strong>{flight.aircraft_code ?? "—"}</strong>
        </div>

        <Link
          to={`/flights/${flight.id}`}
          className="btn btn-primary"
        >
          Chọn chuyến
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}
