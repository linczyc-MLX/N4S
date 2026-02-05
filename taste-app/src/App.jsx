/**
 * Taste Exploration Standalone App - Main Wrapper
 *
 * Reads project context from URL query params:
 * - projectId (required)
 * - projectName (optional, for display)
 * - respondentType ('principal' | 'secondary')
 * - clientName (optional, for personalization)
 *
 * Handles session persistence via API calls to website.not-4.sale/api/taste.php
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import TasteExploration from './TasteExploration';
import { loadSession, saveSession, saveProfile } from './api';

function App() {
  // Parse query params
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('projectId');
  const projectName = params.get('projectName') || 'Project';
  const respondentType = params.get('respondentType') || 'principal';
  const clientName = params.get('clientName') || projectName;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialSession, setInitialSession] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);

  // Generate a stable clientId from projectId + respondentType
  const clientId = projectId ? `${projectId}_${respondentType}` : null;

  // Debounce ref for auto-save
  const saveTimeoutRef = useRef(null);

  // Load existing session on mount
  useEffect(() => {
    if (!projectId) {
      setError('Missing projectId parameter. This link may be invalid.');
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const sessionResult = await loadSession(projectId, clientId);
        if (sessionResult.session) {
          console.log('[TasteApp] Loaded existing session:', sessionResult.session);
          setInitialSession(sessionResult.session);
        }
      } catch (err) {
        console.warn('[TasteApp] Failed to load session:', err);
        // Non-fatal: start fresh
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [projectId, clientId]);

  // Handle progress updates (debounced auto-save)
  const handleProgress = useCallback((progressData) => {
    if (!projectId || !clientId) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 2 seconds
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveSession(projectId, clientId, {
          ...progressData,
          respondentType,
          clientName,
          updatedAt: new Date().toISOString()
        });
        console.log('[TasteApp] Session auto-saved');
      } catch (err) {
        console.error('[TasteApp] Failed to save session:', err);
      }
    }, 2000);
  }, [projectId, clientId, respondentType, clientName]);

  // Handle completion
  const handleComplete = useCallback(async (result) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsComplete(true);

    try {
      await saveProfile(projectId, clientId, {
        ...result.profile,
        selections: result.selections,
        skipped: result.skipped,
        respondentType,
        clientName,
        completedAt: result.completedAt
      });
      console.log('[TasteApp] Profile saved successfully');
      setCompletionMessage('Your taste profile has been saved successfully!');
    } catch (err) {
      console.error('[TasteApp] Failed to save profile:', err);
      setCompletionMessage('Your exploration is complete. There was an issue saving, but your results have been recorded locally.');
    }
  }, [projectId, clientId, respondentType, clientName]);

  // Handle back/exit
  const handleBack = useCallback(() => {
    if (window.confirm('Exit the taste exploration? Your progress has been saved.')) {
      window.close();
      // Fallback if window.close() doesn't work (not opened by script)
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ color: '#1a365d', marginBottom: '1rem' }}>Configuration Error</h2>
          <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>{error}</p>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>
            Please contact your advisor for a valid exploration link.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner"></div>
      </div>
    );
  }

  return (
    <TasteExploration
      clientName={clientName}
      respondentType={respondentType}
      onComplete={handleComplete}
      onBack={handleBack}
      onProgress={handleProgress}
      initialSelections={initialSession?.selections}
      initialSkipped={initialSession?.skipped}
      initialIndex={initialSession?.currentIndex}
    />
  );
}

export default App;
