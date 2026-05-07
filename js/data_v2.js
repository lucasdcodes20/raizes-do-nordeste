const restaurantData = {
    establishmentDetails: {
        name: "Raízes do Nordeste",
        cnpj: "12.345.678/0001-99",
        supportContact: "contato@raizesdonordeste.com.br",
        lgpdPolicyActive: true
    },
    capabilities: {
        loyaltyPointsRatio: 10, // R$1 = 10 pts
        discountRatio: 0.05 // 100 pontos = R$ 5 de desconto
    },
    categories: [
        { id: "principais", name: "Pratos Típicos", icon: "🥘" },
        { id: "porcoes", name: "Porções", icon: "🧀" },
        { id: "drinks", name: "Bebidas", icon: "🥤" },
        { id: "desserts", name: "Sobremesas", icon: "🍮" }
    ],
    menu: [
        {
            id: "p1",
            categoryId: "principais",
            name: "Baião de Dois Completo",
            description: "Feijão verde, arroz, nata rural, carne de sol desfiada, queijo coalho e bastante coentro.",
            price: 59.90,
            image: "assets/baiao.png",
            tags: ["Mais Vendido"]
        },
        {
            id: "p2",
            categoryId: "principais",
            name: "Carne de Sol com Macaxeira",
            description: "Tradição raiz! Carne de sol artesanal acebolada com macaxeira frita crocante na manteiga de garrafa.",
            price: 55.00,
            image: "assets/carne.png",
            tags: ["Favorito"]
        },
        {
            id: "p3",
            categoryId: "principais",
            name: "Bobó de Camarão Baiano",
            description: "Camarões frescos mergulhados num creme denso de azeite de dendê, mandioca e leite de coco.",
            price: 68.90,
            image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80",
            tags: ["Premium"]
        },
        {
            id: "p4",
            categoryId: "porcoes",
            name: "Dadinhos de Tapioca",
            description: "Porção com 12 dadinhos de tapioca e queijo coalho fritinhos, servidos com melaço e geleia de pimenta.",
            price: 28.50,
            image: "assets/dadinhos.png"
        },
        {
            id: "p5",
            categoryId: "principais",
            name: "Acarajé Genuíno (Porção com 4)",
            description: "Mini acarajés fritos no azeite de dendê, servidos com vatapá, caruru e camarão seco.",
            price: 35.00,
            image: "assets/acaraje.png"
        },
        {
            id: "d1",
            categoryId: "drinks",
            name: "Cajuína Artesanal",
            description: "Legítima cajuína piauiense servida bem gelada (500ml).",
            price: 12.00,
            image: "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?auto=format&fit=crop&w=300&q=80"
        },
        {
            id: "d2",
            categoryId: "drinks",
            name: "Refrigerante Guaraná Jesus",
            description: "Para refrescar, direto do Maranhão.",
            price: 8.50,
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80"
        },
        {
            id: "ds1",
            categoryId: "desserts",
            name: "Cartola",
            description: "Tradicional sobremesa pernambucana de banana frita com queijo coalho e muita canela.",
            price: 22.90,
            image: "assets/cartola.png"
        },
        {
            id: "ds2",
            categoryId: "desserts",
            name: "Pudim de Tapioca com Coco",
            description: "Pudim cremoso à base de tapioca granulada e coco fresco ralado.",
            price: 18.50,
            image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80"
        }
    ],
    promotions: [
        {
            id: "promo1",
            title: "Combo Nordestão",
            description: "Baião de Dois + Cajuína + Pudim com super Desconto!",
            price: 80.00,
            discount: 10.40
        }
    ]
};
