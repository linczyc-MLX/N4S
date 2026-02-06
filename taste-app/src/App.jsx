/**
 * Taste Exploration Standalone App - Main Wrapper
 *
 * Reads project context from URL query params:
 * - projectId (required, unless demo mode)
 * - projectName (optional, for display)
 * - respondentType ('principal' | 'secondary')
 * - clientName (optional, for personalization)
 * - demo (optional, 'true' = demo mode, no data loading/saving)
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
  const isDemo = params.get('demo') === 'true';

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

  // Load existing session on mount (skip in demo mode)
  useEffect(() => {
    // Demo mode: skip validation and loading, start fresh
    if (isDemo) {
      console.log('[TasteApp] Demo mode - skipping session load');
      setLoading(false);
      return;
    }

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
  }, [projectId, clientId, isDemo]);

  // Handle progress updates (debounced auto-save, skip in demo mode)
  const handleProgress = useCallback((progressData) => {
    // Demo mode: skip all saves
    if (isDemo) {
      console.log('[TasteApp] Demo mode - skipping session save');
      return;
    }

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
  }, [projectId, clientId, respondentType, clientName, isDemo]);

  // Handle completion (skip profile save in demo mode)
  const handleComplete = useCallback(async (result) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsComplete(true);

    // Demo mode: show demo completion message, don't save
    if (isDemo) {
      console.log('[TasteApp] Demo mode - skipping profile save');
      setCompletionMessage('Demo complete! In a live session, the taste profile would be saved here.');
      return;
    }

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
  }, [projectId, clientId, respondentType, clientName, isDemo]);

  // Handle back/exit
  const handleBack = useCallback(() => {
    const message = isDemo
      ? 'Exit the demo? No data has been saved.'
      : 'Exit the taste exploration? Your progress has been saved.';
    if (window.confirm(message)) {
      window.close();
      // Fallback if window.close() doesn't work (not opened by script)
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }
  }, [isDemo]);

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
    <>
      {isDemo && (
        <div className="demo-banner">
          Demo Mode — No data will be saved
        </div>
      )}
      <TasteExploration
        clientName={isDemo ? 'Demo User' : clientName}
        respondentType={respondentType}
        onComplete={handleComplete}
        onBack={handleBack}
        onProgress={handleProgress}
        initialSelections={initialSession?.selections}
        initialSkipped={initialSession?.skipped}
        initialIndex={initialSession?.currentIndex}
      />
    </>
  );
}

export default App;
