# 🏆 Agentic SIAT (El Contador Autónomo)
> **El primer Servidor MCP para Facturación Electrónica en Bolivia (SIN-SIAT)**  
> *Desarrollado para el CochaTech Hackathon 2026 — Track MCP Jam*

---

## 📌 ¿Qué es Agentic SIAT?

**Agentic SIAT** es un servidor Model Context Protocol (MCP) que otorga a modelos de lenguaje (como Claude Desktop, ChatGPT o agentes autónomos) la capacidad de interactuar directamente con el **Sistema Integrado de Administración Tributaria (SIAT)** de la **Administración Tributaria de Bolivia (SIN)**.

Permite que cualquier IA actúe como un **Asistente Contable Autónomo**, interpretando comandos en lenguaje natural como:
> *"Claude, emite una factura de compra-venta por 350 Bs al cliente Juan Pérez con CI 7654321, y luego verifícame su estado."*

La IA comprende el contexto, valida los datos mediante esquemas estrictos de Zod, genera el Código Único de Facturación (CUF) en base al algoritmo oficial Módulo 11 del SIN, firma digitalmente el XML (XMLDSig), lo comprime en Gzip y lo envía al SIN, retornando el resultado procesado en lenguaje humano.

---

## 💼 Justificación Comercial y Monetización (Jurado: 30%)

### 🔴 El Problema
Integrar la facturación electrónica en Bolivia es un calvario de ingeniería:
1. **Tecnología Obsoleta:** El SIN utiliza el protocolo SOAP/WSDL con esquemas XML muy estrictos en lugar de JSON/REST modernos.
2. **Seguridad Compleja:** Se requiere firmar digitalmente cada XML con certificados de la AGETIC usando criptografía XMLDSig (RSA-SHA256).
3. **Mantenimiento Alto:** Los códigos CUFD expiran cada 24 horas y las actividades/productos deben sincronizarse constantemente.
4. **Falta de Accesibilidad:** Las PYMEs bolivianas no tienen acceso a sistemas integrados inteligentes y terminan pagando licencias SaaS costosas e inflexibles.

### 🟢 Nuestra Solución: "Agentic SIAT"
Al encapsular toda esta complejidad en un **servidor MCP estándar**, permitimos que cualquier software o IA interactúe con el SIAT sin que el desarrollador tenga que programar un cliente SOAP desde cero.
* **Integración en 5 minutos:** Los contadores y desarrolladores añaden el servidor MCP a su entorno local y facturan a través de chat.
* **Seguridad a Nivel de Servidor:** Las llaves privadas y tokens del SIN nunca salen de la máquina local del contribuyente; la IA solo invoca herramientas a nivel de stdio/SSE.

### 💰 Modelo de Negocio e Ingresos
1. **SaaS Integrador (B2B):** Suscripción mensual para desarrolladores que desean integrar facturación en sus aplicaciones sin lidiar con SOAP (Tiers desde $19 USD/mes).
2. **Licenciamiento Enterprise (B2B2C):** Venta directa a sistemas ERP de Bolivia (ej. Odoo localizados, sistemas contables bolivianos) como módulo plug-and-play de facturación por IA.
3. **Soporte y Consultoría:** Servicios de homologación y firma digital para empresas que inician su transición a facturación electrónica.

---

## ⚙️ Decisiones de Ingeniería (Jurado: 30%)

| Componente | Tecnología | Razón de la Elección / Tradeoffs |
213: | Lenguaje | TypeScript | Tipado estricto para evitar errores en las operaciones financieras del CUF. |
214: | Protocolo | MCP (Model Context Protocol) | Estándar universal desarrollado por Anthropic para dotar de herramientas seguras a las IA. |
215: | Criptografía | `xml-crypto` (v6.1.2+) | Permite firma XMLDSig con RSA-SHA256 según el estándar oficial de impuestos de Bolivia. |
216: | Compresión | `zlib` (nativo de Node) | Compresión de datos a formato Gzip requerida por el SIN para reducir ancho de banda en envíos masivos. |
217: | Validación | `zod` | Esquemas de datos para asegurar que la IA no envíe datos con formatos incorrectos o montos negativos. |
218: | Simulación | Simulador en Memoria | Un simulador de alta fidelidad que gestiona estados (facturas emitidas, validez del CUFD) para testing 100% offline. |

---

## 🛠️ Arquitectura y Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│  USUARIO (Contador / Comerciante)                    │
│  "Claude, emite una factura de 150 Bs a Juan Pérez" │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  CLIENTE MCP (Claude Desktop / ChatGPT)              │
│  Interpreta el lenguaje natural y llama a las Tools  │
└──────────────────────┬───────────────────────────────┘
                       │ stdio (JSON-RPC 2.0)
                       ▼
┌──────────────────────────────────────────────────────┐
│  SERVIDOR MCP "Agentic SIAT"                         │
│                                                      │
│  Herramientas:                                       │
│  ├─ verificar_conexion_siat                          │
│  ├─ obtener_cuis                                     │
│  ├─ obtener_cufd                                     │
│  ├─ sincronizar_catalogos                            │
│  ├─ emitir_factura                                   │
│  ├─ anular_factura                                   │
│  └─ consultar_estado                                 │
│                                                      │
│  Capas Internas:                                     │
│  ├─ Validación Zod (factura.ts)                      │
│  ├─ Generador CUF (Módulo 11 + BigInt Hex)           │
│  ├─ Firmador XMLDSig (xml-signer.ts)                 │
│  ├─ Compresor Gzip & SHA-256                         │
│  └─ Cliente SOAP (soap-client.ts)                    │
└──────────────────────┬───────────────────────────────┘
                       │ SOAP/WSDL (Offline: Simulador)
                       ▼
┌──────────────────────────────────────────────────────┐
│  SERVICIOS DEL GOBIERNO (SIAT Piloto o Simulador)     │
│  pilotosiatservicios.impuestos.gob.bo/v2/            │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Instalación y Setup

### Requisitos Previos
* Node.js (versión 18 o superior)
* npm

### Pasos
1. **Clonar e instalar dependencias:**
   ```bash
   git clone https://github.com/Stuwarth/COCHATECH-KUSI.git
   cd "AGENTE SIAT"
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Copia el archivo de plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   *Para desarrollo offline y pruebas de la hackathon, puedes dejar los valores por defecto (modo `simulador`).*

3. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

4. **Integración con Claude Desktop:**
   Agrega la configuración del servidor en tu archivo de configuración de Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "agentic-siat": {
         "command": "node",
         "args": ["C:/ruta-a-tu-proyecto/AGENTE SIAT/dist/server.js"],
         "env": {
           "SIAT_AMBIENTE": "simulador",
           "SIAT_NIT": "123456789"
         }
       }
     }
   }
   ```
   *Asegúrate de cambiar `C:/ruta-a-tu-proyecto` por la ruta absoluta real de tu carpeta.*

---

## 🧪 Pruebas y Evals (Jurado: 25%)

Para garantizar la estabilidad técnica del servidor, implementamos dos capas de validación automatizada:

### 1. Pruebas Unitarias (Jest + ts-jest)
Verifican la lógica criptográfica (Módulo 11, hashes, firmas) y el correcto manejo de errores y validaciones Zod.
```bash
npm run test
```

### 2. Script de Evaluación del Agente (`eval.ts` + `tsx`)
Un simulador de comportamiento que ejecuta de manera secuencial todos los flujos de un agente autónomo (verificación, obtención de códigos, emisión de factura, control de montos, consulta y anulación) y evalúa que la respuesta cumpla con el estándar esperado.
```bash
npm run eval
```

---

## 👥 Miembros del Equipo y Roles

* **Stuwarth:** Product Manager (Pitch, Modelo de Negocio y Viabilidad Comercial).
* **Tomas:** Arquitecto Core MCP (Implementación del SDK de MCP y Servidor Stdio).
* **Jhunior:** Ingeniero de QA (Testing, Evals y Cobertura de Pruebas Unitarias).
* **Javier:** Especialista IA (Diseño de Prompts, Integración con LLM y Grabación de Demo).

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
