import { SeatType } from "@/types";

/**
 * Genera la lista de asientos relacionales para bus_seats basada en la configuración de layout.
 * Convención ADR-003: la primera fila asigna 1A y 1B como asientos preferenciales (accessibility).
 */
export function generateSeatsFromLayout(
  rows: number,
  columns: number,
  columnLabels: string[] = ["A", "B", "_", "C", "D"]
): { seatNumber: string; seatRow: number; seatColumn: number; seatType: SeatType }[] {
  const seats: { seatNumber: string; seatRow: number; seatColumn: number; seatType: SeatType }[] = [];

  for (let r = 1; r <= rows; r++) {
    let seatColIndex = 1;
    for (let i = 0; i < columnLabels.length; i++) {
      const colLabel = columnLabels[i];
      if (colLabel !== "_") {
        const seatNumber = `${r}${colLabel}`;
        const seatType: SeatType = r === 1 && (colLabel === "A" || colLabel === "B") ? "accessibility" : "standard";
        seats.push({
          seatNumber,
          seatRow: r,
          seatColumn: seatColIndex++,
          seatType,
        });
      }
    }
  }

  return seats;
}
