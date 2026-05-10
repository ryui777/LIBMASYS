<?php
// -----------------------------
// ENV/CONFIG
// -----------------------------
$defaultDbHost = '127.0.0.1';
$defaultDbPort = 3306;
$defaultDbUser = 'root';
$defaultDbPass = '';
$defaultDbName = 'lms_db';

// For hosting, set these in your panel or edit directly if env vars are unavailable.
define('DB_HOST', getenv('DB_HOST') ?: $defaultDbHost);
define('DB_PORT', (int)(getenv('DB_PORT') ?: $defaultDbPort));
define('DB_USER', getenv('DB_USER') ?: $defaultDbUser);
define('DB_PASS', getenv('DB_PASS') ?: $defaultDbPass);
define('DB_NAME', getenv('DB_NAME') ?: $defaultDbName);

// Allowed origins for browser requests (comma-separated env var)
// Example:
// ALLOWED_ORIGINS=https://your-site.com,https://www.your-site.com,http://localhost
$allowedOriginsEnv = getenv('ALLOWED_ORIGINS') ?: '';
$allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOriginsEnv)));

// Local fallback for development if ALLOWED_ORIGINS is not set.
if (empty($allowedOrigins)) {
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
    ];
}

// -----------------------------
// CORS + SESSION SETUP
// -----------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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
        'secure' => $isHttps,      // true on HTTPS hosting
        'httponly' => true,
        'samesite' => 'Lax',       // if frontend & API are different sites, change to 'None' (requires secure=true)
    ]);
} else {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', $isHttps ? '1' : '0');
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
