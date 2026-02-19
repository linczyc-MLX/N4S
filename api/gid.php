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
        
        // Filter: role
        if (!empty($_GET['role'])) {
            $where[] = "role = ?";
            $params[] = $_GET['role'];
        }
        
        // Filter: active only (default true)
        if (($_GET['active'] ?? '1') === '1') {
            $where[] = "active = 1";
        }
        
        // Filter: verification status
        if (!empty($_GET['verification'])) {
            $where[] = "verification_status = ?";
            $params[] = $_GET['verification'];
        }
        
        // Filter: state
        if (!empty($_GET['state'])) {
            $where[] = "hq_state = ?";
            $params[] = $_GET['state'];
        }
        
        // Filter: search (firm name or last name)
        if (!empty($_GET['search'])) {
            $where[] = "(firm_name LIKE ? OR last_name LIKE ? OR first_name LIKE ?)";
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
        $sql = "SELECT * FROM gid_consultants WHERE $whereClause ORDER BY $sortField $sortDir LIMIT $limit OFFSET $offset";
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
        $countSql = "SELECT COUNT(*) FROM gid_consultants WHERE $whereClause";
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
    
    // Total consultants
    $stmt = $pdo->query("SELECT COUNT(*) FROM gid_consultants WHERE active = 1");
    $stats['totalActive'] = (int)$stmt->fetchColumn();
    
    // By role
    $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM gid_consultants WHERE active = 1 GROUP BY role");
    $stats['byRole'] = $stmt->fetchAll();
    
    // By verification status
    $stmt = $pdo->query("SELECT verification_status, COUNT(*) as count FROM gid_consultants WHERE active = 1 GROUP BY verification_status");
    $stats['byVerification'] = $stmt->fetchAll();
    
    // By state (top 10)
    $stmt = $pdo->query("SELECT hq_state, COUNT(*) as count FROM gid_consultants WHERE active = 1 AND hq_state IS NOT NULL GROUP BY hq_state ORDER BY count DESC LIMIT 10");
    $stats['byState'] = $stmt->fetchAll();
    
    // Total portfolio projects
    $stmt = $pdo->query("SELECT COUNT(*) FROM gid_portfolio_projects");
    $stats['totalProjects'] = (int)$stmt->fetchColumn();
    
    // Total reviews
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
                          'date_contacted', 'date_responded', 'date_meeting', 'date_proposal',
                          'date_engaged', 'date_contracted'];

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

// If no entity matched
if (empty($entity)) {
    errorResponse('Missing entity parameter. Use: consultants, portfolio, reviews, stats, engagements');
}
