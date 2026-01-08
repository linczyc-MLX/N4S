<?php
// Database setup script - run once to create tables
require_once 'config.php';

$pdo = getDB();

// Create projects table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
");

// Create project_data table (stores full JSON data for each project)
$pdo->exec("
    CREATE TABLE IF NOT EXISTS project_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(36) NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        data_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_data (project_id, data_type)
    )
");

// Create app_state table (stores global app state like active project)
$pdo->exec("
    CREATE TABLE IF NOT EXISTS app_state (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_key VARCHAR(100) UNIQUE NOT NULL,
        state_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
");

jsonResponse([
    'success' => true,
    'message' => 'Database tables created successfully',
    'tables' => ['projects', 'project_data', 'app_state']
]);
?>
