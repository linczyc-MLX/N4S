<?php
/**
 * GID Module — PHP API
 * 
 * Endpoints:
 *   GET    /api/gid.php?entity=consultants              List consultants (with filters)
 *   GET    /api/gid.php?entity=consultants&id=UUID       Get single consultant + portfolio + reviews
 *   POST   /api/gid.php?entity=consultants               Add consultant
 *   POST   /api/gid.php?entity=consultants&id=UUID&action=update  Update consultant
 *   POST   /api/gid.php?entity=consultants&id=UUID&action=delete  Soft-delete (archive)
 *
 *   GET    /api/gid.php?entity=portfolio&consultant_id=UUID   Get portfolio projects
 *   POST   /api/gid.php?entity=portfolio                      Add portfolio project
 *   POST   /api/gid.php?entity=portfolio&id=UUID&action=update  Update portfolio project
 *   POST   /api/gid.php?entity=portfolio&id=UUID&action=delete  Delete portfolio project
 *
 *   GET    /api/gid.php?entity=reviews&consultant_id=UUID     Get reviews
 *   POST   /api/gid.php?entity=reviews                        Add review
 *
 *   GET    /api/gid.php?entity=stats                          Dashboard stats
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$entity = $_GET['entity'] ?? '';
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// Generate UUID (MariaDB compatible)
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Parse JSON body
function getBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ============================================================================
// AUTO-MIGRATION: Project-scoped tables
// ============================================================================

$hasJunctionTable = false;
try {
    // Junction table: links consultants to projects
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
    // Fix collation if table already existed with wrong collation
    $pdo->exec("ALTER TABLE gid_project_consultants CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $hasJunctionTable = true;
} catch (Exception $e) {
    // Log but continue — junction table features will be disabled
    error_log('[BYT Migration] Junction table creation failed: ' . $e->getMessage());
}

$hasDiscProjectCol = false;
try {
    // Add project_id to discovery candidates if not present
    $cols = $pdo->query("SHOW COLUMNS FROM gid_discovery_candidates LIKE 'project_id'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE gid_discovery_candidates ADD COLUMN project_id VARCHAR(100) DEFAULT NULL");
        $pdo->exec("ALTER TABLE gid_discovery_candidates ADD KEY idx_disc_project (project_id)");
    }
    $hasDiscProjectCol = true;
} catch (Exception $e) {
    // Discovery table may not exist yet — that's fine
    error_log('[BYT Migration] Discovery column migration: ' . $e->getMessage());
}

// ============================================================================
// CONSULTANTS
// ============================================================================

if ($entity === 'consultants') {
    
    // GET — List or single consultant
    if ($method === 'GET') {
        
        // Single consultant with portfolio + reviews
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM gid_consultants WHERE id = ?");
            $stmt->execute([$id]);
            $consultant = $stmt->fetch();
            
            if (!$consultant) {
                errorResponse('Consultant not found', 404);
            }
            
            // Parse JSON fields
            $consultant['specialties'] = json_decode($consultant['specialties'] ?? '[]', true);
            $consultant['service_areas'] = json_decode($consultant['service_areas'] ?? '[]', true);
            $consultant['certifications'] = json_decode($consultant['certifications'] ?? '[]', true);
            $consultant['active'] = (bool)$consultant['active'];
            
            // Fetch portfolio
            $stmt = $pdo->prepare("SELECT * FROM gid_portfolio_projects WHERE consultant_id = ? ORDER BY completion_year DESC, created_at DESC");
            $stmt->execute([$id]);
            $portfolio = $stmt->fetchAll();
            foreach ($portfolio as &$p) {
                $p['features'] = json_decode($p['features'] ?? '[]', true);
                $p['featured_in_publications'] = json_decode($p['featured_in_publications'] ?? '[]', true);
                $p['gallery_photos'] = json_decode($p['gallery_photos'] ?? '[]', true);
                $p['public_urls'] = json_decode($p['public_urls'] ?? '[]', true);
                $p['award_winner'] = (bool)$p['award_winner'];
                $p['is_featured'] = (bool)$p['is_featured'];
            }
            
            // Fetch reviews
            $stmt = $pdo->prepare("SELECT * FROM gid_reviews WHERE consultant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $reviews = $stmt->fetchAll();
            foreach ($reviews as &$r) {
                $r['verified_client'] = (bool)$r['verified_client'];
                $r['would_recommend'] = $r['would_recommend'] === null ? null : (bool)$r['would_recommend'];
            }
            
            // Fetch sources
            $stmt = $pdo->prepare("SELECT * FROM gid_sources WHERE consultant_id = ? ORDER BY created_at DESC");
            $stmt->execute([$id]);
            $sources = $stmt->fetchAll();
            
            $consultant['portfolio'] = $portfolio;
            $consultant['reviews'] = $reviews;
            $consultant['sources'] = $sources;
            
            jsonResponse($consultant);
        }
        
        // List consultants with optional filters
        $where = ["1=1"];
        $params = [];
        $joinClause = "";
        $selectPrefix = "c.*";
        
        // PROJECT SCOPING: When project_id provided AND junction table exists, filter
        $projectId = $_GET['project_id'] ?? null;
        if ($projectId && $hasJunctionTable) {
            $joinClause = "INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id AND pc.project_id = ?";
            $params[] = $projectId;
            $selectPrefix = "c.*, pc.source as project_source, pc.added_at as project_added_at";
        }
        
        // Filter: role
        if (!empty($_GET['role'])) {
            $where[] = "c.role = ?";
            $params[] = $_GET['role'];
        }
        
        // Filter: active only (default true)
        if (($_GET['active'] ?? '1') === '1') {
            $where[] = "c.active = 1";
        }
        
        // Filter: verification status
        if (!empty($_GET['verification'])) {
            $where[] = "c.verification_status = ?";
            $params[] = $_GET['verification'];
        }
        
        // Filter: state
        if (!empty($_GET['state'])) {
            $where[] = "c.hq_state = ?";
            $params[] = $_GET['state'];
        }
        
        // Filter: search (firm name or last name)
        if (!empty($_GET['search'])) {
            $where[] = "(c.firm_name LIKE ? OR c.last_name LIKE ? OR c.first_name LIKE ?)";
            $searchTerm = '%' . $_GET['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        // Sort
        $sortField = $_GET['sort'] ?? 'firm_name';
        $sortDir = strtoupper($_GET['dir'] ?? 'ASC');
        $allowedSorts = ['firm_name', 'avg_rating', 'created_at', 'updated_at', 'last_name', 'years_experience'];
        if (!in_array($sortField, $allowedSorts)) $sortField = 'firm_name';
        if (!in_array($sortDir, ['ASC', 'DESC'])) $sortDir = 'ASC';
        
        // Pagination
        $limit = min((int)($_GET['limit'] ?? 50), 200);
        $offset = max((int)($_GET['offset'] ?? 0), 0);
        
        $whereClause = implode(' AND ', $where);
        $sql = "SELECT $selectPrefix FROM gid_consultants c $joinClause WHERE $whereClause ORDER BY c.$sortField $sortDir LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $consultants = $stmt->fetchAll();
        
        // Parse JSON fields
        foreach ($consultants as &$c) {
            $c['specialties'] = json_decode($c['specialties'] ?? '[]', true);
            $c['service_areas'] = json_decode($c['service_areas'] ?? '[]', true);
            $c['certifications'] = json_decode($c['certifications'] ?? '[]', true);
            $c['active'] = (bool)$c['active'];
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) FROM gid_consultants c $joinClause WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();
        
        jsonResponse([
            'consultants' => $consultants,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }
    
    // POST — Create or Update or Delete
    if ($method === 'POST') {
        $body = getBody();
        
        // Update
        if ($id && $action === 'update') {
            $fields = [];
            $params = [];
            
            $allowed = [
                'role', 'first_name', 'last_name', 'firm_name',
                'hq_city', 'hq_state', 'hq_country',
                'min_budget', 'max_budget', 'bio', 'phone', 'email',
                'website', 'linkedin_url', 'profile_photo_url',
                'years_experience', 'firm_established_year', 'team_size',
                'verification_status', 'active', 'source_of_discovery',
                'source_attribution', 'notes', 'created_by'
            ];
            $jsonFields = ['specialties', 'service_areas', 'certifications'];
            
            foreach ($allowed as $field) {
                if (array_key_exists($field, $body)) {
                    $fields[] = "$field = ?";
                    $params[] = $body[$field];
                }
            }
            foreach ($jsonFields as $field) {
                if (array_key_exists($field, $body)) {
                    $fields[] = "$field = ?";
                    $params[] = json_encode($body[$field]);
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update');
            }
            
            $params[] = $id;
            $sql = "UPDATE gid_consultants SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            jsonResponse(['success' => true, 'id' => $id]);
        }
        
        // Soft delete (archive)
        if ($id && $action === 'delete') {
            $stmt = $pdo->prepare("UPDATE gid_consultants SET active = 0 WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'id' => $id]);
        }
        
        // Create
        if (!$id && !$action) {
            $newId = generateUUID();
            
            $stmt = $pdo->prepare("INSERT INTO gid_consultants (
                id, role, first_name, last_name, firm_name,
                specialties, service_areas, hq_city, hq_state, hq_country,
                min_budget, max_budget, certifications, bio, phone, email,
                website, linkedin_url, profile_photo_url,
                years_experience, firm_established_year, team_size,
                verification_status, source_of_discovery, source_attribution,
                notes, created_by
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?
            )");
            
            $stmt->execute([
                $newId,
                $body['role'] ?? 'architect',
                $body['first_name'] ?? null,
                $body['last_name'] ?? null,
                $body['firm_name'] ?? 'Unknown Firm',
                json_encode($body['specialties'] ?? []),
                json_encode($body['service_areas'] ?? []),
                $body['hq_city'] ?? null,
                $body['hq_state'] ?? null,
                $body['hq_country'] ?? 'USA',
                $body['min_budget'] ?? null,
                $body['max_budget'] ?? null,
                json_encode($body['certifications'] ?? []),
                $body['bio'] ?? null,
                $body['phone'] ?? null,
                $body['email'] ?? null,
                $body['website'] ?? null,
                $body['linkedin_url'] ?? null,
                $body['profile_photo_url'] ?? null,
                $body['years_experience'] ?? null,
                $body['firm_established_year'] ?? null,
                $body['team_size'] ?? null,
                $body['verification_status'] ?? 'pending',
                $body['source_of_discovery'] ?? null,
                $body['source_attribution'] ?? null,
                $body['notes'] ?? null,
                $body['created_by'] ?? null,
            ]);
            
            // Link to project if project_id provided and junction table exists
            if (!empty($body['project_id']) && $hasJunctionTable) {
                try {
                    $stmt = $pdo->prepare("INSERT IGNORE INTO gid_project_consultants 
                        (project_id, consultant_id, discipline, source, added_by) 
                        VALUES (?, ?, ?, 'manual', ?)");
                    $stmt->execute([
                        $body['project_id'],
                        $newId,
                        $body['role'] ?? 'architect',
                        $body['created_by'] ?? null,
                    ]);
                } catch (Exception $e) { /* junction table may not exist yet */ }
            }
            
            jsonResponse(['success' => true, 'id' => $newId], 201);
        }
    }
}

// ============================================================================
// PORTFOLIO PROJECTS
// ============================================================================

if ($entity === 'portfolio') {
    
    // GET — List portfolio projects for a consultant
    if ($method === 'GET') {
        $consultantId = $_GET['consultant_id'] ?? null;
        if (!$consultantId) errorResponse('consultant_id required');
        
        $stmt = $pdo->prepare("SELECT * FROM gid_portfolio_projects WHERE consultant_id = ? ORDER BY completion_year DESC, created_at DESC");
        $stmt->execute([$consultantId]);
        $projects = $stmt->fetchAll();
        
        foreach ($projects as &$p) {
            $p['features'] = json_decode($p['features'] ?? '[]', true);
            $p['featured_in_publications'] = json_decode($p['featured_in_publications'] ?? '[]', true);
            $p['gallery_photos'] = json_decode($p['gallery_photos'] ?? '[]', true);
            $p['public_urls'] = json_decode($p['public_urls'] ?? '[]', true);
            $p['award_winner'] = (bool)$p['award_winner'];
            $p['is_featured'] = (bool)$p['is_featured'];
        }
        
        jsonResponse(['projects' => $projects]);
    }
    
    // POST — Create, Update, or Delete
    if ($method === 'POST') {
        $body = getBody();
        
        // Update
        if ($id && $action === 'update') {
            $fields = [];
            $params = [];
            
            $allowed = [
                'project_name', 'location_city', 'location_state', 'location_country',
                'project_type', 'description', 'budget_min', 'budget_max',
                'completion_year', 'square_footage', 'lot_acres', 'architectural_style',
                'award_winner', 'award_details', 'is_featured', 'visibility'
            ];
            $jsonFields = ['features', 'featured_in_publications', 'gallery_photos', 'public_urls'];
            
            foreach ($allowed as $field) {
                if (array_key_exists($field, $body)) {
                    $fields[] = "$field = ?";
                    $params[] = $body[$field];
                }
            }
            foreach ($jsonFields as $field) {
                if (array_key_exists($field, $body)) {
                    $fields[] = "$field = ?";
                    $params[] = json_encode($body[$field]);
                }
            }
            
            if (empty($fields)) errorResponse('No fields to update');
            
            $params[] = $id;
            $sql = "UPDATE gid_portfolio_projects SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            jsonResponse(['success' => true, 'id' => $id]);
        }
        
        // Delete
        if ($id && $action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM gid_portfolio_projects WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(['success' => true]);
        }
        
        // Create
        if (!$id && !$action) {
            $newId = generateUUID();
            
            $stmt = $pdo->prepare("INSERT INTO gid_portfolio_projects (
                id, consultant_id, project_name, location_city, location_state, location_country,
                project_type, description, budget_min, budget_max,
                completion_year, square_footage, lot_acres, architectural_style,
                features, featured_in_publications, gallery_photos, public_urls,
                award_winner, award_details, is_featured, visibility
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $newId,
                $body['consultant_id'] ?? errorResponse('consultant_id required'),
                $body['project_name'] ?? 'Untitled Project',
                $body['location_city'] ?? null,
                $body['location_state'] ?? null,
                $body['location_country'] ?? 'USA',
                $body['project_type'] ?? null,
                $body['description'] ?? null,
                $body['budget_min'] ?? null,
                $body['budget_max'] ?? null,
                $body['completion_year'] ?? null,
                $body['square_footage'] ?? null,
                $body['lot_acres'] ?? null,
                $body['architectural_style'] ?? null,
                json_encode($body['features'] ?? []),
                json_encode($body['featured_in_publications'] ?? []),
                json_encode($body['gallery_photos'] ?? []),
                json_encode($body['public_urls'] ?? []),
                $body['award_winner'] ?? 0,
                $body['award_details'] ?? null,
                $body['is_featured'] ?? 0,
                $body['visibility'] ?? 'public',
            ]);
            
            jsonResponse(['success' => true, 'id' => $newId], 201);
        }
    }
}

// ============================================================================
// REVIEWS
// ============================================================================

if ($entity === 'reviews') {
    
    // GET — List reviews for a consultant
    if ($method === 'GET') {
        $consultantId = $_GET['consultant_id'] ?? null;
        if (!$consultantId) errorResponse('consultant_id required');
        
        $stmt = $pdo->prepare("SELECT * FROM gid_reviews WHERE consultant_id = ? ORDER BY created_at DESC");
        $stmt->execute([$consultantId]);
        $reviews = $stmt->fetchAll();
        
        foreach ($reviews as &$r) {
            $r['verified_client'] = (bool)$r['verified_client'];
            $r['would_recommend'] = $r['would_recommend'] === null ? null : (bool)$r['would_recommend'];
        }
        
        jsonResponse(['reviews' => $reviews]);
    }
    
    // POST — Add review
    if ($method === 'POST') {
        $body = getBody();
        $newId = generateUUID();
        
        $stmt = $pdo->prepare("INSERT INTO gid_reviews (
            id, consultant_id, portfolio_project_id, reviewer_name,
            reviewer_project_name, rating, budget_accuracy_score,
            timeline_accuracy_score, communication_score, quality_score,
            would_recommend, review_text, verified_client,
            verified_by_n4s_project_id, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $newId,
            $body['consultant_id'] ?? errorResponse('consultant_id required'),
            $body['portfolio_project_id'] ?? null,
            $body['reviewer_name'] ?? null,
            $body['reviewer_project_name'] ?? null,
            $body['rating'] ?? null,
            $body['budget_accuracy_score'] ?? null,
            $body['timeline_accuracy_score'] ?? null,
            $body['communication_score'] ?? null,
            $body['quality_score'] ?? null,
            $body['would_recommend'] ?? null,
            $body['review_text'] ?? null,
            $body['verified_client'] ?? 0,
            $body['verified_by_n4s_project_id'] ?? null,
            $body['source'] ?? 'manual',
        ]);
        
        // Recalculate avg_rating + review_count
        $consultantId = $body['consultant_id'];
        $stmt = $pdo->prepare("UPDATE gid_consultants SET 
            avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM gid_reviews WHERE consultant_id = ?),
            review_count = (SELECT COUNT(*) FROM gid_reviews WHERE consultant_id = ?)
            WHERE id = ?");
        $stmt->execute([$consultantId, $consultantId, $consultantId]);
        
        jsonResponse(['success' => true, 'id' => $newId], 201);
    }
}

// ============================================================================
// STATS
// ============================================================================

if ($entity === 'stats') {
    $stats = [];
    $projectId = $_GET['project_id'] ?? null;
    
    if ($projectId && $hasJunctionTable) {
        // PROJECT-SCOPED stats: only count consultants linked to this project
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM gid_consultants c 
            INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id 
            WHERE pc.project_id = ? AND c.active = 1");
        $stmt->execute([$projectId]);
        $stats['totalActive'] = (int)$stmt->fetchColumn();
        
        $stmt = $pdo->prepare("SELECT c.role, COUNT(*) as count FROM gid_consultants c 
            INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id 
            WHERE pc.project_id = ? AND c.active = 1 GROUP BY c.role");
        $stmt->execute([$projectId]);
        $stats['byRole'] = $stmt->fetchAll();
        
        $stmt = $pdo->prepare("SELECT c.verification_status, COUNT(*) as count FROM gid_consultants c 
            INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id 
            WHERE pc.project_id = ? AND c.active = 1 GROUP BY c.verification_status");
        $stmt->execute([$projectId]);
        $stats['byVerification'] = $stmt->fetchAll();
        
        $stmt = $pdo->prepare("SELECT c.hq_state, COUNT(*) as count FROM gid_consultants c 
            INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id 
            WHERE pc.project_id = ? AND c.active = 1 AND c.hq_state IS NOT NULL 
            GROUP BY c.hq_state ORDER BY count DESC LIMIT 10");
        $stmt->execute([$projectId]);
        $stats['byState'] = $stmt->fetchAll();
    } else {
        // GLOBAL stats (backward compatible)
        $stmt = $pdo->query("SELECT COUNT(*) FROM gid_consultants WHERE active = 1");
        $stats['totalActive'] = (int)$stmt->fetchColumn();
        
        $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM gid_consultants WHERE active = 1 GROUP BY role");
        $stats['byRole'] = $stmt->fetchAll();
        
        $stmt = $pdo->query("SELECT verification_status, COUNT(*) as count FROM gid_consultants WHERE active = 1 GROUP BY verification_status");
        $stats['byVerification'] = $stmt->fetchAll();
        
        $stmt = $pdo->query("SELECT hq_state, COUNT(*) as count FROM gid_consultants WHERE active = 1 AND hq_state IS NOT NULL GROUP BY hq_state ORDER BY count DESC LIMIT 10");
        $stats['byState'] = $stmt->fetchAll();
    }
    
    // Portfolio + reviews are global (not project-scoped)
    $stmt = $pdo->query("SELECT COUNT(*) FROM gid_portfolio_projects");
    $stats['totalProjects'] = (int)$stmt->fetchColumn();
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM gid_reviews");
    $stats['totalReviews'] = (int)$stmt->fetchColumn();
    
    jsonResponse($stats);
}

// ============================================================================
// ENGAGEMENTS (Shortlisting & Pipeline Tracking)
// ============================================================================

if ($entity === 'engagements') {

    // GET — List engagements for a project
    if ($method === 'GET') {
        $projectId = $_GET['project_id'] ?? null;
        $discipline = $_GET['discipline'] ?? null;

        $sql = "SELECT e.*, c.firm_name, c.first_name, c.last_name, c.role, c.hq_city, c.hq_state
                FROM gid_engagements e
                LEFT JOIN gid_consultants c ON e.consultant_id = c.id
                WHERE 1=1";
        $params = [];

        if ($projectId) {
            $sql .= " AND e.n4s_project_id = ?";
            $params[] = $projectId;
        }
        if ($discipline) {
            $sql .= " AND e.discipline = ?";
            $params[] = $discipline;
        }

        $sql .= " ORDER BY e.match_score DESC, e.date_shortlisted DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $engagements = $stmt->fetchAll();

        // Parse JSON fields
        foreach ($engagements as &$eng) {
            $eng['match_breakdown'] = json_decode($eng['match_breakdown'] ?? '[]', true);
        }

        jsonResponse(['engagements' => $engagements]);
    }

    // POST — Create or update engagement
    if ($method === 'POST') {
        $body = getBody();

        // Update existing
        if ($id && $action === 'update') {
            $fields = [];
            $params = [];

            $updatable = ['contact_status', 'team_notes', 'client_feedback', 'chemistry_score',
                          'project_outcome', 'date_contacted', 'date_responded', 'date_meeting',
                          'date_proposal', 'date_engaged', 'date_contracted'];

            foreach ($updatable as $field) {
                if (isset($body[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $body[$field];
                }
            }

            if (empty($fields)) {
                errorResponse('No updatable fields provided');
            }

            $fields[] = "updated_at = CURRENT_TIMESTAMP";
            $params[] = $id;

            $sql = "UPDATE gid_engagements SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            jsonResponse(['success' => true, 'id' => $id]);
        }

        // Delete (soft)
        if ($id && $action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM gid_engagements WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(['success' => true, 'deleted' => $id]);
        }

        // Create new engagement
        $required = ['consultant_id', 'discipline'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                errorResponse("Missing required field: $field");
            }
        }

        $engId = generateUUID();
        $stmt = $pdo->prepare("INSERT INTO gid_engagements
            (id, n4s_project_id, consultant_id, discipline, match_score, client_fit_score,
             project_fit_score, match_breakdown, recommended_by, contact_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $engId,
            $body['n4s_project_id'] ?? 'default',
            $body['consultant_id'],
            $body['discipline'],
            $body['match_score'] ?? null,
            $body['client_fit_score'] ?? null,
            $body['project_fit_score'] ?? null,
            $body['match_breakdown'] ?? null,
            $body['recommended_by'] ?? 'matching_algorithm',
            $body['contact_status'] ?? 'shortlisted',
        ]);

        jsonResponse(['success' => true, 'id' => $engId], 201);
    }
}

// ============================================================================
// PROJECT-CONSULTANT LINKS (Junction table for project scoping)
// ============================================================================

if ($entity === 'project_consultants') {

    if (!$hasJunctionTable) {
        errorResponse('Project-consultant linking not available (migration pending)', 503);
    }

    // GET — List consultant links for a project
    if ($method === 'GET') {
        $projectId = $_GET['project_id'] ?? null;
        if (!$projectId) errorResponse('project_id required');

        $stmt = $pdo->prepare("SELECT pc.*, c.firm_name, c.first_name, c.last_name, c.role, c.hq_city, c.hq_state, c.verification_status
            FROM gid_project_consultants pc
            LEFT JOIN gid_consultants c ON pc.consultant_id = c.id
            WHERE pc.project_id = ?
            ORDER BY pc.added_at DESC");
        $stmt->execute([$projectId]);
        jsonResponse(['links' => $stmt->fetchAll()]);
    }

    // POST — Link an existing consultant to a project
    if ($method === 'POST') {
        $body = getBody();
        $projectId = $body['project_id'] ?? null;
        $consultantId = $body['consultant_id'] ?? null;
        if (!$projectId || !$consultantId) errorResponse('project_id and consultant_id required');

        $stmt = $pdo->prepare("INSERT IGNORE INTO gid_project_consultants 
            (project_id, consultant_id, discipline, source, source_project_id, added_by)
            VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $projectId,
            $consultantId,
            $body['discipline'] ?? null,
            $body['source'] ?? 'imported_from_global',
            $body['source_project_id'] ?? null,
            $body['added_by'] ?? null,
        ]);

        jsonResponse(['success' => true, 'project_id' => $projectId, 'consultant_id' => $consultantId]);
    }
}

// ============================================================================
// DISCOVERY CANDIDATES (Phase 3)
// ============================================================================

if ($entity === 'discovery') {

    // GET — Queue stats (must check before listing)
    if ($method === 'GET' && $action === 'queue_stats') {
        $discProjectId = $_GET['project_id'] ?? null;
        if ($discProjectId && $hasDiscProjectCol) {
            $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM gid_discovery_candidates WHERE project_id = ? GROUP BY status");
            $stmt->execute([$discProjectId]);
        } else {
            $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM gid_discovery_candidates GROUP BY status");
        }
        $rows = $stmt->fetchAll();
        $stats = ['pending' => 0, 'reviewing' => 0, 'approved' => 0, 'dismissed' => 0, 'imported' => 0, 'total' => 0];
        foreach ($rows as $r) {
            $stats[$r['status']] = (int)$r['count'];
            $stats['total'] += (int)$r['count'];
        }
        $stats['queue'] = $stats['pending'] + $stats['reviewing'] + $stats['approved'];
        jsonResponse($stats);
    }

    // GET — List candidates or single candidate
    if ($method === 'GET') {

        // Single candidate
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM gid_discovery_candidates WHERE id = ?");
            $stmt->execute([$id]);
            $candidate = $stmt->fetch();
            if (!$candidate) errorResponse('Candidate not found', 404);

            // Parse JSON fields
            foreach (['specialties', 'service_areas', 'notable_projects', 'awards', 'publications'] as $jf) {
                $candidate[$jf] = json_decode($candidate[$jf] ?? '[]', true);
            }
            jsonResponse($candidate);
        }

        // List with filters
        $where = ["1=1"];
        $params = [];

        // PROJECT SCOPING: filter by project_id (only if column exists)
        if (!empty($_GET['project_id']) && $hasDiscProjectCol) {
            $where[] = "project_id = ?";
            $params[] = $_GET['project_id'];
        }

        if (!empty($_GET['status'])) {
            // Support comma-separated statuses
            $statuses = explode(',', $_GET['status']);
            $placeholders = implode(',', array_fill(0, count($statuses), '?'));
            $where[] = "status IN ($placeholders)";
            $params = array_merge($params, $statuses);
        }
        if (!empty($_GET['discipline'])) {
            $where[] = "discipline = ?";
            $params[] = $_GET['discipline'];
        }
        if (!empty($_GET['source_tier'])) {
            $where[] = "source_tier = ?";
            $params[] = (int)$_GET['source_tier'];
        }
        if (!empty($_GET['state'])) {
            $where[] = "hq_state = ?";
            $params[] = $_GET['state'];
        }

        $limit = min((int)($_GET['limit'] ?? 50), 200);
        $offset = max((int)($_GET['offset'] ?? 0), 0);

        $whereClause = implode(' AND ', $where);
        $sql = "SELECT * FROM gid_discovery_candidates WHERE $whereClause ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $candidates = $stmt->fetchAll();

        foreach ($candidates as &$c) {
            foreach (['specialties', 'service_areas', 'notable_projects', 'awards', 'publications'] as $jf) {
                $c[$jf] = json_decode($c[$jf] ?? '[]', true);
            }
        }

        $countSql = "SELECT COUNT(*) FROM gid_discovery_candidates WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        jsonResponse(['candidates' => $candidates, 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
    }

    // POST actions
    if ($method === 'POST') {
        $body = getBody();

        // Review a candidate (approve/dismiss)
        if ($id && $action === 'review') {
            $newStatus = $body['status'] ?? null;
            if (!in_array($newStatus, ['pending', 'reviewing', 'approved', 'dismissed'])) {
                errorResponse('Invalid status. Use: pending, reviewing, approved, dismissed');
            }
            $stmt = $pdo->prepare("UPDATE gid_discovery_candidates SET status = ?, reviewed_by = ?, review_notes = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([
                $newStatus,
                $body['reviewed_by'] ?? 'LRA Team',
                $body['review_notes'] ?? null,
                $id
            ]);
            jsonResponse(['success' => true, 'id' => $id, 'status' => $newStatus]);
        }

        // Import candidate to registry
        if ($id && $action === 'import') {
            // Load candidate
            $stmt = $pdo->prepare("SELECT * FROM gid_discovery_candidates WHERE id = ?");
            $stmt->execute([$id]);
            $candidate = $stmt->fetch();
            if (!$candidate) errorResponse('Candidate not found', 404);
            if ($candidate['status'] === 'imported') errorResponse('Already imported');

            // Parse principal name
            $nameParts = explode(' ', trim($candidate['principal_name'] ?? ''), 2);
            $firstName = $nameParts[0] ?? null;
            $lastName = $nameParts[1] ?? null;

            // Map budget tier to values
            $budgetMap = [
                'ultra_luxury' => [10000000, 50000000],
                'luxury'       => [5000000, 15000000],
                'high_end'     => [2000000, 8000000],
                'mid_range'    => [1000000, 3000000],
            ];
            $budgetRange = $budgetMap[$candidate['estimated_budget_tier']] ?? [null, null];

            // Create consultant
            $consultantId = generateUUID();
            $sourceAttribution = json_encode([
                'source_tier' => $candidate['source_tier'],
                'source_type' => $candidate['source_type'],
                'source_url' => $candidate['source_url'],
                'source_name' => $candidate['source_name'],
                'discovery_query' => $candidate['discovery_query'],
                'confidence_score' => $candidate['confidence_score'],
                'discovery_candidate_id' => $candidate['id'],
            ]);

            $stmt = $pdo->prepare("INSERT INTO gid_consultants (
                id, role, first_name, last_name, firm_name,
                specialties, service_areas, hq_city, hq_state, hq_country,
                min_budget, max_budget, website, linkedin_url,
                years_experience, verification_status, active,
                source_of_discovery, source_attribution, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?, 'gid_discovery')");

            $stmt->execute([
                $consultantId,
                $candidate['discipline'],
                $firstName,
                $lastName,
                $candidate['firm_name'],
                $candidate['specialties'] ?? '[]',
                $candidate['service_areas'] ?? '[]',
                $candidate['hq_city'],
                $candidate['hq_state'],
                $candidate['hq_country'],
                $budgetRange[0],
                $budgetRange[1],
                $candidate['website'],
                $candidate['linkedin_url'],
                $candidate['years_experience'],
                $candidate['source_type'],
                $sourceAttribution,
            ]);

            // Create source record
            $sourceId = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO gid_sources (id, consultant_id, source_type, source_name, source_url, discovery_date, notes)
                VALUES (?, ?, ?, ?, ?, CURDATE(), ?)");
            $stmt->execute([
                $sourceId,
                $consultantId,
                $candidate['source_type'],
                $candidate['source_name'],
                $candidate['source_url'],
                'Imported from GID Discovery. Query: ' . ($candidate['discovery_query'] ?? 'Manual'),
            ]);

            // Update candidate record
            $stmt = $pdo->prepare("UPDATE gid_discovery_candidates SET status = 'imported', imported_consultant_id = ?, imported_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$consultantId, $id]);

            // Link consultant to the project that discovered them
            $discProjectId = $candidate['project_id'] ?? ($body['project_id'] ?? null);
            if ($discProjectId && $hasJunctionTable) {
                try {
                    $stmt = $pdo->prepare("INSERT IGNORE INTO gid_project_consultants 
                        (project_id, consultant_id, discipline, source, added_by) 
                        VALUES (?, ?, ?, 'discovery', 'gid_discovery')");
                    $stmt->execute([
                        $discProjectId,
                        $consultantId,
                        $candidate['discipline'],
                    ]);
                } catch (Exception $e) { /* junction table may not exist */ }
            }

            jsonResponse(['success' => true, 'consultant_id' => $consultantId, 'candidate_id' => $id], 201);
        }

        // Batch review (approve/dismiss multiple)
        if (!$id && $action === 'batch_review') {
            $ids = $body['ids'] ?? [];
            $newStatus = $body['status'] ?? null;
            if (empty($ids) || !in_array($newStatus, ['approved', 'dismissed'])) {
                errorResponse('Provide ids array and valid status (approved/dismissed)');
            }
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("UPDATE gid_discovery_candidates SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id IN ($placeholders) AND status != 'imported'");
            $stmt->execute(array_merge([$newStatus, $body['reviewed_by'] ?? 'LRA Team'], $ids));
            jsonResponse(['success' => true, 'updated' => count($ids), 'status' => $newStatus]);
        }

        // Create candidate (manual or from AI)
        if (!$id && !$action) {
            $newId = $body['id'] ?? generateUUID();

            // Check for duplicates (same firm_name + hq_state)
            if (!empty($body['firm_name'])) {
                $stmt = $pdo->prepare("SELECT id, status FROM gid_discovery_candidates WHERE firm_name = ? AND hq_state = ? LIMIT 1");
                $stmt->execute([$body['firm_name'], $body['hq_state'] ?? '']);
                $existing = $stmt->fetch();
                if ($existing) {
                    jsonResponse(['warning' => 'duplicate', 'existing_id' => $existing['id'], 'existing_status' => $existing['status']], 200);
                }
                // Also check main registry
                $stmt = $pdo->prepare("SELECT id FROM gid_consultants WHERE firm_name = ? AND hq_state = ? AND active = 1 LIMIT 1");
                $stmt->execute([$body['firm_name'], $body['hq_state'] ?? '']);
                $existingReg = $stmt->fetch();
                if ($existingReg) {
                    jsonResponse(['warning' => 'already_in_registry', 'consultant_id' => $existingReg['id']], 200);
                }
            }

            if ($hasDiscProjectCol) {
                $stmt = $pdo->prepare("INSERT INTO gid_discovery_candidates (
                    id, project_id, discipline, firm_name, principal_name, hq_city, hq_state, hq_country,
                    website, linkedin_url, specialties, service_areas, estimated_budget_tier,
                    years_experience, notable_projects, awards, publications,
                    source_tier, source_type, source_url, source_name, discovery_query,
                    confidence_score, source_rationale, status, discovered_by, project_context
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                $stmt->execute([
                    $newId,
                    $body['project_id'] ?? null,
                    $body['discipline'] ?? 'architect',
                $body['firm_name'] ?? 'Unknown Firm',
                $body['principal_name'] ?? null,
                $body['hq_city'] ?? null,
                $body['hq_state'] ?? null,
                $body['hq_country'] ?? 'USA',
                $body['website'] ?? null,
                $body['linkedin_url'] ?? null,
                json_encode($body['specialties'] ?? []),
                json_encode($body['service_areas'] ?? []),
                $body['estimated_budget_tier'] ?? null,
                $body['years_experience'] ?? null,
                json_encode($body['notable_projects'] ?? []),
                json_encode($body['awards'] ?? []),
                json_encode($body['publications'] ?? []),
                $body['source_tier'] ?? 3,
                $body['source_type'] ?? 'ai_discovery',
                $body['source_url'] ?? null,
                $body['source_name'] ?? null,
                $body['discovery_query'] ?? null,
                $body['confidence_score'] ?? null,
                $body['source_rationale'] ?? null,
                'pending',
                $body['discovered_by'] ?? 'LRA Team',
                $body['project_context'] ?? null,
            ]);
            } else {
                // Fallback: no project_id column available
                $stmt = $pdo->prepare("INSERT INTO gid_discovery_candidates (
                    id, discipline, firm_name, principal_name, hq_city, hq_state, hq_country,
                    website, linkedin_url, specialties, service_areas, estimated_budget_tier,
                    years_experience, notable_projects, awards, publications,
                    source_tier, source_type, source_url, source_name, discovery_query,
                    confidence_score, source_rationale, status, discovered_by, project_context
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                $stmt->execute([
                    $newId,
                    $body['discipline'] ?? 'architect',
                    $body['firm_name'] ?? 'Unknown Firm',
                    $body['principal_name'] ?? null,
                    $body['hq_city'] ?? null,
                    $body['hq_state'] ?? null,
                    $body['hq_country'] ?? 'USA',
                    $body['website'] ?? null,
                    $body['linkedin_url'] ?? null,
                    json_encode($body['specialties'] ?? []),
                    json_encode($body['service_areas'] ?? []),
                    $body['estimated_budget_tier'] ?? null,
                    $body['years_experience'] ?? null,
                    json_encode($body['notable_projects'] ?? []),
                    json_encode($body['awards'] ?? []),
                    json_encode($body['publications'] ?? []),
                    $body['source_tier'] ?? 3,
                    $body['source_type'] ?? 'ai_discovery',
                    $body['source_url'] ?? null,
                    $body['source_name'] ?? null,
                    $body['discovery_query'] ?? null,
                    $body['confidence_score'] ?? null,
                    $body['source_rationale'] ?? null,
                    'pending',
                    $body['discovered_by'] ?? 'LRA Team',
                    $body['project_context'] ?? null,
                ]);
            }

            jsonResponse(['success' => true, 'id' => $newId], 201);
        }
    }
}

// ============================================================================
// ADMIN CONFIG — Global + project-level BYT configuration
// ============================================================================

if ($entity === 'admin_config') {
    $scope = $_GET['scope'] ?? '';
    $configKey = $_GET['key'] ?? '';
    $configAction = $action ?? '';

    // Ensure byt_global_config table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS byt_global_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
    )");

    // GET — Read global config
    if ($method === 'GET' && $scope === 'global') {
        if ($configKey) {
            // Single key
            $stmt = $pdo->prepare("SELECT config_value FROM byt_global_config WHERE config_key = ?");
            $stmt->execute([$configKey]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                jsonResponse(['key' => $configKey, 'value' => json_decode($row['config_value'], true)]);
            } else {
                jsonResponse(['key' => $configKey, 'value' => null]);
            }
        } else {
            // All global config as a nested object
            $stmt = $pdo->query("SELECT config_key, config_value, updated_at FROM byt_global_config ORDER BY config_key");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $config = [];
            foreach ($rows as $row) {
                $parts = explode('.', $row['config_key']);
                $ref = &$config;
                for ($i = 0; $i < count($parts) - 1; $i++) {
                    if (!isset($ref[$parts[$i]])) $ref[$parts[$i]] = [];
                    $ref = &$ref[$parts[$i]];
                }
                $ref[$parts[count($parts) - 1]] = json_decode($row['config_value'], true);
            }
            jsonResponse(['config' => $config]);
        }
    }

    // POST — Update global config
    if ($method === 'POST' && $scope === 'global' && $configAction === 'update') {
        $body = getBody();
        $key = $body['key'] ?? '';
        $value = $body['value'] ?? null;

        if (!$key) {
            errorResponse('Missing config key');
        }

        $stmt = $pdo->prepare("INSERT INTO byt_global_config (config_key, config_value, updated_by) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_by = VALUES(updated_by)");
        $stmt->execute([$key, json_encode($value), 'admin']);
        jsonResponse(['success' => true, 'key' => $key]);
    }

    // POST — Test API connection
    if ($method === 'POST' && $configAction === 'test_api') {
        $provider = $_GET['provider'] ?? '';
        
        if ($provider === 'anthropic') {
            // Read key from config-secrets
            $keyFile = __DIR__ . '/config-secrets.php';
            if (file_exists($keyFile)) {
                include $keyFile;
                $key = defined('ANTHROPIC_API_KEY') ? ANTHROPIC_API_KEY : null;
                if ($key) {
                    jsonResponse(['ok' => true, 'message' => 'API key configured (server-side validation not available due to IONOS restrictions)']);
                } else {
                    jsonResponse(['error' => 'API key not found in config-secrets.php']);
                }
            } else {
                jsonResponse(['error' => 'config-secrets.php not found']);
            }
        } elseif ($provider === 'rfq') {
            // Can't test outbound from IONOS, return static status
            jsonResponse(['ok' => true, 'message' => 'RFQ endpoint configured (client-side connection test recommended)']);
        } else {
            jsonResponse(['error' => "Unknown provider: $provider"]);
        }
    }

    // GET — Stats for data management card
    if ($method === 'GET' && $configAction === 'stats') {
        $projectId = $_GET['project_id'] ?? 'default';
        
        // Consultant counts — project-scoped if project_id provided
        if ($projectId && $projectId !== 'default' && $hasJunctionTable) {
            $stmt = $pdo->prepare("SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN c.verification_status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN c.verification_status = 'pending' OR c.verification_status IS NULL THEN 1 ELSE 0 END) as pending
                FROM gid_consultants c
                INNER JOIN gid_project_consultants pc ON c.id = pc.consultant_id
                WHERE pc.project_id = ? AND c.active = 1");
            $stmt->execute([$projectId]);
            $consultants = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->query("SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN verification_status = 'pending' OR verification_status IS NULL THEN 1 ELSE 0 END) as pending
                FROM gid_consultants WHERE active = 1");
            $consultants = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Engagement counts (project-scoped via n4s_project_id)
        $engagements = ['active' => 0, 'archived' => 0];
        try {
            $engStmt = $pdo->prepare("SELECT 
                SUM(CASE WHEN contact_status NOT IN ('contracted','withdrawn','declined') THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN contact_status IN ('contracted','withdrawn','declined') THEN 1 ELSE 0 END) as archived
                FROM gid_engagements WHERE n4s_project_id = ?");
            $engStmt->execute([$projectId]);
            $engagements = $engStmt->fetch(PDO::FETCH_ASSOC) ?: $engagements;
        } catch (Exception $e) { /* table may not exist yet */ }

        // Discovery counts — project-scoped
        $discovery = ['pending' => 0, 'imported' => 0, 'rejected' => 0];
        try {
            if ($projectId && $projectId !== 'default' && $hasDiscProjectCol) {
                $discStmt = $pdo->prepare("SELECT 
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'imported' THEN 1 ELSE 0 END) as imported,
                    SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as rejected
                    FROM gid_discovery_candidates WHERE project_id = ?");
                $discStmt->execute([$projectId]);
            } else {
                $discStmt = $pdo->query("SELECT 
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'imported' THEN 1 ELSE 0 END) as imported,
                    SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as rejected
                    FROM gid_discovery_candidates");
            }
            $discovery = $discStmt->fetch(PDO::FETCH_ASSOC) ?: $discovery;
        } catch (Exception $e) { /* table may not exist yet */ }

        jsonResponse([
            'consultants' => [
                'total' => (int)($consultants['total'] ?? 0),
                'verified' => (int)($consultants['verified'] ?? 0),
                'pending' => (int)($consultants['pending'] ?? 0),
            ],
            'engagements' => [
                'active' => (int)($engagements['active'] ?? 0),
                'archived' => (int)($engagements['archived'] ?? 0),
            ],
            'discovery' => [
                'pending' => (int)($discovery['pending'] ?? 0),
                'imported' => (int)($discovery['imported'] ?? 0),
                'rejected' => (int)($discovery['rejected'] ?? 0),
            ],
            'rfq' => [
                'sent' => 0,
                'submitted' => 0,
                'scored' => 0,
            ],
        ]);
    }
}

// If no entity matched
if (empty($entity)) {
    errorResponse('Missing entity parameter. Use: consultants, portfolio, reviews, stats, engagements, discovery, project_consultants, admin_config');
}
