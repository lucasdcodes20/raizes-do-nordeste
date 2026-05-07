<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['admin_user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT p.id, p.numero_pedido, p.status, p.total, p.metodo_pagamento, p.criado_em, u.nome as cliente_nome
        FROM pedidos p 
        JOIN usuarios u ON p.usuario_id = u.id 
        ORDER BY p.id DESC
    ");
    $pedidos = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $pedidos]);

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $status = $data['status'] ?? null;

    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID e Status obrigatórios.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);

    echo json_encode(['success' => true, 'message' => 'Status do pedido atualizado.']);
}
