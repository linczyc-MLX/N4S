<?php
// Database configuration for IONOS MariaDB
// These values should be overwritten during deployment with actual credentials

$DB_HOST = getenv('DB_HOST') ?: 'db5019349376.hosting-data.io';
$DB_NAME = getenv('DB_NAME') ?: 'dbs15149159';
$DB_USER = getenv('DB_USER') ?: 'dbu2492912';
$DB_PASS = getenv('DB_PASS') ?: 'reMarkable2026!'; // Set via environment or replace during deploy
$DB_PORT = getenv('DB_PORT') ?: 3306;

// CORS headers for API access (credentials require specific origin, not wildcard)
$allowed_origins = [
    'https://website.not-4.sale',
    'https://home-5019238456.app-ionos.space',
    'http://localhost:3000',
    'http://localhost:5173',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (!$origin) {
    // Same-origin request (no Origin header) — allow
    header('Access-Control-Allow-Origin: https://website.not-4.sale');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection function
function getDB() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_PORT;

    try {
        $pdo = new PDO(
            "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

// JSON response helper
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Error response helper
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}
?>
