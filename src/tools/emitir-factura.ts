import { SiatSoapClient } from '../siat/soap-client.js';
import { EmitirFacturaSchema } from '../schemas/factura.js';

export const emitirFacturaTool = {
  name: 'emitir_factura',
  description: 'Emite una factura electrónica de Compra-Venta ante el SIAT. Realiza de forma automática la validación, la firma digital XMLDSig, el empaquetado Gzip y el envío al SIN.',
  inputSchema: {
    type: 'object',
    properties: {
      nitEmisor: { type: 'string', description: 'NIT de la empresa que emite la factura' },
      razonSocialEmisor: { type: 'string', description: 'Razón social del emisor' },
      sucursal: { type: 'number', description: 'Código de sucursal (0 = Casa Matriz)', default: 0 },
      puntoVenta: { type: 'number', description: 'Código de punto de venta (0 = No aplica)', default: 0 },
      numeroFactura: { type: 'number', description: 'Número correlativo de la factura' },
      nombreRazonSocial: { type: 'string', description: 'Nombre o Razón Social del cliente' },
      codigoTipoDocumentoIdentidad: { type: 'number', description: 'Código de tipo de documento: 1 = CI, 5 = NIT, 2 = CEX' },
      numeroDocumento: { type: 'string', description: 'Número de documento de identidad o NIT del cliente' },
      complemento: { type: 'string', description: 'Complemento de CI (ej: 1C), opcional' },
      codigoCliente: { type: 'string', description: 'Código de identificación del cliente en la empresa' },
      codigoMetodoPago: { type: 'number', description: '1 = Efectivo, 2 = Tarjeta, 8 = Transferencia, 38 = QR' },
      numeroTarjeta: { type: 'string', description: 'Últimos 4 dígitos de la tarjeta (si aplica)', optional: true },
      codigoMoneda: { type: 'number', description: '1 = Bolivianos, 2 = USD', default: 1 },
      tipoCambio: { type: 'number', description: 'Tipo de cambio respecto al boliviano', default: 1 },
      montoTotal: { type: 'number', description: 'Monto total final de la factura (debe coincidir con la suma de subtotales)' },
      montoDescuentoAdicional: { type: 'number', description: 'Monto de descuento adicional a nivel global de factura', default: 0 },
      detalles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            codigoProductoSin: { type: 'number', description: 'Código de producto homologado por el SIN' },
            codigoProducto: { type: 'string', description: 'Código de producto interno de la empresa' },
            descripcion: { type: 'string', description: 'Descripción detallada del producto o servicio' },
            cantidad: { type: 'number', description: 'Cantidad' },
            codigoUnidadMedida: { type: 'number', description: 'Código de unidad de medida del SIN (ej. 58 = Servicios)' },
            precioUnitario: { type: 'number', description: 'Precio unitario' },
            montoDescuento: { type: 'number', description: 'Descuento aplicable a este item', default: 0 },
            subTotal: { type: 'number', description: 'Subtotal del ítem (cantidad * precioUnitario - descuento)' },
          },
          required: ['codigoProductoSin', 'codigoProducto', 'descripcion', 'cantidad', 'codigoUnidadMedida', 'precioUnitario', 'subTotal'],
        },
      },
    },
    required: [
      'nitEmisor',
      'razonSocialEmisor',
      'numeroFactura',
      'nombreRazonSocial',
      'codigoTipoDocumentoIdentidad',
      'numeroDocumento',
      'codigoCliente',
      'codigoMetodoPago',
      'montoTotal',
      'detalles',
    ],
  },
  handler: async (args: any) => {
    // Validar con Zod
    const validation = EmitirFacturaSchema.safeParse(args);
    if (!validation.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              transaccion: false,
              codigo: 400,
              descripcion: 'Error de validación de datos de entrada',
              errors: validation.error.format(),
            }, null, 2),
          },
        ],
        isError: true,
      };
    }

    const response = await SiatSoapClient.emitirFactura(validation.data);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
      isError: !response.transaccion,
    };
  },
};
