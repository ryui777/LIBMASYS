<?php
header('Content-Type: application/json');

// Try multiple connection methods
$connected = false;
$conn = null;
$error = '';

$connection_attempts = [
    ['host' => '127.0.0.1', 'port' => 3306, 'user' => 'root', 'pass' => '', 'name' => 'via 127.0.0.1:3306'],
    ['host' => 'localhost', 'port' => 3306, 'user' => 'root', 'pass' => '', 'name' => 'via localhost:3306'],
    ['host' => 'localhost', 'port' => null, 'user' => 'root', 'pass' => '', 'name' => 'via localhost'],
];

// Also try to get connection info from existing databases
if (class_exists('mysqli')) {
    foreach ($connection_attempts as $attempt) {
        if (function_exists('mysqli_report')) {
            mysqli_report(MYSQLI_REPORT_OFF);
        }
        $conn = @new mysqli($attempt['host'], $attempt['user'], $attempt['pass'], '', $attempt['port']);
        if (!$conn->connect_error) {
            $connected = true;
            break;
        }

        $error = $conn->connect_error;
        $conn = null;
    }
}

if (!$connected) {
    // Try using PDO
    try {
        $pdo = new PDO('mysql:host=localhost', 'root', '');
        $connected = true;
        $conn = $pdo;
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Cannot connect to MySQL/MariaDB',
            'details' => 'Host "localhost" is not allowed to connect. This is a MariaDB permission issue.',
            'solution' => 'You need to:
1. Open XAMPP Control Panel
2. Click "Config" button next to MySQL
3. Edit the configuration file
4. Make sure skip-networking is commented out
5. Or use phpMyAdmin to import your database manually',
            'phpmyadmin_url' => 'http://localhost/phpmyadmin'
        ]);
    }
    exit;
}

// If we got here, we have a connection
// Now try to import the SQL file
$sql_file = __DIR__ . '/database/lms_db.sql';
if (!file_exists($sql_file)) {
    echo json_encode(['success' => false, 'error' => 'SQL file not found at: ' . $sql_file]);
    exit;
}

$sql = file_get_contents($sql_file);

if ($conn instanceof PDO) {
    try {
        $conn->exec($sql);
        echo json_encode([
            'success' => true,
            'message' => 'Database setup complete. lms_db is ready.',
            'method' => 'PDO localhost'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Database import failed',
            'details' => $e->getMessage()
        ]);
    }
    exit;
}

if (!$conn->multi_query($sql)) {
    echo json_encode([
        'success' => false,
        'error' => 'Database import failed',
        'details' => $conn->error
    ]);
    exit;
}

do {
    if ($result = $conn->store_result()) {
        $result->free();
    }
} while ($conn->more_results() && $conn->next_result());

echo json_encode([
    'success' => $conn->errno === 0,
    'message' => $conn->errno === 0 ? 'Database setup complete. lms_db is ready.' : 'Database setup finished with errors.',
    'method' => $attempt['name'] ?? 'mysqli',
    'error' => $conn->errno ? $conn->error : null
]);

$conn->close();
?>
