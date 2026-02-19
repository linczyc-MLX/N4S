<?php
/**
 * GID Discovery — AI Search Endpoint
 * 
 * POST /api/gid-discovery-ai.php
 * Body: { discipline, states, budgetTier, styleKeywords, limit }
 * 
 * Calls Claude Sonnet via Anthropic API to find consultant candidates.
 * Returns structured JSON array of candidates.
 * Inserts each into gid_discovery_candidates with status='pending'.
 */

require_once __DIR__ . '/config.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('POST method required', 405);
}

// Anthropic API key — check constant (from config-secrets.php) first, then env var
$ANTHROPIC_API_KEY = defined('ANTHROPIC_API_KEY') ? ANTHROPIC_API_KEY : (getenv('ANTHROPIC_API_KEY') ?: '');

if (empty($ANTHROPIC_API_KEY)) {
    errorResponse('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable or update api/config.php.', 500);
}

$pdo = getDB();
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Validate input
$discipline = $body['discipline'] ?? 'architect';
$states = $body['states'] ?? [];
$budgetTier = $body['budgetTier'] ?? 'luxury';
$styleKeywords = $body['styleKeywords'] ?? [];
$limit = min(max((int)($body['limit'] ?? 10), 1), 20);
$projectContext = $body['projectContext'] ?? null;

$disciplineLabels = [
    'architect' => 'architecture',
    'interior_designer' => 'interior design',
    'pm' => 'project management (luxury residential)',
    'gc' => 'general contracting (luxury residential)',
];
$disciplineLabel = $disciplineLabels[$discipline] ?? $discipline;

$geoFocus = !empty($states) ? implode(', ', $states) : 'Nationwide (USA)';
$styleFocus = !empty($styleKeywords) ? implode(', ', $styleKeywords) : 'Contemporary, Traditional, Transitional';

$budgetTierLabels = [
    'ultra_luxury' => 'Ultra-Luxury ($10M+ projects)',
    'luxury' => 'Luxury ($5M–$15M projects)',
    'high_end' => 'High-End ($2M–$8M projects)',
    'mid_range' => 'Mid-Range ($1M–$3M projects)',
];
$budgetLabel = $budgetTierLabels[$budgetTier] ?? $budgetTier;

// Build the discovery query string for record-keeping
$discoveryQuery = "Find $limit $disciplineLabel firms | Geo: $geoFocus | Budget: $budgetLabel | Style: $styleFocus";

// Build system prompt
$systemPrompt = <<<PROMPT
You are a luxury residential consultant researcher for N4S (Not-4-Sale), an advisory platform serving ultra-high-net-worth families and family offices.

Your task is to identify real, verifiable $disciplineLabel firms matching these criteria:
- Geographic focus: $geoFocus
- Budget tier: $budgetLabel
- Style specialization: $styleFocus
- Number of results requested: $limit

For each firm, provide:
- firm_name (official business name — must be a real, verifiable firm)
- principal_name (lead partner/principal architect or designer)
- hq_city (headquarters city)
- hq_state (headquarters state abbreviation, e.g., "CT", "NY")
- website (URL — must be a real URL you are confident exists)
- specialties (array of 3–5 style/specialty tags)
- service_areas (array of states where they actively work)
- years_experience (estimated years the firm has been operating)
- notable_projects (array of objects: [{name, location, year}] — real projects only)
- awards (array of objects: [{name, year}] — real awards only)
- publications (array of objects: [{publication, year}] — real publications only)
- estimated_budget_tier (one of: ultra_luxury, luxury, high_end, mid_range)
- confidence_score (0–100, your confidence this firm genuinely matches the criteria)
- source_rationale (1–2 sentences explaining why this firm was identified)

CRITICAL RULES:
1. Every firm MUST be real and verifiable. Do not fabricate firm names, projects, or awards.
2. If you cannot find $limit qualifying firms, return fewer. Quality over quantity.
3. Return ONLY a valid JSON array. No markdown, no backticks, no explanatory text.
4. Prioritize firms with demonstrated luxury residential experience.
5. Confidence scores: 90+ = perfect match, 70-89 = strong match, 50-69 = possible match, <50 = stretch.
PROMPT;

// Call Anthropic API
$apiPayload = json_encode([
    'model' => 'claude-sonnet-4-20250514',
    'max_tokens' => 4096,
    'system' => $systemPrompt,
    'messages' => [
        [
            'role' => 'user',
            'content' => "Find $limit $disciplineLabel firms matching: Geographic focus: $geoFocus, Budget tier: $budgetLabel, Style: $styleFocus. Return only the JSON array."
        ]
    ]
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $apiPayload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT => 60,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    errorResponse('AI API connection error: ' . $curlError, 502);
}

if ($httpCode !== 200) {
    $errBody = json_decode($response, true);
    $errMsg = $errBody['error']['message'] ?? "HTTP $httpCode";
    errorResponse('AI API error: ' . $errMsg, 502);
}

// Parse Claude's response
$apiResult = json_decode($response, true);
$textContent = '';
foreach (($apiResult['content'] ?? []) as $block) {
    if (($block['type'] ?? '') === 'text') {
        $textContent .= $block['text'];
    }
}

// Strip any accidental markdown fencing
$textContent = trim($textContent);
$textContent = preg_replace('/^```json\s*/i', '', $textContent);
$textContent = preg_replace('/\s*```$/i', '', $textContent);

$candidates = json_decode($textContent, true);
if (!is_array($candidates)) {
    errorResponse('AI returned invalid JSON. Raw: ' . substr($textContent, 0, 500), 502);
}

// Insert each candidate into gid_discovery_candidates
$insertedIds = [];
$duplicates = [];

$insertStmt = $pdo->prepare("INSERT INTO gid_discovery_candidates (
    id, discipline, firm_name, principal_name, hq_city, hq_state, hq_country,
    website, linkedin_url, specialties, service_areas, estimated_budget_tier,
    years_experience, notable_projects, awards, publications,
    source_tier, source_type, source_url, source_name, discovery_query,
    confidence_score, source_rationale, status, discovered_by, project_context
) VALUES (?, ?, ?, ?, ?, ?, 'USA', ?, ?, ?, ?, ?, ?, ?, ?, ?, 3, 'ai_discovery', ?, 'Claude Sonnet', ?, ?, ?, 'pending', 'LRA Team', ?)");

$dupCheckStmt = $pdo->prepare("SELECT id FROM gid_discovery_candidates WHERE firm_name = ? AND hq_state = ? LIMIT 1");
$regCheckStmt = $pdo->prepare("SELECT id FROM gid_consultants WHERE firm_name = ? AND hq_state = ? AND active = 1 LIMIT 1");

// Generate UUID function
function genUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

foreach ($candidates as $c) {
    $firmName = $c['firm_name'] ?? 'Unknown';
    $hqState = $c['hq_state'] ?? '';

    // Duplicate check in discovery table
    $dupCheckStmt->execute([$firmName, $hqState]);
    if ($dupCheckStmt->fetch()) {
        $duplicates[] = $firmName;
        continue;
    }
    // Duplicate check in registry
    $regCheckStmt->execute([$firmName, $hqState]);
    if ($regCheckStmt->fetch()) {
        $duplicates[] = $firmName . ' (already in registry)';
        continue;
    }

    $candId = genUUID();
    try {
        $insertStmt->execute([
            $candId,
            $discipline,
            $firmName,
            $c['principal_name'] ?? null,
            $c['hq_city'] ?? null,
            $hqState,
            $c['website'] ?? null,
            null, // linkedin_url
            json_encode($c['specialties'] ?? []),
            json_encode($c['service_areas'] ?? []),
            $c['estimated_budget_tier'] ?? $budgetTier,
            $c['years_experience'] ?? null,
            json_encode($c['notable_projects'] ?? []),
            json_encode($c['awards'] ?? []),
            json_encode($c['publications'] ?? []),
            $c['website'] ?? null,
            $discoveryQuery,
            $c['confidence_score'] ?? null,
            $c['source_rationale'] ?? null,
            $projectContext,
        ]);
        $insertedIds[] = $candId;
    } catch (PDOException $e) {
        // Skip on insert error, continue with others
        error_log('[GID Discovery] Insert error for ' . $firmName . ': ' . $e->getMessage());
    }
}

// Return the inserted candidates
$result = [];
if (!empty($insertedIds)) {
    $placeholders = implode(',', array_fill(0, count($insertedIds), '?'));
    $stmt = $pdo->prepare("SELECT * FROM gid_discovery_candidates WHERE id IN ($placeholders) ORDER BY confidence_score DESC");
    $stmt->execute($insertedIds);
    $result = $stmt->fetchAll();
    foreach ($result as &$r) {
        foreach (['specialties', 'service_areas', 'notable_projects', 'awards', 'publications'] as $jf) {
            $r[$jf] = json_decode($r[$jf] ?? '[]', true);
        }
    }
}

jsonResponse([
    'success' => true,
    'candidates' => $result,
    'inserted' => count($insertedIds),
    'duplicates_skipped' => $duplicates,
    'query' => $discoveryQuery,
]);
