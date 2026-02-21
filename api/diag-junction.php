<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();

$report = [];

// 1. Check if junction table exists
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'gid_project_consultants'");
    $tables = $stmt->fetchAll();
    $report['junction_table_exists'] = !empty($tables);
} catch (Exception $e) {
    $report['junction_table_check_error'] = $e->getMessage();
}

// 2. Check table structure
try {
    $stmt = $pdo->query("DESCRIBE gid_project_consultants");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $report['junction_columns'] = array_column($cols, 'Field');
} catch (Exception $e) {
    $report['junction_describe_error'] = $e->getMessage();
}

// 3. Count rows
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM gid_project_consultants");
    $report['junction_row_count'] = (int)$stmt->fetchColumn();
} catch (Exception $e) {
    $report['junction_count_error'] = $e->getMessage();
}

// 4. Test the INNER JOIN query
$projectId = $_GET['project_id'] ?? 'proj_thornwood_001';
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM gid_consultants c 
        INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id 
        WHERE pc.project_id = ? AND c.active = 1");
    $stmt->execute([$projectId]);
    $report['join_count'] = (int)$stmt->fetchColumn();
} catch (Exception $e) {
    $report['join_error'] = $e->getMessage();
}

// 5. Test discovery project_id column
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM gid_discovery_candidates LIKE 'project_id'");
    $cols = $stmt->fetchAll();
    $report['discovery_has_project_id'] = !empty($cols);
} catch (Exception $e) {
    $report['discovery_col_error'] = $e->getMessage();
}

// 6. Check hasJunctionTable would-be value by re-running auto-migration logic
try {
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $report['auto_migration_would_succeed'] = true;
} catch (Exception $e) {
    $report['auto_migration_error'] = $e->getMessage();
}

// 7. Test the full consultant list query with project_id
try {
    $sql = "SELECT c.*, pc.source as project_source, pc.added_at as project_added_at 
            FROM gid_consultants c 
            INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id AND pc.project_id = ? 
            WHERE 1=1 AND c.active = 1 
            ORDER BY c.firm_name ASC LIMIT 5 OFFSET 0";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$projectId]);
    $results = $stmt->fetchAll();
    $report['full_query_result_count'] = count($results);
} catch (Exception $e) {
    $report['full_query_error'] = $e->getMessage();
}

echo json_encode($report, JSON_PRETTY_PRINT);
