import '../instrument.js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

export const config = {
  ambiente: process.env.SIAT_AMBIENTE || 'simulador',
  nit: process.env.SIAT_NIT || '123456789',
  tokenDelegado: process.env.SIAT_TOKEN_DELEGADO || 'SIMULATED_TOKEN',
  codigoSistema: process.env.SIAT_CODIGO_SISTEMA || 'SIMULATED_SYSTEM_CODE',
  codigoSucursal: parseInt(process.env.SIAT_CODIGO_SUCURSAL || '0', 10),
  codigoPuntoVenta: parseInt(process.env.SIAT_CODIGO_PUNTO_VENTA || '0', 10),
  certificadoRuta: process.env.SIAT_CERTIFICADO_RUTA || '',
  certificadoPassword: process.env.SIAT_CERTIFICADO_PASSWORD || '',
};
