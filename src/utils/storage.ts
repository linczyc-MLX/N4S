// Storage utility for N4S application
// Uses window.storage API when available (Claude Artifacts)
// Falls back to localStorage for regular web hosting

import { Client, ClientProfileData, WorkstreamProgress } from '../types';

const STORAGE_PREFIX = 'n4s:';

// Check if window.storage API is available
const hasWindowStorage = typeof window !== 'undefined' && 
                         window.storage !== undefined;

// LocalStorage adapter that mimics window.storage API
const localStorageAdapter = {
  async get(key: string): Promise<{ key: string; value: string } | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    } catch (error) {
      console.error('localStorage get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<{ key: string; value: string } | null> {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      console.error('localStorage set error:', error);
      return null;
    }
  },

  async delete(key: string): Promise<{ key: string; deleted: boolean } | null> {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      console.error('localStorage delete error:', error);
      return null;
    }
  },

  async list(prefix: string): Promise<{ keys: string[] } | null> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return { keys };
    } catch (error) {
      console.error('localStorage list error:', error);
      return null;
    }
  }
};

// Use window.storage if available, otherwise use localStorage adapter
const storage = hasWindowStorage 
  ? {
      get: (key: string, shared: boolean) => window.storage.get(key, shared),
      set: (key: string, value: string, shared: boolean) => window.storage.set(key, value, shared),
      delete: (key: string, shared: boolean) => window.storage.delete(key, shared),
      list: (prefix: string, shared: boolean) => window.storage.list(prefix, shared)
    }
  : {
      get: (key: string) => localStorageAdapter.get(key),
      set: (key: string, value: string) => localStorageAdapter.set(key, value),
      delete: (key: string) => localStorageAdapter.delete(key),
      list: (prefix: string) => localStorageAdapter.list(prefix)
    };

// Helper to handle storage operations with error handling
async function safeStorageOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const result = await operation();
    return result || fallback;
  } catch (error) {
    console.error('Storage operation failed:', error);
    return fallback;
  }
}

// Client operations
export async function saveClient(client: Client): Promise<boolean> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}client:${client.id}`;
    const result = await storage.set(key, JSON.stringify(client), false);
    return result !== null;
  }, false);
}

export async function getClient(clientId: string): Promise<Client | null> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}client:${clientId}`;
    const result = await storage.get(key, false);
    return result ? JSON.parse(result.value) : null;
  }, null);
}

export async function getAllClients(): Promise<Client[]> {
  return safeStorageOperation(async () => {
    const result = await storage.list(`${STORAGE_PREFIX}client:`, false);
    if (!result || !result.keys) return [];
    
    const clients: Client[] = [];
    for (const key of result.keys) {
      try {
        const data = await storage.get(key, false);
        if (data) {
          clients.push(JSON.parse(data.value));
        }
      } catch (e) {
        console.error(`Failed to load client from key ${key}:`, e);
      }
    }
    
    // Sort by most recently updated
    return clients.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, []);
}

export async function deleteClient(clientId: string): Promise<boolean> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}client:${clientId}`;
    const result = await storage.delete(key, false);
    return result !== null;
  }, false);
}

// Client profile data operations
export async function saveClientProfile(
  clientId: string,
  data: ClientProfileData
): Promise<boolean> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}profile:${clientId}`;
    const result = await storage.set(key, JSON.stringify(data), false);
    return result !== null;
  }, false);
}

export async function getClientProfile(
  clientId: string
): Promise<ClientProfileData | null> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}profile:${clientId}`;
    const result = await storage.get(key, false);
    return result ? JSON.parse(result.value) : null;
  }, null);
}

// Workstream progress tracking
export async function saveWorkstreamProgress(
  progress: WorkstreamProgress
): Promise<boolean> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}progress:${progress.clientId}:${progress.workstreamId}`;
    const result = await storage.set(key, JSON.stringify(progress), false);
    return result !== null;
  }, false);
}

export async function getWorkstreamProgress(
  clientId: string,
  workstreamId: string
): Promise<WorkstreamProgress | null> {
  return safeStorageOperation(async () => {
    const key = `${STORAGE_PREFIX}progress:${clientId}:${workstreamId}`;
    const result = await storage.get(key, false);
    return result ? JSON.parse(result.value) : null;
  }, null);
}

// Get all progress for a client
export async function getClientProgress(clientId: string): Promise<WorkstreamProgress[]> {
  return safeStorageOperation(async () => {
    const result = await storage.list(`${STORAGE_PREFIX}progress:${clientId}:`, false);
    if (!result || !result.keys) return [];
    
    const progress: WorkstreamProgress[] = [];
    for (const key of result.keys) {
      try {
        const data = await storage.get(key, false);
        if (data) {
          progress.push(JSON.parse(data.value));
        }
      } catch (e) {
        console.error(`Failed to load progress from key ${key}:`, e);
      }
    }
    
    return progress;
  }, []);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Portfolio context helpers
export function getKYCWeight(portfolioContext: string): number {
  switch (portfolioContext) {
    case 'forever': return 0.7;
    case '5-year': return 0.3;
    case '10-year': return 0.5;
    case 'investment': return 0.2;
    default: return 0.5;
  }
}

export function getKYMWeight(portfolioContext: string): number {
  return 1 - getKYCWeight(portfolioContext);
}

export function getPortfolioContextLabel(context: string): string {
  switch (context) {
    case 'forever': return 'Forever Home';
    case '5-year': return '5-Year Hold';
    case '10-year': return '10-Year Hold';
    case 'investment': return 'Investment Property';
    default: return context;
  }
}

export function getPathLabel(path: string): string {
  switch (path) {
    case 'B1': return 'Buying';
    case 'B2': return 'Build';
    case 'B3': return 'Bespoke';
    default: return path;
  }
}
