/**
 * Algoritmo Módulo 11 oficial del SIN de Bolivia
 * Utilizado para generar el dígito verificador del CUF.
 */
export function calculaDigitoMod11(cadena: string, numDig: number, limMult: number, x10: boolean): string {
  if (!x10) {
    numDig = 1;
  }
  
  let tempCadena = cadena;
  
  for (let n = 1; n <= numDig; n++) {
    let suma = 0;
    let mult = 2;
    for (let i = tempCadena.length - 1; i >= 0; i--) {
      const val = parseInt(tempCadena.charAt(i), 10);
      if (isNaN(val)) {
        throw new Error(`Carácter no numérico encontrado en la cadena del CUF: ${tempCadena.charAt(i)}`);
      }
      suma += (mult * val);
      mult++;
      if (mult > limMult) {
        mult = 2;
      }
    }
    
    let dig: number;
    if (x10) {
      dig = ((suma * 10) % 11) % 10;
    } else {
      dig = suma % 11;
    }
    
    if (dig === 10) {
      tempCadena += "1";
    } else if (dig === 11) {
      tempCadena += "0";
    } else {
      tempCadena += dig.toString();
    }
  }
  
  return tempCadena.substring(tempCadena.length - numDig);
}

export interface CufInputs {
  nit: string;
  fechaHora: string; // Formato yyyyMMddHHmmssSSS (17 dígitos)
  sucursal: number;
  modalidad: number; // 1 = Electrónica, 2 = Computarizada
  tipoEmision: number; // 1 = Online, 2 = Offline, 3 = Masiva
  tipoFactura: number; // 1 = Crédito Fiscal, 2 = Sin Derecho, etc.
  tipoDocumentoSector: number; // e.g. 1
  numeroFactura: number;
  puntoVenta: number;
}

/**
 * Genera el Código Único de Factura (CUF) en formato hexadecimal
 */
export function generarCUF(inputs: CufInputs): string {
  // Padrón de campos según la especificación del SIN
  const nitPad = inputs.nit.padStart(13, '0');
  const fechaPad = inputs.fechaHora.padStart(17, '0');
  const sucursalPad = inputs.sucursal.toString().padStart(4, '0');
  const modalidadPad = inputs.modalidad.toString().padStart(1, '0');
  const tipoEmisionPad = inputs.tipoEmision.toString().padStart(1, '0');
  const tipoFacturaPad = inputs.tipoFactura.toString().padStart(1, '0');
  const tipoDocSectorPad = inputs.tipoDocumentoSector.toString().padStart(2, '0');
  const numFacturaPad = inputs.numeroFactura.toString().padStart(10, '0');
  const puntoVentaPad = inputs.puntoVenta.toString().padStart(4, '0');

  // Concatenar todos los campos (53 dígitos)
  const cadenaPreVerificadora = 
    `${nitPad}${fechaPad}${sucursalPad}${modalidadPad}${tipoEmisionPad}${tipoFacturaPad}${tipoDocSectorPad}${numFacturaPad}${puntoVentaPad}`;

  if (cadenaPreVerificadora.length !== 53) {
    throw new Error(`La longitud de la cadena pre-verificadora debe ser exactamente 53 caracteres (obtenido: ${cadenaPreVerificadora.length})`);
  }

  // Calcular el dígito autoverificador Módulo 11 (1 dígito)
  const digitoVerificador = calculaDigitoMod11(cadenaPreVerificadora, 1, 9, false);

  // Cadena completa (54 dígitos)
  const cadenaCompleta = `${cadenaPreVerificadora}${digitoVerificador}`;

  // Convertir a BigInt y luego a base 16 (hexadecimal) en mayúsculas
  const cufHex = BigInt(cadenaCompleta).toString(16).toUpperCase();

  return cufHex;
}
