<?php
/**
 * N4S Users Management API (Admin Only)
 * 
 * Endpoints:
 *   GET    /users.php              — List all users
 *   GET    /users.php?id=X         — Get single user
 *   POST   /users.php              — Create new user
 *   POST   /users.php?id=X&action=update   — Update user
 *   POST   /users.php?id=X&action=delete   — Delete user (soft: deactivate)
 *   POST   /users.php?id=X&action=reset_password — Admin reset password
 */
require_once 'config.php';

// Start session
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
session_start();

// Require authenticated admin
function requireAdmin() {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        errorResponse('Admin access required', 403);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// All user management requires admin
requireAdmin();

$pdo = getDB();

// ============================================================================
// LIST ALL USERS
// ============================================================================
if ($method === 'GET' && !$id) {
    $stmt = $pdo->query('SELECT id, username, display_name, role, is_active, created_at, last_login FROM users ORDER BY created_at ASC');
    $users = $stmt->fetchAll();
    jsonResponse($users);
}

// ============================================================================
// GET SINGLE USER
// ============================================================================
if ($method === 'GET' && $id) {
    $stmt = $pdo->prepare('SELECT id, username, display_name, role, is_active, created_at, last_login FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) {
        errorResponse('User not found', 404);
    }
    jsonResponse($user);
}

// ============================================================================
// CREATE USER
// ============================================================================
if ($method === 'POST' && !$id && !$action) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $displayName = trim($input['display_name'] ?? '');
    $role = $input['role'] ?? 'visitor';

    // Validate
    if (!$username || !$password) {
        errorResponse('Username and password are required', 400);
    }
    if (strlen($username) < 3) {
        errorResponse('Username must be at least 3 characters', 400);
    }
    if (strlen($password) < 8) {
        errorResponse('Password must be at least 8 characters', 400);
    }
    if (!in_array($role, ['admin', 'advisor', 'client', 'visitor'])) {
        errorResponse('Invalid role. Must be: admin, advisor, client, or visitor', 400);
    }

    // Check uniqueness
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        errorResponse('Username already exists', 409);
    }

    $id = 'usr_' . bin2hex(random_bytes(8));
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (id, username, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$id, $username, $hash, $displayName ?: $username, $role]);

    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $id,
            'username' => $username,
            'display_name' => $displayName ?: $username,
            'role' => $role,
            'is_active' => true,
        ]
    ], 201);
}

// ============================================================================
// UPDATE USER
// ============================================================================
if ($method === 'POST' && $id && $action === 'update') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Verify user exists
    $stmt = $pdo->prepare('SELECT id, username FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        errorResponse('User not found', 404);
    }

    $updates = [];
    $params = [];

    if (isset($input['display_name'])) {
        $updates[] = 'display_name = ?';
        $params[] = trim($input['display_name']);
    }
    if (isset($input['role'])) {
        if (!in_array($input['role'], ['admin', 'advisor', 'client', 'visitor'])) {
            errorResponse('Invalid role', 400);
        }
        // Prevent removing the last admin
        if ($existing['id'] === $_SESSION['user_id'] && $input['role'] !== 'admin') {
            errorResponse('Cannot change your own role from admin', 400);
        }
        $updates[] = 'role = ?';
        $params[] = $input['role'];
    }
    if (isset($input['is_active'])) {
        // Prevent deactivating yourself
        if ($existing['id'] === $_SESSION['user_id'] && !$input['is_active']) {
            errorResponse('Cannot deactivate your own account', 400);
        }
        $updates[] = 'is_active = ?';
        $params[] = $input['is_active'] ? 1 : 0;
    }
    if (isset($input['username'])) {
        $newUsername = trim($input['username']);
        if (strlen($newUsername) < 3) {
            errorResponse('Username must be at least 3 characters', 400);
        }
        // Check uniqueness
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$newUsername, $id]);
        if ($stmt->fetch()) {
            errorResponse('Username already exists', 409);
        }
        $updates[] = 'username = ?';
        $params[] = $newUsername;
    }

    if (empty($updates)) {
        errorResponse('No fields to update', 400);
    }

    $updates[] = 'updated_at = NOW()';
    $params[] = $id;

    $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    jsonResponse(['success' => true, 'message' => 'User updated']);
}

// ============================================================================
// RESET PASSWORD (admin resets another user's password)
// ============================================================================
if ($method === 'POST' && $id && $action === 'reset_password') {
    $input = json_decode(file_get_contents('php://input'), true);
    $newPassword = $input['new_password'] ?? '';

    if (strlen($newPassword) < 8) {
        errorResponse('Password must be at least 8 characters', 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        errorResponse('User not found', 404);
    }

    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$hash, $id]);

    jsonResponse(['success' => true, 'message' => 'Password reset successfully']);
}

// ============================================================================
// DELETE (soft deactivate)
// ============================================================================
if ($method === 'POST' && $id && $action === 'delete') {
    // Prevent self-deletion
    if ($id === $_SESSION['user_id']) {
        errorResponse('Cannot delete your own account', 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        errorResponse('User not found', 404);
    }

    $stmt = $pdo->prepare('UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$id]);

    jsonResponse(['success' => true, 'message' => 'User deactivated']);
}

errorResponse('Invalid request', 400);
?>
