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
    if (!grid || typeof CATALOGO === "undefined") return;

    const genero = grid.dataset.genero;
    const items = CATALOGO[genero] || [];
    let filtro = "Todos";
    let fichaIndex = 0;
    let fichaItem = null;

    const filtros = document.getElementById("filtros");
    const ficha = document.getElementById("ficha");
    const fichaImg = document.getElementById("fichaImg");
    const fichaTitulo = document.getElementById("fichaTitulo");
    const fichaMeta = document.getElementById("fichaMeta");
    const fichaTexto = document.getElementById("fichaTexto");
    const fichaTallas = document.getElementById("fichaTallas");

    function pintar() {
        const lista = filtro === "Todos" ? items : items.filter((p) => p.categoria === filtro);
        grid.innerHTML = lista.map((p) => `
            <div class="producto" role="button" tabindex="0" data-id="${p.id}">
                <span class="tag">${p.categoria}</span>
                <div class="slider">
                    <button class="slider-prev" type="button" aria-label="Foto anterior">‹</button>
                    ${p.fotos.map((src, i) => `<img src="${src}" alt="${p.nombre}" class="${i === 0 ? "active" : ""}">`).join("")}
                    <button class="slider-next" type="button" aria-label="Foto siguiente">›</button>
                </div>
                <span class="nombre">${p.nombre}</span>
                <span class="precio">$${p.precio.toFixed(2)}</span>
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

            // Swipe en móvil
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
        mostrarFoto();
        fichaTitulo.textContent = fichaItem.nombre;
        fichaMeta.textContent = `${genero === "hombre" ? "Hombre" : "Mujer"} · ${fichaItem.categoria}`;
        fichaTexto.textContent = fichaItem.texto;
        fichaTallas.innerHTML = fichaItem.tallas.map((t) => `<span>${t}</span>`).join("");
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

    filtros?.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            filtros.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
            btn.classList.add("on");
            filtro = btn.dataset.filtro;
            pintar();
        });
    });

    pintar();
}

function initAuth() {
    const authBtn = document.getElementById("authBtn");
    const authModal = document.getElementById("authModal");
    const cerrarAuth = document.getElementById("cerrarAuth");
    const authTabs = document.querySelectorAll(".auth-tab");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const cartIcon = document.querySelector(".cart-icon");

    // Estado de autenticación
    let isAuthenticated = false;

    // Abrir modal
    authBtn?.addEventListener("click", () => {
        authModal.classList.add("open");
        document.body.style.overflow = "hidden";
    });

    // Cerrar modal
    function cerrarModal() {
        authModal.classList.remove("open");
        document.body.style.overflow = "";
    }

    cerrarAuth?.addEventListener("click", cerrarModal);
    authModal?.addEventListener("click", (e) => {
        if (e.target === authModal) cerrarModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarModal();
    });

    // Tabs (login/register)
    authTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            authTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const tabType = tab.dataset.tab;
            if (tabType === "login") {
                loginForm.style.display = "flex";
                registerForm.style.display = "none";
            } else {
                loginForm.style.display = "none";
                registerForm.style.display = "flex";
            }
        });
    });

    // Botón Google Login (por ahora solo visual)
    document.getElementById("googleLoginBtn")?.addEventListener("click", () => {
        alert("Funcionalidad de login con Google pendiente de integración con Supabase");
    });

    // Botón Google Register (por ahora solo visual)
    document.getElementById("googleRegisterBtn")?.addEventListener("click", () => {
        alert("Funcionalidad de registro con Google pendiente de integración con Supabase");
    });

    // Verificar autenticación al hacer click en el carrito
    cartIcon?.addEventListener("click", () => {
        if (!isAuthenticated) {
            authModal.classList.add("open");
            document.body.style.overflow = "hidden";
        } else {
            // Aquí iría la funcionalidad del carrito
            alert("Carrito funcionalidad pendiente");
        }
    });

    // Función para marcar como autenticado (se llamará cuando se integre Supabase)
    window.setAuthenticated = (status) => {
        isAuthenticated = status;
        if (status) {
            cartIcon?.classList.remove("disabled");
        } else {
            cartIcon?.classList.add("disabled");
        }
    };

    // Inicializar como no autenticado
    cartIcon?.classList.add("disabled");
}
