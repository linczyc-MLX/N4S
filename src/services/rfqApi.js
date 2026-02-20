/**
 * RFQ API Service — Client-side calls from N4S main app to the RFQ Portal backend.
 * 
 * The RFQ API runs on VPS (rfq.not-4.sale), called via client-side fetch.
 * This bypasses IONOS outbound HTTPS restrictions since it runs in the browser.
 * 
 * All admin routes require x-api-key header.
 */

// RFQ API base URL — the VPS-hosted backend
const RFQ_API_BASE = 'https://rfq.not-4.sale/api';

// Admin API key — stored in localStorage by admin user
function getAdminApiKey() {
  return localStorage.getItem('rfq_admin_api_key') || '';
}

export function setAdminApiKey(key) {
  localStorage.setItem('rfq_admin_api_key', key);
}

async function adminRequest(path, options = {}) {
  const response = await fetch(`${RFQ_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getAdminApiKey(),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `RFQ API request failed (${response.status})`);
  }

  return data;
}

// ── Projects ──────────────────────────────────────────────

export async function rfqSyncProject(projectData) {
  return adminRequest('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

export async function rfqListProjects() {
  return adminRequest('/admin/projects');
}

export async function rfqGetProject(n4sProjectId) {
  return adminRequest(`/admin/projects/${n4sProjectId}`);
}

// ── Invitations ───────────────────────────────────────────

export async function rfqCreateInvitation(data) {
  return adminRequest('/admin/invitations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function rfqListInvitations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminRequest(`/admin/invitations${query ? `?${query}` : ''}`);
}

export async function rfqGetInvitationResponses(invitationId) {
  return adminRequest(`/admin/invitations/${invitationId}/responses`);
}

export async function rfqUpdateInvitation(invitationId, data) {
  return adminRequest(`/admin/invitations/${invitationId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function rfqRegeneratePassword(invitationId) {
  return adminRequest(`/admin/invitations/${invitationId}/regenerate-password`, {
    method: 'POST'
  });
}

// ── Scoring ───────────────────────────────────────────────

export async function rfqComputeScore(invitationId) {
  return adminRequest(`/scoring/compute/${invitationId}`, { method: 'POST' });
}

export async function rfqComputeAllScores(n4sProjectId) {
  return adminRequest(`/scoring/compute-all/${n4sProjectId}`, { method: 'POST' });
}

export async function rfqGetScores(n4sProjectId) {
  return adminRequest(`/scoring/results/${n4sProjectId}`);
}

// ── Synergy ───────────────────────────────────────────────

export async function rfqSimulateSynergy(teamData) {
  return adminRequest('/synergy/simulate', {
    method: 'POST',
    body: JSON.stringify(teamData)
  });
}

export async function rfqSaveTeamConfig(configData) {
  return adminRequest('/synergy/configurations', {
    method: 'POST',
    body: JSON.stringify(configData)
  });
}

export async function rfqListTeamConfigs(n4sProjectId) {
  return adminRequest(`/synergy/configurations/${n4sProjectId}`);
}

export async function rfqDeleteTeamConfig(configId) {
  return adminRequest(`/synergy/configurations/${configId}`, { method: 'DELETE' });
}

// ── Library ───────────────────────────────────────────────

export async function rfqBrowseLibrary(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminRequest(`/library${query ? `?${query}` : ''}`);
}

export async function rfqGetConsultantHistory(consultantId) {
  return adminRequest(`/library/consultant/${consultantId}`);
}

export async function rfqSearchLibrary(q) {
  return adminRequest(`/library/search?q=${encodeURIComponent(q)}`);
}

// ── Health ────────────────────────────────────────────────

export async function rfqHealthCheck() {
  try {
    const response = await fetch(`${RFQ_API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
