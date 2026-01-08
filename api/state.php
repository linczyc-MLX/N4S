<?php
// App State API endpoint (for things like active project ID, disclosure tier)
// Uses POST for all write operations to avoid hosting restrictions on PUT/DELETE
require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$key = isset($_GET['key']) ? $_GET['key'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        if ($key) {
            // Get specific state value
            $stmt = $pdo->prepare("SELECT state_value FROM app_state WHERE state_key = ?");
            $stmt->execute([$key]);
            $result = $stmt->fetch();

            if ($result) {
                $value = json_decode($result['state_value'], true);
                jsonResponse(['key' => $key, 'value' => $value ?? $result['state_value']]);
            } else {
                jsonResponse(['key' => $key, 'value' => null]);
            }
        } else {
            // Get all state values
            $stmt = $pdo->query("SELECT state_key, state_value FROM app_state");
            $results = $stmt->fetchAll();

            $state = [];
            foreach ($results as $row) {
                $value = json_decode($row['state_value'], true);
                $state[$row['state_key']] = $value ?? $row['state_value'];
            }

            jsonResponse($state);
        }
        break;

    case 'POST':
    case 'PUT':
        // Handle delete via POST if action=delete
        if ($action === 'delete' && $key) {
            $stmt = $pdo->prepare("DELETE FROM app_state WHERE state_key = ?");
            $stmt->execute([$key]);
            jsonResponse(['success' => true, 'deleted' => $key]);
            break;
        }

        // Set state value
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['key'])) {
            errorResponse('Key and value required');
        }

        $stateKey = $input['key'];
        $stateValue = json_encode($input['value']);

        $stmt = $pdo->prepare("INSERT INTO app_state (state_key, state_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_value = ?");
        $stmt->execute([$stateKey, $stateValue, $stateValue]);

        jsonResponse(['success' => true, 'key' => $stateKey]);
        break;

    case 'DELETE':
        // Fallback for DELETE if hosting allows it
        if (!$key) {
            errorResponse('Key required');
        }

        $stmt = $pdo->prepare("DELETE FROM app_state WHERE state_key = ?");
        $stmt->execute([$key]);

        jsonResponse(['success' => true, 'deleted' => $key]);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
?>
