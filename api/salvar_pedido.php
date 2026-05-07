<?php
// api/salvar_pedido.php — Salva um pedido finalizado no banco
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$usuario_id      = (int)($dados['usuario_id'] ?? 0);
$itens           = $dados['itens'] ?? [];
$subtotal        = (float)($dados['subtotal'] ?? 0);
$desconto        = (float)($dados['desconto'] ?? 0);
$total           = (float)($dados['total'] ?? 0);
$metodo          = $dados['metodo_pagamento'] ?? 'Desconhecido';
$pontos_usados   = (int)($dados['pontos_usados'] ?? 0);
$unidade         = $dados['unidade'] ?? 'matriz';

if (!$usuario_id || empty($itens)) {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
    exit;
}

$pdo = getDB();

// Calcula pontos ganhos (R$1 = 10 pts, conforme data.js)
$pontos_ganhos = (int)floor($total / 1 * 10); // ex: R$59,90 → 599 pts

// Gera número de pedido único
$numero_pedido = strtoupper(substr(md5(uniqid()), 0, 8));

$pdo->beginTransaction();
try {
    // Insere pedido
    $stmt = $pdo->prepare(
        'INSERT INTO pedidos (usuario_id, numero_pedido, subtotal, desconto, total, metodo_pagamento, pontos_ganhos, pontos_usados, unidade)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$usuario_id, $numero_pedido, $subtotal, $desconto, $total, $metodo, $pontos_ganhos, $pontos_usados, $unidade]);
    $pedido_id = $pdo->lastInsertId();

    // Insere itens
    $stmt_item = $pdo->prepare(
        'INSERT INTO itens_pedido (pedido_id, produto_id, nome_produto, preco_unit, quantidade, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    foreach ($itens as $item) {
        $stmt_item->execute([
            $pedido_id,
            $item['id'],
            $item['name'],
            $item['price'],
            $item['qty'],
            $item['price'] * $item['qty']
        ]);
    }

    // Atualiza pontos do usuário
    $stmt_pts = $pdo->prepare('UPDATE usuarios SET pontos = pontos + ? - ? WHERE id = ?');
    $stmt_pts->execute([$pontos_ganhos, $pontos_usados, $usuario_id]);

    // Busca pontos atualizados
    $stmt_pontos = $pdo->prepare('SELECT pontos FROM usuarios WHERE id = ?');
    $stmt_pontos->execute([$usuario_id]);
    $novos_pontos = $stmt_pontos->fetchColumn();

    $pdo->commit();

    echo json_encode([
        'success'        => true,
        'numero_pedido'  => $numero_pedido,
        'pontos_ganhos'  => $pontos_ganhos,
        'pontos_atuais'  => $novos_pontos
    ]);
} catch (\Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar pedido.']);
}
