/**
 * API service for Taste Exploration
 * Calls the taste.php endpoint on website.not-4.sale (cross-origin)
 */

const API_BASE = 'https://website.not-4.sale/api/taste.php';

/**
 * Helper for GET requests
 */
async function apiGet(action, params = {}) {
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Helper for POST requests
 */
async function apiPost(action, body) {
  const url = new URL(API_BASE);
  url.searchParams.set('action', action);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Load existing session for a client
 * @param {string} projectId - Project identifier
 * @param {string} clientId - Client identifier (e.g., projectId_principal)
 * @returns {Promise<{session: object|null}>}
 */
export async function loadSession(projectId, clientId) {
  try {
    return await apiGet('session', { projectId, clientId });
  } catch (err) {
    console.warn('Failed to load session:', err);
    return { session: null };
  }
}

/**
 * Save session state (selections, skipped, currentIndex)
 * @param {string} projectId - Project identifier
 * @param {string} clientId - Client identifier
 * @param {object} sessionData - Session data to save
 */
export async function saveSession(projectId, clientId, sessionData) {
  return apiPost('save-session', { projectId, clientId, sessionData });
}

/**
 * Save completed profile
 * @param {string} projectId - Project identifier
 * @param {string} clientId - Client identifier
 * @param {object} profileData - Profile data including scores, topMaterials, etc.
 */
export async function saveProfile(projectId, clientId, profileData) {
  return apiPost('save-profile', { projectId, clientId, profileData });
}

/**
 * Load full taste exploration data for a project
 * @param {string} projectId - Project identifier
 * @returns {Promise<{quadEnabledState: object, sessions: object, profiles: object}>}
 */
export async function loadTasteData(projectId) {
  return apiGet('data', { projectId });
}
