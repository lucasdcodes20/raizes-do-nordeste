<?php
require_once 'config.php';

$pdo = getDB();
$stmt = $pdo->query("SELECT * FROM categorias WHERE ativo = 1 ORDER BY ordem ASC");
$categorias = $stmt->fetchAll();

echo json_encode(['success' => true, 'data' => $categorias]);
