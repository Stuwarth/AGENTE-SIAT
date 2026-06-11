import { siatSimulator } from '../../src/siat/siat-simulator.js';
import { EmitirFacturaInput } from '../../src/schemas/factura.js';

describe('Simulador SIAT de Alta Fidelidad', () => {
  beforeEach(() => {
    siatSimulator.reset();
  });

  test('flujo completo de simulación de facturación', () => {
    // 1. Verificar conexión
    const ping = siatSimulator.verificarConexion();
    expect(ping.transaccion).toBe(true);
    expect(ping.codigo).toBe(926);

    // 2. Obtener CUIS
    const cuisResp = siatSimulator.obtenerCuis('123456789', 0);
    expect(cuisResp.transaccion).toBe(true);
    expect(cuisResp.cuis).toBeDefined();

    // 3. Obtener CUFD
    const cufdResp = siatSimulator.obtenerCufd('123456789', 0, 0);
    expect(cufdResp.transaccion).toBe(true);
    expect(cufdResp.cufd).toBeDefined();
    expect(cufdResp.control).toBeDefined();

    // 4. Emitir factura válida
    const facturaInput: EmitirFacturaInput = {
      nitEmisor: '123456789',
      razonSocialEmisor: 'Empresa Demo S.R.L.',
      sucursal: 0,
      puntoVenta: 0,
      numeroFactura: 1,
      nombreRazonSocial: 'Juan Perez',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '7654321',
      codigoCliente: 'CLI-9922',
      codigoMetodoPago: 1, // Efectivo
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
    };

    const emisionResp = siatSimulator.emitirFactura(facturaInput);
    expect(emisionResp.transaccion).toBe(true);
    expect(emisionResp.cuf).toBeDefined();
    expect(emisionResp.codigoRecepcion).toBeDefined();

    // 5. Consultar estado factura
    const cuf = emisionResp.cuf!;
    const consultaResp = siatSimulator.consultarEstado(cuf);
    expect(consultaResp.transaccion).toBe(true);
    expect(consultaResp.factura).toBeDefined();
    expect(consultaResp.factura?.estado).toBe('ACEPTADA');

    // 6. Anular factura
    const anulacionInput = {
      cuf,
      codigoMotivo: 1, // Factura mal emitida
      sucursal: 0,
      puntoVenta: 0,
      nitEmisor: '123456789'
    };
    const anulacionResp = siatSimulator.anularFactura(anulacionInput);
    expect(anulacionResp.transaccion).toBe(true);
    expect(anulacionResp.codigo).toBe(905);

    // 7. Consultar estado post-anulación
    const consultaAnulada = siatSimulator.consultarEstado(cuf);
    expect(consultaAnulada.factura?.estado).toBe('ANULADA');
  });

  test('falla al emitir factura si el monto total no cuadra', () => {
    // Inicializar cuis y cufd
    siatSimulator.obtenerCuis('123456789', 0);
    siatSimulator.obtenerCufd('123456789', 0, 0);

    const facturaInvalida: EmitirFacturaInput = {
      nitEmisor: '123456789',
      razonSocialEmisor: 'Empresa Demo S.R.L.',
      sucursal: 0,
      puntoVenta: 0,
      numeroFactura: 2,
      nombreRazonSocial: 'Maria Gomez',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '8765432',
      codigoCliente: 'CLI-9923',
      codigoMetodoPago: 1,
      codigoMoneda: 1,
      tipoCambio: 1,
      montoTotal: 150, // incorrecto, debería ser 100
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
    };

    const emisionResp = siatSimulator.emitirFactura(facturaInvalida);
    expect(emisionResp.transaccion).toBe(false);
    expect(emisionResp.codigo).toBe(912); // Código de error por total no coincide
  });
});
