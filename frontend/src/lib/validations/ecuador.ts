/**
 * Validador de Cédula de Identidad de Ecuador (Algoritmo Módulo 10).
 */
export function validateEcuadorianIdCard(idCard: string): boolean {
  if (!idCard || idCard.length !== 10 || !/^\d{10}$/.test(idCard)) {
    return false;
  }

  const provinceCode = parseInt(idCard.substring(0, 2), 10);
  // Códigos de provincia válidos en Ecuador: 01 a 24, más 30 para casos especiales
  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    return false;
  }

  const thirdDigit = parseInt(idCard.charAt(2), 10);
  if (thirdDigit >= 6) {
    // Personas naturales: el tercer dígito debe ser menor a 6
    return false;
  }

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(idCard.charAt(i), 10) * coefficients[i];
    if (val >= 10) {
      val -= 9;
    }
    sum += val;
  }

  const verifierDigit = parseInt(idCard.charAt(9), 10);
  const calculatedDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);

  return calculatedDigit === verifierDigit;
}

/**
 * Validador de RUC de Ecuador (13 dígitos).
 * Para personas naturales termina en 001 y los primeros 10 dígitos son cédula válida.
 */
export function validateEcuadorianRuc(ruc: string): boolean {
  if (!ruc || ruc.length !== 13 || !/^\d{13}$/.test(ruc)) {
    return false;
  }

  // Verificar sufijo de establecimiento (usualmente 001)
  if (!ruc.endsWith("001")) {
    return false;
  }

  const provinceCode = parseInt(ruc.substring(0, 2), 10);
  if ((provinceCode < 1 || provinceCode > 24) && provinceCode !== 30) {
    return false;
  }

  const thirdDigit = parseInt(ruc.charAt(2), 10);

  // Persona natural: tercer dígito < 6 -> valida con cédula
  if (thirdDigit < 6) {
    return validateEcuadorianIdCard(ruc.substring(0, 10));
  }

  // Persona jurídica o pública: los 13 dígitos numéricos válidos
  return true;
}

/**
 * Validador de placa de vehículo ecuatoriana (ej: IAA-1234, PBH-456).
 */
export function validateEcuadorianPlate(plate: string): boolean {
  if (!plate) return false;
  const clean = plate.trim().toUpperCase();
  return /^[A-Z]{3}-?\d{3,4}$/.test(clean);
}
