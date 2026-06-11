import { verificarConexionTool } from '../../src/tools/verificar-conexion.js';
import { obtenerCuisTool } from '../../src/tools/obtener-cuis.js';
import { obtenerCufdTool } from '../../src/tools/obtener-cufd.js';
import { sincronizarCatalogosTool } from '../../src/tools/sincronizar-catalogos.js';
import { emitirFacturaTool } from '../../src/tools/emitir-factura.js';
import { anularFacturaTool } from '../../src/tools/anular-factura.js';
import { consultarEstadoTool } from '../../src/tools/consultar-estado.js';
import { siatSimulator } from '../../src/siat/siat-simulator.js';

describe('Herramientas MCP del Agente SIAT', () => {
  beforeEach(() => {
    siatSimulator.reset();
  });

  test('verificar_conexion_siat responde correctamente', async () => {
    const res = await verificarConexionTool.handler();
    expect(res.content).toBeDefined();
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.transaccion).toBe(true);
    expect(parsed.codigo).toBe(926);
  });

  test('obtener_cuis y obtener_cufd responden correctamente', async () => {
    // 1. Obtener CUIS
    const cuisRes = await obtenerCuisTool.handler();
    const cuisData = JSON.parse(cuisRes.content[0].text);
    expect(cuisData.transaccion).toBe(true);
    expect(cuisData.cuis).toBeDefined();

    // 2. Obtener CUFD
    const cufdRes = await obtenerCufdTool.handler();
    const cufdData = JSON.parse(cufdRes.content[0].text);
    expect(cufdData.transaccion).toBe(true);
    expect(cufdData.cufd).toBeDefined();
  });

  test('sincronizar_catalogos responde con los productos del SIN', async () => {
    const res = await sincronizarCatalogosTool.handler({ tipo: 'productos' });
    const data = JSON.parse(res.content[0].text);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].codigoProducto).toBeDefined();
  });

  test('emitir_factura valida entradas usando Zod', async () => {
    // Caso inválido (faltan campos obligatorios)
    const badRes = await emitirFacturaTool.handler({
      nitEmisor: '123456789'
    });
    expect(badRes.isError).toBe(true);
    const badData = JSON.parse(badRes.content[0].text);
    expect(badData.codigo).toBe(400);
    expect(badData.descripcion).toContain('validación');

    // Caso válido
    // Asegurar que hay CUIS y CUFD activos en el simulador
    await obtenerCuisTool.handler();
    await obtenerCufdTool.handler();

    const goodRes = await emitirFacturaTool.handler({
      nitEmisor: '123456789',
      razonSocialEmisor: 'Empresa Demo S.R.L.',
      sucursal: 0,
      puntoVenta: 0,
      numeroFactura: 10,
      nombreRazonSocial: 'Juan Perez',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '7654321',
      codigoCliente: 'CLI-9922',
      codigoMetodoPago: 1,
      codigoMoneda: 1,
      tipoCambio: 1,
      montoTotal: 100,
      detalles: [
        {
          codigoProductoSin: 83111,
          codigoProducto: 'SOFT-01',
          descripcion: 'Licencia Software',
          cantidad: 1,
          codigoUnidadMedida: 58,
          precioUnitario: 100,
          montoDescuento: 0,
          subTotal: 100
        }
      ]
    });

    expect(goodRes.isError).toBeFalsy();
    const goodData = JSON.parse(goodRes.content[0].text);
    expect(goodData.transaccion).toBe(true);
    expect(goodData.cuf).toBeDefined();
    
    // Consultar estado de la factura recién creada
    const cuf = goodData.cuf;
    const consultaRes = await consultarEstadoTool.handler({ cuf });
    const consultaData = JSON.parse(consultaRes.content[0].text);
    expect(consultaData.transaccion).toBe(true);
    expect(consultaData.factura.estado).toBe('ACEPTADA');

    // Anular factura
    const anulacionRes = await anularFacturaTool.handler({
      cuf,
      codigoMotivo: 1,
      nitEmisor: '123456789',
      sucursal: 0,
      puntoVenta: 0
    });
    const anulacionData = JSON.parse(anulacionRes.content[0].text);
    expect(anulacionData.transaccion).toBe(true);

    // Consultar de nuevo para verificar anulación
    const consultaAnuladaRes = await consultarEstadoTool.handler({ cuf });
    const consultaAnuladaData = JSON.parse(consultaAnuladaRes.content[0].text);
    expect(consultaAnuladaData.factura.estado).toBe('ANULADA');
  });
});
