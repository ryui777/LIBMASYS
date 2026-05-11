<?php
// -----------------------------
// ENV/CONFIG
// -----------------------------
// --- DATABASE SETTINGS (Fill these from your hosting panel) ---
define('DB_HOST', 'sql208.infinityfree.com'); // Find this in InfinityFree 'MySQL Databases'
define('DB_USER', 'if0_41883431');
define('DB_PASS', 'MBEZlGYbi6WaBAC'); // Note: I kept the space at the end as provided
define('DB_NAME', 'if0_41883431_if0_41883431_lms'); // Create this in InfinityFree first
define('DB_PORT', 3306);

// --- CORS SETTINGS ---
// Allow your GitHub Pages domain to access this API
$allowedOrigins = [
    'https://ryui777.github.io',
    'http://localhost',
    'http://127.0.0.1'
];

// Local fallback for development if ALLOWED_ORIGINS is not set.
if (empty($allowedOrigins)) {
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost:80',
        'http://127.0.0.1:80',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
    ];
}

// --- CORS + SESSION SETUP ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// For now, let's allow your GitHub Pages origin specifically
$allowedOrigins = [
    'https://ryui777.github.io',
    'http://localhost',
    'http://127.0.0.1'
];

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle Preflight (OPTIONS) requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$isHttps = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
    (($_SERVER['SERVER_PORT'] ?? null) == 443) ||
    (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
);

if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => true,         // Required for SameSite=None
        'httponly' => true,
        'samesite' => 'None',     // Allows cross-site session cookies
    ]);
} else {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_samesite', 'None');
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// -----------------------------
// DB CONNECTION
// -----------------------------
if (function_exists('mysqli_report')) {
    mysqli_report(MYSQLI_REPORT_OFF);
}

$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed: ' . $conn->connect_error,
        'hint' => 'For web hosting, verify DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME from your hosting panel.'
    ]));
}
$conn->set_charset('utf8mb4');

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
