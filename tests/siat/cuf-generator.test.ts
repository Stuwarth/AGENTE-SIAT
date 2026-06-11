import { calculaDigitoMod11, generarCUF } from '../../src/siat/cuf-generator.js';

describe('Algoritmo Módulo 11 y CUF', () => {
  test('calculaDigitoMod11 calcula el dígito verificador correcto', () => {
    // Ejemplo de prueba simple con Modulo 11
    // Cadena de prueba numérica
    const cadena = '1234567';
    // Ponderación manual:
    // 7*2 + 6*3 + 5*4 + 4*5 + 3*6 + 2*7 + 1*8
    // = 14 + 18 + 20 + 20 + 18 + 14 + 8 = 112
    // 112 % 11 = 2.
    // Como 2 < 10, retorna "2"
    expect(calculaDigitoMod11(cadena, 1, 9, false)).toBe('2');
  });

  test('calculaDigitoMod11 maneja residuo 10', () => {
    // Necesitamos una cadena que sume de tal forma que sum % 11 === 10
    // Ejemplo: '10' -> 0*2 + 1*3 = 3 (no es 10)
    // Ejemplo: '9' -> 9*2 = 18. 18%11 = 7.
    // Busquemos una suma que dé residuo 10: ej: 10 % 11 === 10, 21 % 11 === 10
    // '52' -> 2*2 + 5*3 = 4 + 15 = 19. 19%11 = 8.
    // '61' -> 1*2 + 6*3 = 2 + 18 = 20. 20%11 = 9.
    // '70' -> 0*2 + 7*3 = 21. 21%11 = 10.
    // Para '70', sum % 11 = 10, lo que según la regla retorna '1'.
    expect(calculaDigitoMod11('70', 1, 9, false)).toBe('1');
  });

  test('generarCUF genera un código hexadecimal válido', () => {
    const inputs = {
      nit: '123456789',
      fechaHora: '20260611153045123',
      sucursal: 0,
      modalidad: 1,
      tipoEmision: 1,
      tipoFactura: 1,
      tipoDocumentoSector: 1,
      numeroFactura: 101,
      puntoVenta: 0
    };

    const cuf = generarCUF(inputs);
    expect(cuf).toBeDefined();
    expect(typeof cuf).toBe('string');
    expect(cuf.length).toBeGreaterThan(10);
    
    // Debe ser una cadena hexadecimal válida en mayúsculas
    expect(/^[0-9A-F]+$/.test(cuf)).toBe(true);
  });
});
