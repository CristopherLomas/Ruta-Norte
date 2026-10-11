import { describe, it, expect } from "vitest";
import { generateSeatsFromLayout } from "@/features/buses/utils";

describe("Generación Automática de Asientos desde layout_config (ADR-003)", () => {
  it("debe generar 40 asientos físicos para un layout estándar de 10 filas x 4 columnas con pasillo", () => {
    // 10 filas x 4 columnas (A, B pasillo C, D) = 40 asientos
    const columnLabels = ["A", "B", "_", "C", "D"];
    const seats = generateSeatsFromLayout(10, 4, columnLabels);

    expect(seats.length).toBe(40);

    // Verificar primer asiento
    expect(seats[0]).toEqual({
      seatNumber: "1A",
      seatRow: 1,
      seatColumn: 1,
      seatType: "accessibility",
    });

    // Verificar segundo asiento (también preferencial en primera fila)
    expect(seats[1]).toEqual({
      seatNumber: "1B",
      seatRow: 1,
      seatColumn: 2,
      seatType: "accessibility",
    });

    // Verificar asiento de segunda fila (debe ser estándar)
    const seat2A = seats.find((s) => s.seatNumber === "2A");
    expect(seat2A).toBeDefined();
    expect(seat2A?.seatType).toBe("standard");

    // Verificar último asiento
    const lastSeat = seats[seats.length - 1];
    expect(lastSeat.seatNumber).toBe("10D");
  });

  it("debe omitir la creación de asientos para la columna de pasillo ('_')", () => {
    const columnLabels = ["A", "B", "_", "C", "D"];
    const seats = generateSeatsFromLayout(5, 4, columnLabels);

    // Ningún asiento debe contener el carácter '_'
    const aisleSeats = seats.filter((s) => s.seatNumber.includes("_"));
    expect(aisleSeats.length).toBe(0);
  });

  it("debe generar correctamente 24 asientos para un microbús de 8 filas y 3 columnas", () => {
    const columnLabels = ["A", "B", "_", "C"];
    const seats = generateSeatsFromLayout(8, 3, columnLabels);

    expect(seats.length).toBe(24);
    expect(seats[seats.length - 1].seatNumber).toBe("8C");
  });
});
