<?php
/**
 * GID Module — Database Setup (MariaDB)
 * 
 * Run once to create GID tables. Safe to re-run (uses IF NOT EXISTS).
 * Access: website.not-4.sale/api/gid-setup.php
 */

require_once __DIR__ . '/config.php';

$pdo = getDB();

$queries = [];

// Table 1: gid_consultants
$queries[] = "CREATE TABLE IF NOT EXISTS gid_consultants (
  id VARCHAR(36) PRIMARY KEY,
  role VARCHAR(50) NOT NULL COMMENT 'architect | interior_designer | pm | gc',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  firm_name VARCHAR(200) NOT NULL,
  specialties JSON DEFAULT NULL,
  service_areas JSON DEFAULT NULL,
  hq_city VARCHAR(100),
  hq_state VARCHAR(50),
  hq_country VARCHAR(100) DEFAULT 'USA',
  min_budget DECIMAL(12,2) DEFAULT NULL,
  max_budget DECIMAL(12,2) DEFAULT NULL,
  certifications JSON DEFAULT NULL,
  bio TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  profile_photo_url VARCHAR(255),
  avg_rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  years_experience INT DEFAULT NULL,
  firm_established_year INT DEFAULT NULL,
  team_size INT DEFAULT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending | verified | partner',
  active TINYINT(1) DEFAULT 1,
  source_of_discovery VARCHAR(100) DEFAULT NULL,
  source_attribution TEXT,
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_active (active),
  INDEX idx_rating (avg_rating DESC),
  INDEX idx_verification (verification_status),
  INDEX idx_budget (min_budget, max_budget),
  INDEX idx_state (hq_state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Table 2: gid_portfolio_projects
$queries[] = "CREATE TABLE IF NOT EXISTS gid_portfolio_projects (
  id VARCHAR(36) PRIMARY KEY,
  consultant_id VARCHAR(36) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_state VARCHAR(50),
  location_country VARCHAR(100) DEFAULT 'USA',
  project_type VARCHAR(50) COMMENT 'new_build | renovation | addition | restoration',
  description TEXT,
  budget_min DECIMAL(12,2) DEFAULT NULL,
  budget_max DECIMAL(12,2) DEFAULT NULL,
  completion_year INT DEFAULT NULL,
  square_footage DECIMAL(10,1) DEFAULT NULL,
  lot_acres DECIMAL(8,2) DEFAULT NULL,
  architectural_style VARCHAR(100),
  features JSON DEFAULT NULL,
  featured_in_publications JSON DEFAULT NULL,
  award_winner TINYINT(1) DEFAULT 0,
  award_details VARCHAR(500),
  gallery_photos JSON DEFAULT NULL,
  public_urls JSON DEFAULT NULL,
  is_featured TINYINT(1) DEFAULT 0,
  visibility VARCHAR(50) DEFAULT 'public' COMMENT 'public | partner_only | hidden',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_consultant (consultant_id),
  INDEX idx_style (architectural_style),
  INDEX idx_year (completion_year DESC),
  INDEX idx_location (location_state, location_city),
  FOREIGN KEY (consultant_id) REFERENCES gid_consultants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Table 3: gid_reviews
$queries[] = "CREATE TABLE IF NOT EXISTS gid_reviews (
  id VARCHAR(36) PRIMARY KEY,
  consultant_id VARCHAR(36) NOT NULL,
  portfolio_project_id VARCHAR(36) DEFAULT NULL,
  reviewer_name VARCHAR(255),
  reviewer_project_name VARCHAR(255),
  rating INT CHECK(rating >= 1 AND rating <= 5),
  budget_accuracy_score DECIMAL(2,1) DEFAULT NULL,
  timeline_accuracy_score DECIMAL(2,1) DEFAULT NULL,
  communication_score DECIMAL(2,1) DEFAULT NULL,
  quality_score DECIMAL(2,1) DEFAULT NULL,
  would_recommend TINYINT(1) DEFAULT NULL,
  review_text TEXT,
  verified_client TINYINT(1) DEFAULT 0,
  verified_by_n4s_project_id VARCHAR(100),
  source VARCHAR(50) DEFAULT 'manual' COMMENT 'manual | houzz_import | n4s_verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_consultant (consultant_id),
  INDEX idx_verified (verified_client),
  INDEX idx_rating (rating DESC),
  FOREIGN KEY (consultant_id) REFERENCES gid_consultants(id) ON DELETE CASCADE,
  FOREIGN KEY (portfolio_project_id) REFERENCES gid_portfolio_projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Table 4: gid_engagements
$queries[] = "CREATE TABLE IF NOT EXISTS gid_engagements (
  id VARCHAR(36) PRIMARY KEY,
  n4s_project_id VARCHAR(100) NOT NULL,
  consultant_id VARCHAR(36) NOT NULL,
  discipline VARCHAR(50) NOT NULL,
  match_score INT DEFAULT NULL CHECK(match_score >= 0 AND match_score <= 100),
  client_fit_score INT DEFAULT NULL,
  project_fit_score INT DEFAULT NULL,
  match_breakdown JSON DEFAULT NULL,
  recommended_by VARCHAR(50) DEFAULT 'team_curation',
  contact_status VARCHAR(50) DEFAULT 'shortlisted',
  date_shortlisted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_contacted TIMESTAMP NULL DEFAULT NULL,
  date_responded TIMESTAMP NULL DEFAULT NULL,
  date_meeting TIMESTAMP NULL DEFAULT NULL,
  date_proposal TIMESTAMP NULL DEFAULT NULL,
  date_engaged TIMESTAMP NULL DEFAULT NULL,
  date_contracted TIMESTAMP NULL DEFAULT NULL,
  team_notes TEXT,
  client_feedback TEXT,
  chemistry_score INT DEFAULT NULL,
  project_outcome VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project (n4s_project_id),
  INDEX idx_consultant (consultant_id),
  INDEX idx_status (contact_status),
  INDEX idx_discipline (discipline),
  FOREIGN KEY (consultant_id) REFERENCES gid_consultants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Table 5: gid_sources
$queries[] = "CREATE TABLE IF NOT EXISTS gid_sources (
  id VARCHAR(36) PRIMARY KEY,
  consultant_id VARCHAR(36) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_name VARCHAR(255),
  source_url VARCHAR(500),
  discovery_date DATE DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_consultant (consultant_id),
  INDEX idx_type (source_type),
  FOREIGN KEY (consultant_id) REFERENCES gid_consultants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Table 6: gid_discovery_candidates (Phase 3)
$queries[] = "CREATE TABLE IF NOT EXISTS gid_discovery_candidates (
  id VARCHAR(36) PRIMARY KEY,
  discipline VARCHAR(50) NOT NULL COMMENT 'architect | interior_designer | pm | gc',
  firm_name VARCHAR(200) NOT NULL,
  principal_name VARCHAR(200),
  hq_city VARCHAR(100),
  hq_state VARCHAR(50),
  hq_country VARCHAR(100) DEFAULT 'USA',
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  specialties JSON DEFAULT NULL,
  service_areas JSON DEFAULT NULL,
  estimated_budget_tier VARCHAR(50) COMMENT 'ultra_luxury | luxury | high_end | mid_range',
  years_experience INT DEFAULT NULL,
  notable_projects JSON DEFAULT NULL COMMENT '[{name, location, year}]',
  awards JSON DEFAULT NULL COMMENT '[{name, year}]',
  publications JSON DEFAULT NULL COMMENT '[{publication, year, url}]',
  
  -- Source tracking
  source_tier INT NOT NULL COMMENT '1-5 per GID tier system',
  source_type VARCHAR(100) NOT NULL,
  source_url VARCHAR(500),
  source_name VARCHAR(255),
  discovery_query TEXT COMMENT 'The search query or AI prompt that found this candidate',
  confidence_score INT DEFAULT NULL COMMENT '0-100, AI confidence in relevance',
  source_rationale TEXT COMMENT 'AI explanation for why this candidate was identified',
  
  -- Review workflow
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending | reviewing | approved | dismissed | imported',
  reviewed_by VARCHAR(100),
  review_notes TEXT,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Import tracking
  imported_consultant_id VARCHAR(36) DEFAULT NULL COMMENT 'FK to gid_consultants after import',
  imported_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Metadata
  discovered_by VARCHAR(100),
  project_context VARCHAR(100) COMMENT 'N4S project ID that triggered discovery, if any',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_discipline (discipline),
  INDEX idx_status (status),
  INDEX idx_source_tier (source_tier),
  INDEX idx_state (hq_state),
  INDEX idx_project (project_context),
  FOREIGN KEY (imported_consultant_id) REFERENCES gid_consultants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// Execute all queries
$results = [];
foreach ($queries as $i => $sql) {
    try {
        $pdo->exec($sql);
        // Extract table name from SQL
        preg_match('/CREATE TABLE IF NOT EXISTS (\w+)/', $sql, $matches);
        $tableName = $matches[1] ?? "Query $i";
        $results[] = ['table' => $tableName, 'status' => 'OK'];
    } catch (PDOException $e) {
        preg_match('/CREATE TABLE IF NOT EXISTS (\w+)/', $sql, $matches);
        $tableName = $matches[1] ?? "Query $i";
        $results[] = ['table' => $tableName, 'status' => 'ERROR', 'message' => $e->getMessage()];
    }
}

jsonResponse([
    'success' => true,
    'message' => 'GID database setup complete',
    'tables' => $results,
]);
