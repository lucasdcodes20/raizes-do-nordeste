<?php
// api/cadastro.php — Cadastro de novo usuário
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

// Validação básica dos campos obrigatórios
$campos = ['nome', 'email', 'cpf', 'telefone', 'endereco', 'senha'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo '{$campo}' é obrigatório."]);
        exit;
    }
}

$nome     = trim($dados['nome']);
$email    = strtolower(trim($dados['email']));
$cpf      = preg_replace('/\D/', '', $dados['cpf']); // Remove máscara
$cpf_fmt  = preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
$telefone = trim($dados['telefone']);
$endereco = trim($dados['endereco']);
$senha    = $dados['senha'];

// Validações
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
    exit;
}
if (strlen($cpf) !== 11) {
    echo json_encode(['success' => false, 'message' => 'CPF inválido. Use apenas os 11 números.']);
    exit;
}
if (strlen($senha) < 6) {
    echo json_encode(['success' => false, 'message' => 'Senha deve ter ao menos 6 caracteres.']);
    exit;
}

$pdo = getDB();

// Verifica duplicidade
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? OR cpf = ? LIMIT 1');
$stmt->execute([$email, $cpf_fmt]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'E-mail ou CPF já cadastrado.']);
    exit;
}

// Hash da senha com bcrypt
$senha_hash = password_hash($senha, PASSWORD_BCRYPT);

// Insere o usuário (começa com 150 pontos de boas-vindas)
$stmt = $pdo->prepare(
    'INSERT INTO usuarios (nome, email, cpf, telefone, endereco, senha_hash, pontos)
     VALUES (?, ?, ?, ?, ?, ?, 150)'
);
$stmt->execute([$nome, $email, $cpf_fmt, $telefone, $endereco, $senha_hash]);
$novo_id = $pdo->lastInsertId();

// Busca o usuário inserido para retornar
$stmt = $pdo->prepare('SELECT id, nome, email, cpf, telefone, endereco, pontos, criado_em FROM usuarios WHERE id = ?');
$stmt->execute([$novo_id]);
$usuario = $stmt->fetch();

// Salva JSON do usuário na pasta Usuarios (acessível no Antigravity do Admin)
// Caminho acessível via WSL: /mnt/c/Users/.../antigravity/Usuarios
$pasta_usuarios = '/mnt/c/Users/Lucas Mohamed/.gemini/antigravity/Usuarios';
if (!is_dir($pasta_usuarios)) {
    @mkdir($pasta_usuarios, 0755, true);
}
$arquivo = $pasta_usuarios . '/' . preg_replace('/[^a-z0-9_\-]/i', '_', $email) . '.json';
$dados_admin = [
    'id'        => $usuario['id'],
    'nome'      => $usuario['nome'],
    'email'     => $usuario['email'],
    'cpf'       => $usuario['cpf'],
    'telefone'  => $usuario['telefone'],
    'endereco'  => $usuario['endereco'],
    'pontos'    => $usuario['pontos'],
    'cadastro'  => $usuario['criado_em'],
];
file_put_contents($arquivo, json_encode($dados_admin, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'message' => "Cadastro realizado! Bem-vindo(a), {$nome}.",
    'usuario' => $usuario
]);
