/**
 * Módulo de Utilidades
 * Gestión de Catálogo de Ropa - 4to Semestre
 * Funciones reutilizables para toda la aplicación
 */

/**
 * Formatea un precio a moneda local
 * @param {number} precio - El precio a formatear
 * @returns {string} Precio formateado en moneda local
 */
function formatearPrecio(precio) {
  const moneda = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.moneda : 'COP';
  const formato = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.formatoMoneda : 'es-CO';

  return new Intl.NumberFormat(formato, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0
  }).format(precio);
}

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Guarda datos en localStorage
 * @param {string} clave - Clave para guardar
 * @param {any} valor - Valor a guardar
 */
function guardarEnLocalStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
  }
}

/**
 * Obtiene datos de localStorage
 * @param {string} clave - Clave a buscar
 * @param {any} defecto - Valor por defecto si no existe
 * @returns {any} Valor almacenado o valor por defecto
 */
function obtenerDeLocalStorage(clave, defecto = null) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : defecto;
  } catch (error) {
    console.error('Error leyendo de localStorage:', error);
    return defecto;
  }
}

/**
 * Elimina datos de localStorage
 * @param {string} clave - Clave a eliminar
 */
function eliminarDeLocalStorage(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.error('Error eliminando de localStorage:', error);
  }
}

/**
 * Debounce - Ejecuta una función solo después de un tiempo de espera
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Muestra un mensaje de error al usuario
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarError(mensaje) {
  alert(`Error: ${mensaje}`);
}

/**
 * Muestra un mensaje de éxito al usuario
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarExito(mensaje) {
  alert(`✅ ${mensaje}`);
}

/**
 * Verifica si estamos en modo desarrollo
 * @returns {boolean} True si estamos en modo desarrollo
 */
function esModoDesarrollo() {
  return (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.modoDesarrollo : true;
}

/**
 * Log condicional - Solo muestra logs en modo desarrollo
 * @param {string} mensaje - Mensaje a loguear
 * @param {any} data - Datos adicionales
 */
function logDesarrollo(mensaje, data = null) {
  if (esModoDesarrollo()) {
    console.log(`[DEV] ${mensaje}`, data || '');
  }
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatearPrecio,
    validarEmail,
    guardarEnLocalStorage,
    obtenerDeLocalStorage,
    eliminarDeLocalStorage,
    debounce,
    mostrarError,
    mostrarExito,
    esModoDesarrollo,
    logDesarrollo
  };
}
