<?php
/**
 * N4S Users Table Setup
 * 
 * Run ONCE to create the users table and seed the admin account.
 * Access: /api/setup-users.php
 * 
 * IMPORTANT: After running, consider removing or protecting this file.
 */
require_once 'config.php';

$pdo = getDB();

// Create users table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        role ENUM('admin', 'advisor', 'client', 'visitor') NOT NULL DEFAULT 'visitor',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Check if admin already exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute(['mlinczyc007']);
$existing = $stmt->fetch();

if ($existing) {
    jsonResponse([
        'success' => true,
        'message' => 'Users table exists. Admin account already created.',
        'admin_exists' => true
    ]);
}

// Seed admin account
$adminId = 'usr_admin_' . bin2hex(random_bytes(4));
$adminHash = password_hash('LetMeN4S2026!', PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO users (id, username, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$adminId, 'mlinczyc007', $adminHash, 'Michael Linczyc', 'admin']);

jsonResponse([
    'success' => true,
    'message' => 'Users table created and admin account seeded.',
    'admin_id' => $adminId,
    'tables' => ['users']
]);
?>
