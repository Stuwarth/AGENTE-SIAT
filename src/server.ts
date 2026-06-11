import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { EmisionFacturaSchema, AnulacionFacturaSchema } from "./schemas.js";
import * as crypto from "node:crypto";
import process from "node:process";

// ==========================================
// MOCK DEL GOBIERNO (Impuestos Nacionales)
// ==========================================
// En un entorno de producción, esto haría peticiones SOAP/REST reales.
// Para el MCPJam, simulamos el comportamiento estricto del SIAT.
let cufdDiarioValido = false;

// ==========================================
// INICIALIZACIÓN DEL SERVIDOR MCP
// ==========================================
const server = new McpServer({
  name: "Agentic-SIAT",
  version: "1.0.0"
});

// ----------------------------------------------------
// HERRAMIENTA 1: Verificar Conexión
// ----------------------------------------------------
server.tool("verificar_conexion_siat",
  "Verifica si los servidores de Impuestos Nacionales están en línea.",
  {},
  async () => {
    // Simula latencia de conexión
    await new Promise(r => setTimeout(r, 500));
    return {
      content: [{ type: "text", text: "✅ CONEXIÓN EXITOSA: El Sistema de Facturación en Línea (SIAT) está operativo." }]
    };
  }
);

// ----------------------------------------------------
// HERRAMIENTA 2: Generar CUFD Diario
// ----------------------------------------------------
server.tool("generar_cufd_diario",
  "Solicita un nuevo Código Único de Facturación Diaria (CUFD). Obligatorio ejecutar esto al menos una vez al día antes de emitir facturas.",
  {},
  async () => {
    cufdDiarioValido = true;
    const mockCufd = crypto.randomBytes(32).toString('hex').toUpperCase();
    return {
      content: [{ type: "text", text: `✅ CUFD GENERADO: ${mockCufd}\nVálido por 24 horas. Ya puedes emitir facturas.` }]
    };
  }
);

// ----------------------------------------------------
// HERRAMIENTA 3: Emitir Factura Electrónica
// ----------------------------------------------------
server.tool("emitir_factura_electronica",
  "Emite una factura electrónica legal firmada criptográficamente en Bolivia. Requiere que exista un CUFD válido.",
  EmisionFacturaSchema.shape,
  async ({ nitCliente, razonSocial, montoTotal, detalle }) => {
    if (!cufdDiarioValido) {
      return {
        isError: true,
        content: [{ type: "text", text: "❌ ERROR DEL SIAT: No existe un CUFD válido. Ejecuta 'generar_cufd_diario' primero." }]
      };
    }

    // Simulamos la firma del XML
    const mockCuf = crypto.randomBytes(32).toString('hex').toUpperCase();
    const numeroFactura = Math.floor(Math.random() * 1000) + 1;
    const impuestoCalculado = (montoTotal * 0.13).toFixed(2); // 13% IVA en Bolivia

    const respuesta = `✅ FACTURA EMITIDA EXITOSAMENTE
------------------------------------
Nro Factura: ${numeroFactura}
CUF: ${mockCuf}
Cliente: ${razonSocial} (NIT: ${nitCliente})
Detalle: ${detalle}
Total a Pagar: ${montoTotal} Bs.
IVA Declarado (13%): ${impuestoCalculado} Bs.
------------------------------------
Link PDF: https://siat.impuestos.gob.bo/consulta/qr?cuf=${mockCuf}`;

    return {
      content: [{ type: "text", text: respuesta }]
    };
  }
);

// ----------------------------------------------------
// HERRAMIENTA 4: Anular Factura
// ----------------------------------------------------
server.tool("anular_factura",
  "Anula una factura electrónica emitida previamente usando su CUF.",
  AnulacionFacturaSchema.shape,
  async ({ cuf, motivoAnulacion }) => {
    const motivos = {
      "1": "Datos incorrectos",
      "2": "Devolución",
      "3": "Factura duplicada",
      "4": "Error de sistema"
    };

    return {
      content: [{ type: "text", text: `✅ FACTURA ANULADA EXITOSAMENTE.\nCUF Anulado: ${cuf}\nMotivo registrado en el SIN: ${motivos[motivoAnulacion]}` }]
    };
  }
);

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentic SIAT MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
