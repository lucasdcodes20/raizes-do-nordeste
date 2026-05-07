<?php
// api/atualizar_pontos.php — Atualiza pontos do usuário (usado após pagamento)
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$dados       = json_decode(file_get_contents('php://input'), true);
$usuario_id  = (int)($dados['usuario_id'] ?? 0);
$novos_pontos= (int)($dados['pontos'] ?? -1);

if (!$usuario_id || $novos_pontos < 0) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

$pdo  = getDB();
$stmt = $pdo->prepare('UPDATE usuarios SET pontos = ? WHERE id = ?');
$stmt->execute([$novos_pontos, $usuario_id]);

echo json_encode(['success' => true, 'pontos' => $novos_pontos]);
