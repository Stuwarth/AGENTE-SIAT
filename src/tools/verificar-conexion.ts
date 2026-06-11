import { SiatSoapClient } from '../siat/soap-client.js';

export const verificarConexionTool = {
  name: 'verificar_conexion_siat',
  description: 'Verifica la conectividad con los servicios del SIAT del SIN (Impuestos Nacionales de Bolivia). Útil para diagnosticar problemas de conexión antes de facturar.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    const response = await SiatSoapClient.verificarConexion();
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
