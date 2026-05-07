<?php
session_start();
require_once '../config.php';

// Proteção
if (!isset($_SESSION['admin_user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.id DESC");
    $produtos = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $produtos]);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $categoria_id = $data['categoria_id'] ?? null;
    $nome = $data['nome'] ?? '';
    $descricao = $data['descricao'] ?? '';
    $preco = $data['preco'] ?? 0;
    $imagem = $data['imagem'] ?? '';
    $disponivel = $data['disponivel'] ?? 1;

    if (!$categoria_id || empty($nome) || $preco <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Categoria, Nome e Preço são obrigatórios.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO produtos (categoria_id, nome, descricao, preco, imagem, disponivel) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$categoria_id, $nome, $descricao, $preco, $imagem, $disponivel]);
    
    echo json_encode(['success' => true, 'message' => 'Produto cadastrado com sucesso.']);

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? null;
    $categoria_id = $data['categoria_id'] ?? null;
    $nome = $data['nome'] ?? '';
    $descricao = $data['descricao'] ?? '';
    $preco = $data['preco'] ?? 0;
    $imagem = $data['imagem'] ?? '';
    $disponivel = $data['disponivel'] ?? 1;

    if (!$id || !$categoria_id || empty($nome) || $preco <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID, Categoria, Nome e Preço são obrigatórios.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE produtos SET categoria_id = ?, nome = ?, descricao = ?, preco = ?, imagem = ?, disponivel = ? WHERE id = ?");
    $stmt->execute([$categoria_id, $nome, $descricao, $preco, $imagem, $disponivel, $id]);

    echo json_encode(['success' => true, 'message' => 'Produto atualizado.']);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID não informado.']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Produto removido.']);
}
