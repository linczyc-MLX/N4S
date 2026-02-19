<?php
/**
 * GID Discovery — AI Proxy Endpoint
 * 
 * Proxies AI requests to Anthropic API with server-side key injection.
 * The API key NEVER leaves the server. The frontend sends the full
 * messages payload; this endpoint adds the key and forwards to Anthropic.
 * 
 * Uses file_get_contents (stream context) as primary method since
 * IONOS shared hosting blocks outbound cURL.
 * Falls back to cURL if file_get_contents fails.
 * 
 * POST /api/gid-ai-proxy.php
 * Body: { model, max_tokens, system, messages }
 * Returns: Anthropic API response (passthrough)
 */

require_once __DIR__ . '/config.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'POST method required'], 405);
}

// Load API key from secrets (server-side only — never exposed to client)
$secretsFile = __DIR__ . '/config-secrets.php';
if (!defined('ANTHROPIC_API_KEY') && file_exists($secretsFile)) {
    require_once $secretsFile;
}

if (!defined('ANTHROPIC_API_KEY') || empty(ANTHROPIC_API_KEY)) {
    jsonResponse(['error' => 'AI service not configured'], 500);
}

// Read the request body
$body = json_decode(file_get_contents('php://input'), true);
if (!$body || !isset($body['messages'])) {
    jsonResponse(['error' => 'Invalid request: messages required'], 400);
}

// Whitelist allowed fields — don't blindly forward everything
$apiPayload = [
    'model'      => $body['model'] ?? 'claude-sonnet-4-20250514',
    'max_tokens' => min((int)($body['max_tokens'] ?? 4096), 8192),
    'messages'   => $body['messages'],
];

// Optional system prompt
if (!empty($body['system'])) {
    $apiPayload['system'] = $body['system'];
}

$jsonPayload = json_encode($apiPayload);
$anthropicUrl = 'https://api.anthropic.com/v1/messages';

$headers = [
    'Content-Type: application/json',
    'x-api-key: ' . ANTHROPIC_API_KEY,
    'anthropic-version: 2023-06-01',
];

// ---- METHOD 1: file_get_contents with stream context ----
// This often works on shared hosting where cURL is blocked for outbound
$response = null;
$httpCode = 0;
$method = 'none';

if (ini_get('allow_url_fopen')) {
    $streamHeaders = implode("\r\n", $headers);
    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => $streamHeaders,
            'content' => $jsonPayload,
            'timeout' => 90,
            'ignore_errors' => true,  // Don't throw on 4xx/5xx
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);

    $response = @file_get_contents($anthropicUrl, false, $context);

    if ($response !== false) {
        $method = 'stream';
        // Extract HTTP status from response headers
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $h) {
                if (preg_match('/^HTTP\/[\d.]+ (\d+)/', $h, $m)) {
                    $httpCode = (int)$m[1];
                }
            }
        }
        if ($httpCode === 0) $httpCode = 200;
    }
}

// ---- METHOD 2: cURL fallback ----
if ($response === null || $response === false) {
    if (function_exists('curl_init')) {
        $ch = curl_init($anthropicUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $jsonPayload,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 90,
            CURLOPT_CONNECTTIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        $curlErrno = curl_errno($ch);
        curl_close($ch);

        if ($curlError) {
            error_log("[GID AI Proxy] cURL error $curlErrno: $curlError");
            jsonResponse([
                'error' => [
                    'type' => 'proxy_error',
                    'message' => "AI service connection failed (cURL: $curlError)",
                ]
            ], 502);
        }
        $method = 'curl';
    }
}

// ---- No method worked ----
if ($response === null || $response === false) {
    error_log('[GID AI Proxy] All connection methods failed');
    jsonResponse([
        'error' => [
            'type' => 'proxy_error',
            'message' => 'AI service unavailable. Server cannot make outbound HTTPS requests.',
        ]
    ], 502);
}

// Log which method succeeded (for diagnostics)
error_log("[GID AI Proxy] Success via $method, HTTP $httpCode");

// Forward the response as-is
http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;
exit;
