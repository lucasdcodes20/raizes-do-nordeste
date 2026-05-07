<?php
session_start();
require_once '../config.php';

// Proteção de Rota (Apenas usuários logados como admin ou vendedor)
if (!isset($_SESSION['admin_user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    // Listar categorias
    $stmt = $pdo->query("SELECT * FROM categorias ORDER BY ordem ASC");
    $categorias = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $categorias]);

} elseif ($method === 'POST') {
    // Criar categoria
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data['nome'] ?? '';
    $icone = $data['icone'] ?? '';
    $ordem = $data['ordem'] ?? 0;
    
    if (empty($nome)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nome da categoria é obrigatório.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO categorias (nome, icone, ordem) VALUES (?, ?, ?)");
    $stmt->execute([$nome, $icone, $ordem]);
    
    echo json_encode(['success' => true, 'message' => 'Categoria criada com sucesso.', 'id' => $pdo->lastInsertId()]);

} elseif ($method === 'PUT') {
    // Atualizar categoria
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $nome = $data['nome'] ?? '';
    $icone = $data['icone'] ?? '';
    $ordem = $data['ordem'] ?? 0;
    $ativo = $data['ativo'] ?? 1;

    if (!$id || empty($nome)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID e Nome são obrigatórios.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE categorias SET nome = ?, icone = ?, ordem = ?, ativo = ? WHERE id = ?");
    $stmt->execute([$nome, $icone, $ordem, $ativo, $id]);

    echo json_encode(['success' => true, 'message' => 'Categoria atualizada.']);

} elseif ($method === 'DELETE') {
    // Deletar categoria
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID não informado.']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM categorias WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Categoria removida.']);
}
