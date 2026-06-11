# Plan de Implementación: Servidor MCP "Agentic SIAT"

## Contexto del Proyecto

**Hackathon:** Track MCP Jam — CochaTech 2026
**Plazo:** 10 al 17 de junio (7 días)
**Premio:** $1,000 USD
**Equipo:** Stuwarth (Rol 4), Tomas, Jhunior, Javier (roles por definir)

---

## Rúbrica Oficial (Así nos califican)

| Criterio | Peso | Qué evalúan exactamente |
|---|---|---|
| ¿Comprarías este producto? | 30% | Problema real, usuario claro, alguien pagaría por esto |
| Decisiones de Ingeniería | 30% | Auth/OAuth, seguridad, tradeoffs justificados, diseño de Tools |
| Uso de MCPJam: Testing/Evals | 25% | Evidencia REAL de testing con la herramienta MCPJam durante el desarrollo |
| Demo Funcionando | 15% | Flujo completo en ChatGPT o Claude, sin interrupciones (video válido) |

> ⚠️ **Descalificación automática** si falta: (1) Testing con MCPJam, (2) Repo compartido, o (3) Demo operativa.

---

## La Realidad Técnica del SIAT (Lo que investigamos)

El SIAT (Sistema Integrado de Administración Tributaria) del SIN funciona así:

### Cómo funciona la API real
- **Protocolo:** SOAP/WSDL (NO es REST, es XML pesado)
- **Autenticación:** Token Delegado → se envía como header `apikey: TokenApi <token>`
- **Ambiente de pruebas (Piloto):** `https://pilotosiatservicios.impuestos.gob.bo/v2/`

### Flujo real para emitir una factura
```
1. Registrar sistema en portal SIAT (una vez)
2. Generar Token Delegado (vigencia 1 año)
3. Obtener CUIS via SOAP (vigencia 1 año)
4. Obtener CUFD via SOAP (cada 24 horas)
5. Sincronizar catálogos del SIN (productos, actividades)
6. Generar XML de la factura según esquema XSD del SIN
7. Generar CUF localmente (algoritmo Módulo 11 + Hexadecimal)
8. Firmar digitalmente el XML (XMLDSig, RSA-SHA256)
9. Comprimir en Gzip + calcular Hash SHA-256
10. Enviar via SOAP al método "recepcionFactura"
11. Recibir código de autorización del SIN
```

### Credenciales necesarias para conectar al SIAT real
- NIT del contribuyente
- Credenciales de la Oficina Virtual del SIN
- Código de Sistema (registrado en el portal)
- Token Delegado
- Certificado Digital de la AGETIC (firmadigital.bo) — cuesta Bs 70

### Librerías open-source existentes (referencia)
- `sinticbolivia/MonoInvoicesApiClient` (PHP) — Cliente completo
- `arielfad/cuf-siat-bolivia` (JavaScript) — Generación de CUF
- `DeGsoft/firma-factura-electronica-siat-java` (Java) — Firma XMLDSig

---

## ❓ Pregunta Crítica: ¿Tienen acceso al SIAT Piloto?

Para conectarnos al SIAT real (aunque sea el ambiente de pruebas), necesitamos:
1. ¿Alguno del equipo tiene NIT y acceso a la Oficina Virtual del SIN?
2. ¿Pueden generar un Token Delegado desde el portal SIAT?
3. ¿Tienen o pueden obtener un certificado digital de la AGETIC?

**Si la respuesta es SÍ:** Construimos el MCP conectado al Piloto real del SIAT.
**Si la respuesta es NO:** Construimos un "Simulador SIAT" de alta fidelidad que replica exactamente los endpoints SOAP, los códigos de error y los flujos del gobierno. El servidor MCP será 100% real, solo el "gobierno" será simulado. Esto es válido para la hackathon porque demuestra la arquitectura y las decisiones de ingeniería.

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────┐
│  USUARIO (Contador / Empresario)                    │
│  "Claude, emite una factura por 5000 Bs a Tech Corp"│
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  CLIENTE MCP (Claude Desktop / ChatGPT)              │
│  Interpreta el lenguaje natural y llama a las Tools  │
└──────────────────────┬───────────────────────────────┘
                       │ stdio / HTTP+SSE
                       ▼
┌──────────────────────────────────────────────────────┐
│  SERVIDOR MCP "Agentic SIAT" (Lo que construimos)    │
│                                                      │
│  Tools disponibles:                                  │
│  ├─ verificar_conexion      (ping al SIAT)           │
│  ├─ obtener_cuis            (código anual)           │
│  ├─ obtener_cufd            (código diario)          │
│  ├─ sincronizar_catalogos   (productos del SIN)      │
│  ├─ emitir_factura          (genera XML+firma+envía) │
│  ├─ anular_factura          (con motivo legal)       │
│  └─ consultar_estado        (verificar recepción)    │
│                                                      │
│  Capas internas:                                     │
│  ├─ Validación (Zod)                                 │
│  ├─ Generador de CUF (Módulo 11)                     │
│  ├─ Firmador XML (XMLDSig + RSA-SHA256)              │
│  ├─ Compresor (Gzip + SHA-256)                       │
│  └─ Cliente SOAP (conexión al SIAT)                  │
└──────────────────────┬───────────────────────────────┘
                       │ SOAP/WSDL
                       ▼
┌──────────────────────────────────────────────────────┐
│  API DEL GOBIERNO (SIAT Piloto o Simulador Local)    │
│  pilotosiatservicios.impuestos.gob.bo/v2/            │
│  ├─ FacturacionCodigos (CUIS, CUFD)                  │
│  ├─ ServicioFacturacionElectronica (emitir)           │
│  ├─ FacturacionOperaciones (anular)                   │
│  └─ FacturacionSincronizacion (catálogos)             │
└──────────────────────────────────────────────────────┘
```

---

## Fases de Desarrollo (Cronograma 7 días)

### Fase 1: Setup del Proyecto (Día 1 — Hoy)
**Objetivo:** Dejar el entorno listo para que todos puedan trabajar.
- [ ] Limpiar el código actual del repositorio (lo que subí antes estaba incompleto)
- [ ] Configurar correctamente `package.json`, `tsconfig.json`
- [ ] Instalar dependencias reales: SDK MCP, Zod, librería SOAP (`soap` o `strong-soap`), crypto nativo
- [ ] Crear estructura de carpetas definitiva:
  ```
  src/
  ├── server.ts          (Punto de entrada del MCP)
  ├── tools/             (Cada herramienta MCP en su archivo)
  │   ├── verificar-conexion.ts
  │   ├── obtener-cuis.ts
  │   ├── obtener-cufd.ts
  │   ├── sincronizar-catalogos.ts
  │   ├── emitir-factura.ts
  │   ├── anular-factura.ts
  │   └── consultar-estado.ts
  ├── siat/              (Capa de conexión al gobierno)
  │   ├── soap-client.ts
  │   ├── cuf-generator.ts
  │   ├── xml-signer.ts
  │   └── gzip-handler.ts
  ├── schemas/           (Validaciones Zod)
  │   └── factura.ts
  └── config/            (Variables de entorno y configuración)
      └── env.ts
  tests/
  ├── tools/
  ├── siat/
  └── evals/
  ```
- [ ] Configurar `.env` para credenciales del SIAT (Token Delegado, NIT, etc.)

### Fase 2: Motor SIAT — La Capa Pesada (Días 2-3)
**Objetivo:** Construir la lógica que realmente habla con Impuestos Nacionales.
- [ ] Implementar `cuf-generator.ts`: Algoritmo Módulo 11 + conversión hexadecimal (basado en la spec oficial del SIN)
- [ ] Implementar `xml-signer.ts`: Firma XMLDSig con RSA-SHA256
- [ ] Implementar `gzip-handler.ts`: Compresión Gzip + Hash SHA-256
- [ ] Implementar `soap-client.ts`: Cliente SOAP que se conecta a los WSDL del SIAT
- [ ] Si NO hay credenciales reales: Crear `siat-simulator.ts` que replica los endpoints SOAP del gobierno con respuestas idénticas a las reales

### Fase 3: Tools MCP — Las Herramientas de la IA (Días 3-4)
**Objetivo:** Conectar el motor SIAT al protocolo MCP para que Claude pueda usarlo.
- [ ] Implementar cada Tool como un archivo independiente con:
  - Nombre descriptivo
  - Descripción clara (esto es lo que Claude lee para decidir qué herramienta usar)
  - Esquema Zod de entrada (validación estricta)
  - Lógica que llama al motor SIAT
  - Respuesta formateada para el usuario
- [ ] Registrar todas las Tools en `server.ts`
- [ ] Implementar manejo de errores robusto (¿qué pasa si el SIAT está caído? ¿Si el CUFD expiró?)

### Fase 4: Testing con MCPJam (Días 4-5) — VALE 25%
**Objetivo:** Generar evidencia REAL de testing usando MCPJam.
- [ ] Instalar MCPJam CLI: `npx @mcpjam/inspector@latest`
- [ ] Usar el Inspector visual para probar cada Tool manualmente
- [ ] Crear archivos de evaluación:
  - `tests.json` — Escenarios de prueba (factura válida, NIT inválido, monto negativo, CUFD expirado)
  - `environment.json` — Configuración del servidor
  - `llms.json` — Proveedores LLM para testing
- [ ] Ejecutar `mcpjam evals run` y capturar los resultados
- [ ] Escribir pruebas unitarias con Jest para la lógica interna (CUF, firma, validaciones)
- [ ] **Documentar TODO con screenshots** (el jurado quiere ver evidencia)

### Fase 5: Demo + Documentación (Días 6-7) — VALE 15% + 30%
**Objetivo:** Grabar la demo y escribir la documentación que vende el producto.
- [ ] Conectar el servidor a Claude Desktop o ChatGPT
- [ ] Grabar video de demo mostrando el flujo completo:
  1. Usuario pide verificar conexión
  2. Usuario pide generar CUFD del día
  3. Usuario pide emitir factura con datos reales
  4. Claude procesa, firma, y devuelve el resultado
  5. Usuario pide anular la factura
- [ ] Escribir README.md final con:
  - Problema que resuelve (dolor del contador boliviano)
  - Decisiones de ingeniería justificadas
  - Instrucciones de instalación y uso
  - Evidencia de testing con MCPJam
  - Link al video de demo

---

## Stack Tecnológico Definitivo

| Componente | Tecnología | Justificación |
|---|---|---|
| Lenguaje | TypeScript | Tipado fuerte, ecosistema MCP nativo |
| Runtime | Node.js | SDK oficial de MCP es para Node |
| SDK MCP | `@modelcontextprotocol/sdk` | Librería oficial de Anthropic |
| Validación | `zod` | Requerido por el SDK MCP para esquemas de Tools |
| Cliente SOAP | `soap` o `strong-soap` | El SIAT usa WSDL/SOAP, no REST |
| Firma XML | `xml-crypto` | Implementa XMLDSig (RSA-SHA256) |
| Compresión | `zlib` (nativo de Node) | Para Gzip antes de enviar al SIAT |
| Testing | Jest + MCPJam CLI | Jest para unitarios, MCPJam para evals de IA |
| Transporte | stdio | Estándar para Claude Desktop |

---

## Distribución de Trabajo por Roles

### Rol 1 — Arquitecto Core (Tomas / Jhunior / Javier)
- Fase 1 completa
- Fase 2 completa (motor SIAT)
- Fase 3 (implementar Tools)

### Rol 2 — Ingeniero Testing (Tomas / Jhunior / Javier)
- Fase 4 completa (Jest + MCPJam)
- Documentar evidencia de testing

### Rol 3 — Director IA & Demo (Tomas / Jhunior / Javier)
- Conectar servidor a Claude/ChatGPT
- Grabar video de demo (Fase 5)
- Prompt Engineering

### Rol 4 — Product Manager (Stuwarth)
- README.md comercial y técnico
- Justificación de decisiones de ingeniería
- Pitch / Presentación
- Coordinar entregas

---

## Preguntas Abiertas (Responder antes de programar)

1. **¿Tienen acceso al SIAT Piloto?** (NIT, Token Delegado, Certificado Digital) — Esto define si conectamos al gobierno real o usamos simulador.
2. **¿Tomas, Jhunior y Javier ya escogieron sus roles?**
3. **¿Quieren que limpie el código actual del repo y lo restructure según este plan, o prefieren empezar desde cero?**
4. **¿Fecha exacta de entrega?** El documento dice "culmina el 17", ¿es a medianoche del 17 o durante el día?
