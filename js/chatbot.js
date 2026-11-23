/**
 * Módulo de Chatbot con IA
 * Gestión de Catálogo de Ropa - 4to Semestre
 */

// Usar configuración centralizada si está disponible
const API_KEY = (typeof CHATBOT_CONFIG !== 'undefined' && CHATBOT_CONFIG.apiKey) ? CHATBOT_CONFIG.apiKey : '';

const SYSTEM_PROMPT = (typeof CHATBOT_CONFIG !== 'undefined' && CHATBOT_CONFIG.systemPrompt) ? CHATBOT_CONFIG.systemPrompt : `Eres el asistente virtual oficial de la tienda de ropa streetwear "Herencia" (Gestión de Catálogo de Ropa).

INFORMACIÓN COMPLETA DE LA PÁGINA Y LA TIENDA:
- Marca: Herencia. Estilo streetwear, siluetas oversize, denim amplio y gráficos con identidad propia.
- Colección Hombre:
  * Buzos ($70.000 COP, tallas S, M, L, XL): Buzo Contoda (felpa oversize con mensaje de marca en la espalda), Buzo Chiribiquete (negro con gráfico naranja inspirado en arte andino), Buzo Fuego / 火 (gráfico frontal y posterior), Buzo Wayu (diseño cultural en felpa premium).
  * Camisetas ($35.000 COP, tallas S, M, L, XL): Camiseta 333 (corte cómodo con gráfico exclusivo), Camiseta Herencia / Gestión (prenda insignia).
- Colección Mujer:
  * Crop Hoodies ($70.000 COP, tallas XS, S, M, L): Crop Hoodie Crema (felpa suave, silueta cropped moderna).
- Tallas: XS, S, M, L, XL. (Buzos y camisetas: S a XL; Crops: XS a L).
- Precios: Buzos $70.000 COP, Camisetas $35.000 COP, Crop Hoodies $70.000 COP.
- Métodos de Pago: Tarjetas de crédito y débito (Visa, Mastercard, American Express) con transacciones seguras y encriptadas, y efectivo.
- Envíos: Cobertura nacional a toda Colombia. Tiempos de entrega habituales de 2 a 5 días hábiles según la ciudad.
- Cambios y Devoluciones: Tienes hasta 30 días para cambios de talla o prenda manteniendo las marquillas originales y la prenda en perfecto estado.
- Compras: El usuario puede seleccionar la talla en la ficha de cada producto, agregarlo a su carrito, revisar el total y proceder al checkout de pago.
- Contacto: Instagram oficial (@her3ncia) y WhatsApp en el pie de página del sitio.

REGLA ESTRICTA DE COMPORTAMIENTO:
1. Responde de forma cordial, clara y concisa a cualquier duda o consulta sobre la tienda, las prendas, precios, tallas, envíos, métodos de pago o políticas de compra.
2. Si el usuario te hace una pregunta que NO tenga que ver con la tienda, la página o la ropa de Herencia (por ejemplo: preguntas de matemáticas, tareas, política, cocina, código, clima, conocimiento general o cualquier tema ajeno a la tienda), debes responder ÚNICA Y EXACTAMENTE:
"Disculpa no entendí"`;

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.productos = [];
        this.init();
    }

    init() {
        this.loadProductos();
        this.createChatUI();
        this.attachEventListeners();
    }

    async loadProductos() {
        try {
            // Detectar qué página estamos usando para cargar los productos correctos
            const currentPath = window.location.pathname;

            // Cargar productos según la página actual
            if (currentPath.includes('hombre.html') || currentPath.includes('hombre')) {
                if (typeof CATALOGO_HOMBRE !== 'undefined') {
                    CATALOGO_HOMBRE.forEach(p => {
                        p.genero = 'hombre';
                        this.productos.push(p);
                    });
                }
            } else if (currentPath.includes('mujer.html') || currentPath.includes('mujer')) {
                if (typeof CATALOGO_MUJER !== 'undefined') {
                    CATALOGO_MUJER.forEach(p => {
                        p.genero = 'mujer';
                        this.productos.push(p);
                    });
                }
            } else {
                // En index.html, cargar ambos
                if (typeof CATALOGO_HOMBRE !== 'undefined') {
                    CATALOGO_HOMBRE.forEach(p => {
                        p.genero = 'hombre';
                        this.productos.push(p);
                    });
                }
                if (typeof CATALOGO_MUJER !== 'undefined') {
                    CATALOGO_MUJER.forEach(p => {
                        p.genero = 'mujer';
                        this.productos.push(p);
                    });
                }
            }

            // También intentar cargar desde CATALOGO (estructura unificada) si existe
            if (typeof CATALOGO !== 'undefined') {
                if (CATALOGO.hombre) {
                    CATALOGO.hombre.forEach(p => {
                        if (!this.productos.find(prod => prod.id === p.id)) {
                            p.genero = 'hombre';
                            this.productos.push(p);
                        }
                    });
                }
                if (CATALOGO.mujer) {
                    CATALOGO.mujer.forEach(p => {
                        if (!this.productos.find(prod => prod.id === p.id)) {
                            p.genero = 'mujer';
                            this.productos.push(p);
                        }
                    });
                }
            }

            console.log('Productos cargados:', this.productos.length);
            console.log('Productos hombre:', this.productos.filter(p => p.genero === 'hombre').length);
            console.log('Productos mujer:', this.productos.filter(p => p.genero === 'mujer').length);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    createChatUI() {
        // Botón flotante
        const chatButton = document.createElement('button');
        chatButton.id = 'chatbot-button';
        chatButton.innerHTML = '💬';
        chatButton.setAttribute('aria-label', 'Abrir chat de ayuda');
        document.body.appendChild(chatButton);

        // Ventana del chat
        const chatWindow = document.createElement('div');
        chatWindow.id = 'chatbot-window';
        chatWindow.innerHTML = `
            <div class="chatbot-header">
                <span>Asistente Herencia</span>
                <button id="chatbot-close" aria-label="Cerrar">×</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <div class="chatbot-message bot">
                    ¡Hola! 👋 Bienvenido a Herencia. Soy tu asistente virtual y estoy aquí para ayudarte.
                </div>
                <div class="chatbot-message bot">
                    Puedo asistirte con:
                </div>
                <div class="chatbot-message bot services">
                    <strong>👕 Productos y Tallas:</strong> Recomendaciones de prendas, guía de tallas, combinaciones de outfits
                </div>
                <div class="chatbot-message bot services">
                    <strong>📦 Envíos y Entregas:</strong> Tiempos de entrega, costos de envío, seguimiento de pedidos
                </div>
                <div class="chatbot-message bot services">
                    <strong>🔄 Devoluciones y Cambios:</strong> Política de cambios, proceso de devolución
                </div>
                <div class="chatbot-message bot services">
                    <strong>💳 Pagos:</strong> Métodos de pago, seguridad, preguntas sobre el proceso de compra
                </div>
                <div class="chatbot-message bot">
                    ¿En qué puedo ayudarte hoy? Escribe tu pregunta abajo.
                </div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta sobre la tienda..." autocomplete="off">
                <button id="chatbot-send" aria-label="Enviar">Enviar</button>
            </div>
        `;
        document.body.appendChild(chatWindow);
    }

    attachEventListeners() {
        const button = document.getElementById('chatbot-button');
        const window = document.getElementById('chatbot-window');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');

        button.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        const window = document.getElementById('chatbot-window');
        const button = document.getElementById('chatbot-button');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            window.classList.add('open');
            button.style.display = 'none';
        } else {
            window.classList.remove('open');
            button.style.display = 'block';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Mostrar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';

        // Mostrar indicador de escribiendo
        this.showTyping();

        try {
            let botReply;
            if (API_KEY && API_KEY.startsWith('sk-ant-')) {
                try {
                    botReply = await this.callClaudeAPI(message);
                } catch (apiError) {
                    console.warn('Error en Claude API, recurriendo al modelo local:', apiError);
                    if (typeof neuralChatbot !== 'undefined') {
                        botReply = await neuralChatbot.procesarMensaje(message);
                    } else {
                        botReply = this.getFallbackResponse(message);
                    }
                }
            } else if (typeof neuralChatbot !== 'undefined') {
                botReply = await neuralChatbot.procesarMensaje(message);
            } else {
                botReply = this.getFallbackResponse(message);
            }

            this.removeTyping();
            this.addMessage(botReply, 'bot');
        } catch (error) {
            this.removeTyping();
            console.error('Error del chatbot:', error);
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        messageDiv.textContent = text;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animación de entrada
        setTimeout(() => {
            messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'chatbot-typing';
        typingDiv.className = 'chatbot-message bot typing';
        typingDiv.innerHTML = '<span class="typing-dots">●●●</span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animación de los puntos
        const dots = typingDiv.querySelector('.typing-dots');
        let dotCount = 0;
        const interval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            dots.textContent = '●'.repeat(dotCount + 1);
        }, 200);

        typingDiv.dataset.interval = interval;
    }

    removeTyping() {
        const typing = document.getElementById('chatbot-typing');
        if (typing) typing.remove();
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();

        console.log('Mensaje recibido:', lowerMessage);

        // Mensajes muy cortos o sin sentido
        if (lowerMessage.length < 3 || /^[^a-z]+$/.test(lowerMessage)) {
            return 'Disculpa no entendí';
        }

        // Respuestas básicas cuando la API falla
        // Sistema de puntuación para mejor detección
        let scores = {
            devoluciones: 0,
            tallas: 0,
            envios: 0,
            compras: 0,
            pagos: 0,
            productos: 0,
            ubicacion: 0,
            saludos: 0
        };

        // Puntuar productos (mejorado con errores de escritura comunes)
        if (lowerMessage.includes('producto') || lowerMessage.includes('productos') || lowerMessage.includes('prodcuto') || lowerMessage.includes('prodcutos')) scores.productos += 3;
        if (lowerMessage.includes('prenda') || lowerMessage.includes('prendas')) scores.productos += 2;
        if (lowerMessage.includes('ropa')) scores.productos += 2;
        if (lowerMessage.includes('catálogo') || lowerMessage.includes('catalogo')) scores.productos += 2;
        if (lowerMessage.includes('recomienda') || lowerMessage.includes('recomendar')) scores.productos += 3;
        if (lowerMessage.includes('qué tienen') || lowerMessage.includes('que tienen')) scores.productos += 2;
        if (lowerMessage.includes('tienen') || lowerMessage.includes('disponible') || lowerMessage.includes('disponibles')) scores.productos += 2;
        if (lowerMessage.includes('qué sacos') || lowerMessage.includes('que sacos') || lowerMessage.includes('sacos')) scores.productos += 3;
        if (lowerMessage.includes('buzo') || lowerMessage.includes('buzos')) scores.productos += 3;
        if (lowerMessage.includes('camiseta') || lowerMessage.includes('camisetas')) scores.productos += 3;
        if (lowerMessage.includes('crop') || lowerMessage.includes('crops')) scores.productos += 3;
        if (lowerMessage.includes('articulo') || lowerMessage.includes('articulos') || lowerMessage.includes('artículo') || lowerMessage.includes('artículos')) scores.productos += 3;
        if (lowerMessage.includes('vende') || lowerMessage.includes('venden') || lowerMessage.includes('vender')) scores.productos += 3;
        if (lowerMessage.includes('ofrecen') || lowerMessage.includes('ofrece') || lowerMessage.includes('ofrecer')) scores.productos += 2;
        if (lowerMessage.includes('herencia') || lowerMessage.includes('gestión') || lowerMessage.includes('gestion')) scores.productos += 2;
        if (lowerMessage.includes('qué hay') || lowerMessage.includes('que hay') || lowerMessage.includes('que tienen')) scores.productos += 2;
        if (lowerMessage.includes('inventario') || lowerMessage.includes('stock')) scores.productos += 2;

        // Puntuar género (prioridad alta si se combina con productos)
        if (lowerMessage.includes('mujer') || lowerMessage.includes('mujeres')) {
            scores.productos += 4; // Prioridad alta
        }
        if (lowerMessage.includes('hombre') || lowerMessage.includes('hombres')) {
            scores.productos += 4; // Prioridad alta
        }

        // Puntuar específicamente "que productos de X hay"
        if (lowerMessage.includes('que') || lowerMessage.includes('qué')) {
            if (lowerMessage.includes('productos') || lowerMessage.includes('prodcutos')) {
                scores.productos += 5; // Máxima prioridad
            }
        }

        // Puntuar devoluciones
        if (lowerMessage.includes('devolver')) scores.devoluciones += 3;
        if (lowerMessage.includes('devolución') || lowerMessage.includes('devolucion')) scores.devoluciones += 3;
        if (lowerMessage.includes('cambio') || lowerMessage.includes('cambiar')) scores.devoluciones += 2;
        if (lowerMessage.includes('retornar')) scores.devoluciones += 2;
        if (lowerMessage.includes('reembolso') || lowerMessage.includes('reembolsar')) scores.devoluciones += 2;
        if (lowerMessage.includes('terminos') || lowerMessage.includes('términos') || lowerMessage.includes('termino') || lowerMessage.includes('término')) scores.devoluciones += 2;
        if (lowerMessage.includes('condiciones') || lowerMessage.includes('condicion')) scores.devoluciones += 2;
        if (lowerMessage.includes('politica') || lowerMessage.includes('política') || lowerMessage.includes('policies')) scores.devoluciones += 2;
        if (lowerMessage.includes('reglas') || lowerMessage.includes('reglamento')) scores.devoluciones += 2;

        // Puntuar saludos
        if (lowerMessage.includes('hola')) scores.saludos += 3;
        if (lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) scores.saludos += 2;
        if (lowerMessage.includes('cómo estás') || lowerMessage.includes('como estas')) scores.saludos += 2;
        if (lowerMessage.includes('qué tal') || lowerMessage.includes('que tal')) scores.saludos += 2;
        if (lowerMessage.includes('adiós') || lowerMessage.includes('adios')) scores.saludos += 2;
        if (lowerMessage.includes('buen día') || lowerMessage.includes('buen dia')) scores.saludos += 2;
        if (lowerMessage.includes('chao') || lowerMessage.includes('chau')) scores.saludos += 3;
        if (lowerMessage.includes('bye') || lowerMessage.includes('adios')) scores.saludos += 2;

        // Puntuar agradecimientos
        if (lowerMessage.includes('gracias') || lowerMessage.includes('gracias') || lowerMessage.includes('thank')) scores.saludos += 3;
        if (lowerMessage.includes('muchas gracias') || lowerMessage.includes('muchas gracias')) scores.saludos += 3;
        if (lowerMessage.includes('perfecto') || lowerMessage.includes('excelente') || lowerMessage.includes('genial')) scores.saludos += 2;

        // Puntuar tallas
        if (lowerMessage.includes('talla') || lowerMessage.includes('tallas')) scores.tallas += 3;
        if (lowerMessage.includes('tamaño')) scores.tallas += 2;
        if (lowerMessage.includes('medida') || lowerMessage.includes('medidas')) scores.tallas += 2;
        if (lowerMessage.includes('qué talla') || lowerMessage.includes('que talla')) scores.tallas += 2;

        // Puntuar envíos
        if (lowerMessage.includes('envío') || lowerMessage.includes('envio') || lowerMessage.includes('envíos') || lowerMessage.includes('envios')) scores.envios += 3;
        if (lowerMessage.includes('entrega') || lowerMessage.includes('entregas')) scores.envios += 2;
        if (lowerMessage.includes('llegará') || lowerMessage.includes('llegara') || lowerMessage.includes('llegue') || lowerMessage.includes('llego')) scores.envios += 2;
        if (lowerMessage.includes('cuando llega') || lowerMessage.includes('cuando llegara') || lowerMessage.includes('cuando llegue')) scores.envios += 2;
        if (lowerMessage.includes('tarda') || lowerMessage.includes('tardar') || lowerMessage.includes('tiempo')) scores.envios += 3;
        if (lowerMessage.includes('pedido') || lowerMessage.includes('pedir') || lowerMessage.includes('pedidos')) scores.envios += 2;

        // Puntuar compras
        if (lowerMessage.includes('compra') || lowerMessage.includes('comprar')) scores.compras += 3;
        if (lowerMessage.includes('proceso')) scores.compras += 2;
        if (lowerMessage.includes('carrito')) scores.compras += 2;
        if (lowerMessage.includes('pagar')) scores.compras += 2;

        // Puntuar pagos
        if (lowerMessage.includes('pago') || lowerMessage.includes('pagos')) scores.pagos += 3;
        if (lowerMessage.includes('tarjeta') || lowerMessage.includes('tarjetas')) scores.pagos += 2;
        if (lowerMessage.includes('seguridad')) scores.pagos += 2;
        if (lowerMessage.includes('visa') || lowerMessage.includes('mastercard') || lowerMessage.includes('amex')) scores.pagos += 2;

        // Puntuar productos
        if (lowerMessage.includes('producto') || lowerMessage.includes('productos')) scores.productos += 2;
        if (lowerMessage.includes('prenda') || lowerMessage.includes('prendas')) scores.productos += 2;
        if (lowerMessage.includes('ropa')) scores.productos += 2;
        if (lowerMessage.includes('catálogo') || lowerMessage.includes('catalogo')) scores.productos += 2;
        if (lowerMessage.includes('recomienda') || lowerMessage.includes('recomendar')) scores.productos += 3;
        if (lowerMessage.includes('qué tienen') || lowerMessage.includes('que tienen')) scores.productos += 2;
        if (lowerMessage.includes('tienen') || lowerMessage.includes('disponible') || lowerMessage.includes('disponibles')) scores.productos += 2;
        if (lowerMessage.includes('qué sacos') || lowerMessage.includes('que sacos') || lowerMessage.includes('sacos')) scores.productos += 3;
        if (lowerMessage.includes('buzo') || lowerMessage.includes('buzos')) scores.productos += 3;
        if (lowerMessage.includes('camiseta') || lowerMessage.includes('camisetas')) scores.productos += 3;
        if (lowerMessage.includes('crop') || lowerMessage.includes('crops')) scores.productos += 3;
        if (lowerMessage.includes('articulo') || lowerMessage.includes('articulos') || lowerMessage.includes('artículo') || lowerMessage.includes('artículos')) scores.productos += 3;
        if (lowerMessage.includes('vende') || lowerMessage.includes('venden') || lowerMessage.includes('vender')) scores.productos += 3;
        if (lowerMessage.includes('ofrecen') || lowerMessage.includes('ofrece') || lowerMessage.includes('ofrecer')) scores.productos += 2;
        if (lowerMessage.includes('herencia') || lowerMessage.includes('gestión') || lowerMessage.includes('gestion')) scores.productos += 2;
        if (lowerMessage.includes('qué hay') || lowerMessage.includes('que hay') || lowerMessage.includes('que tienen')) scores.productos += 2;
        if (lowerMessage.includes('inventario') || lowerMessage.includes('stock')) scores.productos += 2;

        // Puntuar ubicación/dónde encontrar
        if (lowerMessage.includes('dónde') || lowerMessage.includes('donde') || lowerMessage.includes('en donde')) scores.ubicacion += 3;
        if (lowerMessage.includes('ubicación') || lowerMessage.includes('ubicacion')) scores.ubicacion += 3;
        if (lowerMessage.includes('encontrar') || lowerMessage.includes('encontrar')) scores.ubicacion += 2;
        if (lowerMessage.includes('colección') || lowerMessage.includes('coleccion')) scores.ubicacion += 2;

        console.log('Scores:', scores);

        // Encontrar la categoría con mayor puntaje
        const maxScore = Math.max(...Object.values(scores));
        console.log('Max score:', maxScore);

        if (maxScore === 0) {
            return 'Por favor haz una pregunta específica sobre la tienda. Puedo ayudarte con productos, tallas, envíos, devoluciones o pagos.';
        }

        // Si hay empate, dar prioridad a saludos y ubicación
        if (scores.saludos === maxScore && scores.saludos > 0) {
            if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
                return '¡De nada! Estoy aquí para ayudarte. Si tienes más preguntas sobre nuestros productos, tallas, envíos o pagos, no dudes en preguntar. ¡Que tengas un excelente día!';
            }
            if (lowerMessage.includes('chao') || lowerMessage.includes('chau') || lowerMessage.includes('adiós') || lowerMessage.includes('adios') || lowerMessage.includes('bye')) {
                return '¡Hasta luego! Espero haberte ayudado. Si necesitas algo más, estaremos aquí para ti. ¡Que tengas un excelente día!';
            }
            return '¡Hola! Bienvenido a Gestión de Catálogo de Ropa. Estoy aquí para ayudarte con preguntas sobre nuestros productos, tallas, envíos, devoluciones o pagos. ¿En qué puedo asistirte hoy?';
        }

        if (scores.ubicacion === maxScore && scores.ubicacion > 0) {
            return 'Puedes encontrar nuestras colecciones en el menú principal: Hombre y Mujer. Cada sección tiene los productos disponibles con sus fotos, descripciones y tallas.';
        }

        if (scores.devoluciones === maxScore && scores.devoluciones > 0) {
            if (lowerMessage.includes('terminos') || lowerMessage.includes('términos') || lowerMessage.includes('condiciones') || lowerMessage.includes('politica') || lowerMessage.includes('política')) {
                return 'Nuestra política de cambios permite devoluciones dentro de un período específico de la compra. Los productos deben estar en su estado original con etiquetas intactas. Para proceder con una devolución, contáctanos por WhatsApp o Instagram para recibir instrucciones específicas. Los términos completos están disponibles en nuestra sección de políticas en el sitio.';
            }
            return 'Nuestra política de cambios está disponible en la tienda. Por lo general, aceptamos devoluciones dentro de un período específico. Revisa los términos completos en nuestra política.';
        }

        if (scores.tallas === maxScore && scores.tallas > 0) {
            return 'Para saber tu talla correcta, consulta la tabla de medidas en la ficha de cada prenda. Si tienes dudas específicas, puedes escribirnos por WhatsApp o Instagram.';
        }

        if (scores.envios === maxScore && scores.envios > 0) {
            return 'La información de envíos está disponible en la tienda. Los tiempos pueden variar según tu ubicación. Para más detalles, contáctanos por WhatsApp.';
        }

        if (scores.compras === maxScore && scores.compras > 0) {
            return 'El proceso de compra es simple: selecciona las prendas que te gusten, elige tu talla, agrégalas al carrito y procede al pago. Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express).';
        }

        if (scores.pagos === maxScore && scores.pagos > 0) {
            return 'Aceptamos pagos con tarjetas Visa, Mastercard y American Express. Todas las transacciones son seguras y encriptadas.';
        }

        if (scores.productos === maxScore && scores.productos > 0) {
            return this.getProductosResponse(lowerMessage);
        }

        return 'Disculpa no entendí';
    }

    getProductosResponse(message) {
        if (this.productos.length === 0) {
            return 'Contamos con ropa para hombre y mujer, incluyendo buzos y camisetas con estilo streetwear y oversize. Explora nuestras colecciones en el sitio.';
        }

        // Detectar categoría específica
        let categoria = null;
        let genero = null;

        if (message.includes('hombre') || message.includes('hombres')) genero = 'hombre';
        if (message.includes('mujer') || message.includes('mujeres')) genero = 'mujer';
        if (message.includes('buzo') || message.includes('buzos') || message.includes('saco') || message.includes('sacos')) categoria = 'Buzos';
        if (message.includes('camiseta') || message.includes('camisetas')) categoria = 'Camisetas';
        if (message.includes('crop') || message.includes('crops')) categoria = 'Crop';
        if (message.includes('jean') || message.includes('jeans') || message.includes('pantalón') || message.includes('pantalon')) categoria = 'Jeans';

        // Filtrar productos
        let productosFiltrados = this.productos;

        // Filtrar por género usando la propiedad genero que agregamos al cargar
        if (genero === 'hombre') {
            productosFiltrados = this.productos.filter(p => p.genero === 'hombre');
        } else if (genero === 'mujer') {
            productosFiltrados = this.productos.filter(p => p.genero === 'mujer');
        }

        // Filtrar por categoría
        if (categoria) {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
        }

        // Si no hay productos después del filtro, mostrar todos
        if (productosFiltrados.length === 0) {
            productosFiltrados = this.productos;
        }

        console.log('Genero detectado:', genero);
        console.log('Categoria detectada:', categoria);
        console.log('Productos filtrados:', productosFiltrados.length);

        // Generar respuesta
        let response = '';

        if (genero === 'hombre' || message.includes('hombre')) {
            response = 'Para hombre tenemos:\n\n';
        } else if (genero === 'mujer' || message.includes('mujer')) {
            response = 'Para mujer tenemos:\n\n';
        } else {
            response = 'En nuestra tienda tenemos:\n\n';
        }

        // Agrupar por categoría
        const porCategoria = {};
        productosFiltrados.forEach(p => {
            if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
            porCategoria[p.categoria].push(p);
        });

        Object.keys(porCategoria).forEach(cat => {
            response += `**${cat}:**\n`;
            porCategoria[cat].forEach(p => {
                response += `• ${p.nombre} - ${formatearPrecio(p.precio)}\n`;
                response += `  ${p.texto}\n`;
                response += `  Tallas: ${p.tallas.join(', ')}\n\n`;
            });
        });

        response += '\nExplora nuestras colecciones en el sitio para ver las fotos y más detalles.';

        return response;
    }

    async callClaudeAPI(userMessage) {
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: (typeof CHATBOT_CONFIG !== 'undefined' && CHATBOT_CONFIG.model) ? CHATBOT_CONFIG.model : 'claude-3-haiku-20240307',
                    max_tokens: 1024,
                    system: (typeof CHATBOT_CONFIG !== 'undefined' && CHATBOT_CONFIG.systemPrompt) ? CHATBOT_CONFIG.systemPrompt : SYSTEM_PROMPT,
                    messages: this.messages
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error de API:', response.status, errorData);
                throw new Error(`Error de API: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const botResponse = data.content[0].text;

            this.messages.push({
                role: 'assistant',
                content: botResponse
            });

            return botResponse;
        } catch (error) {
            console.error('Error completo:', error);
            throw error;
        }
    }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});
