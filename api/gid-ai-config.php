<?php
/**
 * GID Discovery — AI Config Endpoint
 * Returns the Anthropic API key for client-side AI calls.
 * Key is stored in config-secrets.php (not in git).
 */
require_once __DIR__ . '/config.php';

// Load secrets directly as fallback
$secretsFile = __DIR__ . '/config-secrets.php';
if (!defined('ANTHROPIC_API_KEY') && file_exists($secretsFile)) {
    require_once $secretsFile;
}

if (!defined('ANTHROPIC_API_KEY') || empty(ANTHROPIC_API_KEY)) {
    jsonResponse(['error' => 'ANTHROPIC_API_KEY not configured. Ensure config-secrets.php exists in /api/ with define(\'ANTHROPIC_API_KEY\', \'sk-ant-...\')'], 500);
}

jsonResponse(['key' => ANTHROPIC_API_KEY]);
