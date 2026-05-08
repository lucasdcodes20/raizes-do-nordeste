// mock.js - Intercepta fetch() e usa data.js quando PHP não disponível

const _originalFetch = window.fetch;

window.fetch = async function(url, options) {

    if (typeof url === 'string' && url.startsWith('api/')) {

        // GET api/categorias.php
        if (url.includes('categorias.php')) {
            return mockResponse({ success: true, data: restaurantData.categories });
        }

        // GET api/produtos.php
        if (url.includes('produtos.php')) {
            return mockResponse({ success: true, data: restaurantData.menu });
        }

        // POST api/cadastro.php
        if (url.includes('cadastro.php')) {
            const body = JSON.parse(options?.body || '{}');
            return mockResponse({
                success: true,
                message: "Cadastro realizado com sucesso!",
                usuario: {
                    id: 1,
                    nome: body.nome || "Usuário Demo",
                    email: body.email || "demo@raizes.com.br",
                    cpf: body.cpf || "000.000.000-00",
                    telefone: body.telefone || "(74) 99999-9999",
                    endereco: body.endereco || "Rua do Nordeste, 100",
                    pontos: 0
                }
            });
        }

        // POST api/login.php
        if (url.includes('login.php')) {
            const body = JSON.parse(options?.body || '{}');
            return mockResponse({
                success: true,
                usuario: {
                    id: 1,
                    nome: "Usuário Demo",
                    email: body.identificador || "demo@raizes.com.br",
                    cpf: "000.000.000-00",
                    telefone: "(74) 99999-9999",
                    endereco: "Rua do Nordeste, 100",
                    pontos: 250
                }
            });
        }

	// POST api/salvar_pedido.php
        if (url.includes('salvar_pedido.php')) {
            const body = JSON.parse(options?.body || '{}');
            const pontos = Math.floor((body.total || 0) * 10);
            return mockResponse({
                success: true,
                numero_pedido: "PED-" + Math.floor(Math.random() * 9000 + 1000),
                pontos_atuais: 250 + pontos,
                message: "Pedido salvo com sucesso!"
            });
        }
        // POST api/atualizar_pontos.php
        if (url.includes('atualizar_pontos.php')) {
            return mockResponse({ success: true });
        }

        // Qualquer outra chamada à API
        return mockResponse({ success: true });
    }

    // Fora da API — comportamento normal
    return _originalFetch(url, options);
};

function mockResponse(data) {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data)
    });
}
