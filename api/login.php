<?php
// api/login.php — Autenticação por E-mail ou CPF + Senha
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$identificador = trim($dados['identificador'] ?? ''); // email ou CPF
$senha         = $dados['senha'] ?? '';

if (empty($identificador) || empty($senha)) {
    echo json_encode(['success' => false, 'message' => 'Preencha o e-mail/CPF e a senha.']);
    exit;
}

$pdo = getDB();

// Normaliza: se for CPF remove máscara para busca
$cpf_limpo = preg_replace('/\D/', '', $identificador);
$cpf_fmt   = strlen($cpf_limpo) === 11
    ? preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf_limpo)
    : '';

// Busca por e-mail OU por CPF (com ou sem máscara)
$stmt = $pdo->prepare(
    'SELECT id, nome, email, cpf, telefone, endereco, senha_hash, pontos, ativo
     FROM usuarios
     WHERE email = ? OR cpf = ?
     LIMIT 1'
);
$stmt->execute([strtolower($identificador), $cpf_fmt ?: $identificador]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
    exit;
}

if (!$usuario['ativo']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Conta desativada. Entre em contato com o suporte.']);
    exit;
}

if (!password_verify($senha, $usuario['senha_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Senha incorreta.']);
    exit;
}

// Remove campo sensível antes de retornar
unset($usuario['senha_hash'], $usuario['ativo']);

echo json_encode([
    'success' => true,
    'message' => "Login realizado! Bem-vindo(a), {$usuario['nome']}.",
    'usuario' => $usuario
]);
