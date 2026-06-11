import { SiatSoapClient } from '../siat/soap-client.js';
import { AnularFacturaSchema } from '../schemas/factura.js';

export const anularFacturaTool = {
  name: 'anular_factura',
  description: 'Solicita la anulación de una factura emitida ante el SIAT. Requiere el código CUF de la factura y un código de motivo válido (ej. 1 = Factura Mal Emitida).',
  inputSchema: {
    type: 'object',
    properties: {
      cuf: { type: 'string', description: 'Código Único de Factura (CUF) a anular' },
      codigoMotivo: { type: 'number', description: 'Código de motivo: 1 = Factura Mal Emitida, 2 = Datos Incorrectos, 3 = Devolución' },
      sucursal: { type: 'number', description: 'Código de sucursal', default: 0 },
      puntoVenta: { type: 'number', description: 'Código de punto de venta', default: 0 },
      nitEmisor: { type: 'string', description: 'NIT de la empresa emisora de la factura' },
    },
    required: ['cuf', 'codigoMotivo', 'nitEmisor'],
  },
  handler: async (args: any) => {
    // Validar con Zod
    const validation = AnularFacturaSchema.safeParse(args);
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

    const response = await SiatSoapClient.anularFactura(validation.data);
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
