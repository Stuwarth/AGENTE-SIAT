import './instrument.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Importar herramientas
import { verificarConexionTool } from './tools/verificar-conexion.js';
import { obtenerCuisTool } from './tools/obtener-cuis.js';
import { obtenerCufdTool } from './tools/obtener-cufd.js';
import { sincronizarCatalogosTool } from './tools/sincronizar-catalogos.js';
import { emitirFacturaTool } from './tools/emitir-factura.js';
import { anularFacturaTool } from './tools/anular-factura.js';
import { consultarEstadoTool } from './tools/consultar-estado.js';

class AgenticSiatServer {
  private server: Server;
  private tools: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'agentic-siat',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registerTools();
    this.setupHandlers();
    
    // Registrar manejador de errores de proceso
    this.server.onerror = (error) => console.error('[MCP Error]', error);

    // Escuchar excepciones y rechazos no capturados globales para evitar caídas del proceso
    process.on('uncaughtException', (error) => {
      console.error('[CRITICAL UNCAUGHT EXCEPTION] El servidor MCP evitó una caída:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[CRITICAL UNHANDLED REJECTION] Promesa rechazada sin manejar en:', promise, 'razón:', reason);
    });

    // Controlar apagado limpio
    process.on('SIGINT', () => {
      console.error('Cerrando servidor Agentic SIAT de forma ordenada...');
      process.exit(0);
    });
  }

  private registerTools() {
    const toolsList = [
      verificarConexionTool,
      obtenerCuisTool,
      obtenerCufdTool,
      sincronizarCatalogosTool,
      emitirFacturaTool,
      anularFacturaTool,
      consultarEstadoTool,
    ];

    for (const tool of toolsList) {
      this.tools.set(tool.name, tool);
    }
  }

  private setupHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.tools.values()).map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      };
    });

    // Llamar a una herramienta en particular
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = this.tools.get(request.params.name);
      if (!tool) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Herramienta no encontrada: ${request.params.name}`
        );
      }

      try {
        return await tool.handler(request.params.arguments || {});
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                transaccion: false,
                codigo: 500,
                descripcion: `Error interno de ejecución en herramienta ${request.params.name}: ${error.message}`,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  public async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Servidor MCP "Agentic SIAT" corriendo en transporte Stdio.');
  }
}

// Iniciar servidor
const serverInstance = new AgenticSiatServer();
serverInstance.start().catch((error) => {
  console.error('Fallo crítico al iniciar el servidor:', error);
  process.exit(1);
});
