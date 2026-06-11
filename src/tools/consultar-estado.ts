import { SiatSoapClient } from '../siat/soap-client.js';

export const consultarEstadoTool = {
  name: 'consultar_estado',
  description: 'Consulta el estado actual de recepción y validez de una factura emitida ante el SIAT usando su código CUF.',
  inputSchema: {
    type: 'object',
    properties: {
      cuf: { type: 'string', description: 'Código Único de Factura (CUF) a consultar' },
    },
    required: ['cuf'],
  },
  handler: async (args: { cuf: string }) => {
    const response = await SiatSoapClient.consultarEstado(args.cuf);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
};
