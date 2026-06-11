import { z } from 'zod';

// Detalle de la factura
export const DetalleFacturaSchema = z.object({
  codigoProductoSin: z.number().int().describe('Código de producto homologado por el SIN'),
  codigoProducto: z.string().min(1).describe('Código de producto interno de la empresa'),
  descripcion: z.string().min(1).describe('Descripción del producto o servicio'),
  cantidad: z.number().positive().describe('Cantidad del producto o servicio'),
  codigoUnidadMedida: z.number().int().describe('Código de unidad de medida del SIN (ej. 58 = Servicios)'),
  precioUnitario: z.number().nonnegative().describe('Precio unitario en la moneda de la factura'),
  montoDescuento: z.number().nonnegative().optional().default(0).describe('Monto de descuento aplicable al ítem'),
  subTotal: z.number().nonnegative().describe('Monto subtotal (cantidad * precioUnitario - montoDescuento)'),
});

// Datos de emisión de factura
export const EmitirFacturaSchema = z.object({
  nitEmisor: z.string().min(1).describe('NIT de la empresa que emite la factura'),
  razonSocialEmisor: z.string().min(1).describe('Razón social del emisor'),
  sucursal: z.number().int().nonnegative().default(0).describe('Código de sucursal (0 = Casa Matriz)'),
  puntoVenta: z.number().int().nonnegative().default(0).describe('Código de punto de venta (0 = No aplica)'),
  numeroFactura: z.number().int().positive().describe('Número correlativo de la factura'),
  
  // Cliente
  nombreRazonSocial: z.string().min(1).describe('Nombre o Razón Social del cliente'),
  codigoTipoDocumentoIdentidad: z.number().int().positive().describe('1 = CI, 5 = NIT, 2 = CEX, etc.'),
  numeroDocumento: z.string().min(1).describe('Número de documento de identidad o NIT del cliente'),
  complemento: z.string().optional().describe('Complemento del CI (opcional, ej: 1C)'),
  codigoCliente: z.string().min(1).describe('Código único de identificación del cliente'),
  
  // Transacción
  codigoMetodoPago: z.number().int().positive().describe('1 = Efectivo, 2 = Tarjeta, 8 = Transferencia, etc.'),
  numeroTarjeta: z.string().optional().describe('Últimos 4 dígitos de la tarjeta (si aplica)'),
  codigoMoneda: z.number().int().positive().default(1).describe('1 = Bolivianos, 2 = USD, etc.'),
  tipoCambio: z.number().positive().default(1).describe('Tipo de cambio respecto al boliviano (1 para Bs)'),
  
  // Montos
  montoTotal: z.number().positive().describe('Monto total de la factura'),
  montoDescuentoAdicional: z.number().nonnegative().optional().default(0).describe('Descuento adicional a nivel de factura'),
  
  // Detalles
  detalles: z.array(DetalleFacturaSchema).min(1).describe('Lista de ítems detallados de la factura'),
});

// Datos de anulación de factura
export const AnularFacturaSchema = z.object({
  cuf: z.string().length(44).or(z.string().min(1)).describe('Código Único de Factura (CUF) a anular'),
  codigoMotivo: z.number().int().positive().describe('Motivo de anulación (1 = Factura Mal Emitida, 2 = Datos de Emisión Incorrectos, 3 = Devolución, etc.)'),
  sucursal: z.number().int().nonnegative().default(0).describe('Código de sucursal'),
  puntoVenta: z.number().int().nonnegative().default(0).describe('Código de punto de venta'),
  nitEmisor: z.string().min(1).describe('NIT de la empresa emisora'),
});

export type EmitirFacturaInput = z.infer<typeof EmitirFacturaSchema>;
export type AnularFacturaInput = z.infer<typeof AnularFacturaSchema>;
export type DetalleFactura = z.infer<typeof DetalleFacturaSchema>;
export type Factura = z.infer<typeof EmitirFacturaSchema>;
export type AnulacionFactura = z.infer<typeof AnularFacturaSchema>;
export const FacturaSchema = EmitirFacturaSchema;
