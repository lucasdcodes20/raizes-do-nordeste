const API_URL = '../api/admin';

const adminApp = {
    user: null,

    init() {
        this.checkAuth();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('admin-login-form').addEventListener('submit', (e) => this.login(e));
        
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if(e.target.dataset.view) {
                    e.preventDefault();
                    this.showView(e.target.dataset.view);
                }
            });
        });

        document.getElementById('form-produto').addEventListener('submit', (e) => this.saveProduto(e));
        document.getElementById('form-categoria').addEventListener('submit', (e) => this.saveCategoria(e));
    },

    async checkAuth() {
        try {
            const res = await fetch(`${API_URL}/auth.php?action=check`);
            const data = await res.json();
            if (data.success) {
                this.user = data.user;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (e) {
            this.showLogin();
        }
    },

    async login(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const res = await fetch(`${API_URL}/auth.php?action=login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, senha})
            });
            const data = await res.json();
            if (data.success) {
                this.user = data.user;
                this.showDashboard();
            } else {
                errorDiv.innerText = data.message;
            }
        } catch(e) {
            errorDiv.innerText = "Erro ao conectar com o servidor.";
        }
    },

    async logout() {
        await fetch(`${API_URL}/auth.php?action=logout`);
        this.user = null;
        this.showLogin();
    },

    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard-screen').classList.add('hidden');
    },

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        document.getElementById('current-user-name').innerText = this.user.nome;
        document.getElementById('current-user-role').innerText = this.user.papel;

        if (this.user.papel !== 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        } else {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        }

        this.showView('view-dashboard');
    },

    showView(viewId) {
        document.querySelectorAll('.admin-view').forEach(el => el.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        
        document.querySelectorAll('.sidebar-nav .menu-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.sidebar-nav [data-view="${viewId}"]`).classList.add('active');

        // Carregar dados de acordo com a view
        if(viewId === 'view-dashboard') this.loadDashboard();
        else if(viewId === 'view-produtos') this.loadProdutos();
        else if(viewId === 'view-categorias') this.loadCategorias();
        else if(viewId === 'view-pedidos') this.loadPedidos();
        else if(viewId === 'view-usuarios' && this.user.papel === 'admin') this.loadUsuarios();
        else if(viewId === 'view-config' && this.user.papel === 'admin') this.loadConfig();
        else if(viewId === 'view-docs') this.loadDocs();
    },

    openModal(id) {
        document.getElementById(id).classList.remove('hidden');
    },
    closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        if(id === 'modal-produto') document.getElementById('form-produto').reset();
        if(id === 'modal-categoria') document.getElementById('form-categoria').reset();
    },

    // --- DASHBOARD ---
    async loadDashboard() {
        const res = await fetch(`${API_URL}/relatorios.php`);
        const {data} = await res.json();
        if(!data) return;
        document.getElementById('dash-faturamento').innerText = `R$ ${parseFloat(data.faturamento).toFixed(2).replace('.',',')}`;
        document.getElementById('dash-pedidos').innerText = data.total_pedidos;

        let topHTML = '';
        data.top_produtos.forEach(p => {
            topHTML += `<tr><td>${p.nome_produto}</td><td>${p.total_vendido}x</td></tr>`;
        });
        document.getElementById('dash-top-produtos').innerHTML = topHTML || '<tr><td colspan="2">Nenhum dado.</td></tr>';
    },

    // --- CATEGORIAS ---
    async loadCategorias() {
        const res = await fetch(`${API_URL}/categorias.php`);
        const {data} = await res.json();
        let html = '';
        data.forEach(c => {
            html += `<tr>
                <td>${c.nome}</td>
                <td>${c.icone}</td>
                <td>${c.ordem}</td>
                <td>
                    <button class="btn-ghost" onclick="adminApp.deleteCategoria(${c.id})">Excluir</button>
                </td>
            </tr>`;
        });
        document.getElementById('categorias-tbody').innerHTML = html;
        this.fillCategoriaSelect(data);
    },
    fillCategoriaSelect(categorias) {
        let html = '<option value="">Selecione...</option>';
        categorias.forEach(c => html += `<option value="${c.id}">${c.nome}</option>`);
        const sel = document.getElementById('prod-cat');
        if(sel) sel.innerHTML = html;
    },
    async saveCategoria(e) {
        e.preventDefault();
        const payload = {
            nome: document.getElementById('cat-nome').value,
            icone: document.getElementById('cat-icone').value,
            ordem: document.getElementById('cat-ordem').value
        };
        await fetch(`${API_URL}/categorias.php`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        this.closeModal('modal-categoria');
        this.loadCategorias();
    },
    async deleteCategoria(id) {
        if(confirm("Deseja realmente excluir? Produtos atrelados serão afetados.")) {
            await fetch(`${API_URL}/categorias.php?id=${id}`, {method: 'DELETE'});
            this.loadCategorias();
        }
    },

    // --- PRODUTOS ---
    async loadProdutos() {
        const res = await fetch(`${API_URL}/produtos.php`);
        const {data} = await res.json();
        let html = '';
        data.forEach(p => {
            html += `<tr>
                <td><img src="../${p.imagem}" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${p.nome}</td>
                <td>${p.categoria_nome || '-'}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2).replace('.',',')}</td>
                <td>${p.disponivel == 1 ? 'Sim' : 'Não'}</td>
                <td>
                    <button class="btn-ghost text-danger" onclick="adminApp.deleteProduto(${p.id})">Excluir</button>
                </td>
            </tr>`;
        });
        document.getElementById('produtos-tbody').innerHTML = html;
    },
    async saveProduto(e) {
        e.preventDefault();
        const payload = {
            categoria_id: document.getElementById('prod-cat').value,
            nome: document.getElementById('prod-nome').value,
            descricao: document.getElementById('prod-desc').value,
            preco: document.getElementById('prod-preco').value,
            imagem: document.getElementById('prod-img').value,
            disponivel: document.getElementById('prod-disp').value
        };
        await fetch(`${API_URL}/produtos.php`, {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        this.closeModal('modal-produto');
        this.loadProdutos();
    },
    async deleteProduto(id) {
        if(confirm("Deseja excluir este produto?")) {
            await fetch(`${API_URL}/produtos.php?id=${id}`, {method: 'DELETE'});
            this.loadProdutos();
        }
    },

    // --- PEDIDOS ---
    async loadPedidos() {
        const res = await fetch(`${API_URL}/pedidos.php`);
        const {data} = await res.json();
        let html = '';
        data.forEach(p => {
            html += `<tr>
                <td>#${p.numero_pedido}</td>
                <td>${p.cliente_nome}</td>
                <td>${new Date(p.criado_em).toLocaleDateString()}</td>
                <td>
                    <select onchange="adminApp.updatePedidoStatus(${p.id}, this.value)">
                        <option value="recebido" ${p.status==='recebido'?'selected':''}>Recebido</option>
                        <option value="preparando" ${p.status==='preparando'?'selected':''}>Preparando</option>
                        <option value="pronto" ${p.status==='pronto'?'selected':''}>Pronto</option>
                        <option value="entregue" ${p.status==='entregue'?'selected':''}>Entregue</option>
                    </select>
                </td>
                <td>R$ ${parseFloat(p.total).toFixed(2)}</td>
                <td>-</td>
            </tr>`;
        });
        document.getElementById('pedidos-tbody').innerHTML = html;
    },
    async updatePedidoStatus(id, status) {
        await fetch(`${API_URL}/pedidos.php`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, status})
        });
    },

    // --- USUÁRIOS ---
    async loadUsuarios() {
        const res = await fetch(`${API_URL}/usuarios.php`);
        const {data} = await res.json();
        let html = '';
        data.forEach(u => {
            html += `<tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>
                    <select onchange="adminApp.updateUserRole(${u.id}, this.value)">
                        <option value="cliente" ${u.papel==='cliente'?'selected':''}>Cliente</option>
                        <option value="vendedor" ${u.papel==='vendedor'?'selected':''}>Vendedor</option>
                        <option value="admin" ${u.papel==='admin'?'selected':''}>Admin</option>
                    </select>
                </td>
                <td>-</td>
            </tr>`;
        });
        document.getElementById('usuarios-tbody').innerHTML = html;
    },
    async updateUserRole(id, papel) {
        await fetch(`${API_URL}/usuarios.php`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, papel})
        });
    },

    // --- CONFIGURAÇÕES ---
    async loadConfig() {
        const res = await fetch(`${API_URL}/configuracoes.php`);
        const {data} = await res.json();
        let html = '';
        data.forEach(c => {
            html += `<tr>
                <td>${c.chave}</td>
                <td>${c.descricao || ''}</td>
                <td><input type="text" id="cfg_${c.id}" value="${c.valor}"></td>
                <td><button class="btn-primary" onclick="adminApp.saveConfig(${c.id})">Salvar</button></td>
            </tr>`;
        });
        document.getElementById('config-tbody').innerHTML = html;
    },
    async saveConfig(id) {
        const valor = document.getElementById(`cfg_${id}`).value;
        await fetch(`${API_URL}/configuracoes.php`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, valor})
        });
        alert('Configuração salva!');
    },

    // --- DOCS (TCC) ---
    async loadDocs() {
        try {
            const res = await fetch('TCC_Final_Lucas_Santos.md');
            const text = await res.text();
            document.getElementById('document-content').innerHTML = marked.parse(text);
        } catch(e) {
            document.getElementById('document-content').innerText = "Erro ao carregar o documento.";
        }
    },
    downloadPDF() {
        const element = document.getElementById('document-content');
        html2pdf().set({
            margin: 15, filename: 'Projeto_Front_End_Relatorio.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
    }
};

adminApp.init();
