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

    default:
        errorResponse('Invalid action. Valid actions: client-projects, project-status');
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
