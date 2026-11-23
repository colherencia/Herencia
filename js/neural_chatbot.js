/**
 * Chatbot con IA Simple
 * Gestión de Catálogo de Ropa - 4to Semestre
 * Versión básica para explicar al profesor
 */

class SimpleChatbot {
    constructor() {
        this.productos = [];
        this.respuestas = {
            saludos: "¡Hola! Bienvenido a Herencia. ¿En qué puedo ayudarte?",
            productos: "Tenemos buzos, camisetas y crops con estilo streetwear oversize. ¿Quieres ver productos de hombre o de mujer?",
            hombre: "Para hombre tenemos: Buzo Contoda ($70.000), Buzo Chiribiquete ($70.000), Buzo Fuego ($70.000), Buzo Wayu ($70.000), Camiseta 333 ($35.000) y Camiseta Herencia ($35.000).",
            mujer: "Para mujer tenemos el Crop Hoodie Crema ($70.000) en felpa suave, disponible en tallas de XS a L.",
            buzos: "Nuestros buzos ($70.000 COP) son silueta oversize: Buzo Contoda, Buzo Chiribiquete, Buzo Fuego y Buzo Wayu en tallas S a XL.",
            camisetas: "Nuestras camisetas ($35.000 COP) son: Camiseta 333 y Camiseta Herencia en tallas S a XL.",
            crop: "El Crop Hoodie Crema para mujer cuesta $70.000 COP y está disponible en tallas XS, S, M y L.",
            tallas: "Tallas disponibles: XS, S, M, L, XL. Buzos y camisetas de S a XL; crop hoodies de XS a L.",
            precios: "Precios: Buzos $70.000 COP, Camisetas $35.000 COP, Crop Hoodie Crema $70.000 COP.",
            envios: "Realizamos envíos a toda Colombia. Los tiempos de entrega habituales son de 2 a 5 días hábiles según la ciudad.",
            devoluciones: "Aceptamos cambios de talla o prenda hasta 30 días después de la compra con marquillas originales y sin uso.",
            pagos: "Aceptamos tarjeta de crédito o débito (Visa, Mastercard, Amex) a través de nuestro checkout seguro, y efectivo.",
            compras: "Para comprar, abre la prenda que te guste, selecciona tu talla, haz clic en 'Agregar al carrito' y luego procede al pago en el checkout.",
            contacto: "Puedes contactarnos en nuestro Instagram oficial @her3ncia o a través de WhatsApp en el pie de página.",
            marca: "Herencia es una marca streetwear enfocada en siluetas oversize, denim amplio y gráficos con identidad propia."
        };
    }

    cargarProductos() {
        if (typeof CATALOGO_HOMBRE !== 'undefined') {
            this.productos = this.productos.concat(CATALOGO_HOMBRE);
        }
        if (typeof CATALOGO_MUJER !== 'undefined') {
            this.productos = this.productos.concat(CATALOGO_MUJER);
        }
    }

    procesarMensaje(mensaje) {
        const texto = mensaje.toLowerCase().trim();

        // Saludos
        if (this.contienePalabra(texto, ['hola', 'buenos', 'buenas', 'buen', 'saludos', 'hey'])) {
            return this.respuestas.saludos;
        }

        // Buzos específicos
        if (this.contienePalabra(texto, ['buzo', 'buzos', 'saco', 'sacos', 'hoodie', 'hoodies', 'contoda', 'chiribiquete', 'fuego', 'wayu'])) {
            return this.respuestas.buzos;
        }

        // Camisetas específicas
        if (this.contienePalabra(texto, ['camiseta', 'camisetas', 'remera', 'playera', '333'])) {
            return this.respuestas.camisetas;
        }

        // Crop específicos
        if (this.contienePalabra(texto, ['crop', 'crops', 'crema'])) {
            return this.respuestas.crop;
        }

        // Género hombre
        if (this.contienePalabra(texto, ['hombre', 'hombres', 'masculino', 'caballero', 'caballeros'])) {
            return this.respuestas.hombre;
        }

        // Género mujer
        if (this.contienePalabra(texto, ['mujer', 'mujeres', 'femenino', 'dama', 'damas'])) {
            return this.respuestas.mujer;
        }

        // Productos generales
        if (this.contienePalabra(texto, ['producto', 'productos', 'prenda', 'prendas', 'ropa', 'tienen', 'venden', 'catalogo', 'catálogo', 'coleccion', 'colección'])) {
            return this.respuestas.productos;
        }

        // Tallas
        if (this.contienePalabra(texto, ['talla', 'tallas', 'medida', 'medidas', 'size', 'oversize', 'ancho'])) {
            return this.respuestas.tallas;
        }

        // Precios
        if (this.contienePalabra(texto, ['precio', 'precios', 'cuesta', 'cuestan', 'cuanto', 'cuánto', 'costo', 'valor', 'vale'])) {
            return this.respuestas.precios;
        }

        // Envíos
        if (this.contienePalabra(texto, ['envío', 'envio', 'envios', 'envíos', 'entrega', 'entregas', 'llegará', 'llega', 'tarda', 'tiempo'])) {
            return this.respuestas.envios;
        }

        // Devoluciones
        if (this.contienePalabra(texto, ['devolución', 'devolucion', 'devoluciones', 'cambio', 'cambios', 'retornar', 'garantia', 'garantía', 'politica', 'política'])) {
            return this.respuestas.devoluciones;
        }

        // Pagos
        if (this.contienePalabra(texto, ['pago', 'pagos', 'pagar', 'tarjeta', 'tarjetas', 'visa', 'mastercard', 'amex', 'efectivo'])) {
            return this.respuestas.pagos;
        }

        // Carrito y compra
        if (this.contienePalabra(texto, ['carrito', 'compra', 'comprar', 'compras', 'checkout', 'orden', 'pedido', 'adquirir'])) {
            return this.respuestas.compras;
        }

        // Contacto y redes
        if (this.contienePalabra(texto, ['contacto', 'contactar', 'instagram', 'whatsapp', 'telefono', 'teléfono', 'redes', 'red social'])) {
            return this.respuestas.contacto;
        }

        // Historia o marca
        if (this.contienePalabra(texto, ['herencia', 'marca', 'historia', 'quienes son', 'quiénes son', 'concepto', 'estilo', 'streetwear'])) {
            return this.respuestas.marca;
        }

        // Si la pregunta NO tiene que ver con la página/tienda:
        return "Disculpa no entendí";
    }

    contienePalabra(texto, palabras) {
        // Verifica si alguna de las palabras está en el texto
        for (let palabra of palabras) {
            if (texto.includes(palabra)) {
                return true;
            }
        }
        return false;
    }
}

// Instancia global
const neuralChatbot = new SimpleChatbot();
