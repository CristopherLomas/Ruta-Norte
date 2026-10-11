import { describe, it, expect } from "vitest";
import {
  validateEcuadorianIdCard,
  validateEcuadorianRuc,
  validateEcuadorianPlate,
} from "@/lib/validations/ecuador";
import {
  cooperativeSchema,
  busSchema,
  routeSchema,
} from "@/lib/validations";

describe("Validaciones Oficiales Ecuatorianas (Registro Civil, SRI, ANT)", () => {
  describe("Cédula de Identidad Ecuatoriana (Algoritmo Módulo 10)", () => {
    // Cédulas matemáticamente válidas según el algoritmo del Registro Civil
    // 1710034065: Prov 17 (Pichincha), dígito 1, coeficientes x2x1 -> suma 25 -> 30-25 = 5 (dígito 5)
    // 1002345678: Prov 10 (Imbabura)
    it("debe validar cédulas ecuatorianas legítimas de 10 dígitos", () => {
      // 1710034065 es una cédula válida conocida
      expect(validateEcuadorianIdCard("1710034065")).toBe(true);
      // 0923456784 (Guayas)
      expect(validateEcuadorianIdCard("0923456784")).toBe(true);
    });

    it("debe rechazar cédulas con longitud distinta a 10 dígitos", () => {
      expect(validateEcuadorianIdCard("171003406")).toBe(false); // 9 dígitos
      expect(validateEcuadorianIdCard("17100340651")).toBe(false); // 11 dígitos
      expect(validateEcuadorianIdCard("")).toBe(false);
    });

    it("debe rechazar códigos de provincia inexistentes (> 24)", () => {
      expect(validateEcuadorianIdCard("9910034065")).toBe(false); // Provincia 99
      expect(validateEcuadorianIdCard("0010034065")).toBe(false); // Provincia 00
    });

    it("debe rechazar cédulas cuyo dígito verificador no coincida con el cálculo de módulo 10", () => {
      expect(validateEcuadorianIdCard("1710034069")).toBe(false); // Dígito final alterado a 9
      expect(validateEcuadorianIdCard("1000000000")).toBe(false);
    });
  });

  describe("RUC Ecuatoriano (13 dígitos)", () => {
    it("debe validar RUCs de personas naturales basados en cédula terminados en 001", () => {
      expect(validateEcuadorianRuc("1710034065001")).toBe(true);
      expect(validateEcuadorianRuc("0923456784001")).toBe(true);
    });

    it("debe rechazar RUCs que no terminen en 001", () => {
      expect(validateEcuadorianRuc("1710034065002")).toBe(false);
      expect(validateEcuadorianRuc("1710034065999")).toBe(false);
    });

    it("debe rechazar RUCs con longitud distinta a 13 dígitos", () => {
      expect(validateEcuadorianRuc("1710034065")).toBe(false);
      expect(validateEcuadorianRuc("17100340650001")).toBe(false);
    });
  });

  describe("Placas de Vehículo (Norma ANT Ecuador)", () => {
    it("debe aceptar placas válidas con guion o sin guion (ej: IAA-1234, PBH-0456, IBA-123)", () => {
      expect(validateEcuadorianPlate("IAA-1234")).toBe(true);
      expect(validateEcuadorianPlate("PBH-0456")).toBe(true);
      expect(validateEcuadorianPlate("IBA-123")).toBe(true);
      expect(validateEcuadorianPlate("iaa1234")).toBe(true); // Insensible a mayúsculas
    });

    it("debe rechazar placas con formatos extranjeros o inválidos", () => {
      expect(validateEcuadorianPlate("1234-IAA")).toBe(false);
      expect(validateEcuadorianPlate("AB-1234")).toBe(false);
      expect(validateEcuadorianPlate("IAAA-1234")).toBe(false);
      expect(validateEcuadorianPlate("")).toBe(false);
    });
  });

  describe("Validación de Tarifas y Precios (Zod)", () => {
    const validUuid = "11111111-1111-1111-1111-111111111111";
    const otherUuid = "22222222-2222-2222-2222-222222222222";

    it("debe aceptar rutas con tarifas base no negativas", () => {
      const res = routeSchema.safeParse({
        name: "Ibarra - Otavalo",
        code: "RN-101",
        originStopId: validUuid,
        destinationStopId: otherUuid,
        distanceKm: 25.5,
        durationMin: 40,
        baseFare: 2.5,
        isActive: true,
      });
      expect(res.success).toBe(true);
    });

    it("debe rechazar rutas con tarifas negativas o distancia negativa", () => {
      const res = routeSchema.safeParse({
        name: "Ibarra - Otavalo",
        code: "RN-101",
        originStopId: validUuid,
        destinationStopId: otherUuid,
        distanceKm: -10, // Distancia negativa
        durationMin: 40,
        baseFare: -1.0, // Tarifa negativa
        isActive: true,
      });
      expect(res.success).toBe(false);
    });
  });
});
