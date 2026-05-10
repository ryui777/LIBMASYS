<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);

$data = json_decode(file_get_contents('php://input'), true);
$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$name || !$email || !$password) jsonResponse(['error' => 'All fields are required'], 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonResponse(['error' => 'Invalid email'], 400);
if (strlen($password) < 8) jsonResponse(['error' => 'Password must be at least 8 characters'], 400);

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) jsonResponse(['error' => 'Email already registered'], 409);

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
$stmt->bind_param("sss", $name, $email, $hash);
$stmt->execute();

jsonResponse(['success' => true, 'message' => 'Account created! Please log in.']);
