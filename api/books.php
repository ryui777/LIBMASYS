<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search   = '%' . ($conn->real_escape_string($_GET['search'] ?? '')) . '%';
    $category = $conn->real_escape_string($_GET['category'] ?? '');
    if ($category) {
        $stmt = $conn->prepare("SELECT * FROM books WHERE (title LIKE ? OR author LIKE ?) AND category = ? ORDER BY id DESC");
        $stmt->bind_param("sss", $search, $search, $category);
    } else {
        $stmt = $conn->prepare("SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY id DESC");
        $stmt->bind_param("ss", $search, $search);
    }
    $stmt->execute();
    jsonResponse($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
}

if ($method === 'POST') {
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') jsonResponse(['error' => 'Unauthorized'], 403);
    $data   = json_decode(file_get_contents('php://input'), true);
    $title  = trim($data['title'] ?? '');
    $author = trim($data['author'] ?? '');
    $cat    = trim($data['category'] ?? '');
    $img    = trim($data['img'] ?? 'images/default.jpg');
    if (!$title || !$author) jsonResponse(['error' => 'Title and author required'], 400);
    $stmt = $conn->prepare("INSERT INTO books (title, author, category, img) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $title, $author, $cat, $img);
    $stmt->execute();
    jsonResponse(['success' => true, 'id' => $conn->insert_id]);
}

if ($method === 'PUT') {
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') jsonResponse(['error' => 'Unauthorized'], 403);
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = (int)($data['id'] ?? 0);
    $title  = trim($data['title'] ?? '');
    $author = trim($data['author'] ?? '');
    $cat    = trim($data['category'] ?? '');
    $img    = trim($data['img'] ?? 'images/default.jpg');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $conn->prepare("UPDATE books SET title=?, author=?, category=?, img=? WHERE id=?");
    $stmt->bind_param("ssssi", $title, $author, $cat, $img, $id);
    $stmt->execute();
    jsonResponse(['success' => true]);
}

if ($method === 'DELETE') {
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') jsonResponse(['error' => 'Unauthorized'], 403);
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $conn->prepare("DELETE FROM books WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
