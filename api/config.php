<?php
session_start();
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'lms_db');

$connectionAttempts = [
    ['host' => '127.0.0.1', 'port' => 3306],
    ['host' => 'localhost', 'port' => 3306],
    ['host' => 'localhost', 'port' => null],
];

$conn = null;
$lastError = '';

foreach ($connectionAttempts as $attempt) {
    if (function_exists('mysqli_report')) {
        mysqli_report(MYSQLI_REPORT_OFF);
    }
    $conn = @new mysqli(
        $attempt['host'],
        DB_USER,
        DB_PASS,
        DB_NAME,
        $attempt['port'] ?? null
    );

    if (!$conn->connect_error) {
        break;
    }

    $lastError = $conn->connect_error;
    $conn = null;
}

if (!$conn) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed: ' . $lastError,
        'hint' => 'Start Apache and MySQL in XAMPP, then open setup.php once to create/import lms_db.'
    ]));
}
$conn->set_charset('utf8mb4');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
