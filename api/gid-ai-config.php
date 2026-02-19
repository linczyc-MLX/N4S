<?php
/**
 * GID Discovery — AI Config Endpoint
 * Returns the Anthropic API key for client-side AI calls.
 * Key is stored in config-secrets.php (not in git).
 */
require_once __DIR__ . '/config.php';

if (!defined('ANTHROPIC_API_KEY') || empty(ANTHROPIC_API_KEY)) {
    jsonResponse(['error' => 'ANTHROPIC_API_KEY not configured in config-secrets.php'], 500);
}

jsonResponse(['key' => ANTHROPIC_API_KEY]);
