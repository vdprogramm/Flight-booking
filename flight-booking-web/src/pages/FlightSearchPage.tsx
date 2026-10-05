import {
  ArrowRightLeft,
  CalendarDays,
  MapPin,
  Plane,
  Search,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import FlightCard from "../components/FlightCard";
import { getAirports } from "../api/airport.api";
import { getFlights } from "../api/flight.api";
import type { Airport, Flight } from "../types/flight";

export default function FlightSearchPage() {
  const [airports, setAirports] = useState<Airport[]>([]);

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");

  const [loadingAirports, setLoadingAirports] = useState(true);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAirports();
        setAirports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAirports(false);
      }
    };

    load();
  }, []);

  const swapAirports = () => {
    const currentDeparture = departure;

    setDeparture(arrival);
    setArrival(currentDeparture);
  };

  const handleSearch = async () => {
    if (!departure || !arrival || !date) {
      setSearchError("Vui lòng chọn đầy đủ hành trình.");
      return;
    }

    if (departure === arrival) {
      setSearchError("Điểm đi và điểm đến không được giống nhau.");
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      setSearched(false);
      setFlights([]);

      const departureAirport = airports.find(
        (airport) => airport.id === Number(departure)
      );

      const arrivalAirport = airports.find(
        (airport) => airport.id === Number(arrival)
      );

      if (!departureAirport || !arrivalAirport) {
        setSearchError("Không tìm thấy thông tin sân bay.");
        return;
      }

      const result = await getFlights({
        from: departureAirport.code,
        to: arrivalAirport.code,
        date,
      });

      setFlights(result.data);
      setSearched(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Flight search response:", error.response?.data);

        const validationErrors = error.response?.data?.errors;

        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];

          setSearchError(
            Array.isArray(firstError)
              ? String(firstError[0])
              : String(firstError)
          );
        } else {
          setSearchError(
            error.response?.data?.message ??
              "Không thể tìm chuyến bay."
          );
        }
      } else {
        setSearchError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flight-search-page">
      <section className="search-hero">
        <div className="container">
          <span className="search-eyebrow">
            <Plane size={16} />
            KHÁM PHÁ HÀNH TRÌNH
          </span>

          <h1>Tìm chuyến bay của bạn</h1>

          <p>
            Chọn điểm khởi hành, điểm đến và ngày bay
            để tìm chuyến phù hợp.
          </p>
        </div>
      </section>

      <section className="container search-section">
        <div className="search-panel">
          <div className="trip-type">
            <button className="trip-active">
              Một chiều
            </button>
          </div>

          <div className="search-fields">
            <div className="search-field">
              <label>
                <MapPin size={15} />
                Điểm đi
              </label>

              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                disabled={loadingAirports}
              >
                <option value="">
                  Chọn sân bay
                </option>

                {airports.map((airport) => (
                  <option
                    key={airport.id}
                    value={airport.id}
                  >
                    {airport.city} ({airport.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="swap-button"
              onClick={swapAirports}
              type="button"
              title="Đổi điểm đi và điểm đến"
            >
              <ArrowRightLeft size={18} />
            </button>

            <div className="search-field">
              <label>
                <MapPin size={15} />
                Điểm đến
              </label>

              <select
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                disabled={loadingAirports}
              >
                <option value="">
                  Chọn sân bay
                </option>

                {airports.map((airport) => (
                  <option
                    key={airport.id}
                    value={airport.id}
                  >
                    {airport.city} ({airport.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <CalendarDays size={15} />
                Ngày khởi hành
              </label>

              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary search-submit"
              onClick={handleSearch}
              disabled={searching}
            >
              <Search size={19} />
              {searching ? "Đang tìm..." : "Tìm chuyến"}
            </button>
          </div>
        </div>

        {searchError && (
          <div className="search-error">
            {searchError}
          </div>
        )}

        {searched && (
          <section className="flight-results">
            <div className="flight-results-heading">
              <div>
                <span>KẾT QUẢ TÌM KIẾM</span>
                <h2>Chuyến bay phù hợp</h2>
                <p>
                  Tìm thấy {flights.length} chuyến bay.
                </p>
              </div>
            </div>

            {flights.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Plane size={30} />
                </div>

                <h3>Chưa tìm thấy chuyến bay</h3>
                <p>
                  Hãy thử chọn ngày khác hoặc thay đổi hành trình.
                </p>
              </div>
            ) : (
              <div className="flight-results-list">
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="search-introduction">
          <div>
            <strong>01</strong>
            <span>Chọn hành trình</span>
          </div>

          <div className="search-step-line" />

          <div>
            <strong>02</strong>
            <span>Chọn chuyến bay</span>
          </div>

          <div className="search-step-line" />

          <div>
            <strong>03</strong>
            <span>Chọn ghế</span>
          </div>

          <div className="search-step-line" />

          <div>
            <strong>04</strong>
            <span>Hoàn tất đặt vé</span>
          </div>
        </div>
      </section>
    </div>
  );
}
