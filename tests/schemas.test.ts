import { EmisionFacturaSchema, AnulacionFacturaSchema } from '../src/schemas.js';

describe('Zod Schemas - Seguridad del SIAT', () => {

  describe('EmisionFacturaSchema', () => {
    it('debe aceptar datos válidos', () => {
      const data = {
        nitCliente: "1234567",
        razonSocial: "Tech Corp",
        montoTotal: 500.50,
        detalle: "Venta de Laptop Lenovo"
      };
      expect(() => EmisionFacturaSchema.parse(data)).not.toThrow();
    });

    it('debe rechazar un NIT con letras', () => {
      const data = {
        nitCliente: "1234567A", // Inválido
        razonSocial: "Tech Corp",
        montoTotal: 500.50,
        detalle: "Venta de Laptop Lenovo"
      };
      expect(() => EmisionFacturaSchema.parse(data)).toThrow("El NIT debe contener solo números");
    });

    it('debe rechazar montos negativos o cero', () => {
      const data = {
        nitCliente: "1234567",
        razonSocial: "Tech Corp",
        montoTotal: -10, // Inválido
        detalle: "Venta de Laptop Lenovo"
      };
      expect(() => EmisionFacturaSchema.parse(data)).toThrow("El monto debe ser mayor a 0");
    });
  });

  describe('AnulacionFacturaSchema', () => {
    it('debe aceptar motivos válidos', () => {
      const data = {
        cuf: "A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2", // 64 chars
        motivoAnulacion: "1"
      };
      expect(() => AnulacionFacturaSchema.parse(data)).not.toThrow();
    });

    it('debe rechazar motivos que no estén en la lista del SIAT', () => {
      const data = {
        cuf: "A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2",
        motivoAnulacion: "9" // Inválido
      };
      expect(() => AnulacionFacturaSchema.parse(data)).toThrow("Motivo inválido");
    });
  });

});
