<?php
require_once 'config.php';
if (empty($_SESSION['user'])) jsonResponse(['error' => 'Unauthorized'], 401);
$data = json_decode(file_get_contents('php://input'), true);
$id   = (int)($data['id'] ?? 0);
if (!$id) jsonResponse(['error' => 'Borrow ID required'], 400);
$uid  = $_SESSION['user']['id'];
$role = $_SESSION['user']['role'];
if ($role === 'admin') {
    $stmt = $conn->prepare("UPDATE borrowed_books SET status='Returned' WHERE id=?");
    $stmt->bind_param("i", $id);
} else {
    $stmt = $conn->prepare("UPDATE borrowed_books SET status='Returned' WHERE id=? AND user_id=?");
    $stmt->bind_param("ii", $id, $uid);
}
$stmt->execute();
jsonResponse(['success' => true]);
