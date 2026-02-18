<?php
// Projects API endpoint
// Uses POST for all write operations to avoid hosting restrictions on PUT/DELETE
require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$projectId = isset($_GET['id']) ? $_GET['id'] : null;

// Handle all operations
switch ($method) {
    case 'GET':
        if ($projectId) {
            // Get single project with all its data
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
            $stmt->execute([$projectId]);
            $project = $stmt->fetch();

            if (!$project) {
                errorResponse('Project not found', 404);
            }

            // Get all data for this project
            $stmt = $pdo->prepare("SELECT data_type, data_json FROM project_data WHERE project_id = ?");
            $stmt->execute([$projectId]);
            $dataRows = $stmt->fetchAll();

            $projectData = [
                'id' => $project['id'],
                'clientData' => [
                    'projectName' => $project['project_name'],
                    'projectCode' => $project['project_code'],
                    'createdAt' => $project['created_at'],
                    'lastUpdated' => $project['updated_at']
                ]
            ];

            foreach ($dataRows as $row) {
                $projectData[$row['data_type']] = json_decode($row['data_json'], true);
            }

            jsonResponse($projectData);
        } else {
            // Get all projects (list only, no full data)
            $stmt = $pdo->query("SELECT id, project_name, project_code, created_at, updated_at FROM projects ORDER BY updated_at DESC");
            $projects = $stmt->fetchAll();
            jsonResponse($projects);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // Route based on action parameter
        if ($action === 'update' && $projectId) {
            // UPDATE existing project
            if (!$input) {
                errorResponse('Invalid project data');
            }

            // Update project metadata if provided
            if (isset($input['clientData'])) {
                $clientData = $input['clientData'];
                $stmt = $pdo->prepare("UPDATE projects SET project_name = ?, project_code = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([
                    $clientData['projectName'] ?? 'Untitled Project',
                    $clientData['projectCode'] ?? '',
                    $projectId
                ]);
            }

            // Update data sections
            $dataTypes = ['kycData', 'fyiData', 'activeRespondent', 'lcdData', 'vmxData', 'kymData'];
            foreach ($dataTypes as $type) {
                if (isset($input[$type])) {
                    $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_json = ?");
                    $jsonData = json_encode($input[$type]);
                    $stmt->execute([$projectId, $type, $jsonData, $jsonData]);
                }
            }

            jsonResponse(['success' => true, 'id' => $projectId]);

        } elseif ($action === 'delete' && $projectId) {
            // DELETE project
            $stmt = $pdo->prepare("DELETE FROM project_data WHERE project_id = ?");
            $stmt->execute([$projectId]);

            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$projectId]);

            jsonResponse(['success' => true, 'deleted' => $projectId]);

        } else {
            // CREATE new project (default POST behavior)
            if (!$input || !isset($input['id'])) {
                errorResponse('Invalid project data');
            }

            $id = $input['id'];
            $clientData = $input['clientData'] ?? [];
            $projectName = $clientData['projectName'] ?? 'Untitled Project';
            $projectCode = $clientData['projectCode'] ?? '';

            // Insert project
            $stmt = $pdo->prepare("INSERT INTO projects (id, project_name, project_code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE project_name = ?, project_code = ?, updated_at = NOW()");
            $stmt->execute([$id, $projectName, $projectCode, $projectName, $projectCode]);

            // Insert/update data sections
            $dataTypes = ['kycData', 'fyiData', 'activeRespondent', 'lcdData', 'vmxData', 'kymData'];
            foreach ($dataTypes as $type) {
                if (isset($input[$type])) {
                    $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_json = ?");
                    $jsonData = json_encode($input[$type]);
                    $stmt->execute([$id, $type, $jsonData, $jsonData]);
                }
            }

            jsonResponse(['success' => true, 'id' => $id], 201);
        }
        break;

    case 'PUT':
        // Fallback for PUT if hosting allows it
        if (!$projectId) {
            errorResponse('Project ID required');
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            errorResponse('Invalid project data');
        }

        if (isset($input['clientData'])) {
            $clientData = $input['clientData'];
            $stmt = $pdo->prepare("UPDATE projects SET project_name = ?, project_code = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([
                $clientData['projectName'] ?? 'Untitled Project',
                $clientData['projectCode'] ?? '',
                $projectId
            ]);
        }

        $dataTypes = ['kycData', 'fyiData', 'activeRespondent', 'lcdData', 'vmxData', 'kymData'];
        foreach ($dataTypes as $type) {
            if (isset($input[$type])) {
                $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data_json = ?");
                $jsonData = json_encode($input[$type]);
                $stmt->execute([$projectId, $type, $jsonData, $jsonData]);
            }
        }

        jsonResponse(['success' => true, 'id' => $projectId]);
        break;

    case 'DELETE':
        // Fallback for DELETE if hosting allows it
        if (!$projectId) {
            errorResponse('Project ID required');
        }

        $stmt = $pdo->prepare("DELETE FROM project_data WHERE project_id = ?");
        $stmt->execute([$projectId]);

        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);

        jsonResponse(['success' => true, 'deleted' => $projectId]);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
?>
