const restaurantData = {
    establishmentDetails: {
        nome: "Raízes do Nordeste",
        cnpj: "12.345.678/0001-99",
        supportContact: "contato@raizesdonordeste.com.br",
        lgpdPolicyActive: true
    },
    capabilities: {
        loyaltyPointsRatio: 10, // R$1 = 10 pts
        discountRatio: 0.05 // 100 pontos = R$ 5 de desconto
    },
    categories: [
        { id: "principais", nome: "Pratos Típicos", icone: "🥘" },
        { id: "porcoes", nome: "Porções", icone: "🧀" },
        { id: "drinks", nome: "Bebidas", icone: "🥤" },
        { id: "desserts", nome: "Sobremesas", icone: "🍮" }
    ],
    menu: [
        {
            id: "p1",
            categoria_id: "principais",
            nome: "Baião de Dois Completo",
            descricao: "Feijão verde, arroz, nata rural, carne de sol desfiada, queijo coalho e bastante coentro.",
            preco: 59.90,
            imagem: "assets/baiao.png",
            tags: ["Mais Vendido"]
        },
        {
            id: "p2",
            categoria_id: "principais",
            nome: "Carne de Sol com Macaxeira",
            descricao: "Tradição raiz! Carne de sol artesanal acebolada com macaxeira frita crocante na manteiga de garrafa.",
            preco: 55.00,
            imagem: "assets/carne.png",
            tags: ["Favorito"]
        },
        {
            id: "p3",
            categoria_id: "principais",
            nome: "Bobó de Camarão Baiano",
            descricao: "Camarões frescos mergulhados num creme denso de azeite de dendê, mandioca e leite de coco.",
            preco: 68.90,
            imagem: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80",
            tags: ["Premium"]
        },
        {
            id: "p4",
            categoria_id: "porcoes",
            nome: "Dadinhos de Tapioca",
            descricao: "Porção com 12 dadinhos de tapioca e queijo coalho fritinhos, servidos com melaço e geleia de pimenta.",
            preco: 28.50,
            imagem: "assets/dadinhos.png"
        },
        {
            id: "p5",
            categoria_id: "porcoes",
            nome: "Acarajé Genuíno (Porção com 4)",
            descricao: "Mini acarajés fritos no azeite de dendê, servidos com vatapá, caruru e camarão seco.",
            preco: 35.00,
            imagem: "assets/acaraje.jpg"
        },
        {
            id: "d1",
            categoria_id: "drinks",
            nome: "Cajuína Artesanal",
            descricao: "Legítima cajuína piauiense servida bem gelada (500ml).",
            preco: 12.00,
            imagem: "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?auto=format&fit=crop&w=300&q=80"
        },
        {
            id: "d2",
            categoria_id: "drinks",
            nome: "Coca-cola",
            descricao: "Para refrescar, bem gelada.",
            preco: 8.50,
            imagem: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80"
        },
        {
            id: "ds1",
            categoria_id: "desserts",
            nome: "Cartola",
            descricao: "Tradicional sobremesa pernambucana de banana frita com queijo coalho e muita canela.",
            preco: 22.90,
            imagem: "assets/cartola.png"
        },
        {
            id: "ds2",
            categoria_id: "desserts",
            nome: "Pudim de Tapioca com Coco",
            descricao: "Pudim cremoso à base de tapioca granulada e coco fresco ralado.",
            preco: 18.50,
            imagem: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80"
        }
    ],
    promotions: [
        {
            id: "promo1",
            title: "Combo Nordestão",
            descricao: "Baião de Dois + Cajuína + Pudim com super Desconto!",
            preco: 80.00,
            discount: 10.40
        }
    ]
};
