// app.js - Lógica Principal (Modular e Vanilla JS)

const app = {
    state: {
        cart: [],
        user: { 
            isAuthenticated: false, 
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

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSession(); // Carrega usuário se existir
        this.renderCategories();
        this.renderProducts('principais');
        this.renderPromotions();
        this.checkLGPD();
        this.updateCartBadge();
    },

    loadSession() {
        const savedUser = localStorage.getItem('raizes_user_session');
        if (savedUser) {
            this.state.user = JSON.parse(savedUser);
            document.getElementById('auth-btn').textContent = 'Sair';
        }
    },

    cacheDOM() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.categoriesList = document.getElementById('categories-list');
        this.productsGrid = document.getElementById('products-grid');
        this.promotionsGrid = document.getElementById('promotions-grid');
        this.cartBadge = document.getElementById('cart-badge');
        this.cartItemsList = document.getElementById('cart-items');
        this.views = document.querySelectorAll('.view');
        this.lgpdBanner = document.getElementById('lgpd-banner');
        this.authModal = document.getElementById('auth-modal');
    },

    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Auth
        document.getElementById('auth-btn').addEventListener('click', () => {
            if(this.state.user.isAuthenticated) {
                this.toggleAuthMock();
            } else {
                this.openAuthModal('login');
            }
        });

        // Modal Payment mock
        document.getElementById('checkout-btn').addEventListener('click', () => {
            if(this.state.cart.length === 0) return alert("Carrinho vazio!");
            this.showView('view-payment');
        });

        // LGPD Banners
        document.getElementById('lgpd-accept').addEventListener('click', () => this.acceptLGPD());
        document.getElementById('lgpd-decline').addEventListener('click', () => {
            this.lgpdBanner.classList.add('hidden');
        });

        // Fidelity Banner
        const applyDiscountBtn = document.getElementById('apply-discount-btn');
        if(applyDiscountBtn){
            applyDiscountBtn.addEventListener('click', () => this.applyLoyaltyDiscount());
        }
    },

    // Controle de Views
    showView(viewId) {
        if(viewId === 'view-profile' && !this.state.user.isAuthenticated) {
            this.openAuthModal('login');
            return;
        }

        this.views.forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        
        if (viewId === 'view-cart') this.renderCart();
        if (viewId === 'view-profile') this.renderProfile();
        
        // Atualiza Nav Bottom ativo
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
        if(viewId === 'view-menu') document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active');
        if(viewId === 'view-profile') document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active');
        if(viewId === 'view-cart') document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active');
    },

    // Tema
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

    // Troca de Unidade
    changeUnit() {
        const unit = document.getElementById('store-unit').value;
        const bannerName = document.getElementById('current-unit-name');
        
        this.productsGrid.innerHTML = '<div class="loader"><div class="spinner"></div><p>Carregando cardápio da unidade...</p></div>';
        
        setTimeout(() => {
            const unitName = unit === 'matriz' ? 'Matriz (Centro)' : 'Filial (Shopping Barra)';
            bannerName.textContent = unitName;
            this.renderProducts('principais');
        }, 600);
    },

    // Renderização Dinâmica (Cardápio & Promoções)
    renderPromotions() {
        if(!this.promotionsGrid) return;
        this.promotionsGrid.innerHTML = '';
        restaurantData.promotions.forEach(promo => {
            this.promotionsGrid.innerHTML += `
                <div class="promo-card">
                    <div>
                        <h3>${promo.title}</h3>
                        <p>${promo.description}</p>
                    </div>
                    <div>
                        <span class="promo-price">R$ ${promo.price.toFixed(2).replace('.', ',')}</span>
                        <button class="btn-primary-small mt-2" onclick="app.addPromoToCart('${promo.id}')">Pedir Combo</button>
                    </div>
                </div>
            `;
        });
    },

    addPromoToCart(promoId) {
        const promo = restaurantData.promotions.find(p => p.id === promoId);
        alert(`Combo "${promo.title}" adicionado! (Simulação de múltiplos itens)`);
        // Aqui simulamos adicionar os itens do combo
        this.addToCart('p1'); // Baião
        this.showView('view-cart');
    },

    renderCategories() {
        this.categoriesList.innerHTML = '';
        restaurantData.categories.forEach((cat, index) => {
            const li = document.createElement('li');
            li.className = `cat-item ${index === 0 ? 'active' : ''}`;
            li.innerHTML = `${cat.icon} ${cat.name}`;
            li.onclick = (e) => {
                document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                this.renderProducts(cat.id);
            };
            this.categoriesList.appendChild(li);
        });
    },

    renderProducts(categoryId) {
        this.productsGrid.innerHTML = '';
        const filtered = restaurantData.menu.filter(p => p.categoryId === categoryId);
        
        filtered.forEach(p => {
            const hasTags = p.tags && p.tags.length > 0;
            const tagHTML = hasTags ? `<span class="product-tag">${p.tags[0]}</span>` : '';

            this.productsGrid.innerHTML += `
                <div class="product-card">
                    <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
                    <div class="product-info">
                        ${tagHTML}
                        <h3 class="product-title">${p.name}</h3>
                        <p class="product-desc">${p.description}</p>
                        <div class="product-footer">
                            <span class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
                            <button class="add-btn" onclick="app.addToCart('${p.id}')">+</button>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    // Carrinho de Compras
    addToCart(productId) {
        const product = restaurantData.menu.find(p => p.id === productId);
        if(!product) return;

        const existing = this.state.cart.find(i => i.id === productId);
        if(existing) {
            existing.qty++;
        } else {
            this.state.cart.push({ ...product, qty: 1 });
        }
        
        this.updateCartBadge();
        
        // Efeito de pulso no botão do carrinho para feedback
        this.cartBadge.style.transform = 'scale(1.5)';
        setTimeout(() => this.cartBadge.style.transform = 'scale(1)', 200);
    },

    updateCartBadge() {
        const totalItems = this.state.cart.reduce((acc, item) => acc + item.qty, 0);
        this.cartBadge.textContent = totalItems;
        if(totalItems > 0) {
            this.cartBadge.classList.remove('hidden');
        } else {
            this.cartBadge.classList.add('hidden');
        }
    },

    renderCart() {
        this.cartItemsList.innerHTML = '';
        
        if(this.state.cart.length === 0) {
            this.cartItemsList.innerHTML = '<p class="empty-msg text-muted">Seu carrinho está vazio.</p>';
            this.updateTotals();
            return;
        }

        this.state.cart.forEach((item, index) => {
            this.cartItemsList.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="text-accent text-bold">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="cart-item-action">
                        <span class="text-muted">Qtd: ${item.qty}</span>
                        <button class="btn-ghost" style="color:var(--danger)" onclick="app.removeFromCart(${index})">Remover</button>
                    </div>
                </div>
            `;
        });

        // Tratar exibição do banner de fidelidade
        const loyaltyBanner = document.getElementById('loyalty-banner');
        if(this.state.user.isAuthenticated && this.state.user.points >= 100 && !this.state.discountApplied) {
            document.getElementById('user-points').textContent = this.state.user.points;
            loyaltyBanner.style.display = 'flex';
        } else {
            loyaltyBanner.style.display = 'none';
        }

        this.updateTotals();
    },

    removeFromCart(index) {
        this.state.cart.splice(index, 1);
        // Reseta o desconto se o carrinho ficou vazio
        if(this.state.cart.length === 0) this.state.discountApplied = false;
        this.updateCartBadge();
        this.renderCart();
    },

    updateTotals() {
        const subtotal = this.state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        let total = subtotal;
        let discount = 0;

        const discountDisplay = document.getElementById('discount-display');
        
        if (this.state.discountApplied && subtotal > 0) {
            discount = 5.00; // Desconto fixo por 100 pontos simulado
            total = subtotal - discount;
            if(total < 0) total = 0;
            
            discountDisplay.classList.remove('hidden');
            document.getElementById('cart-discount').textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
        } else {
            discountDisplay.classList.add('hidden');
        }

        document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        document.getElementById('pay-total-amount').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    },

    // Fidelidade / Autenticação Robusta (Mock)
    openAuthModal(mode = 'login') {
        this.authModal.classList.remove('hidden');
        this.switchAuthMode(mode);
    },

    closeAuthModal() {
        this.authModal.classList.add('hidden');
    },

    switchAuthMode(mode) {
        const title = document.getElementById('auth-modal-title');
        const desc = document.getElementById('auth-modal-desc');
        const submitBtn = document.getElementById('auth-submit-btn');
        const switchText = document.querySelector('.auth-switch');
        
        // Grupos de campos extras
        const nameGroup = document.getElementById('name-group');
        const phoneGroup = document.getElementById('phone-group');
        const cpfGroup = document.getElementById('cpf-group');
        const addressGroup = document.getElementById('address-group');

        if(mode === 'register') {
            title.textContent = 'Crie sua conta';
            desc.textContent = 'Cadastre-se para acumular pontos em cada pedido.';
            submitBtn.textContent = 'Cadastrar';
            [nameGroup, phoneGroup, cpfGroup, addressGroup].forEach(g => g.classList.remove('hidden'));
            switchText.innerHTML = 'Já tem conta? <a href="#" onclick="app.switchAuthMode(\'login\')">Faça Login</a>';
        } else {
            title.textContent = 'Bem-vindo visse?';
            desc.textContent = 'Faça seu login para gerenciar seus pedidos.';
            submitBtn.textContent = 'Entrar';
            [nameGroup, phoneGroup, cpfGroup, addressGroup].forEach(g => g.classList.add('hidden'));
            switchText.innerHTML = 'Ainda não tem conta? <a href="#" onclick="app.switchAuthMode(\'register\')">Cadastre-se</a>';
        }
    },

    handleAuthSubmit(e) {
        e.preventDefault();
        const mode = document.getElementById('auth-submit-btn').textContent === 'Cadastrar' ? 'register' : 'login';
        
        const email = document.getElementById('user-email').value;
        const pass = document.getElementById('user-pass').value;

        if (mode === 'register') {
            this.state.user = {
                isAuthenticated: true,
                points: 150,
                name: document.getElementById('user-name').value,
                email: email,
                phone: document.getElementById('user-phone').value,
                cpf: document.getElementById('user-cpf').value,
                address: document.getElementById('user-address').value
            };
        } else {
            // Mock Login (aceita qualquer coisa se não houver cadastro salvo)
            const saved = localStorage.getItem('raizes_user_session');
            if (saved) {
                this.state.user = JSON.parse(saved);
                this.state.user.isAuthenticated = true;
            } else {
                this.state.user = {
                    isAuthenticated: true,
                    points: 50,
                    name: email.split('@')[0],
                    email: email,
                    phone: '-',
                    cpf: '-',
                    address: '-'
                };
            }
        }

        localStorage.setItem('raizes_user_session', JSON.stringify(this.state.user));
        document.getElementById('auth-btn').textContent = 'Sair';
        this.closeAuthModal();
        this.showView('view-profile');
        alert(`Bem-vindo(a), ${this.state.user.name}!`);
    },

    renderProfile() {
        if (!this.state.user.isAuthenticated) return;
        document.getElementById('profile-name').textContent = this.state.user.name;
        document.getElementById('profile-email').textContent = this.state.user.email;
        document.getElementById('profile-phone').textContent = this.state.user.phone;
        document.getElementById('profile-cpf').textContent = this.state.user.cpf;
        document.getElementById('profile-address').textContent = this.state.user.address;
        document.getElementById('profile-points').textContent = this.state.user.points;
    },

    toggleAuthMock() {
        if(this.state.user.isAuthenticated) {
            if(confirm("Deseja realmente sair?")) {
                this.state.user.isAuthenticated = false;
                localStorage.removeItem('raizes_user_session');
                document.getElementById('auth-btn').textContent = 'Entrar';
                this.showView('view-menu');
            }
        }
    },

    applyLoyaltyDiscount() {
        this.state.discountApplied = true;
        this.state.user.points -= 100; // Consome pontos
        alert('Desconto Aplicado com sucesso!');
        this.renderCart();
    },

    // Pagamento
    processPayment(method) {
        const loader = document.getElementById('payment-loader');
        const success = document.getElementById('payment-success');
        const options = document.querySelector('.payment-options');

        options.classList.add('hidden');
        loader.classList.remove('hidden');

        // Simula call de API externa com timeout
        setTimeout(() => {
            loader.classList.add('hidden');
            success.classList.remove('hidden');
            
            // Lógica Pós-Pagamento -> Gera Pontos
            const totalCents = this.state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const gainedPoints = Math.floor(totalCents / restaurantData.capabilities.loyaltyPointsRatio);
            if(this.state.user.isAuthenticated) {
                this.state.user.points += gainedPoints;
                document.getElementById('earned-points').textContent = gainedPoints;
            } else {
                document.getElementById('earned-points').textContent = 0;
            }

            document.getElementById('order-number').textContent = Math.floor(1000 + Math.random() * 9000);
            
            // Limpa carrinho
            this.state.cart = [];
            this.state.discountApplied = false;
            this.updateCartBadge();
            
        }, 2000);
    },

    closeOrder() {
        // Reseta View de pagamento para status normal
        document.querySelector('.payment-options').classList.remove('hidden');
        document.getElementById('payment-success').classList.add('hidden');
        this.showView('view-status');
    },

    // LGPD e Privacidade
    checkLGPD() {
        const consent = localStorage.getItem('lgpd_consent');
        if(!consent && restaurantData.establishmentDetails.lgpdPolicyActive) {
            this.lgpdBanner.classList.remove('hidden');
        }
    },

    acceptLGPD() {
        localStorage.setItem('lgpd_consent', 'true');
        this.lgpdBanner.classList.add('hidden');
    }
};

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => app.init());
