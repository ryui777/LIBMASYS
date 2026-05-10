<?php
echo "<h2>XAMPP Diagnostic Report</h2>";

// Test 1: Check PHP version
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

// Test 2: Check MySQLi extension
if (extension_loaded('mysqli')) {
    echo "<p><strong>✓ MySQLi Extension:</strong> Loaded</p>";
} else {
    echo "<p><strong>✗ MySQLi Extension:</strong> NOT Loaded</p>";
}

// Test 3: Try different connection methods
echo "<h3>Connection Tests:</h3>";

$test_cases = [
    ['host' => '127.0.0.1', 'port' => 3306, 'socket' => null, 'name' => '127.0.0.1:3306'],
    ['host' => 'localhost', 'port' => 3306, 'socket' => null, 'name' => 'localhost:3306'],
    ['host' => 'localhost', 'port' => null, 'socket' => 'C:/xampp/mysql/mysql.sock', 'name' => 'Unix Socket'],
];

foreach ($test_cases as $test) {
    $conn = new mysqli();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 2);
    
    $result = @$conn->real_connect($test['host'], 'root', '', '', $test['port'], $test['socket']);
    
    if (!$result || $conn->connect_error) {
        echo "<p><strong>✗ " . $test['name'] . ":</strong> " . ($conn->connect_error ?: 'Connection failed') . "</p>";
    } else {
        echo "<p><strong>✓ " . $test['name'] . ":</strong> Connected!</p>";
        // Try to list databases
        if ($dbresult = $conn->query("SHOW DATABASES")) {
            echo "<pre>";
            while ($row = $dbresult->fetch_assoc()) {
                echo "- " . $row['Database'] . "\n";
            }
            echo "</pre>";
        }
        $conn->close();
        break;
    }
}
?>
