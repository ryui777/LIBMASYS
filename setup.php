<?php
header('Content-Type: application/json');

// Try multiple connection methods
$connected = false;
$conn = null;
$error = '';

$connection_attempts = [
    ['host' => 'localhost', 'user' => 'root', 'pass' => '', 'name' => 'via localhost'],
    ['host' => '127.0.0.1', 'user' => 'root', 'pass' => '', 'name' => 'via 127.0.0.1'],
];

// Also try to get connection info from existing databases
foreach ($connection_attempts as $attempt) {
    try {
        $conn = new mysqli($attempt['host'], $attempt['user'], $attempt['pass']);
        if (!$conn->connect_error) {
            $connected = true;
            echo json_encode(['success' => false, 'status' => 'connected', 'method' => $attempt['name']]);
            break;
        }
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}

if (!$connected) {
    // Try using PDO
    try {
        $pdo = new PDO('mysql:host=localhost', 'root', '');
        $connected = true;
        $conn = $pdo;
        echo json_encode(['success' => false, 'status' => 'connected_pdo']);
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
$queries = array_filter(array_map('trim', explode(';', $sql)), function($q) { return $q && !str_starts_with($q, '--'); });

$imported = 0;
$failed = 0;

foreach ($queries as $query) {
    try {
        if (is_object($conn) && get_class($conn) === 'PDO') {
            $conn->exec($query . ';');
        } else {
            $conn->query($query);
        }
        $imported++;
    } catch (Exception $e) {
        $failed++;
        error_log("Query failed: " . $e->getMessage());
    }
}

echo json_encode([
    'success' => $failed == 0,
    'message' => "Database setup complete. Imported $imported queries.",
    'imported' => $imported,
    'failed' => $failed
]);

$conn = null;
?>
