<?php
session_start();

/*
|--------------------------------------------------------------------------
| AUTO DETECT ENVIRONMENT
|--------------------------------------------------------------------------
| If running on localhost → use XAMPP settings
| If running on hosting → use production DB settings
*/

$isLocal = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']);

if ($isLocal) {
    // =========================
    // LOCAL (XAMPP)
    // =========================
    $DB_HOST = "127.0.0.1";
    $DB_USER = "root";
    $DB_PASS = "";
    $DB_NAME = "lms_db";
} else {
    // =========================
    // HOSTING (InfinityFree / cPanel)
    // =========================
    $DB_HOST = "sql104.infinityfree.com"; // CHANGE if your host differs
    $DB_USER = "if0_41886042";
    $DB_PASS = "programmer404";
    $DB_NAME = "if0_41886042_lms_db";
}

/*
|--------------------------------------------------------------------------
| CONNECT TO DATABASE
|--------------------------------------------------------------------------
*/

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "error" => "Database connection failed: " . $conn->connect_error,
        "host_used" => $DB_HOST,
        "db_used" => $DB_NAME
    ]));
}

$conn->set_charset("utf8mb4");

/*
|--------------------------------------------------------------------------
| HEADERS (API SAFE)
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/*
|--------------------------------------------------------------------------
| HELPER FUNCTION
|--------------------------------------------------------------------------
*/

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
