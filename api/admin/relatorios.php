<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['admin_user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

$pdo = getDB();

$stmtTotal = $pdo->query("SELECT SUM(total) as faturamento_total, COUNT(id) as total_pedidos FROM pedidos WHERE status != 'cancelado'");
$resumo = $stmtTotal->fetch();

$stmtProdutos = $pdo->query("
    SELECT nome_produto, SUM(quantidade) as total_vendido 
    FROM itens_pedido 
    JOIN pedidos p ON itens_pedido.pedido_id = p.id
    WHERE p.status != 'cancelado'
    GROUP BY produto_id, nome_produto 
    ORDER BY total_vendido DESC LIMIT 5
");
$topProdutos = $stmtProdutos->fetchAll();

echo json_encode([
    'success' => true,
    'data' => [
        'faturamento' => $resumo['faturamento_total'] ?? 0,
        'total_pedidos' => $resumo['total_pedidos'] ?? 0,
        'top_produtos' => $topProdutos
    ]
]);
