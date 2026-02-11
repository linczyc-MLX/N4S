<?php
/**
 * N4S Authentication API
 * 
 * Endpoints:
 *   POST /auth.php?action=login    — Authenticate user (username + password)
 *   POST /auth.php?action=logout   — Destroy session
 *   GET  /auth.php?action=check    — Check current session validity
 *   POST /auth.php?action=change_password — Change own password
 */
require_once 'config.php';

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
session_start();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ============================================================================
// LOGIN
// ============================================================================
if ($action === 'login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (!$username || !$password) {
        errorResponse('Username and password are required', 400);
    }

    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT id, username, password_hash, display_name, role, is_active FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        errorResponse('Invalid username or password', 401);
    }

    if (!$user['is_active']) {
        errorResponse('Account is disabled. Contact your administrator.', 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Invalid username or password', 401);
    }

    // Update last login
    $stmt = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);

    // Set session
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['display_name'] = $user['display_name'];
    $_SESSION['login_time'] = time();

    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'role' => $user['role'],
        ]
    ]);
}

// ============================================================================
// LOGOUT
// ============================================================================
if ($action === 'logout' && $method === 'POST') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Logged out']);
}

// ============================================================================
// SESSION CHECK
// ============================================================================
if ($action === 'check' && $method === 'GET') {
    if (isset($_SESSION['user_id'])) {
        // Verify user still exists and is active
        $pdo = getDB();
        $stmt = $pdo->prepare('SELECT id, username, display_name, role, is_active FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user && $user['is_active']) {
            jsonResponse([
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'display_name' => $user['display_name'],
                    'role' => $user['role'],
                ]
            ]);
        }
    }
    jsonResponse(['authenticated' => false], 200);
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================
if ($action === 'change_password' && $method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        errorResponse('Not authenticated', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';

    if (!$currentPassword || !$newPassword) {
        errorResponse('Current and new password are required', 400);
    }

    if (strlen($newPassword) < 8) {
        errorResponse('New password must be at least 8 characters', 400);
    }

    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!password_verify($currentPassword, $user['password_hash'])) {
        errorResponse('Current password is incorrect', 401);
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$newHash, $_SESSION['user_id']]);

    jsonResponse(['success' => true, 'message' => 'Password changed successfully']);
}

// Fallback
errorResponse('Invalid action', 400);
?>
