<?php
require_once 'config.php';
if (empty($_SESSION['user'])) jsonResponse(['error' => 'Unauthorized'], 401);
$uid    = $_SESSION['user']['id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT f.id, b.id AS book_id, b.title, b.author, b.img, b.category FROM favorites f JOIN books b ON f.book_id=b.id WHERE f.user_id=?");
    $stmt->bind_param("i", $uid);
    $stmt->execute();
    jsonResponse($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}
if ($method === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $book_id = (int)($data['book_id'] ?? 0);
    if (!$book_id) jsonResponse(['error' => 'Book ID required'], 400);
    $stmt = $conn->prepare("INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $uid, $book_id);
    $stmt->execute();
    jsonResponse(['success' => true]);
}
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'Favorite ID required'], 400);
    $stmt = $conn->prepare("DELETE FROM favorites WHERE id=? AND user_id=?");
    $stmt->bind_param("ii", $id, $uid);
    $stmt->execute();
    jsonResponse(['success' => true]);
}
jsonResponse(['error' => 'Method not allowed'], 405);
