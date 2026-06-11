# 🏆 Agentic SIAT (El Contador Autónomo)
**Proyecto para el MCPJam Hackathon**

## 📌 ¿Qué es este proyecto?
Agentic SIAT es el primer Servidor MCP (Model Context Protocol) diseñado específicamente para interactuar con el sistema de **Impuestos Nacionales de Bolivia (SIAT)**. 

Le da a las inteligencias artificiales (como Claude o ChatGPT) la capacidad de:
1. Verificar conexión con el gobierno.
2. Generar Códigos Únicos de Facturación Diaria (CUFD).
3. Emitir Facturas Electrónicas legalmente simulando la firma de XMLs.
4. Anular facturas.

## 🚀 Inicio Rápido (Setup)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Stuwarth/AGENTE-SIAT.git
   cd "AGENTE SIAT"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Compilar el servidor TypeScript:**
   ```bash
   npm run build
   ```

4. **Correr el servidor:**
   ```bash
   npm start
   ```

## 🧪 Pruebas (Testing y Evals)
El proyecto utiliza Jest para asegurar la calidad de las herramientas MCP y evitar alucinaciones.
Para correr las pruebas:
```bash
npm run test
```

## 👥 Equipo
* **Stuwarth:** Product Manager (Pitch y Viabilidad Comercial) - Rama: `feature/stuwarth-rol4`
* **Tomas:** Arquitecto Core MCP (Backend) - Rama: `feature/tomas`
* **Jhunior:** Ingeniero de QA (Testing y Evals) - Rama: `feature/jhunior`
* **Javier:** Especialista IA (Prompts y Demo) - Rama: `feature/javier`
