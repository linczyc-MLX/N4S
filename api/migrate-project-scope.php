<?php
/**
 * ONE-TIME MIGRATION: Link existing consultants + discovery candidates to project
 * 
 * Run once after Phase A deploy to populate gid_project_consultants junction table.
 * All existing data was created under Thornwood, so we link everything there.
 * 
 * Usage: GET /api/migrate-project-scope.php?confirm=yes
 *        GET /api/migrate-project-scope.php  (dry run — shows what would happen)
 */

require_once __DIR__ . '/config.php';
$pdo = getDB();
header('Content-Type: application/json');

$dryRun = ($_GET['confirm'] ?? '') !== 'yes';

// Step 1: Find existing project IDs from engagements
$stmt = $pdo->query("SELECT DISTINCT n4s_project_id FROM gid_engagements WHERE n4s_project_id IS NOT NULL AND n4s_project_id != 'default'");
$projectIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Also look in the projects table
$stmt2 = $pdo->query("SELECT id, project_name FROM projects ORDER BY created_at ASC");
$projects = $stmt2->fetchAll(PDO::FETCH_ASSOC);

$report = [
    'dry_run' => $dryRun,
    'engagement_project_ids' => $projectIds,
    'all_projects' => $projects,
];

// Use first engagement project_id (Thornwood), or first project from projects table
$targetProjectId = $projectIds[0] ?? ($projects[0]['id'] ?? null);

if (!$targetProjectId) {
    echo json_encode(['error' => 'No projects found. Cannot migrate.', 'report' => $report], JSON_PRETTY_PRINT);
    exit;
}

$report['target_project_id'] = $targetProjectId;
$report['target_project_name'] = null;
foreach ($projects as $p) {
    if ($p['id'] === $targetProjectId) {
        $report['target_project_name'] = $p['project_name'];
    }
}

// Step 2: Ensure junction table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS gid_project_consultants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    consultant_id VARCHAR(36) NOT NULL,
    discipline VARCHAR(30) DEFAULT NULL,
    source VARCHAR(30) DEFAULT 'manual',
    source_project_id VARCHAR(100) DEFAULT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(100) DEFAULT NULL,
    UNIQUE KEY uq_project_consultant (project_id, consultant_id),
    KEY idx_project (project_id),
    KEY idx_consultant (consultant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

// Step 3: Count existing consultants
$stmt = $pdo->query("SELECT id, role, firm_name, source_of_discovery FROM gid_consultants WHERE active = 1");
$consultants = $stmt->fetchAll(PDO::FETCH_ASSOC);
$report['consultants_to_link'] = count($consultants);

// Step 4: Count existing discovery candidates
$stmt = $pdo->query("SELECT id, discipline, firm_name, project_id FROM gid_discovery_candidates");
$candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
$untagged = array_filter($candidates, fn($c) => empty($c['project_id']));
$report['discovery_candidates_total'] = count($candidates);
$report['discovery_candidates_untagged'] = count($untagged);

// Step 5: Check for project_id column on discovery, add if missing
$cols = $pdo->query("SHOW COLUMNS FROM gid_discovery_candidates LIKE 'project_id'")->fetchAll();
$hasDiscProjectCol = !empty($cols);
if (!$hasDiscProjectCol && !$dryRun) {
    try {
        $pdo->exec("ALTER TABLE gid_discovery_candidates ADD COLUMN project_id VARCHAR(100) DEFAULT NULL");
        $pdo->exec("ALTER TABLE gid_discovery_candidates ADD KEY idx_disc_project (project_id)");
        $hasDiscProjectCol = true;
    } catch (Exception $e) {
        $report['discovery_column_error'] = $e->getMessage();
    }
}
$report['discovery_has_project_id_column'] = $hasDiscProjectCol;

if ($dryRun) {
    $report['message'] = "DRY RUN — no changes made. Add ?confirm=yes to execute.";
    echo json_encode($report, JSON_PRETTY_PRINT);
    exit;
}

// EXECUTE MIGRATION

// Link all consultants to target project
$linked = 0;
$skipped = 0;
foreach ($consultants as $c) {
    try {
        $ins = $pdo->prepare("INSERT IGNORE INTO gid_project_consultants 
            (project_id, consultant_id, discipline, source, added_by) 
            VALUES (?, ?, ?, ?, 'migration')");
        $source = ($c['source_of_discovery'] === 'ai_discovery' || $c['source_of_discovery'] === 'gid_discovery') ? 'discovery' : 'manual';
        $ins->execute([$targetProjectId, $c['id'], $c['role'], $source]);
        if ($ins->rowCount() > 0) $linked++;
        else $skipped++;
    } catch (Exception $e) {
        $skipped++;
    }
}
$report['consultants_linked'] = $linked;
$report['consultants_skipped_already_linked'] = $skipped;

// Tag untagged discovery candidates with project_id
$tagged = 0;
if ($hasDiscProjectCol) {
    foreach ($untagged as $c) {
        $stmt = $pdo->prepare("UPDATE gid_discovery_candidates SET project_id = ? WHERE id = ? AND (project_id IS NULL OR project_id = '')");
        $stmt->execute([$targetProjectId, $c['id']]);
        $tagged += $stmt->rowCount();
    }
}
$report['discovery_candidates_tagged'] = $tagged;

$report['message'] = "Migration complete. $linked consultants linked, $tagged discovery candidates tagged.";
echo json_encode($report, JSON_PRETTY_PRINT);
