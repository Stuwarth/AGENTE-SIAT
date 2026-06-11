# Plan Técnico de Implementación: Servidor MCP "Agentic SIAT"

Este documento detalla la arquitectura técnica y el paso a paso para construir nuestro servidor MCP desde cero en el entorno Antigravity. Cumpliremos estrictamente con la rúbrica del MCPJam (Ingeniería, Testing y MCPJam Tools).

## 1. Arquitectura del Proyecto (Stack Tecnológico)
* **Lenguaje:** TypeScript / Node.js (Fuerte tipado, ideal para arquitecturas seguras y para el ecosistema MCP).
* **SDK Principal:** `@modelcontextprotocol/sdk` (Librería oficial para construir el servidor).
* **Transporte:** `stdio` (Comunicación estándar de entrada/salida, que es el formato nativo para conectar herramientas como Claude Desktop o Antigravity).
* **Testing Framework:** Jest (Obligatorio para asegurar el 25% del puntaje de la rúbrica en Testing/Evals).

## 2. Definición de Herramientas (MCP Tools)
El núcleo de nuestro "Caballo de Troya". Le daremos a la IA 4 "superpoderes" (herramientas) específicos para lidiar con Impuestos Nacionales:

* **`verificar_conexion_siat`**: Un ping al sistema. Simula verificar si los servidores del SIN (Impuestos Nacionales) están en línea antes de operar.
* **`generar_cufd_diario`**: Simula la solicitud de un Código Único de Facturación Diaria (requisito criptográfico obligatorio en Bolivia).
* **`emitir_factura_electronica`**: La joya de la corona. Recibe datos (NIT, Razón Social, Detalles de Venta, Montos). Simula la creación del XML, la firma digital RSA, y devuelve el "Código de Autorización" junto con un link simulado al PDF de la factura.
* **`anular_factura`**: Recibe un número de factura y un código de motivo (ej. "Datos incorrectos") para procesar la anulación.

*(Nota de Ingeniería: Como el SIAT real requiere credenciales y certificados digitales pagados, para esta Hackathon construiremos una capa de simulación de alta fidelidad (Sandbox). La arquitectura del MCP será 100% real, pero las respuestas de la API del gobierno estarán mockeadas con los códigos de estado exactos que usa Impuestos).*

## 3. Plan de Acción (Paso a Paso)

### Fase 1: Inicialización (Setup)
* Inicializar el proyecto `npm init` en `C:\Users\stuwa\OneDrive\Documentos\Desktop\AGENTE SIAT`.
* Configurar TypeScript (`tsconfig.json`).
* Instalar dependencias clave: `@modelcontextprotocol/sdk`, `zod` (para validación de esquemas de datos) y `jest` (para pruebas).

### Fase 2: Desarrollo del Servidor
* Crear la clase `SiatMcpServer`.
* Implementar la capa de validación de entradas usando `zod` (ej. validar que un NIT boliviano tenga un formato correcto).
* Desarrollar la lógica de simulación de las 4 herramientas mencionadas arriba.

### Fase 3: Testing y Evals (Crucial para el Jurado)
* Escribir pruebas unitarias con Jest para cada herramienta MCP.
* Crear un script de evaluación (`eval.ts`) que demuestre cómo el servidor MCP responde correctamente a casos de borde (ej. ¿Qué pasa si la IA intenta emitir una factura por un monto negativo?).

### Fase 4: Documentación y Demo
* Generar un `README.md` robusto enfocado en la rúbrica del jurado (Decisiones de Ingeniería).
* Realizar la demostración operativa del Agente facturando exitosamente usando Antigravity.

## 4. Preguntas Abiertas / Feedback
* **Revisión del Plan:** ¿Estás de acuerdo con el stack propuesto (TypeScript, Node.js, Jest)?
* **Preparación del Entorno:** ¿Tienes Node.js instalado en tu máquina actual? (Para verificar, abre tu terminal y ejecuta `node -v` y `npm -v`).
* **Aprobación:** Si este plan técnico te parece bien, autorízame para ejecutar los comandos en tu carpeta "AGENTE SIAT" y empezar a crear los archivos.
