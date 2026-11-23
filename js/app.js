document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");

    if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuBtn.classList.toggle("active");
        });
    }

    initLookbook();
    initCatalogo();
    initAuth();
    initCart();
    initScrollAnimations();
});

function visibleCount() {
    if (window.innerWidth >= 1100) return 3;
    if (window.innerWidth >= 720) return 2;
    return 1;
}

function initLookbook() {
    const track = document.querySelector(".lookbook-track");
    const root = document.querySelector(".lookbook");
    if (!track || !root) return;

    const slides = Array.from(track.children);
    const prev = document.getElementById("prevBtn");
    const next = document.getElementById("nextBtn");
    const dotsWrap = document.querySelector(".lookbook-dots");
    let index = 0;

    function maxIndex() {
        return Math.max(0, slides.length - visibleCount());
    }

    function renderDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        const total = maxIndex() + 1;
        for (let i = 0; i < total; i++) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = i === index ? "on" : "";
            b.addEventListener("click", () => {
                index = i;
                update();
            });
            dotsWrap.appendChild(b);
        }
    }

    function update() {
        index = Math.min(index, maxIndex());
        const pct = 100 / visibleCount();
        track.style.transform = `translateX(-${index * pct}%)`;
        renderDots();
    }

    function go(dir) {
        const max = maxIndex();
        index = (index + dir + max + 1) % (max + 1);
        update();
    }

    prev?.addEventListener("click", () => go(-1));
    next?.addEventListener("click", () => go(1));
    window.addEventListener("resize", update);
    update();

    setInterval(() => go(1), 5500);

    let startX = 0;
    root.addEventListener("touchstart", (e) => {
        startX = e.changedTouches[0].screenX;
    }, { passive: true });
    root.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].screenX - startX;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
}

function initCatalogo() {
    const grid = document.getElementById("gridProductos");
    if (!grid) return;

    const genero = grid.dataset.genero;
    const items = genero === "hombre"
        ? (typeof CATALOGO_HOMBRE !== "undefined" ? CATALOGO_HOMBRE : [])
        : (typeof CATALOGO_MUJER !== "undefined" ? CATALOGO_MUJER : []);
    let filtro = genero === "hombre" ? "Buzos" : "Crop";
    let fichaIndex = 0;
    let fichaItem = null;
    let tallaSeleccionada = null;

    const filtros = document.getElementById("filtros");
    const ficha = document.getElementById("ficha");
    const fichaImg = document.getElementById("fichaImg");
    const fichaTitulo = document.getElementById("fichaTitulo");
    const fichaMeta = document.getElementById("fichaMeta");
    const fichaTexto = document.getElementById("fichaTexto");
    const fichaTallas = document.getElementById("fichaTallas");

    function pintar() {
        const lista = items.filter((p) => p.categoria === filtro);
        grid.innerHTML = lista.map((p) => `
            <div class="producto" role="button" tabindex="0" data-id="${p.id}">
                <span class="tag">$${p.precio.toFixed(2)}</span>
                <div class="slider">
                    <button class="slider-prev" type="button" aria-label="Foto anterior">‹</button>
                    ${p.fotos.map((src, i) => `<img src="${src}" alt="${p.nombre}" class="${i === 0 ? "active" : ""}">`).join("")}
                    <button class="slider-next" type="button" aria-label="Foto siguiente">›</button>
                    <div class="slider-dots">
                        ${p.fotos.map((_, i) => `<span class="${i === 0 ? "active" : ""}"></span>`).join("")}
                    </div>
                </div>
            </div>
        `).join("");

        grid.querySelectorAll(".producto").forEach((card) => {
            card.addEventListener("click", () => abrir(card.dataset.id));
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    abrir(card.dataset.id);
                }
            });
        });

        grid.querySelectorAll(".producto .slider").forEach((slider) => {
            const images = slider.querySelectorAll("img");
            if (images.length < 2) return;
            let i = 0;

            const prevBtn = slider.querySelector(".slider-prev");
            const nextBtn = slider.querySelector(".slider-next");

            function showImage(index) {
                images.forEach((img, idx) => {
                    img.classList.toggle("active", idx === index);
                });
                const dots = slider.querySelectorAll(".slider-dots span");
                dots.forEach((dot, idx) => {
                    dot.classList.toggle("active", idx === index);
                });
            }

            prevBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                i = (i - 1 + images.length) % images.length;
                showImage(i);
            });

            nextBtn?.addEventListener("click", (e) => {
                e.stopPropagation();
                i = (i + 1) % images.length;
                showImage(i);
            });

            let startX = 0;
            slider.addEventListener("touchstart", (e) => {
                startX = e.changedTouches[0].screenX;
            }, { passive: true });

            slider.addEventListener("touchend", (e) => {
                const dx = e.changedTouches[0].screenX - startX;
                if (Math.abs(dx) > 40) {
                    i = dx < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length;
                    showImage(i);
                }
            });
        });
    }

    function abrir(id) {
        fichaItem = items.find((p) => p.id === id);
        if (!fichaItem) return;
        fichaIndex = 0;
        tallaSeleccionada = null;
        mostrarFoto();
        fichaTitulo.textContent = fichaItem.nombre;
        fichaMeta.textContent = `${genero === "hombre" ? "Hombre" : "Mujer"} · ${fichaItem.categoria}`;
        fichaTexto.textContent = fichaItem.texto;

        if (fichaTallas) {
            fichaTallas.innerHTML = fichaItem.tallas.map((t) => `<span data-talla="${t}">${t}</span>`).join("");

            fichaTallas.querySelectorAll("span").forEach((span) => {
                span.addEventListener("click", () => {
                    fichaTallas.querySelectorAll("span").forEach((s) => s.classList.remove("selected"));
                    span.classList.add("selected");
                    tallaSeleccionada = span.dataset.talla;

                    // Animación de selección
                    span.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        span.style.transform = 'scale(1)';
                    }, 200);

                    const agregarBtn = document.getElementById("agregarCarrito");
                    if (agregarBtn) {
                        agregarBtn.disabled = false;
                        agregarBtn.style.animation = 'pulse 0.5s ease-out';
                    }
                });
            });
        }

        const agregarBtn = document.getElementById("agregarCarrito");
        if (agregarBtn) {
            agregarBtn.disabled = true;
        }

        ficha.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function mostrarFoto() {
        if (!fichaItem) return;
        fichaImg.src = fichaItem.fotos[fichaIndex];
        fichaImg.alt = fichaItem.nombre;
    }

    document.getElementById("cerrarFicha")?.addEventListener("click", cerrar);
    ficha?.addEventListener("click", (e) => {
        if (e.target === ficha) cerrar();
    });
    document.getElementById("fichaPrev")?.addEventListener("click", () => {
        if (!fichaItem) return;
        fichaIndex = (fichaIndex - 1 + fichaItem.fotos.length) % fichaItem.fotos.length;
        mostrarFoto();
    });
    document.getElementById("fichaNext")?.addEventListener("click", () => {
        if (!fichaItem) return;
        fichaIndex = (fichaIndex + 1) % fichaItem.fotos.length;
        mostrarFoto();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrar();
    });

    function cerrar() {
        ficha?.classList.remove("open");
        document.body.style.overflow = "";
    }

    const agregarBtn = document.getElementById("agregarCarrito");

    agregarBtn?.addEventListener("click", () => {
        if (!fichaItem || !tallaSeleccionada) return;
        if (typeof window.agregarAlCarrito === "function") {
            // Animación del botón
            agregarBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                agregarBtn.style.transform = 'scale(1)';
            }, 100);

            window.agregarAlCarrito(fichaItem, tallaSeleccionada);
            cerrar();
        }
    });

    filtros?.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            filtros.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
            btn.classList.add("on");
            filtro = btn.dataset.filtro;
            pintar();
        });
    });

    pintar();

    setTimeout(() => {
        initScrollAnimations();
    }, 100);
}

function initAuth() {
    const authBtn = document.getElementById("authBtn");
    const authModal = document.getElementById("authModal");
    const cerrarAuth = document.getElementById("cerrarAuth");
    const authTabs = document.querySelectorAll(".auth-tab");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authGuest = document.getElementById("authGuest");
    const authSession = document.getElementById("authSession");
    const authError = document.getElementById("authError");
    const authUserName = document.getElementById("authUserName");
    const authUserEmail = document.getElementById("authUserEmail");
    const cartIcon = document.querySelector(".cart-icon");
    let isAuthenticated = false;

    function mostrarError(mensaje) {
        if (!authError) return;
        authError.textContent = mensaje;
        authError.hidden = false;
    }

    function limpiarError() {
        if (!authError) return;
        authError.textContent = "";
        authError.hidden = true;
    }

    function aplicarSesion(user) {
        isAuthenticated = Boolean(user);

        authBtn?.classList.toggle("authenticated", isAuthenticated);
        cartIcon?.classList.toggle("disabled", !isAuthenticated);

        if (authGuest) authGuest.hidden = isAuthenticated;
        if (authSession) authSession.hidden = !isAuthenticated;

        if (user) {
            if (authUserName) authUserName.textContent = user.displayName || "Sesión activa";
            if (authUserEmail) authUserEmail.textContent = user.email || "";
        } else {
            // Asegurar que el carrito esté deshabilitado si no hay usuario
            cartIcon?.classList.add("disabled");
        }
    }

    function abrirModal() {
        limpiarError();
        authModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function cerrarModal() {
        authModal.classList.remove("open");
        document.body.style.overflow = "";
        limpiarError();
    }

    authBtn?.addEventListener("click", abrirModal);
    cerrarAuth?.addEventListener("click", cerrarModal);
    authModal?.addEventListener("click", (e) => {
        if (e.target === authModal) cerrarModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarModal();
    });

    authTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            authTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const esLogin = tab.dataset.tab === "login";
            if (loginForm) loginForm.style.display = esLogin ? "flex" : "none";
            if (registerForm) registerForm.style.display = esLogin ? "none" : "flex";
            limpiarError();
        });
    });

    async function entrarConGoogle() {
        limpiarError();

        if (typeof window.firebaseAuth === "undefined") {
            mostrarError("No se pudo cargar el servicio de cuentas. Recarga la página.");
            return;
        }

        if (window.location.protocol === "file:") {
            mostrarError("Abre el sitio con un servidor local (por ejemplo Live Server), no como archivo.");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await window.firebaseAuth.signInWithPopup(provider);
            cerrarModal();
        } catch (error) {
            mostrarError(error.message || "No se pudo conectar con Google.");
        }
    }

    document.getElementById("googleLoginBtn")?.addEventListener("click", entrarConGoogle);
    document.getElementById("googleRegisterBtn")?.addEventListener("click", entrarConGoogle);

    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
        limpiarError();
        try {
            await window.firebaseAuth.signOut();
            aplicarSesion(null);
            cerrarModal();
        } catch (error) {
            mostrarError(error.message);
        }
    });

    cartIcon?.addEventListener("click", () => {
        if (!isAuthenticated) {
            abrirModal();
            mostrarError("Inicia sesión para acceder al carrito.");
            return;
        }
    });

    cartIcon?.classList.add("disabled");

    if (typeof window.firebaseAuth === "undefined") {
        console.error("Firebase Auth no está inicializado");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) {
        abrirModal();
        mostrarError(oauthError);
        history.replaceState({}, document.title, window.location.pathname);
    }

    // Firebase onAuthStateChanged detecta cambios de autenticación
    window.firebaseAuth.onAuthStateChanged((user) => {
        aplicarSesion(user);
    });
}

function initCart() {
    const cartModal = document.getElementById("cartModal");
    const cerrarCart = document.getElementById("cerrarCart");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCheckout = document.getElementById("cartCheckout");
    const cartCount = document.getElementById("cartCount");
    const cartIcon = document.querySelector(".cart-icon");

    let cart = JSON.parse(localStorage.getItem("herencia_cart")) || [];

    function saveCart() {
        localStorage.setItem("herencia_cart", JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.classList.toggle("visible", totalItems > 0);

            // Animación cuando cambia el contador
            if (totalItems > 0) {
                cartCount.style.animation = 'none';
                setTimeout(() => {
                    cartCount.style.animation = 'pulse 0.3s ease-out';
                }, 10);
            }
        }
    }

    function renderCart() {
        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
            if (cartTotal) cartTotal.textContent = "$0.00";
            if (cartCheckout) cartCheckout.disabled = true;
            return;
        }

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.foto}" alt="${item.nombre}" class="cart-item-img">
                <div class="cart-item-info">
                    <div>
                        <div class="cart-item-name">${item.nombre}</div>
                        <div class="cart-item-size">Talla: ${item.talla}</div>
                    </div>
                    <div>
                        <div class="cart-item-price">$${typeof item.precio === 'number' ? item.precio.toLocaleString('es-CO') : item.precio}</div>
                        <button class="cart-item-remove" data-index="${index}">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join("");

        const total = cart.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
        if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-CO')}`;
        if (cartCheckout) cartCheckout.disabled = false;

        cartItems.querySelectorAll(".cart-item-remove").forEach((btn) => {
            btn.addEventListener("click", () => {
                const index = parseInt(btn.dataset.index);
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });
        });
    }

    function abrirCart() {
        if (!window.firebaseAuth?.currentUser) return;
        if (cartModal) {
            cartModal.classList.add("open");
            document.body.style.overflow = "hidden";
            renderCart();
        }
    }

    function cerrarCartModal() {
        if (cartModal) {
            cartModal.classList.remove("open");
            document.body.style.overflow = "";
        }
    }

    cartIcon?.addEventListener("click", () => {
        abrirCart();
    });

    cerrarCart?.addEventListener("click", cerrarCartModal);
    cartModal?.addEventListener("click", (e) => {
        if (e.target === cartModal) cerrarCartModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarCartModal();
    });

    cartCheckout?.addEventListener("click", () => {
        abrirCheckout();
    });

    updateCartCount();

    window.agregarAlCarrito = function(producto, talla) {
        const existingItem = cart.find(
            (item) => item.id === producto.id && item.talla === talla
        );

        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            cart.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                talla: talla,
                foto: producto.fotos[0],
                cantidad: 1
            });
        }

        saveCart();
    };

    function abrirCheckout() {
        const checkoutModal = document.getElementById("checkoutModal");
        if (!checkoutModal) return;

        const checkoutTotal = document.getElementById("checkoutTotal");

        const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        if (checkoutTotal) {
            checkoutTotal.textContent = `$${total.toLocaleString('es-CO')}`;
        }

        checkoutModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function cerrarCheckoutModal() {
        const checkoutModal = document.getElementById("checkoutModal");
        if (checkoutModal) {
            checkoutModal.classList.remove("open");
            document.body.style.overflow = "";
        }
    }

    document.getElementById("cerrarCheckout")?.addEventListener("click", cerrarCheckoutModal);
    document.getElementById("checkoutModal")?.addEventListener("click", (e) => {
        if (e.target.id === "checkoutModal") cerrarCheckoutModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarCheckoutModal();
    });

    const checkoutForm = document.getElementById("checkoutForm");
    checkoutForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Función de pago en desarrollo. Próximamente se integrará con Bold.");
    });

    const cardNumberInput = document.getElementById("cardNumber");
    cardNumberInput?.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
        let formatted = value.match(/.{1,4}/g)?.join(" ") || value;
        e.target.value = formatted;
    });

    const cardExpiryInput = document.getElementById("cardExpiry");
    cardExpiryInput?.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }
        e.target.value = value;
    });
}

// ======================================
// ANIMACIONES DE SCROLL
// ======================================

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar elementos con clase scroll-reveal
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // Observar elementos con clase scroll-reveal-left
    document.querySelectorAll('.scroll-reveal-left').forEach(el => {
        observer.observe(el);
    });

    // Observar elementos con clase scroll-reveal-right
    document.querySelectorAll('.scroll-reveal-right').forEach(el => {
        observer.observe(el);
    });

    // Observar elementos con clase scroll-reveal-scale
    document.querySelectorAll('.scroll-reveal-scale').forEach(el => {
        observer.observe(el);
    });
}
