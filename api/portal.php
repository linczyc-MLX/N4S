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

            // Check if email matches principal or secondary
            $principalEmail = strtolower($kycData['profiles']['principal']['contactInfo']['email'] ?? '');
            $secondaryEmail = strtolower($kycData['profiles']['secondary']['contactInfo']['email'] ?? '');

            $role = null;
            if ($email === $principalEmail) {
                $role = 'principal';
            } elseif ($email === $secondaryEmail) {
                $role = 'secondary';
            }

            if ($role) {
                // Get principal name for display
                $principalName = trim(
                    ($kycData['profiles']['principal']['contactInfo']['firstName'] ?? '') . ' ' .
                    ($kycData['profiles']['principal']['contactInfo']['lastName'] ?? '')
                );

                // Get secondary name
                $secondaryName = trim(
                    ($kycData['profiles']['secondary']['contactInfo']['firstName'] ?? '') . ' ' .
                    ($kycData['profiles']['secondary']['contactInfo']['lastName'] ?? '')
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

        // Verify email has access
        $principalEmail = strtolower($kycData['profiles']['principal']['contactInfo']['email'] ?? '');
        $secondaryEmail = strtolower($kycData['profiles']['secondary']['contactInfo']['email'] ?? '');

        if ($email !== $principalEmail && $email !== $secondaryEmail) {
            errorResponse('Access denied', 403);
        }

        $role = ($email === $principalEmail) ? 'principal' : 'secondary';

        // Get LuXeBrief status from kycData
        $luxebriefStatus = [
            'principal' => $kycData['profiles']['principal']['luxebriefStatus'] ?? 'not_started',
            'secondary' => $kycData['profiles']['secondary']['luxebriefStatus'] ?? 'not_started'
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

    default:
        errorResponse('Invalid action. Valid actions: client-projects, project-status');
}

// Helper function to calculate KYC completion percentage
function calculateKYCCompletion($kycData) {
    if (!$kycData) return 0;

    $sections = [
        'designIdentity' => 10,
        'familyHousehold' => 15,
        'financialFramework' => 15,
        'timeline' => 10,
        'designPreferences' => 15,
        'lifestyleLiving' => 20,
        'partnerAlignment' => 10,
        'additionalContext' => 5
    ];

    $totalWeight = array_sum($sections);
    $completedWeight = 0;

    // Simple check: if section has data, count as complete
    foreach ($sections as $section => $weight) {
        if (isset($kycData[$section]) && !empty($kycData[$section])) {
            $completedWeight += $weight;
        }
    }

    return round(($completedWeight / $totalWeight) * 100);
}
?>
