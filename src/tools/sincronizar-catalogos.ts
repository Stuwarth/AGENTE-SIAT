import { SiatSoapClient } from '../siat/soap-client.js';

export const sincronizarCatalogosTool = {
  name: 'sincronizar_catalogos',
  description: 'Obtiene los catálogos oficiales homologados por el SIN de Bolivia. Permite sincronizar productos autorizados, métodos de pago válidos o motivos de anulación legales.',
  inputSchema: {
    type: 'object',
    properties: {
      tipo: {
        type: 'string',
        enum: ['productos', 'metodosPago', 'motivosAnulacion'],
        description: 'Tipo de catálogo a sincronizar. Por defecto sincroniza productos.',
      },
    },
    required: ['tipo'],
  },
  handler: async (args: { tipo: 'productos' | 'metodosPago' | 'motivosAnulacion' }) => {
    const response = await SiatSoapClient.sincronizarCatalogos(args.tipo);
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
