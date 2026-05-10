<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) jsonResponse(['error' => 'Email and password required'], 400);

$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) jsonResponse(['error' => 'Invalid email or password'], 401);

$user = $result->fetch_assoc();
if (!password_verify($password, $user['password'])) jsonResponse(['error' => 'Invalid email or password'], 401);

$_SESSION['user'] = [
    'id'    => $user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'role'  => $user['role']
];

jsonResponse([
    'success' => true,
    'user'    => $_SESSION['user']
]);
