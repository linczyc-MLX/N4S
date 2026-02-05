<?php
// Taste Exploration API endpoint
// Handles taste exploration data storage (quad configurations, sessions, profiles)
require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        handleGet($pdo, $action);
        break;
    case 'POST':
        handlePost($pdo, $action);
        break;
    default:
        errorResponse('Method not allowed', 405);
}

function handleGet($pdo, $action) {
    $projectId = isset($_GET['projectId']) ? $_GET['projectId'] : '';
    
    if (!$projectId) {
        errorResponse('projectId parameter required');
    }
    
    switch ($action) {
        case 'data':
            // Get all taste exploration data for project
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            if ($row) {
                jsonResponse(json_decode($row['data_json'], true));
            } else {
                // Return default structure if no data exists
                jsonResponse([
                    'quadEnabledState' => [],
                    'sessions' => [],
                    'profiles' => []
                ]);
            }
            break;
            
        case 'session':
            // Get specific session by clientId
            $clientId = isset($_GET['clientId']) ? $_GET['clientId'] : '';
            if (!$clientId) {
                errorResponse('clientId parameter required');
            }
            
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            if ($row) {
                $data = json_decode($row['data_json'], true);
                $session = isset($data['sessions'][$clientId]) ? $data['sessions'][$clientId] : null;
                jsonResponse(['session' => $session]);
            } else {
                jsonResponse(['session' => null]);
            }
            break;
            
        case 'profile':
            // Get specific profile by clientId
            $clientId = isset($_GET['clientId']) ? $_GET['clientId'] : '';
            if (!$clientId) {
                errorResponse('clientId parameter required');
            }
            
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            if ($row) {
                $data = json_decode($row['data_json'], true);
                $profile = isset($data['profiles'][$clientId]) ? $data['profiles'][$clientId] : null;
                jsonResponse(['profile' => $profile]);
            } else {
                jsonResponse(['profile' => null]);
            }
            break;
            
        default:
            errorResponse('Invalid action. Valid actions: data, session, profile');
    }
}

function handlePost($pdo, $action) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Invalid JSON in request body');
    }
    
    $projectId = isset($input['projectId']) ? $input['projectId'] : '';
    
    if (!$projectId) {
        errorResponse('projectId required in request body');
    }
    
    switch ($action) {
        case 'save-quad-state':
            // Save quad enabled state
            $quadEnabledState = isset($input['quadEnabledState']) ? $input['quadEnabledState'] : null;
            if (!$quadEnabledState) {
                errorResponse('quadEnabledState required');
            }
            
            // Get existing data or create new
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            $data = $row ? json_decode($row['data_json'], true) : [
                'quadEnabledState' => [],
                'sessions' => [],
                'profiles' => []
            ];
            
            $data['quadEnabledState'] = $quadEnabledState;
            
            // Update or insert
            if ($row) {
                $stmt = $pdo->prepare("UPDATE project_data SET data_json = ?, updated_at = NOW() WHERE project_id = ? AND data_type = 'tasteExplorationData'");
                $stmt->execute([json_encode($data), $projectId]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json, created_at, updated_at) VALUES (?, 'tasteExplorationData', ?, NOW(), NOW())");
                $stmt->execute([$projectId, json_encode($data)]);
            }
            
            jsonResponse(['success' => true, 'message' => 'Quad state saved']);
            break;
            
        case 'save-session':
            // Save or update session
            $clientId = isset($input['clientId']) ? $input['clientId'] : '';
            $sessionData = isset($input['sessionData']) ? $input['sessionData'] : null;
            
            if (!$clientId || !$sessionData) {
                errorResponse('clientId and sessionData required');
            }
            
            // Get existing data or create new
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            $data = $row ? json_decode($row['data_json'], true) : [
                'quadEnabledState' => [],
                'sessions' => [],
                'profiles' => []
            ];
            
            $data['sessions'][$clientId] = $sessionData;
            
            // Update or insert
            if ($row) {
                $stmt = $pdo->prepare("UPDATE project_data SET data_json = ?, updated_at = NOW() WHERE project_id = ? AND data_type = 'tasteExplorationData'");
                $stmt->execute([json_encode($data), $projectId]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json, created_at, updated_at) VALUES (?, 'tasteExplorationData', ?, NOW(), NOW())");
                $stmt->execute([$projectId, json_encode($data)]);
            }
            
            jsonResponse(['success' => true, 'message' => 'Session saved']);
            break;
            
        case 'save-profile':
            // Save completed profile
            $clientId = isset($input['clientId']) ? $input['clientId'] : '';
            $profileData = isset($input['profileData']) ? $input['profileData'] : null;
            
            if (!$clientId || !$profileData) {
                errorResponse('clientId and profileData required');
            }
            
            // Get existing data or create new
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            $data = $row ? json_decode($row['data_json'], true) : [
                'quadEnabledState' => [],
                'sessions' => [],
                'profiles' => []
            ];
            
            $data['profiles'][$clientId] = $profileData;
            
            // Update or insert
            if ($row) {
                $stmt = $pdo->prepare("UPDATE project_data SET data_json = ?, updated_at = NOW() WHERE project_id = ? AND data_type = 'tasteExplorationData'");
                $stmt->execute([json_encode($data), $projectId]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json, created_at, updated_at) VALUES (?, 'tasteExplorationData', ?, NOW(), NOW())");
                $stmt->execute([$projectId, json_encode($data)]);
            }
            
            jsonResponse(['success' => true, 'message' => 'Profile saved']);
            break;
            
        case 'delete-session':
            // Delete a session
            $clientId = isset($input['clientId']) ? $input['clientId'] : '';
            
            if (!$clientId) {
                errorResponse('clientId required');
            }
            
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'tasteExplorationData'");
            $stmt->execute([$projectId]);
            $row = $stmt->fetch();
            
            if ($row) {
                $data = json_decode($row['data_json'], true);
                unset($data['sessions'][$clientId]);
                
                $stmt = $pdo->prepare("UPDATE project_data SET data_json = ?, updated_at = NOW() WHERE project_id = ? AND data_type = 'tasteExplorationData'");
                $stmt->execute([json_encode($data), $projectId]);
            }
            
            jsonResponse(['success' => true, 'message' => 'Session deleted']);
            break;
            
        default:
            errorResponse('Invalid action. Valid actions: save-quad-state, save-session, save-profile, delete-session');
    }
}
?>
