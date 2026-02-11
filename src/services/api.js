// API Service for N4S Database
// Connects to the PHP backend on IONOS
// Both sites (website.not-4.sale and home-5019238456.app-ionos.space) use this same API

// Detect environment and use appropriate API URL
// FTP site (website.not-4.sale) has PHP backend, IONOS site needs to call FTP API
const API_BASE_URL = window.location.hostname.includes('ionos.space') 
    ? 'https://website.not-4.sale/api' 
  : '/api';
class ApiService {
  constructor() {
        this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Projects API
  async getProjects() {
    return this.request('/projects.php');
  }

  async getProject(id) {
    return this.request(`/projects.php?id=${encodeURIComponent(id)}`);
  }

  async createProject(projectData) {
    return this.request('/projects.php', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    // Use POST with action=update to avoid hosting blocking PUT method
    return this.request(`/projects.php?id=${encodeURIComponent(id)}&action=update`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    // Use POST with action=delete to avoid hosting blocking DELETE method
    return this.request(`/projects.php?id=${encodeURIComponent(id)}&action=delete`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // App State API
  async getState(key = null) {
    const endpoint = key ? `/state.php?key=${encodeURIComponent(key)}` : '/state.php';
    return this.request(endpoint);
  }

  async setState(key, value) {
    return this.request('/state.php', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async deleteState(key) {
    // Use POST with action=delete to avoid hosting blocking DELETE method
    return this.request(`/state.php?key=${encodeURIComponent(key)}&action=delete`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Setup database (run once)
  async setupDatabase() {
    return this.request('/setup.php');
  }

  // ========================================================================
  // Auth API
  // ========================================================================
  async login(username, password) {
    return this.request('/auth.php?action=login', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth.php?action=logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  async checkSession() {
    return this.request('/auth.php?action=check', {
      credentials: 'include',
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth.php?action=change_password', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // ========================================================================
  // Users API (Admin)
  // ========================================================================
  async getUsers() {
    return this.request('/users.php', { credentials: 'include' });
  }

  async createUser(userData) {
    return this.request('/users.php', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users.php?id=${encodeURIComponent(id)}&action=update`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(userData),
    });
  }

  async resetUserPassword(id, newPassword) {
    return this.request(`/users.php?id=${encodeURIComponent(id)}&action=reset_password`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  async deleteUser(id) {
    return this.request(`/users.php?id=${encodeURIComponent(id)}&action=delete`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({}),
    });
  }

  // Health check
  async healthCheck() {
    try {
      await this.getState('_health');
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Export singleton instance
const api = new ApiService();
export default api;

// Also export class for testing
export { ApiService };
