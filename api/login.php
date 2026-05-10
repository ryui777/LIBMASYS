<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role     = $data['role'] ?? '';

if (!$email || !$password) jsonResponse(['error' => 'Email and password required'], 400);
if ($role && !in_array($role, ['user', 'admin'], true)) jsonResponse(['error' => 'Invalid login role'], 400);

$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) jsonResponse(['error' => 'Invalid email or password'], 401);

$user = $result->fetch_assoc();
if (!password_verify($password, $user['password'])) jsonResponse(['error' => 'Invalid email or password'], 401);
if ($role && $user['role'] !== $role) {
    jsonResponse(['error' => $role === 'admin' ? 'This account is not an admin account' : 'Please choose Admin to log in with this account'], 403);
}

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
