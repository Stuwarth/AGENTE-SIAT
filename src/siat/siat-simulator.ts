import { CufInputs, generarCUF } from './cuf-generator.js';
import { EmitirFacturaInput, AnularFacturaInput } from '../schemas/factura.js';
import { roundHalfUp } from './utils.js';


export interface FacturaRegistrada {
  cuf: string;
  numeroFactura: number;
  nitEmisor: string;
  fechaEmision: string;
  montoTotal: number;
  nombreRazonSocial: string;
  numeroDocumento: string;
  estado: 'ACEPTADA' | 'RECHAZADA' | 'ANULADA';
  motivoAnulacion?: number;
}

class SiatSimulator {
  private activeCuis: string | null = null;
  private activeCufd: string | null = null;
  private cufdControl: string | null = null;
  private cufdCreatedAt: number = 0;
  
  // Base de datos en memoria de facturas emitidas para validación posterior
  private facturasEmitidas: Map<string, FacturaRegistrada> = new Map();

  // Catálogo simulado del SIN
  public catalogos = {
    actividades: [
      { codigoCaeb: '620100', descripcion: 'Servicios de consultoría informática y suministro de programas' },
      { codigoCaeb: '620200', descripcion: 'Actividades de gestión de instalaciones informáticas' },
      { codigoCaeb: '474100', descripcion: 'Venta al por menor de computadoras, equipo periférico y programas' }
    ],
    productos: [
      { codigoActividad: '620100', codigoProducto: '83111', descripcion: 'SERVICIOS DE DESARROLLO DE SOFTWARE A MEDIDA' },
      { codigoActividad: '620100', codigoProducto: '83112', descripcion: 'SERVICIOS DE CONSULTORÍA EN TI' },
      { codigoActividad: '620200', codigoProducto: '83120', descripcion: 'SERVICIOS DE SOPORTE TÉCNICO Y MANTENIMIENTO INFORMÁTICO' },
      { codigoActividad: '474100', codigoProducto: '43220', descripcion: 'LICENCIAS DE SOFTWARE COMERCIAL' }
    ],
    motivosAnulacion: [
      { codigo: 1, descripcion: 'FACTURA MAL EMITIDA' },
      { codigo: 2, descripcion: 'DATOS DE EMISION INCORRECTOS' },
      { codigo: 3, descripcion: 'DEVOLUCION DE PRODUCTOS o RESCISION DE SERVICIOS' }
    ],
    tiposDocumentoIdentidad: [
      { codigo: 1, descripcion: 'CÉDULA DE IDENTIDAD (CI)' },
      { codigo: 5, descripcion: 'NÚMERO DE IDENTIFICACIÓN TRIBUTARIA (NIT)' },
      { codigo: 2, descripcion: 'CÉDULA DE EXTRANJERÍA (CEX)' }
    ],
    metodosPago: [
      { codigo: 1, descripcion: 'EFECTIVO' },
      { codigo: 2, descripcion: 'TARJETA DÉBITO/CRÉDITO' },
      { codigo: 8, descripcion: 'TRANSFERENCIA BANCARIA' },
      { codigo: 38, descripcion: 'PAGO QR / TRANSFERENCIA MOVIL' }
    ]
  };

  constructor() {
    // Inicializar valores por defecto para permitir flujo de demo rápido
    this.activeCuis = "CUIS-E8C3A9B2-D410";
    this.activeCufd = "CUFD-A7F9D8C2B1A0E938D8C210B2D4F0";
    this.cufdControl = "CONTROL-A8B9C0";
    this.cufdCreatedAt = Date.now();
  }

  public reset(): void {
    this.activeCuis = null;
    this.activeCufd = null;
    this.cufdControl = null;
    this.cufdCreatedAt = 0;
    this.facturasEmitidas.clear();
  }

  public verificarConexion(): { transaccion: boolean; codigo: number; descripcion: string } {
    return {
      transaccion: true,
      codigo: 926,
      descripcion: "CONEXION CON EL SIAT ESTABLECIDA EXITOSAMENTE (SIMULADOR)"
    };
  }

  public obtenerCuis(nit: string, sucursal: number): { transaccion: boolean; codigo: number; cuis?: string; descripcion: string } {
    if (!nit || nit.length < 5) {
      return {
        transaccion: false,
        codigo: 901,
        descripcion: "NIT EMISOR INVALIDO O NO REGISTRADO"
      };
    }
    const generatedCuis = `CUIS-${crypto.randomUUID().substring(0, 8).toUpperCase()}-${nit.substring(0, 4)}`;
    this.activeCuis = generatedCuis;
    return {
      transaccion: true,
      codigo: 928,
      cuis: generatedCuis,
      descripcion: "CODIGO CUIS GENERADO Y REGISTRADO SATISFACTORIAMENTE POR 1 AÑO"
    };
  }

  public obtenerCufd(nit: string, sucursal: number, puntoVenta: number): { transaccion: boolean; codigo: number; cufd?: string; control?: string; descripcion: string } {
    if (!this.activeCuis) {
      return {
        transaccion: false,
        codigo: 902,
        descripcion: "ERROR: DEBE OBTENER UN CODIGO CUIS ANTES DE GENERAR EL CUFD"
      };
    }

    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const generatedCufd = `CUFD-${randomHex}`;
    const generatedControl = `CTRL-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    this.activeCufd = generatedCufd;
    this.cufdControl = generatedControl;
    this.cufdCreatedAt = Date.now();

    return {
      transaccion: true,
      codigo: 929,
      cufd: generatedCufd,
      control: generatedControl,
      descripcion: "CODIGO CUFD GENERADO EXITOSAMENTE CON VIGENCIA DE 24 HORAS"
    };
  }

  public verificarCufdVigente(): boolean {
    if (!this.activeCufd) return false;
    const unDia = 24 * 60 * 60 * 1000;
    return (Date.now() - this.cufdCreatedAt) < unDia;
  }

  public emitirFactura(input: EmitirFacturaInput): { transaccion: boolean; codigo: number; cuf?: string; codigoRecepcion?: string; descripcion: string } {
    // Validar CUFD
    if (!this.verificarCufdVigente()) {
      return {
        transaccion: false,
        codigo: 904,
        descripcion: "CODIGO CUFD EXPIRED O INEXISTENTE. DEBE GENERAR UNO NUEVO."
      };
    }

    // Validar montos del detalle
    let sumaSubtotales = 0;
    for (const item of input.detalles) {
      const expectedSubtotal = parseFloat(roundHalfUp(item.cantidad * item.precioUnitario - (item.montoDescuento || 0)));
      const subtotalFormatted = parseFloat(roundHalfUp(item.subTotal));
      if (Math.abs(subtotalFormatted - expectedSubtotal) > 0.01) {
        return {
          transaccion: false,
          codigo: 910,
          descripcion: `MONTO DE SUB-TOTAL INCORRECTO EN ITEM CON CODIGO ${item.codigoProducto}. Esperado: ${expectedSubtotal.toFixed(2)}, Recibido: ${subtotalFormatted.toFixed(2)}`
        };
      }
      sumaSubtotales += subtotalFormatted;
    }

    const expectedTotal = parseFloat(roundHalfUp(sumaSubtotales - (input.montoDescuentoAdicional || 0)));
    const totalFormatted = parseFloat(roundHalfUp(input.montoTotal));
    if (Math.abs(totalFormatted - expectedTotal) > 0.01) {
      return {
        transaccion: false,
        codigo: 912,
        descripcion: `MONTO TOTAL DE FACTURA NO COINCIDE CON LA SUMATORIA DE DETALLES. Calculado: ${expectedTotal.toFixed(2)}, Recibido: ${totalFormatted.toFixed(2)}`
      };
    }

    // Generar la fecha/hora en formato requerido: yyyyMMddHHmmssSSS
    const now = new Date();
    const formattedDate = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0') +
      now.getMilliseconds().toString().padStart(3, '0');

    // Generar CUF real basado en los datos provistos
    let cuf: string;
    try {
      cuf = generarCUF({
        nit: input.nitEmisor,
        fechaHora: formattedDate,
        sucursal: input.sucursal,
        modalidad: 1, // Electrónica
        tipoEmision: 1, // Online
        tipoFactura: 1, // Crédito Fiscal
        tipoDocumentoSector: 1, // Compra Venta
        numeroFactura: input.numeroFactura,
        puntoVenta: input.puntoVenta
      });
    } catch (err: any) {
      return {
        transaccion: false,
        codigo: 915,
        descripcion: `ERROR AL CALCULAR CUF AUTOMATICAMENTE: ${err.message}`
      };
    }

    const codigoRecepcion = `REC-${Math.floor(Math.random() * 900000000 + 100000000)}`;

    // Registrar en BD en memoria
    this.facturasEmitidas.set(cuf, {
      cuf,
      numeroFactura: input.numeroFactura,
      nitEmisor: input.nitEmisor,
      fechaEmision: now.toISOString(),
      montoTotal: input.montoTotal,
      nombreRazonSocial: input.nombreRazonSocial,
      numeroDocumento: input.numeroDocumento,
      estado: 'ACEPTADA'
    });

    return {
      transaccion: true,
      codigo: 900,
      cuf,
      codigoRecepcion,
      descripcion: "FACTURA RECIBIDA Y VALIDADA SATISFACTORIAMENTE POR EL SIN"
    };
  }

  public anularFactura(input: AnularFacturaInput): { transaccion: boolean; codigo: number; descripcion: string } {
    const factura = this.facturasEmitidas.get(input.cuf);
    if (!factura) {
      return {
        transaccion: false,
        codigo: 906,
        descripcion: `ERROR: NO SE ENCONTRO NINGUNA FACTURA REGISTRADA CON EL CUF: ${input.cuf}`
      };
    }

    if (factura.estado === 'ANULADA') {
      return {
        transaccion: false,
        codigo: 907,
        descripcion: "LA FACTURA YA SE ENCUENTRA EN ESTADO ANULADA"
      };
    }

    // Validar motivo
    const motivoExiste = this.catalogos.motivosAnulacion.some(m => m.codigo === input.codigoMotivo);
    if (!motivoExiste) {
      return {
        transaccion: false,
        codigo: 908,
        descripcion: `CODIGO DE MOTIVO DE ANULACION INVALIDO: ${input.codigoMotivo}`
      };
    }

    // Actualizar estado
    factura.estado = 'ANULADA';
    factura.motivoAnulacion = input.codigoMotivo;
    this.facturasEmitidas.set(input.cuf, factura);

    return {
      transaccion: true,
      codigo: 905,
      descripcion: `FACTURA NRO ${factura.numeroFactura} ANULADA CON EXITO ANTE EL SIN POR ${this.catalogos.motivosAnulacion.find(m => m.codigo === input.codigoMotivo)?.descripcion}`
    };
  }

  public consultarEstado(cuf: string): { transaccion: boolean; codigo: number; factura?: FacturaRegistrada; descripcion: string } {
    const factura = this.facturasEmitidas.get(cuf);
    if (!factura) {
      return {
        transaccion: false,
        codigo: 906,
        descripcion: `NO SE ENCONTRO LA FACTURA CON EL CUF PROVISTO: ${cuf}`
      };
    }

    return {
      transaccion: true,
      codigo: 900,
      factura,
      descripcion: `FACTURA ENCONTRADA. ESTADO ACTUAL: ${factura.estado}`
    };
  }

  public getFacturas(): FacturaRegistrada[] {
    return Array.from(this.facturasEmitidas.values());
  }
}

export const siatSimulator = new SiatSimulator();
