# Onboarding del Equipo: Proyecto "Agentic SIAT"

¡Bienvenidos al proyecto que nos hará ganar el MCPJam! 
Si estás leyendo esto, es porque has sido asignado a uno de los roles clave. Antes de tirar la primera línea de código, necesitamos que todos estemos en la misma sintonía técnica y comercial.

---

## 🧠 1. ¿Qué es MCP? (Explicado para humanos)
Para ganar, todo el equipo debe entender qué estamos construyendo:

* **El Problema:** Las IAs (como ChatGPT o Claude) son muy inteligentes, pero están "encerradas". No pueden leer nuestras bases de datos ni apretar botones en nuestros sistemas.
* **La Solución (MCP):** El *Model Context Protocol* es un estándar abierto. Piensa en él como un "enchufe USB-C universal" para las IAs. 
* **Nuestro Trabajo:** Nosotros NO vamos a construir una página web ni una app móvil. Vamos a construir el "Cable USB" (El Servidor MCP) que conectará a Claude con los servidores de Impuestos Nacionales de Bolivia (SIAT). Así, le daremos a Claude el superpoder de emitir facturas legales.

---

## 🎯 2. El Pitch del Producto (Para el Rol Comercial / Product Manager)
* **Nombre en clave:** Agentic SIAT (El Contador Autónomo).
* **El Dolor del Mercado:** Emitir facturas electrónicas en Bolivia es un infierno técnico (requiere tokens CUIS/CUFD, firmas digitales XML y APIs inestables). Las PYMEs pierden horas peleando con el sistema.
* **Nuestra Propuesta de Valor:** Democratizar la facturación. Un dueño de negocio solo tendrá que abrir Claude y escribir: *"Factura 500 Bs a Juan Pérez por la laptop"*. Nuestro Servidor MCP hará toda la magia criptográfica por detrás en milisegundos.
* **¿Por qué ganará la Hackathon?:** Es B2B, es corporativo, resuelve un problema hiper-regional con tecnología global, y demuestra un nivel de ingeniería extrema que ningún otro equipo se atreverá a tocar.

---

## ✅ 3. Checklist de la Rúbrica Oficial (¡Prohibido olvidarlo!)
El jurado de MCPJam evaluará estrictamente esto. Cada rol debe cuidar su área:

- [ ] **¿Alguien pagaría por esto? (30%):** ¡Sí! Cualquier empresa en Bolivia pagaría por dejar de pelear con el software del SIN. *(Responsabilidad del Rol 4)*.
- [ ] **Decisiones de Ingeniería (30%):** Debemos implementar validaciones, manejo de errores robusto y simular firmas criptográficas. El código no tiene que verse bonito, tiene que ser a prueba de balas. *(Responsabilidad del Rol 1)*.
- [ ] **Testing y Evals (25%):** ESTO ES CRUCIAL. No podemos entregar el proyecto sin pruebas unitarias (`Jest`). El jurado descalifica proyectos sin tests. *(Responsabilidad del Rol 2)*.
- [ ] **Demo Funcionando (15%):** El flujo de "Pedir la factura -> Generar XML -> Retornar el PDF" debe verse fluido, sin errores ni interrupciones en el chat de Claude. *(Responsabilidad del Rol 3)*.

---

**¡Si todos entienden este documento, estamos listos para empezar a programar!**
