import { SiatSoapClient } from '../../src/siat/soap-client.js';

async function runEvaluation() {
  console.log('=== INICIANDO EVALUACION DEL AGENTE SIAT ===');
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  };

  try {
    // 1. Verificar Conexión
    console.log('\nEvaluando: verificarConexion...');
    const connResp = await SiatSoapClient.verificarConexion();
    assert(connResp.transaccion === true, 'Conexión debe retornar transacción true');
    assert(connResp.codigo === 926, 'Código de conexión debe ser 926');

    // 2. Obtener CUIS
    console.log('\nEvaluando: obtenerCuis...');
    const cuisResp = await SiatSoapClient.obtenerCuis();
    assert(cuisResp.transaccion === true, 'Obtención de CUIS exitosa');
    assert(typeof cuisResp.cuis === 'string', 'CUIS retornado es de tipo string');
    const cuis = cuisResp.cuis!;

    // 3. Obtener CUFD
    console.log('\nEvaluando: obtenerCufd...');
    const cufdResp = await SiatSoapClient.obtenerCufd();
    assert(cufdResp.transaccion === true, 'Obtención de CUFD exitosa');
    assert(typeof cufdResp.cufd === 'string', 'CUFD retornado es de tipo string');
    assert(typeof cufdResp.control === 'string', 'Código de control de CUFD es de tipo string');

    // 4. Sincronizar Catálogos
    console.log('\nEvaluando: sincronizarCatalogos (productos)...');
    const catalogos = await SiatSoapClient.sincronizarCatalogos('productos');
    assert(Array.isArray(catalogos), 'Catálogos debe ser un arreglo');
    assert(catalogos.length > 0, 'El arreglo de catálogos no debe estar vacío');

    // 5. Emitir Factura Válida
    console.log('\nEvaluando: emitirFactura (vía SOAP Client)...');
    const facturaInput = {
      nitEmisor: '123456789',
      razonSocialEmisor: 'Empresa Demo S.R.L.',
      sucursal: 0,
      puntoVenta: 0,
      numeroFactura: 105,
      nombreRazonSocial: 'Carlos Perez',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '6543210',
      codigoCliente: 'CLI-8822',
      codigoMetodoPago: 1,
      codigoMoneda: 1,
      tipoCambio: 1,
      montoTotal: 250,
      detalles: [
        {
          codigoProductoSin: 83111,
          codigoProducto: 'DEV-001',
          descripcion: 'Servicio de desarrollo de software',
          cantidad: 1,
          codigoUnidadMedida: 58,
          precioUnitario: 250,
          montoDescuento: 0,
          subTotal: 250
        }
      ]
    };
    const emitirResp = await SiatSoapClient.emitirFactura(facturaInput);
    assert(emitirResp.transaccion === true, 'Emisión de factura debe ser exitosa');
    assert(typeof emitirResp.cuf === 'string', 'Debe retornar un CUF válido');
    assert(typeof emitirResp.hashSha256 === 'string', 'Debe retornar el hash SHA-256 del XML firmado');
    const cuf = emitirResp.cuf!;

    // 6. Consultar Estado
    console.log('\nEvaluando: consultarEstado...');
    const consultaResp = await SiatSoapClient.consultarEstado(cuf);
    assert(consultaResp.transaccion === true, 'Consulta de estado exitosa');
    assert(consultaResp.factura?.estado === 'ACEPTADA', 'El estado inicial debe ser ACEPTADA');

    // 7. Anular Factura
    console.log('\nEvaluando: anularFactura...');
    const anularResp = await SiatSoapClient.anularFactura({
      cuf,
      codigoMotivo: 1, // Factura mal emitida
      nitEmisor: '123456789',
      sucursal: 0,
      puntoVenta: 0
    });
    assert(anularResp.transaccion === true, 'Solicitud de anulación exitosa');
    assert(anularResp.codigo === 905, 'El código de retorno de la anulación debe ser 905');

    // 8. Consultar Estado Posterior
    console.log('\nEvaluando: consultarEstado (post-anulación)...');
    const consultaAnuladaResp = await SiatSoapClient.consultarEstado(cuf);
    assert(consultaAnuladaResp.factura?.estado === 'ANULADA', 'El estado final de la factura debe ser ANULADA');

  } catch (error: any) {
    console.error(`Error crítico durante la evaluación: ${error.message}`);
    failedCount++;
  }

  console.log('\n=== RESUMEN DE LA EVALUACION ===');
  console.log(`Pruebas aprobadas: ${passedCount}`);
  console.log(`Pruebas fallidas: ${failedCount}`);
  if (failedCount === 0) {
    console.log('Resultado: EXCELENTE (100% de éxito)');
    process.exit(0);
  } else {
    console.error('Resultado: ERRORES DETECTADOS');
    process.exit(1);
  }
}

runEvaluation();
