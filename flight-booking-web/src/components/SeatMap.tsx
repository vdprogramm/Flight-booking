import type { FlightSeat } from "../types/seat";

interface Props {
  seats: FlightSeat[];
  selectedSeatIds: number[];
  onSelect: (seat: FlightSeat) => void;
  disabled?: boolean;
}

function seatPosition(seatNumber: string) {
  const match = seatNumber.match(/^(\d+)([A-Za-z]+)$/);

  return {
    row: match ? Number(match[1]) : 0,
    letter: match ? match[2].toUpperCase() : seatNumber,
  };
}

export default function SeatMap({
  seats,
  selectedSeatIds,
  onSelect,
  disabled = false,
}: Props) {
  const rows = new Map<number, FlightSeat[]>();

  for (const seat of seats) {
    const { row } = seatPosition(seat.seat_number);

    if (!rows.has(row)) {
      rows.set(row, []);
    }

    rows.get(row)!.push(seat);
  }

  const sortedRows = [...rows.entries()].sort(
    ([a], [b]) => a - b
  );

  function getSeatState(seat: FlightSeat) {
    if (selectedSeatIds.includes(seat.id)) {
      return "selected";
    }

    if (seat.status === "BOOKED") {
      return "booked";
    }

    if (seat.status === "HELD") {
      return seat.is_mine ? "mine" : "held";
    }

    return "available";
  }

  return (
    <div className="seat-map">
      <div className="seat-map-front">
        <span>PHÍA TRƯỚC MÁY BAY</span>
        <div className="seat-map-cockpit" />
      </div>

      <div className="seat-map-legend">
        <span>
          <i className="seat-legend available" />
          Còn trống
        </span>

        <span>
          <i className="seat-legend selected" />
          Đã chọn
        </span>

        <span>
          <i className="seat-legend mine" />
          Ghế của bạn
        </span>

        <span>
          <i className="seat-legend held" />
          Đang giữ
        </span>

        <span>
          <i className="seat-legend booked" />
          Đã đặt
        </span>
      </div>

      <div className="seat-map-rows">
        {sortedRows.map(([rowNumber, rowSeats]) => {
          const sortedSeats = [...rowSeats].sort(
            (a, b) =>
              seatPosition(a.seat_number).letter.localeCompare(
                seatPosition(b.seat_number).letter
              )
          );

          const midpoint = Math.ceil(sortedSeats.length / 2);

          return (
            <div className="seat-map-row" key={rowNumber}>
              <span className="seat-row-number">
                {rowNumber}
              </span>

              <div className="seat-row-group">
                {sortedSeats.slice(0, midpoint).map((seat) => {
                  const state = getSeatState(seat);

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={`seat-button seat-${state}`}
                      disabled={
                        disabled ||
                        state === "booked" ||
                        state === "held"
                      }
                      onClick={() => onSelect(seat)}
                      title={`${seat.seat_number} • ${Number(
                        seat.price
                      ).toLocaleString("vi-VN")}đ`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>

              <span className="seat-aisle">
                {rowNumber}
              </span>

              <div className="seat-row-group">
                {sortedSeats.slice(midpoint).map((seat) => {
                  const state = getSeatState(seat);

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={`seat-button seat-${state}`}
                      disabled={
                        disabled ||
                        state === "booked" ||
                        state === "held"
                      }
                      onClick={() => onSelect(seat)}
                      title={`${seat.seat_number} • ${Number(
                        seat.price
                      ).toLocaleString("vi-VN")}đ`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
