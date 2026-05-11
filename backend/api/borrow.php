<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (empty($_SESSION['user'])) jsonResponse(['error' => 'Unauthorized'], 401);
    $user = $_SESSION['user'];
    if ($user['role'] === 'admin') {
        $result = $conn->query("SELECT bb.id, bb.book_id, b.title, b.img, u.name AS userName, u.email, bb.borrowed_date, bb.due_date, bb.status FROM borrowed_books bb JOIN books b ON bb.book_id=b.id JOIN users u ON bb.user_id=u.id ORDER BY bb.id DESC");
    } else {
        $uid  = $user['id'];
        $stmt = $conn->prepare("SELECT bb.id, bb.book_id, b.title, b.img, bb.borrowed_date, bb.due_date, bb.status FROM borrowed_books bb JOIN books b ON bb.book_id=b.id WHERE bb.user_id=? ORDER BY bb.id DESC");
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $result = $stmt->get_result();
    }
    jsonResponse($result->fetch_all(MYSQLI_ASSOC));
}

if ($method === 'POST') {
    if (empty($_SESSION['user'])) jsonResponse(['error' => 'Please log in to borrow books'], 401);
    $data    = json_decode(file_get_contents('php://input'), true);
    $book_id = (int)($data['book_id'] ?? 0);
    $uid     = $_SESSION['user']['id'];
    if (!$book_id) jsonResponse(['error' => 'Book ID required'], 400);

    $check = $conn->prepare("SELECT id FROM borrowed_books WHERE user_id=? AND book_id=? AND status='Borrowed'");
    $check->bind_param("ii", $uid, $book_id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) jsonResponse(['error' => 'You already borrowed this book'], 409);

    $today   = date('Y-m-d');
    $dueDate = date('Y-m-d', strtotime('+14 days'));
    $stmt    = $conn->prepare("INSERT INTO borrowed_books (user_id, book_id, borrowed_date, due_date) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $uid, $book_id, $today, $dueDate);
    $stmt->execute();
    jsonResponse(['success' => true, 'due_date' => $dueDate]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
