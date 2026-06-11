/**
 * Redondea un número usando el método comercial "Half-Up" (mitad hacia arriba).
 * Si el siguiente dígito es >= 5, redondea hacia arriba; de lo contrario, hacia abajo.
 * Incluye Number.EPSILON para corregir imprecisiones de punto flotante en JavaScript.
 * 
 * @param value Número a redondear
 * @param decimals Cantidad de decimales (por defecto 2)
 * @returns Cadena con el formato correcto de decimales
 */
export function roundHalfUp(value: number, decimals: number = 2): string {
  const factor = Math.pow(10, decimals);
  return (Math.round((value + Number.EPSILON) * factor) / factor).toFixed(decimals);
}
