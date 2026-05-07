<?php
require_once 'config.php';

$pdo = getDB();
// Busca produtos ativos com suas ofertas se houver
$stmt = $pdo->query("
    SELECT p.*, o.preco_oferta, o.data_inicio, o.data_fim 
    FROM produtos p 
    LEFT JOIN ofertas o ON p.id = o.produto_id AND o.ativo = 1 AND NOW() BETWEEN o.data_inicio AND o.data_fim
    WHERE p.disponivel = 1
");
$produtos = $stmt->fetchAll();

// Tratar os dados para o JS
$produtosFormatados = array_map(function($p) {
    if ($p['preco_oferta'] !== null) {
        $p['preco_original'] = $p['preco'];
        $p['preco'] = $p['preco_oferta'];
        $p['em_oferta'] = true;
    } else {
        $p['em_oferta'] = false;
    }
    return $p;
}, $produtos);

echo json_encode(['success' => true, 'data' => $produtosFormatados]);
