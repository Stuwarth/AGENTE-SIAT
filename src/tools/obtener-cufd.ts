import { SiatSoapClient } from '../siat/soap-client.js';

export const obtenerCufdTool = {
  name: 'obtener_cufd',
  description: 'Obtiene o genera el Código Único de Facturación Diaria (CUFD). Este código se debe obtener cada 24 horas y se utiliza en la generación y firma de cada factura emitida durante el día.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    const response = await SiatSoapClient.obtenerCufd();
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
