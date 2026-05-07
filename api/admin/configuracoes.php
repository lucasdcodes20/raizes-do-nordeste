<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['admin_user_id']) || $_SESSION['admin_papel'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Apenas administradores.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, chave, valor, descricao FROM configuracoes ORDER BY id ASC");
    $configuracoes = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $configuracoes]);

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $valor = $data['valor'] ?? '';

    if (!$id || $valor === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID e Valor são obrigatórios.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE configuracoes SET valor = ? WHERE id = ?");
    $stmt->execute([$valor, $id]);

    echo json_encode(['success' => true, 'message' => 'Configuração salva com sucesso.']);
}
