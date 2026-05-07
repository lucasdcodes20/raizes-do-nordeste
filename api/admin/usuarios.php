<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['admin_user_id']) || $_SESSION['admin_papel'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Apenas administradores podem gerenciar usuários.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, nome, email, cpf, telefone, papel, ativo, criado_em FROM usuarios ORDER BY id DESC");
    $usuarios = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $usuarios]);

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $papel = $data['papel'] ?? 'cliente';
    $ativo = $data['ativo'] ?? 1;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID obrigatório.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE usuarios SET papel = ?, ativo = ? WHERE id = ?");
    $stmt->execute([$papel, $ativo, $id]);

    echo json_encode(['success' => true, 'message' => 'Usuário atualizado com sucesso.']);
}
