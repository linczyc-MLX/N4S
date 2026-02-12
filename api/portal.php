<?php
// Portal API endpoint for LuXeBrief integration
// Provides project data for client portal access
require_once 'config.php';
$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
// Simple API key authentication (shared secret with LuXeBrief)
$apiKey = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';
$validApiKey = getenv('PORTAL_API_KEY') ?: 'n4s-portal-2026-secure';
if ($apiKey !== $validApiKey) {
    errorResponse('Unauthorized', 401);
}
switch ($action) {
    case 'client-projects':
        // Get projects for a specific client email
        $email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
        if (!$email) {
            errorResponse('Email parameter required');
        }
        // Get all projects and check kycData for matching email
        $stmt = $pdo->query("SELECT p.id, p.project_name, p.project_code, p.created_at, p.updated_at, pd.data_json
                            FROM projects p
                            LEFT JOIN project_data pd ON p.id = pd.project_id AND pd.data_type = 'kycData'
                            ORDER BY p.updated_at DESC");
        $rows = $stmt->fetchAll();
        $clientProjects = [];
        foreach ($rows as $row) {
            $kycData = $row['data_json'] ? json_decode($row['data_json'], true) : null;
            if (!$kycData) continue;
            // N4S stores data at kycData.principal.portfolioContext
            $portfolioContext = $kycData['principal']['portfolioContext'] ?? [];
            // Check if email matches principal or secondary
            $principalEmail = strtolower($portfolioContext['principalEmail'] ?? '');
            $secondaryEmail = strtolower($portfolioContext['secondaryEmail'] ?? '');
            $role = null;
            if ($email === $principalEmail) {
                $role = 'principal';
            } elseif ($email === $secondaryEmail) {
                $role = 'secondary';
            }
            if ($role) {
                // Get principal name for display
                $principalName = trim(
                    ($portfolioContext['principalFirstName'] ?? '') . ' ' .
                    ($portfolioContext['principalLastName'] ?? '')
                );
                // Get secondary name
                $secondaryName = trim(
                    ($portfolioContext['secondaryFirstName'] ?? '') . ' ' .
                    ($portfolioContext['secondaryLastName'] ?? '')
                );
                // Calculate KYC completion
                $completion = calculateKYCCompletion($kycData);
                $clientProjects[] = [
                    'projectId' => $row['id'],
                    'projectName' => $row['project_name'],
                    'projectCode' => $row['project_code'],
                    'role' => $role,
                    'principalName' => $principalName ?: 'Not set',
                    'secondaryName' => $secondaryName ?: null,
                    'kycCompletion' => $completion,
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at']
                ];
            }
        }
        jsonResponse([
            'email' => $email,
            'projects' => $clientProjects
        ]);
        break;
    case 'project-status':
        // Get detailed status for a specific project
        $projectId = isset($_GET['projectId']) ? $_GET['projectId'] : '';
        $email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
        if (!$projectId || !$email) {
            errorResponse('projectId and email parameters required');
        }
        // Get project with kycData
        $stmt = $pdo->prepare("SELECT p.*, pd.data_json as kyc_json
                              FROM projects p
                              LEFT JOIN project_data pd ON p.id = pd.project_id AND pd.data_type = 'kycData'
                              WHERE p.id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        if (!$project) {
            errorResponse('Project not found', 404);
        }
        $kycData = $project['kyc_json'] ? json_decode($project['kyc_json'], true) : null;
        // N4S stores data at kycData.principal.portfolioContext
        $portfolioContext = $kycData['principal']['portfolioContext'] ?? [];
        // Verify email has access
        $principalEmail = strtolower($portfolioContext['principalEmail'] ?? '');
        $secondaryEmail = strtolower($portfolioContext['secondaryEmail'] ?? '');
        if ($email !== $principalEmail && $email !== $secondaryEmail) {
            errorResponse('Access denied', 403);
        }
        $role = ($email === $principalEmail) ? 'principal' : 'secondary';
        // Get LuXeBrief status from kycData
        $designIdentity = $kycData['principal']['designIdentity'] ?? [];
        $luxebriefStatus = [
            'principal' => $designIdentity['luxebriefStatus'] ?? 'not_started',
            'secondary' => $kycData['secondary']['designIdentity']['luxebriefStatus'] ?? 'not_started'
        ];
        jsonResponse([
            'projectId' => $projectId,
            'projectName' => $project['project_name'],
            'role' => $role,
            'kycCompletion' => calculateKYCCompletion($kycData),
            'luxebriefStatus' => $luxebriefStatus,
            'questionnairesEnabled' => [
                'lifestyle' => true,
                'taste' => false // Future: ITR-002
            ]
        ]);
        break;
    case 'get-by-slug':
        // Get full project data by portal slug (for LuXeBrief portal)
        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
        if (!$slug) {
            errorResponse('slug parameter required');
        }
        // Get all projects with their lcdData to find matching slug
        $stmt = $pdo->query("SELECT p.id, p.project_name, p.project_code, p.created_at, p.updated_at
                            FROM projects p ORDER BY p.updated_at DESC");
        $projects = $stmt->fetchAll();
        $foundProject = null;
        foreach ($projects as $project) {
            // Get lcdData for this project
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'lcdData'");
            $stmt->execute([$project['id']]);
            $lcdRow = $stmt->fetch();
            $lcdData = $lcdRow ? json_decode($lcdRow['data_json'], true) : null;
            if ($lcdData && isset($lcdData['portalSlug']) && $lcdData['portalSlug'] === $slug && !empty($lcdData['portalActive'])) {
                // Found matching project, get all data
                $stmt = $pdo->prepare("SELECT data_type, data_json FROM project_data WHERE project_id = ?");
                $stmt->execute([$project['id']]);
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
                $foundProject = $projectData;
                break;
            }
        }
        if (!$foundProject) {
            errorResponse('Portal not found or inactive', 404);
        }
        jsonResponse($foundProject);
        break;
    case 'update-kyc':
        // Update KYC data sections from LuXeBrief intake questionnaire
        // Accepts partial updates — merges into existing kycData
        if ($method !== 'POST') {
            errorResponse('POST method required', 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            errorResponse('Invalid JSON body');
        }
        $slug = $input['slug'] ?? '';
        $sections = $input['sections'] ?? [];
        $principalType = $input['principalType'] ?? 'principal';
        if (!$slug || empty($sections)) {
            errorResponse('slug and sections are required');
        }
        // Valid KYC sections that can be updated from intake
        $allowedSections = ['portfolioContext', 'familyHousehold', 'projectParameters', 'budgetFramework'];
        // Find project by slug
        $stmt = $pdo->query("SELECT p.id FROM projects p ORDER BY p.updated_at DESC");
        $projects = $stmt->fetchAll();
        $projectId = null;
        foreach ($projects as $proj) {
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'lcdData'");
            $stmt->execute([$proj['id']]);
            $lcdRow = $stmt->fetch();
            $lcdData = $lcdRow ? json_decode($lcdRow['data_json'], true) : null;
            if ($lcdData && ($lcdData['portalSlug'] ?? '') === $slug && !empty($lcdData['portalActive'])) {
                $projectId = $proj['id'];
                break;
            }
        }
        if (!$projectId) {
            errorResponse('Portal not found or inactive', 404);
        }
        // Get existing kycData
        $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'kycData'");
        $stmt->execute([$projectId]);
        $kycRow = $stmt->fetch();
        $kycData = $kycRow ? json_decode($kycRow['data_json'], true) : [];
        // Ensure principal structure exists
        if (!isset($kycData[$principalType])) {
            $kycData[$principalType] = [];
        }
        // Merge each allowed section
        $updatedSections = [];
        foreach ($sections as $sectionName => $sectionData) {
            if (!in_array($sectionName, $allowedSections)) {
                continue; // Skip disallowed sections
            }
            // Deep merge: existing section + new data
            $existing = $kycData[$principalType][$sectionName] ?? [];
            $kycData[$principalType][$sectionName] = array_merge($existing, $sectionData);
            $updatedSections[] = $sectionName;
        }
        if (empty($updatedSections)) {
            errorResponse('No valid sections to update');
        }
        // Write back to database
        $kycJson = json_encode($kycData);
        if ($kycRow) {
            $stmt = $pdo->prepare("UPDATE project_data SET data_json = ? WHERE project_id = ? AND data_type = 'kycData'");
            $stmt->execute([$kycJson, $projectId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json) VALUES (?, 'kycData', ?)");
            $stmt->execute([$projectId, $kycJson]);
        }
        // Also update project updated_at timestamp
        $stmt = $pdo->prepare("UPDATE projects SET updated_at = NOW() WHERE id = ?");
        $stmt->execute([$projectId]);
        jsonResponse([
            'success' => true,
            'projectId' => $projectId,
            'updatedSections' => $updatedSections
        ]);
        break;
    case 'complete-intake':
        // Mark intake questionnaire as completed in kycData
        if ($method !== 'POST') {
            errorResponse('POST method required', 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $slug = $input['slug'] ?? '';
        $principalType = $input['principalType'] ?? 'principal';
        if (!$slug) {
            errorResponse('slug is required');
        }
        // Find project by slug
        $stmt = $pdo->query("SELECT p.id FROM projects p ORDER BY p.updated_at DESC");
        $projects = $stmt->fetchAll();
        $projectId = null;
        foreach ($projects as $proj) {
            $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'lcdData'");
            $stmt->execute([$proj['id']]);
            $lcdRow = $stmt->fetch();
            $lcdData = $lcdRow ? json_decode($lcdRow['data_json'], true) : null;
            if ($lcdData && ($lcdData['portalSlug'] ?? '') === $slug && !empty($lcdData['portalActive'])) {
                $projectId = $proj['id'];
                break;
            }
        }
        if (!$projectId) {
            errorResponse('Portal not found or inactive', 404);
        }
        // Update kycData with intake completion status
        $stmt = $pdo->prepare("SELECT data_json FROM project_data WHERE project_id = ? AND data_type = 'kycData'");
        $stmt->execute([$projectId]);
        $kycRow = $stmt->fetch();
        $kycData = $kycRow ? json_decode($kycRow['data_json'], true) : [];
        if (!isset($kycData[$principalType])) {
            $kycData[$principalType] = [];
        }
        if (!isset($kycData[$principalType]['portfolioContext'])) {
            $kycData[$principalType]['portfolioContext'] = [];
        }
        $kycData[$principalType]['portfolioContext']['intakeStatus'] = 'completed';
        $kycData[$principalType]['portfolioContext']['intakeCompletedAt'] = date('c');
        $kycJson = json_encode($kycData);
        if ($kycRow) {
            $stmt = $pdo->prepare("UPDATE project_data SET data_json = ? WHERE project_id = ? AND data_type = 'kycData'");
            $stmt->execute([$kycJson, $projectId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO project_data (project_id, data_type, data_json) VALUES (?, 'kycData', ?)");
            $stmt->execute([$projectId, $kycJson]);
        }
        $stmt = $pdo->prepare("UPDATE projects SET updated_at = NOW() WHERE id = ?");
        $stmt->execute([$projectId]);
        jsonResponse([
            'success' => true,
            'projectId' => $projectId,
            'intakeCompletedAt' => $kycData[$principalType]['portfolioContext']['intakeCompletedAt']
        ]);
        break;
    default:
        errorResponse('Invalid action. Valid actions: client-projects, project-status, get-by-slug, update-kyc, complete-intake');
}
// Helper function to calculate KYC completion percentage
function calculateKYCCompletion($kycData) {
    if (!$kycData) return 0;
    // Check principal data sections
    $principal = $kycData['principal'] ?? [];
    $sections = [
        'portfolioContext' => 15,
        'familyHousehold' => 15,
        'projectParameters' => 15,
        'budgetFramework' => 15,
        'designIdentity' => 15,
        'lifestyleLiving' => 15,
        'partnerAlignment' => 10
    ];
    $totalWeight = array_sum($sections);
    $completedWeight = 0;
    // Check if section has data
    foreach ($sections as $section => $weight) {
        if (isset($principal[$section]) && !empty($principal[$section])) {
            $completedWeight += $weight;
        }
    }
    return round(($completedWeight / $totalWeight) * 100);
}
?>