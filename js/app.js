// app.js - Lógica Principal v3.0 (MariaDB + Auth Wall + Login por Email/CPF)

const app = {
    state: {
        cart: [],
        menu: [],
        categories: [],
        user: {
            isAuthenticated: false,
            id: null,
            points: 0,
            name: '',
            email: '',
            phone: '',
            cpf: '',
            address: ''
        },
        discountApplied: false,
        theme: 'dark'
    },

    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    async init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSession();
        await this.fetchServerData();
        this.renderCategories();
        
        // Pega a primeira categoria ou principal
        const firstCatId = this.state.categories.length > 0 ? this.state.categories[0].id : null;
        this.renderProducts(firstCatId);
        
        // this.renderPromotions(); // Agora integrado nos produtos
        this.checkLGPD();
        this.updateCartBadge();
    },

    async fetchServerData() {
        try {
            const resCat = await fetch('api/categorias.php');
            const dataCat = await resCat.json();
            if(dataCat.success) this.state.categories = dataCat.data;

            const resProd = await fetch('api/produtos.php');
            const dataProd = await resProd.json();
            if(dataProd.success) this.state.menu = dataProd.data;
        } catch(e) {
            console.error("Erro ao carregar dados do servidor:", e);
        }
    },

    // ================================================================
    // SESSÃO LOCAL (sincroniza com banco quando online)
    // ================================================================
    loadSession() {
        const saved = localStorage.getItem('raizes_user_session');
        if (saved) {
            this.state.user = JSON.parse(saved);
            this.updateHeaderIcon();
        }
    },

    saveSession() {
        localStorage.setItem('raizes_user_session', JSON.stringify(this.state.user));
    },

    // ================================================================
    // DOM CACHE & EVENTS
    // ================================================================
    cacheDOM() {
        this.themeToggle    = document.getElementById('theme-toggle');
        this.categoriesList = document.getElementById('categories-list');
        this.productsGrid   = document.getElementById('products-grid');
        this.promotionsGrid = document.getElementById('promotions-grid');
        this.cartBadge      = document.getElementById('cart-badge');
        this.cartItemsList  = document.getElementById('cart-items');
        this.views          = document.querySelectorAll('.view');
        this.lgpdBanner     = document.getElementById('lgpd-banner');
    },

    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        document.getElementById('auth-btn').addEventListener('click', () => {
            if (this.state.user.isAuthenticated) {
                this.showView('view-profile');
            } else {
                this.openAuthModal('login');
            }
        });

        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => this.showView('view-cart'));
        }

        document.getElementById('checkout-btn').addEventListener('click', () => {
            if (!this.state.user.isAuthenticated) {
                this.showAuthRequired('finalizar o pedido');
                return;
            }
            if (this.state.cart.length === 0) { alert('Carrinho vazio!'); return; }
            this.showView('view-payment');
        });

        document.getElementById('lgpd-accept').addEventListener('click', () => this.acceptLGPD());
        document.getElementById('lgpd-decline').addEventListener('click', () => {
            this.lgpdBanner.classList.add('hidden');
        });

        const applyDiscountBtn = document.getElementById('apply-discount-btn');
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', () => this.applyLoyaltyDiscount());
        }
    },

    // ================================================================
    // CONTROLE DE VIEWS
    // ================================================================
    showView(viewId) {
        if (viewId === 'view-profile' && !this.state.user.isAuthenticated) {
            this.showView('view-auth');
            return;
        }

        this.views.forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (viewId === 'view-cart')    this.renderCart();
        if (viewId === 'view-profile') this.renderProfile();

        document.querySelectorAll('.bottom-nav .nav-item').forEach(i => i.classList.remove('active'));
        if (viewId === 'view-menu') document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active');
        if (viewId === 'view-cart') document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active');

        this.checkLGPD();
    },

    // ================================================================
    // AUTH WALL — exibe aviso quando visitante tenta usar carrinho
    // ================================================================
    showAuthRequired(acao = 'realizar esta ação') {
        const modal = document.getElementById('auth-required-modal');
        if (modal) {
            document.getElementById('auth-required-msg').textContent =
                `Para ${acao}, você precisa estar logado.`;
            modal.classList.remove('hidden');
        } else {
            // Fallback: redireciona para login diretamente
            alert(`⚠️ Para ${acao}, faça login ou cadastre-se primeiro.`);
            this.openAuthModal('login');
        }
    },

    // ================================================================
    // TEMA
    // ================================================================
    toggleTheme() {
        const body = document.body;
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            this.themeToggle.textContent = '🌙';
            this.state.theme = 'light';
        } else {
            body.classList.add('dark-mode');
            this.themeToggle.textContent = '☀️';
            this.state.theme = 'dark';
        }
    },

    // ================================================================
    // TROCA DE UNIDADE
    // ================================================================
    changeUnit() {
        const unit = document.getElementById('store-unit').value;
        const bannerName = document.getElementById('current-unit-name');
        this.productsGrid.innerHTML = '<div class="loader"><div class="spinner"></div><p>Carregando cardápio da unidade...</p></div>';
        setTimeout(() => {
            bannerName.textContent = unit === 'matriz' ? 'Matriz (Centro)' : 'Filial (Shopping Barra)';
            const activeCat = document.querySelector('.cat-item.active');
            const catId = activeCat ? activeCat.dataset.id : (this.state.categories.length > 0 ? this.state.categories[0].id : null);
            this.renderProducts(catId);
        }, 600);
    },

    // ================================================================
    // RENDERIZAÇÃO — Promoções, Categorias, Produtos
    // ================================================================
    renderPromotions() {
        if (!this.promotionsGrid) return;
        this.promotionsGrid.innerHTML = '';
        const ofertas = this.state.menu.filter(p => p.em_oferta);
        
        if (ofertas.length === 0) {
            document.querySelector('.promotions-container').classList.add('hidden');
            return;
        } else {
            document.querySelector('.promotions-container').classList.remove('hidden');
        }

        ofertas.forEach(promo => {
            this.promotionsGrid.innerHTML += `
                <div class="promo-card">
                    <div>
                        <h3>${promo.nome}</h3>
                        <p>${promo.descricao}</p>
                    </div>
                    <div>
                        <span class="promo-price" style="text-decoration:line-through; font-size: 0.8rem;">R$ ${parseFloat(promo.preco_original).toFixed(2).replace('.', ',')}</span><br>
                        <span class="promo-price" style="color: var(--danger);">R$ ${parseFloat(promo.preco).toFixed(2).replace('.', ',')}</span>
                        <button class="btn-primary-small mt-2" onclick="app.addToCart(${promo.id}); app.showView('view-cart');">Pedir Oferta</button>
                    </div>
                </div>
            `;
        });
    },

    renderCategories() {
        this.categoriesList.innerHTML = '';
        this.state.categories.forEach((cat, index) => {
            const li = document.createElement('li');
            li.className = `cat-item ${index === 0 ? 'active' : ''}`;
            li.dataset.id = cat.id;
            li.innerHTML = `${cat.icone || ''} ${cat.nome}`;
            li.onclick = (e) => {
                document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                this.renderProducts(cat.id);
            };
            this.categoriesList.appendChild(li);
        });
    },

    renderProducts(categoryId) {
        this.productsGrid.innerHTML = '';
        const filtered = this.state.menu.filter(p => p.categoria_id == categoryId);

        if(filtered.length === 0) {
            this.productsGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align:center;">Nenhum produto nesta categoria.</p>';
            return;
        }

        filtered.forEach(p => {
            const tagHTML = p.em_oferta ? `<span class="product-tag" style="background:var(--danger)">Oferta! R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</span>` : '';
            const priceDisplay = p.em_oferta 
                ? `<span class="product-price" style="text-decoration:line-through; font-size:0.8rem;">R$ ${parseFloat(p.preco_original).toFixed(2).replace('.', ',')}</span> <span class="product-price" style="color:var(--danger)">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</span>`
                : `<span class="product-price">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</span>`;

            const btnHTML = this.state.user.isAuthenticated
                ? `<button class="add-btn" onclick="app.addToCart(${p.id})">+</button>`
                : `<button class="add-btn add-btn-locked" onclick="app.showAuthRequired('adicionar ao carrinho')" title="Faça login para comprar">🔒</button>`;

            this.productsGrid.innerHTML += `
                <div class="product-card">
                    <img src="${p.imagem}" alt="${p.nome}" class="product-img" loading="lazy"
                         onerror="this.src='assets/baiao.png'">
                    <div class="product-info">
                        ${tagHTML}
                        <h3 class="product-title">${p.nome}</h3>
                        <p class="product-desc">${p.descricao}</p>
                        <div class="product-footer">
                            <div>${priceDisplay}</div>
                            ${btnHTML}
                        </div>
                    </div>
                </div>
            `;
        });
    },

    // ================================================================
    // CARRINHO
    // ================================================================
    addToCart(productId) {
        if (!this.state.user.isAuthenticated) {
            this.showAuthRequired('adicionar itens ao carrinho');
            return;
        }

        const product = this.state.menu.find(p => p.id == productId);
        if (!product) return;

        const existing = this.state.cart.find(i => i.id == productId);
        if (existing) {
            existing.qty++;
        } else {
            this.state.cart.push({ ...product, qty: 1 });
        }

        this.updateCartBadge();
        this.cartBadge.style.transform = 'scale(1.5)';
        setTimeout(() => this.cartBadge.style.transform = 'scale(1)', 200);
    },

    updateCartBadge() {
        const total = this.state.cart.reduce((acc, i) => acc + i.qty, 0);
        this.cartBadge.textContent = total;
        total > 0 ? this.cartBadge.classList.remove('hidden') : this.cartBadge.classList.add('hidden');
    },

    renderCart() {
        this.cartItemsList.innerHTML = '';

        if (this.state.cart.length === 0) {
            this.cartItemsList.innerHTML = '<p class="empty-msg text-muted">Seu carrinho está vazio.</p>';
            this.updateTotals();
            return;
        }

        this.state.cart.forEach((item, index) => {
            this.cartItemsList.innerHTML += `
                <div class="cart-item">
                    <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='assets/baiao.png'">
                    <div class="cart-item-details">
                        <h4>${item.nome}</h4>
                        <p class="text-accent text-bold">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="cart-item-action">
                        <span class="text-muted">Qtd: ${item.qty}</span>
                        <button class="btn-ghost" style="color:var(--danger)" onclick="app.removeFromCart(${index})">Remover</button>
                    </div>
                </div>
            `;
        });

        const loyaltyBanner = document.getElementById('loyalty-banner');
        if (this.state.user.isAuthenticated && this.state.user.points >= 100 && !this.state.discountApplied) {
            document.getElementById('user-points').textContent = this.state.user.points;
            loyaltyBanner.style.display = 'flex';
        } else {
            loyaltyBanner.style.display = 'none';
        }

        this.updateTotals();
    },

    removeFromCart(index) {
        this.state.cart.splice(index, 1);
        if (this.state.cart.length === 0) this.state.discountApplied = false;
        this.updateCartBadge();
        this.renderCart();
    },

    updateTotals() {
        const subtotal = this.state.cart.reduce((acc, i) => acc + (parseFloat(i.preco) * i.qty), 0);
        document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        let total = subtotal;
        let discount = 0;
        const discountDisplay = document.getElementById('discount-display');

        if (this.state.discountApplied && subtotal > 0) {
            discount = 5.00;
            total = Math.max(0, subtotal - discount);
            discountDisplay.classList.remove('hidden');
            document.getElementById('cart-discount').textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
        } else {
            discountDisplay.classList.add('hidden');
        }

        document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        document.getElementById('pay-total-amount').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    },

    // ================================================================
    // AUTENTICAÇÃO — Login por E-mail ou CPF
    // ================================================================
    openAuthModal(mode) {
        this.showView('view-auth');
        this.switchAuthMode(mode);
    },

    switchAuthMode(mode) {
        const title      = document.getElementById('auth-view-title');
        const desc       = document.getElementById('auth-view-desc');
        const submitBtn  = document.getElementById('view-auth-submit-btn');
        const switchText = document.getElementById('auth-switch-text');
        const switchLink = document.getElementById('auth-switch-link');
        const nameGroup  = document.getElementById('view-name-group');
        const phoneGroup = document.getElementById('view-phone-group');
        const cpfGroup   = document.getElementById('view-cpf-group');
        const addrGroup  = document.getElementById('view-address-group');

        // Label do identificador muda conforme o modo
        const identLabel = document.getElementById('label-identifier');

        if (mode === 'register') {
            if (identLabel) identLabel.textContent = 'E-mail';
            title.textContent       = 'Crie sua conta';
            desc.textContent        = 'Cadastre-se para acumular pontos em cada pedido.';
            submitBtn.textContent   = 'Finalizar Cadastro';
            [nameGroup, phoneGroup, cpfGroup, addrGroup].forEach(g => g && g.classList.remove('hidden'));
            switchText.textContent  = 'Já tem conta?';
            switchLink.textContent  = 'Faça Login';
            switchLink.setAttribute('onclick', "app.switchAuthMode('login')");
        } else {
            if (identLabel) identLabel.textContent = 'E-mail ou CPF';
            title.textContent       = 'Bem-vindo visse?';
            desc.textContent        = 'Entre com seu e-mail ou CPF cadastrado.';
            submitBtn.textContent   = 'Entrar';
            [nameGroup, phoneGroup, cpfGroup, addrGroup].forEach(g => g && g.classList.add('hidden'));
            switchText.textContent  = 'Ainda não tem conta?';
            switchLink.textContent  = 'Cadastre-se';
            switchLink.setAttribute('onclick', "app.switchAuthMode('register')");
        }
    },

    async handleAuthSubmit(e) {
        e.preventDefault();
        const isRegister = document.getElementById('view-auth-submit-btn').textContent === 'Finalizar Cadastro';
        const submitBtn  = document.getElementById('view-auth-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = isRegister ? 'Cadastrando...' : 'Entrando...';

        const email_ou_cpf = document.getElementById('v-user-email').value.trim();
        const senha        = document.getElementById('v-user-pass').value;

        try {
            if (isRegister) {
                const nome     = document.getElementById('v-user-name').value.trim();
                const telefone = document.getElementById('v-user-phone').value.trim();
                const cpf      = document.getElementById('v-user-cpf').value.trim();
                const endereco = document.getElementById('v-user-address').value.trim();

                if (!nome || !telefone || !cpf || !endereco) {
                    alert('Preencha todos os campos do cadastro!');
                    return;
                }

                const resp = await fetch('api/cadastro.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email: email_ou_cpf, cpf, telefone, endereco, senha })
                });
                const data = await resp.json();

                if (!data.success) {
                    alert('❌ ' + data.message);
                    return;
                }

                this._setUserFromApi(data.usuario);

            } else {
                // LOGIN — identifica por email ou CPF
                const resp = await fetch('api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador: email_ou_cpf, senha })
                });
                const data = await resp.json();

                if (!data.success) {
                    alert('❌ ' + data.message);
                    return;
                }

                this._setUserFromApi(data.usuario);
            }

            this.saveSession();
            this.updateHeaderIcon();
            this.renderProducts(
                document.querySelector('.cat-item.active')?.dataset?.id || 'principais'
            );
            this.showView('view-profile');
            alert(`✅ Bem-vindo(a), ${this.state.user.name}!`);

        } catch (err) {
            alert('Erro de conexão com o servidor. Verifique se o Apache está rodando.');
            console.error(err);
        } finally {
            submitBtn.disabled    = false;
            submitBtn.textContent = isRegister ? 'Finalizar Cadastro' : 'Entrar';
        }
    },

    _setUserFromApi(u) {
        this.state.user = {
            isAuthenticated: true,
            id:      u.id,
            name:    u.nome,
            email:   u.email,
            cpf:     u.cpf,
            phone:   u.telefone,
            address: u.endereco,
            points:  parseInt(u.pontos) || 0
        };
    },

    renderProfile() {
        const u = this.state.user;
        document.getElementById('profile-name').textContent    = u.name    || 'Usuário';
        document.getElementById('profile-email').textContent   = u.email   || '-';
        document.getElementById('profile-address').textContent = u.address || '-';
        document.getElementById('profile-phone').textContent   = u.phone   || '-';
        document.getElementById('profile-cpf').textContent     = u.cpf     || '-';
        document.getElementById('profile-points').textContent  = u.points  || 0;
    },

    updateHeaderIcon() {
        const icon = document.querySelector('.profile-icon');
        if (!icon) return;
        icon.textContent = this.state.user.isAuthenticated ? '👤✅' : '👤';
    },

    logoutUser() {
        if (confirm('Deseja realmente sair da sua conta?')) {
            this.state.user = { isAuthenticated: false, id: null, points: 0, name: '', email: '', phone: '', cpf: '', address: '' };
            this.state.cart = [];
            this.state.discountApplied = false;
            localStorage.removeItem('raizes_user_session');
            this.updateHeaderIcon();
            this.updateCartBadge();
            this.renderProducts('principais');
            this.showView('view-menu');
        }
    },

    // ================================================================
    // FIDELIDADE
    // ================================================================
    applyLoyaltyDiscount() {
        this.state.discountApplied = true;
        this.state.user.points -= 100;
        this.saveSession();

        // Sincroniza pontos com o banco
        if (this.state.user.id) {
            fetch('api/atualizar_pontos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: this.state.user.id, pontos: this.state.user.points })
            }).catch(() => {});
        }

        alert('✅ Desconto de R$5,00 aplicado!');
        this.renderCart();
    },

    // ================================================================
    // PAGAMENTO
    // ================================================================
    processPayment(method) {
        const loader  = document.getElementById('payment-loader');
        const success = document.getElementById('payment-success');
        const options = document.querySelector('.payment-options');
        const unidade = document.getElementById('store-unit')?.value || 'matriz';

        options.classList.add('hidden');
        loader.classList.remove('hidden');

        setTimeout(async () => {
            loader.classList.add('hidden');
            success.classList.remove('hidden');

            const subtotal     = this.state.cart.reduce((a, i) => a + parseFloat(i.preco) * i.qty, 0);
            const desconto     = this.state.discountApplied ? 5.00 : 0;
            const total        = Math.max(0, subtotal - desconto);
            const pontos_usados= this.state.discountApplied ? 100 : 0;
            const gainedPoints = Math.floor(total * 10);

            if (this.state.user.isAuthenticated) {
                this.state.user.points += gainedPoints;
                document.getElementById('earned-points').textContent = gainedPoints;

                // Salva pedido no banco
                try {
                    const resp = await fetch('api/salvar_pedido.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            usuario_id:       this.state.user.id,
                            itens:            this.state.cart,
                            subtotal, desconto, total,
                            metodo_pagamento: method,
                            pontos_usados, unidade
                        })
                    });
                    const data = await resp.json();
                    if (data.success) {
                        this.state.user.points = data.pontos_atuais;
                        document.getElementById('order-number').textContent = data.numero_pedido;
                    }
                } catch (err) {
                    console.warn('Pedido não salvo no servidor:', err);
                    document.getElementById('order-number').textContent = Math.floor(1000 + Math.random() * 9000);
                }

                this.saveSession();
            } else {
                document.getElementById('earned-points').textContent = 0;
                document.getElementById('order-number').textContent = Math.floor(1000 + Math.random() * 9000);
            }

            this.state.cart = [];
            this.state.discountApplied = false;
            this.updateCartBadge();

        }, 2000);
    },

    closeOrder() {
        document.querySelector('.payment-options').classList.remove('hidden');
        document.getElementById('payment-success').classList.add('hidden');
        this.showView('view-status');
    },

    // ================================================================
    // LGPD
    // ================================================================
    checkLGPD() {
        this.lgpdBanner.classList.remove('hidden');
    },

    acceptLGPD() {
        this.lgpdBanner.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
