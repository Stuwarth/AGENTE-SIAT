// Forzar a dotenv a ser completamente silencioso para no contaminar stdout
process.env.DOTENV_CONFIG_QUIET = 'true';

// Redirigir console.log a console.error antes de cualquier importación de librerías para proteger stdout
console.log = console.error;
