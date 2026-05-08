
// mock.js - Intercepta fetch() e usa data.js quando PHP não disponível

const _originalFetch = window.fetch;

window.fetch = async function(url, options) {
    // Só intercepta chamadas para a API local
    if (typeof url === 'string' && url.startsWith('api/')) {

        // GET api/categorias.php
        if (url.includes('categorias.php')) {
            return mockResponse(restaurantData.categories);
        }

        // GET api/produtos.php
        if (url.includes('produtos.php')) {
            return mockResponse({ success: true, data: restaurantData.menu });
        }

        // POST api/login.php
        if (url.includes('login.php')) {
            const body = JSON.parse(options?.body || '{}');
            return mockResponse({
                success: true,
                user: {
                    id: 1,
                    name: "Usuário Demo",
                    email: body.email || "demo@raizes.com.br",
                    cpf: body.cpf || "000.000.000-00",
                    phone: "(11) 99999-9999",
                    address: "Rua do Nordeste, 100",
                    points: 250
                },
                token: "mock-token-demo"
            });
        }

        // POST api/cadastro.php
        if (url.includes('cadastro.php')) {
            return mockResponse({ success: true, message: "Cadastro realizado com sucesso!" });
        }

        // POST api/salvar_pedido.php
        if (url.includes('salvar_pedido.php')) {
            return mockResponse({
                success: true,
                orderId: "PED-" + Math.floor(Math.random() * 9000 + 1000),
                message: "Pedido recebido! Aguarde confirmação."
            });
        }

        // POST api/atualizar_pontos.php
        if (url.includes('atualizar_pontos.php')) {
            return mockResponse({ success: true });
        }

        // Qualquer outra chamada à API
        return mockResponse({ success: true });
    }

    // Fora da API — comportamento normal (Google Fonts, etc.)
    return _originalFetch(url, options);
};

function mockResponse(data) {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data)
    });
}
