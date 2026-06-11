import { SiatSoapClient } from '../siat/soap-client.js';

export const obtenerCuisTool = {
  name: 'obtener_cuis',
  description: 'Obtiene o genera el Código Único de Inicio de Sistemas (CUIS) para la sucursal configurada. Este código tiene vigencia de un año y sirve para identificar al sistema de facturación autorizado.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    const response = await SiatSoapClient.obtenerCuis();
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
