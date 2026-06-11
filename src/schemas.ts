import { z } from "zod";

// Validaciones hiper-estrictas para el SIN
export const EmisionFacturaSchema = z.object({
  nitCliente: z.string()
    .min(5, "El NIT debe tener al menos 5 dígitos")
    .max(15, "El NIT no puede exceder 15 dígitos")
    .regex(/^\d+$/, "El NIT debe contener solo números"),
  razonSocial: z.string()
    .min(2, "La razón social es muy corta")
    .max(100, "La razón social excede el límite permitido"),
  montoTotal: z.number()
    .positive("El monto debe ser mayor a 0")
    .max(9999999, "El monto excede el límite permitido por transacción"),
  detalle: z.string().min(5, "Debes proporcionar un detalle válido de la venta")
});

export const AnulacionFacturaSchema = z.object({
  cuf: z.string().length(64, "El Código Único de Factura (CUF) debe tener exactamente 64 caracteres Hexadecimales"),
  motivoAnulacion: z.enum(["1", "2", "3", "4"], {
    message: "Motivo inválido. Usa: 1 (Datos incorrectos), 2 (Devolución), 3 (Factura duplicada), 4 (Error de sistema)"
  })
});
