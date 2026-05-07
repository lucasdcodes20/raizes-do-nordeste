<?php
session_start();
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $email = $data['email'] ?? '';
    $senha = $data['senha'] ?? '';

    if (empty($email) || empty($senha)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
        exit;
    }

    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT id, nome, papel, senha_hash FROM usuarios WHERE email = ? AND ativo = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($senha, $user['senha_hash'])) {
        if ($user['papel'] !== 'admin' && $user['papel'] !== 'vendedor') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas administradores e vendedores podem acessar o painel.']);
            exit;
        }

        $_SESSION['admin_user_id'] = $user['id'];
        $_SESSION['admin_nome'] = $user['nome'];
        $_SESSION['admin_papel'] = $user['papel'];

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'papel' => $user['papel']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciais inválidas.']);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']);
} elseif ($action === 'check') {
    if (isset($_SESSION['admin_user_id'])) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['admin_user_id'],
                'nome' => $_SESSION['admin_nome'],
                'papel' => $_SESSION['admin_papel']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Não autenticado.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ação não encontrada.']);
}
