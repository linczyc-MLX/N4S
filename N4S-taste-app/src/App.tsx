import React, { useState, useEffect, useCallback } from 'react';
import { TasteSession, TasteQuad, QuadSelection, CategoryProgress, AppView, StyleMetrics } from './types/tasteTypes';
import { CATEGORIES, SESSION_CONFIG, getImageUrl } from './config/tasteConfig';
import { quads, categoryOrder, getQuadsByCategory } from './data/quadMetadata';
import './App.css';

// Extended AppView to include 'admin' and 'prompt-architect'
type ExtendedAppView = AppView | 'admin' | 'prompt-architect';

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Quad enabled state management
const QUAD_STATE_KEY = 'n4s_quad_enabled_state';

const loadQuadEnabledState = (): Record<string, boolean> => {
  const stored = localStorage.getItem(QUAD_STATE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default: all quads enabled
  const defaultState: Record<string, boolean> = {};
  Object.keys(quads).forEach(quadId => {
    defaultState[quadId] = quads[quadId].enabled;
  });
  return defaultState;
};

const saveQuadEnabledState = (state: Record<string, boolean>) => {
  localStorage.setItem(QUAD_STATE_KEY, JSON.stringify(state));
};

// Get enabled quads for a category using custom state
const getEnabledQuadsForCategory = (categoryId: string, enabledState: Record<string, boolean>): TasteQuad[] => {
  return getQuadsByCategory(categoryId).filter(q => enabledState[q.quadId] !== false);
};

const createNewSession = (enabledState: Record<string, boolean>): TasteSession => {
  const progress: Record<string, CategoryProgress> = {};
  categoryOrder.forEach(catId => {
    const categoryQuads = getEnabledQuadsForCategory(catId, enabledState);
    progress[catId] = {
      categoryId: catId,
      totalQuads: categoryQuads.length,
      completedQuads: 0,
      selections: []
    };
  });
  return {
    sessionId: generateSessionId(),
    startedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    progress,
    currentCategory: categoryOrder[0],
    currentQuadIndex: 0
  };
};

const saveSession = (session: TasteSession) => {
  localStorage.setItem(`${SESSION_CONFIG.storageKeyPrefix}current_session`, JSON.stringify(session));
};

const loadSession = (): TasteSession | null => {
  const stored = localStorage.getItem(`${SESSION_CONFIG.storageKeyPrefix}current_session`);
  return stored ? JSON.parse(stored) : null;
};

const convertToFiveScale = (value: number): number => {
  return Math.round(((value - 1) / 8) * 5 * 10) / 10;
};

const App: React.FC = () => {
  const [view, setView] = useState<ExtendedAppView>('welcome');
  const [previousView, setPreviousView] = useState<ExtendedAppView>('welcome');
  const [session, setSession] = useState<TasteSession | null>(null);
  const [currentQuads, setCurrentQuads] = useState<TasteQuad[]>([]);
  const [quadStartTime, setQuadStartTime] = useState<number>(Date.now());
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});
  const [quadEnabledState, setQuadEnabledState] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [hoverPreview, setHoverPreview] = useState<{url: string, x: number, y: number} | null>(null);
  
  // Prompt Architect state
  const [paCategory, setPaCategory] = useState('LS');
  const [paStyle, setPaStyle] = useState('Modern');
  const [paDensity, setPaDensity] = useState('Medium');
  const [paColors, setPaColors] = useState('Neutral, Warm Lighting');
  const [paPrimaryPrompt, setPaPrimaryPrompt] = useState('');
  const [paSecondaryPrompt, setPaSecondaryPrompt] = useState('');
  const [paRefinement, setPaRefinement] = useState('');
  const [paIsGenerating, setPaIsGenerating] = useState(false);
  const [paIsGeneratingSecondary, setPaIsGeneratingSecondary] = useState(false);
  const [paShowSecondaryForm, setPaShowSecondaryForm] = useState(false);

  // Load quad enabled state on mount
  useEffect(() => {
    const state = loadQuadEnabledState();
    setQuadEnabledState(state);
  }, []);

  // Load session on mount
  useEffect(() => {
    const existing = loadSession();
    if (existing && !existing.completedAt) {
      setSession(existing);
      if (existing.currentCategory && Object.keys(quadEnabledState).length > 0) {
        setCurrentQuads(getEnabledQuadsForCategory(existing.currentCategory, quadEnabledState));
      }
    }
  }, [quadEnabledState]);

  // Auto-save session
  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  // Toggle quad enabled state
  const toggleQuad = (quadId: string) => {
    const newState = {
      ...quadEnabledState,
      [quadId]: !quadEnabledState[quadId]
    };
    setQuadEnabledState(newState);
    saveQuadEnabledState(newState);
  };

  // Toggle all quads in a category
  const toggleAllInCategory = (categoryId: string, enabled: boolean) => {
    const categoryQuads = getQuadsByCategory(categoryId);
    const newState = { ...quadEnabledState };
    categoryQuads.forEach(q => {
      newState[q.quadId] = enabled;
    });
    setQuadEnabledState(newState);
    saveQuadEnabledState(newState);
  };

  // Toggle category expansion in admin
  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Get counts for admin display
  const getEnabledCount = (categoryId: string) => {
    const categoryQuads = getQuadsByCategory(categoryId);
    return categoryQuads.filter(q => quadEnabledState[q.quadId] !== false).length;
  };

  const getTotalEnabledQuads = () => {
    return Object.values(quadEnabledState).filter(v => v !== false).length;
  };

  const getTotalQuads = () => {
    return Object.keys(quads).length;
  };

  const startExploration = () => {
    const newSession = createNewSession(quadEnabledState);
    setSession(newSession);
    setCurrentQuads(getEnabledQuadsForCategory(categoryOrder[0], quadEnabledState));
    setQuadStartTime(Date.now());
    setView('exploration');
  };

  const resumeExploration = () => {
    if (session?.currentCategory) {
      setCurrentQuads(getEnabledQuadsForCategory(session.currentCategory, quadEnabledState));
      setQuadStartTime(Date.now());
      setView('exploration');
    }
  };

  const handleSelection = useCallback((selectedIndex: number) => {
    if (!session || !session.currentCategory) return;
    const currentQuad = currentQuads[session.currentQuadIndex || 0];
    if (!currentQuad) return;

    const selection: QuadSelection = {
      quadId: currentQuad.quadId,
      selectedIndex,
      timestamp: Date.now(),
      timeSpent: Date.now() - quadStartTime
    };

    const updatedProgress = { ...session.progress };
    const catProgress = updatedProgress[session.currentCategory];
    catProgress.selections.push(selection);
    catProgress.completedQuads = catProgress.selections.length;

    const nextQuadIndex = (session.currentQuadIndex || 0) + 1;
    
    if (nextQuadIndex >= currentQuads.length) {
      const currentCatIndex = categoryOrder.indexOf(session.currentCategory);
      const nextCatIndex = currentCatIndex + 1;

      if (nextCatIndex >= categoryOrder.length) {
        setSession({ ...session, progress: updatedProgress, lastUpdatedAt: Date.now(), completedAt: Date.now() });
        setView('analysis');
      } else {
        const nextCategory = categoryOrder[nextCatIndex];
        setSession({ ...session, progress: updatedProgress, currentCategory: nextCategory, currentQuadIndex: 0, lastUpdatedAt: Date.now() });
        setCurrentQuads(getEnabledQuadsForCategory(nextCategory, quadEnabledState));
        setView('category-complete');
      }
    } else {
      setSession({ ...session, progress: updatedProgress, currentQuadIndex: nextQuadIndex, lastUpdatedAt: Date.now() });
    }
    setQuadStartTime(Date.now());
  }, [session, currentQuads, quadStartTime, quadEnabledState]);

  const jumpToCategory = (categoryId: string) => {
    if (!session) return;
    const categoryQuads = getEnabledQuadsForCategory(categoryId, quadEnabledState);
    const progress = session.progress[categoryId];
    setSession({ ...session, currentCategory: categoryId, currentQuadIndex: Math.min(progress.completedQuads, categoryQuads.length - 1), lastUpdatedAt: Date.now() });
    setCurrentQuads(categoryQuads);
    setQuadStartTime(Date.now());
    setView('exploration');
  };

  const continueToNextCategory = () => {
    setQuadStartTime(Date.now());
    setView('exploration');
  };

  const openAdmin = () => {
    setPreviousView(view);
    setView('admin');
  };

  const closeAdmin = () => {
    setView(previousView);
  };

  const calculateStyleMetrics = (): StyleMetrics | null => {
    if (!session) return null;
    let totalCT = 0, totalML = 0, totalWC = 0, count = 0;
    const regionCounts: Record<string, number> = {};
    const materialCounts: Record<string, number> = {};

    Object.values(session.progress).forEach(catProgress => {
      catProgress.selections.forEach(sel => {
        const quad = quads[sel.quadId];
        if (!quad) return;
        if (sel.selectedIndex >= -1 && sel.selectedIndex !== -2) {
          totalCT += quad.metadata.ct;
          totalML += quad.metadata.ml;
          totalWC += quad.metadata.wc;
          count++;
          regionCounts[quad.metadata.region] = (regionCounts[quad.metadata.region] || 0) + 1;
          quad.metadata.materials.forEach(mat => {
            materialCounts[mat] = (materialCounts[mat] || 0) + 1;
          });
        }
      });
    });

    if (count === 0) return null;
    const avgCT = totalCT / count;
    const avgML = totalML / count;
    const avgWC = totalWC / count;

    let styleLabel = '';
    if (avgCT <= 3) styleLabel = avgWC <= 4 ? 'Contemporary Warm' : 'Contemporary Cool';
    else if (avgCT <= 6) styleLabel = 'Transitional';
    else styleLabel = avgWC <= 4 ? 'Traditional Warm' : 'Traditional Classic';
    if (avgML <= 3) styleLabel += ' Minimal';
    else if (avgML >= 7) styleLabel += ' Layered';

    return { avgCT, avgML, avgWC, regionPreferences: regionCounts, materialPreferences: materialCounts, styleLabel };
  };

  const getCurrentCategory = () => {
    if (!session?.currentCategory) return null;
    return CATEGORIES[session.currentCategory as keyof typeof CATEGORIES];
  };

  const getOverallProgress = () => {
    if (!session) return 0;
    let total = 0, completed = 0;
    Object.values(session.progress).forEach(p => { total += p.totalQuads; completed += p.completedQuads; });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const isAllComplete = () => {
    if (!session) return false;
    return categoryOrder.every(catId => session.progress[catId].completedQuads >= session.progress[catId].totalQuads);
  };

  const isCategoryComplete = (categoryId: string) => {
    if (!session) return false;
    return session.progress[categoryId].completedQuads >= session.progress[categoryId].totalQuads;
  };

  const handleImageError = (quadId: string, index: number) => {
    setImageLoadErrors(prev => ({ ...prev, [`${quadId}_${index}`]: true }));
  };

  // Handle N4S logo click - different behavior based on current view
  const handleLogoClick = () => {
    if (view === 'prompt-architect') {
      // From Prompt Architect, go back to previous taste exploration view
      setView(previousView);
    } else if (view === 'exploration') {
      // From Taste Exploration (4 images), go to KYC Design Preferences page
      window.location.href = 'https://home-5019238456.app-ionos.space';
    }
  };

  const renderSidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div 
          className="sidebar-logo" 
          onClick={handleLogoClick}
          style={{ cursor: (view === 'prompt-architect' || view === 'exploration') ? 'pointer' : 'default' }}
        >
          <span className="sidebar-logo-icon">📋</span>
          <span>N4S</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {categoryOrder.map(catId => {
          const cat = CATEGORIES[catId as keyof typeof CATEGORIES];
          const isComplete = session ? isCategoryComplete(catId) : false;
          const isActive = session?.currentCategory === catId && view === 'exploration';
          return (
            <div key={catId} className={`sidebar-item ${isActive ? 'active' : ''}`} onClick={() => session && jumpToCategory(catId)}>
              <span className="sidebar-item-name">{cat.name}</span>
              {isComplete && <span className="sidebar-item-check">☑</span>}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-admin-btn" onClick={openAdmin}>
          ⚙ Admin
        </button>
        {isAllComplete() && (
          <button className="sidebar-complete-btn" onClick={() => setView('analysis')}>Complete</button>
        )}
      </div>
    </aside>
  );

  const renderHeader = () => (
    <header className="top-banner">
      <div className="banner-left">
        <div className="banner-title">Welcome to N4S</div>
        <div className="banner-subtitle">Ultra-Luxury Residential Advisory Platform</div>
      </div>
      <div className="banner-right">Taste Exploration</div>
    </header>
  );

  const renderWelcomeContent = () => (
    <div className="welcome-container">
      <h1>Begin Your Design Journey</h1>
      <p className="welcome-subtitle">Discover your design preferences through a curated visual journey</p>
      <div className="welcome-info">
        <div className="info-item"><span className="info-icon">🖼️</span><span>{getTotalEnabledQuads()} curated design quads</span></div>
        <div className="info-item"><span className="info-icon">📂</span><span>10 categories from living to landscape</span></div>
        <div className="info-item"><span className="info-icon">⏱️</span><span>Approximately 20-30 minutes</span></div>
      </div>
      <div className="welcome-actions">
        <button className="btn-primary" onClick={startExploration}>Begin Exploration</button>
        {session && !session.completedAt && (
          <button className="btn-secondary" onClick={resumeExploration}>Resume ({getOverallProgress()}% complete)</button>
        )}
      </div>
    </div>
  );

  const renderExplorationContent = () => {
    if (!session || !session.currentCategory) return null;
    const currentQuad = currentQuads[session.currentQuadIndex || 0];
    const category = getCurrentCategory();
    if (!currentQuad || !category) return null;

    return (
      <>
        <div className="category-header">
          <h2 className="category-title">{category.name}</h2>
          <span className="category-counter">{(session.currentQuadIndex || 0) + 1} of {currentQuads.length}</span>
        </div>
        <div className="exploration-content">
          <div className="quad-header">
            <h3 className="quad-style-title">{currentQuad.title}</h3>
            <p className="quad-space-type">{currentQuad.subtitle}</p>
          </div>
          <div className="quad-grid">
            {[0, 1, 2, 3].map(index => {
              const hasError = imageLoadErrors[`${currentQuad.quadId}_${index}`];
              return (
                <button key={index} className="quad-image-btn" onClick={() => handleSelection(index)} disabled={hasError}>
                  {hasError ? (
                    <div className="image-error"><span>Image unavailable</span></div>
                  ) : (
                    <img src={getImageUrl(currentQuad.quadId, index)} alt={`Option ${index + 1}`} onError={() => handleImageError(currentQuad.quadId, index)} />
                  )}
                  <div className="image-overlay"><span className="select-label">Select</span></div>
                </button>
              );
            })}
          </div>
          <div className="quad-footer">
            <p className="selection-hint">Click the image that best represents your preference</p>
            <div className="skip-buttons">
              <button className="btn-outline-success" onClick={() => handleSelection(-1)}>All of these work for me</button>
              <span className="skip-divider">or</span>
              <button className="btn-outline-danger" onClick={() => handleSelection(-2)}>None of these appeal to me</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCategoryCompleteContent = () => {
    if (!session?.currentCategory) return null;
    const category = getCurrentCategory();
    const prevCatIndex = categoryOrder.indexOf(session.currentCategory) - 1;
    const prevCategory = prevCatIndex >= 0 ? CATEGORIES[categoryOrder[prevCatIndex] as keyof typeof CATEGORIES] : null;
    if (!category) return null;

    const enabledQuadsInNextCat = getEnabledQuadsForCategory(session.currentCategory, quadEnabledState).length;

    return (
      <div className="category-complete-container">
        <div className="complete-icon">✓</div>
        {prevCategory && <h2>{prevCategory.name} Complete!</h2>}
        <p className="complete-progress">{getOverallProgress()}% of exploration complete</p>
        <div className="next-category">
          <span className="next-label">Next Category</span>
          <div className="next-category-info">
            <span className="category-icon">{category.icon}</span>
            <div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="quad-count">{enabledQuadsInNextCat} selections</span>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={continueToNextCategory}>Continue to {category.name}</button>
      </div>
    );
  };

  const renderAdminContent = () => {
    const totalEnabled = getTotalEnabledQuads();
    const totalQuads = getTotalQuads();
    const disabledCount = totalQuads - totalEnabled;

    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin: Quad Management</h1>
          <button className="admin-back-btn" onClick={closeAdmin}>← Back</button>
        </div>

        <div className="admin-summary">
          <div className="admin-stat">
            <span className="admin-stat-label">Total Quads</span>
            <span className="admin-stat-value">{totalQuads}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Enabled Quads</span>
            <span className="admin-stat-value">{totalEnabled}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Disabled Quads</span>
            <span className={`admin-stat-value ${disabledCount > 0 ? 'warning' : ''}`}>{disabledCount}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Total Images</span>
            <span className="admin-stat-value">{totalEnabled * 4}</span>
          </div>
        </div>

        <div className="admin-categories">
          {categoryOrder.map(catId => {
            const cat = CATEGORIES[catId as keyof typeof CATEGORIES];
            const categoryQuads = getQuadsByCategory(catId);
            const enabledCount = getEnabledCount(catId);
            const isExpanded = expandedCategories[catId];

            return (
              <div key={catId} className="admin-category">
                <div className="admin-category-header" onClick={() => toggleCategoryExpand(catId)}>
                  <div>
                    <span className="admin-category-title">{cat.name}</span>
                    <span className="admin-category-count">
                      {' '}— <span className="enabled">{enabledCount}</span> of {categoryQuads.length} quads enabled ({enabledCount * 4} images)
                    </span>
                  </div>
                  <div className="admin-category-toggle">
                    <button 
                      className="admin-toggle-all-btn" 
                      onClick={(e) => { e.stopPropagation(); toggleAllInCategory(catId, true); }}
                    >
                      Enable All
                    </button>
                    <button 
                      className="admin-toggle-all-btn" 
                      onClick={(e) => { e.stopPropagation(); toggleAllInCategory(catId, false); }}
                    >
                      Disable All
                    </button>
                    <span className={`admin-expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="admin-quads-list">
                    {categoryQuads.map(quad => {
                      const isEnabled = quadEnabledState[quad.quadId] !== false;
                      return (
                        <div key={quad.quadId} className={`admin-quad-item ${!isEnabled ? 'disabled' : ''}`}>
                          <div className="admin-quad-images-list">
                            {[0, 1, 2, 3].map(idx => (
                              <div key={idx} className="admin-quad-image-row">
                                <div 
                                  className="admin-thumb-container"
                                  onMouseEnter={(e) => setHoverPreview({
                                    url: getImageUrl(quad.quadId, idx),
                                    x: e.clientX + 20,
                                    y: Math.min(e.clientY - 100, window.innerHeight - 320)
                                  })}
                                  onMouseMove={(e) => setHoverPreview({
                                    url: getImageUrl(quad.quadId, idx),
                                    x: e.clientX + 20,
                                    y: Math.min(e.clientY - 100, window.innerHeight - 320)
                                  })}
                                  onMouseLeave={() => setHoverPreview(null)}
                                >
                                  <img 
                                    src={getImageUrl(quad.quadId, idx)} 
                                    alt={`${quad.quadId}_${idx}`}
                                    className="admin-quad-thumb"
                                  />
                                </div>
                                <span className="admin-quad-filename">{quad.quadId}_{idx}.png</span>
                              </div>
                            ))}
                          </div>
                          <div className="admin-quad-right">
                            <div className="admin-quad-info">
                              <div className="admin-quad-title">{quad.title}</div>
                              <div className="admin-quad-subtitle">{quad.subtitle}</div>
                              <span className="admin-quad-id">{quad.quadId}</span>
                            </div>
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                checked={isEnabled}
                                onChange={() => toggleQuad(quad.quadId)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="admin-footer">
          <button 
            className="pa-launch-btn"
            onClick={() => { setPreviousView('admin'); setView('prompt-architect'); }}
          >
            ✨ Prompt Architect
          </button>
        </div>
      </div>
    );
  };

  // Prompt Architect categories and styles
  const PA_CATEGORIES = [
    { code: 'LS', label: 'Living Spaces' },
    { code: 'EA', label: 'Exterior Architecture' },
    { code: 'DS', label: 'Dining Space' },
    { code: 'KT', label: 'Kitchens' },
    { code: 'FA', label: 'Family Areas' },
    { code: 'PB', label: 'Primary Bedrooms' },
    { code: 'PBT', label: 'Primary Bathrooms' },
    { code: 'GB', label: 'Guest Bedrooms' },
    { code: 'EL', label: 'Exterior Landscape' },
    { code: 'OL', label: 'Outdoor Living' },
  ];

  const PA_STYLES = [
    'Modern', 'Contemporary', 'Minimalist', 'Industrial',
    'Art Deco', 'Transitional', 'Rustic', 'Scandinavian',
    'Biophilic', 'Mid-Century Modern'
  ];

  const PA_DENSITIES = ['Low', 'Medium', 'High'];

  const MIDJOURNEY_DEFAULTS = ' --ar 4:5 --style raw --s 250';

  // Backend URL - Render production server
  const API_URL = 'https://claude-backend-a0ur.onrender.com/api/claude';

  const generatePrimaryPrompt = async () => {
    setPaIsGenerating(true);
    setPaPrimaryPrompt('');
    setPaSecondaryPrompt('');
    
    const promptText = `You are an expert Midjourney Prompt Engineer for interior architecture. 
Create a sophisticated, detailed Midjourney prompt based on these parameters:
- Category: ${PA_CATEGORIES.find(c => c.code === paCategory)?.label}
- Style: ${paStyle}
- Visual Density: ${paDensity}
- Colors/Mood: ${paColors}

Include details about lighting, textures, camera angle, and rendering style (e.g. '8k', 'unreal engine 5', 'photorealistic').

Format: Just return the raw prompt string, nothing else. Do not include Midjourney parameters like --ar or --style.`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await response.json();
      const generatedText = data.content?.[0]?.text || 'Failed to generate prompt.';
      setPaPrimaryPrompt(generatedText + MIDJOURNEY_DEFAULTS);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setPaPrimaryPrompt('Error generating prompt. Please try again.');
    }
    
    setPaIsGenerating(false);
  };

  const generateSecondaryPrompt = async () => {
    if (!paRefinement.trim() || !paPrimaryPrompt) return;
    
    setPaIsGeneratingSecondary(true);
    
    const cleanPrimary = paPrimaryPrompt.replace(MIDJOURNEY_DEFAULTS, '').trim();
    
    const promptText = `You are an expert Midjourney Prompt Engineer for interior architecture.
Create a secondary variant of the given prompt that maintains family resemblance but introduces subtle refinements.
Keep the same general style and mood, but vary elements based on the refinement direction.
The images should look related but explore different design directions.

Primary prompt: ${cleanPrimary}

Refinement direction: ${paRefinement}

Format: Just return the raw prompt string, nothing else. Do not include Midjourney parameters.`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await response.json();
      const generatedText = data.content?.[0]?.text || 'Failed to generate prompt.';
      setPaSecondaryPrompt(generatedText + MIDJOURNEY_DEFAULTS);
      setPaRefinement('');
      setPaShowSecondaryForm(false);
    } catch (error) {
      console.error('Error generating secondary prompt:', error);
      setPaSecondaryPrompt('Error generating prompt. Please try again.');
    }
    
    setPaIsGeneratingSecondary(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderPromptArchitectContent = () => (
    <div className="prompt-architect-container">
      <div className="pa-header">
        <div>
          <h1>✨ AI Interior Architect</h1>
          <p className="pa-subtitle">Create sophisticated, detailed architectural prompts for Midjourney</p>
        </div>
        <button className="admin-back-btn" onClick={() => setView(previousView)}>← Back</button>
      </div>

      <div className="pa-layout">
        {/* Controls Panel */}
        <div className="pa-controls">
          <div className="pa-section">
            <label className="pa-label">Design Area</label>
            <div className="pa-category-grid">
              {PA_CATEGORIES.map(cat => (
                <button
                  key={cat.code}
                  className={`pa-category-btn ${paCategory === cat.code ? 'active' : ''}`}
                  onClick={() => setPaCategory(cat.code)}
                >
                  <span className="pa-cat-code">{cat.code}</span>
                  <span className="pa-cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pa-section">
            <label className="pa-label">🏛 Architectural Style</label>
            <div className="pa-style-grid">
              {PA_STYLES.map(style => (
                <button
                  key={style}
                  className={`pa-style-btn ${paStyle === style ? 'active' : ''}`}
                  onClick={() => setPaStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="pa-section">
            <label className="pa-label">📊 Visual Density</label>
            <div className="pa-density-group">
              {PA_DENSITIES.map(d => (
                <button
                  key={d}
                  className={`pa-density-btn ${paDensity === d ? 'active' : ''}`}
                  onClick={() => setPaDensity(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pa-section">
            <label className="pa-label">🎨 Color Palette & Mood</label>
            <input
              type="text"
              className="pa-input"
              value={paColors}
              onChange={(e) => setPaColors(e.target.value)}
              placeholder="e.g. Earth tones, soft lighting, accents of gold..."
            />
            <p className="pa-hint">Describe the colors, lighting, and atmosphere you want.</p>
          </div>

          <button
            className="pa-generate-btn"
            onClick={generatePrimaryPrompt}
            disabled={paIsGenerating}
          >
            {paIsGenerating ? '⏳ Crafting Prompt...' : '✨ Generate Prompt'}
          </button>

          <div className="pa-info">
            <span>ℹ️</span>
            <p>Generated prompts are optimized for Midjourney v6. They include lighting, composition, and styling parameters automatically.</p>
          </div>
        </div>

        {/* Results Panel */}
        <div className="pa-results">
          <h2>Current Prompt</h2>
          
          {paPrimaryPrompt ? (
            <div className="pa-prompt-card">
              <div className="pa-prompt-badges">
                <span className="pa-badge primary">{paCategory}</span>
                <span className="pa-badge">{paStyle}</span>
                <span className="pa-badge">{paDensity} Density</span>
              </div>

              <div className="pa-prompt-section">
                <label>PRIMARY PROMPT</label>
                <div className="pa-prompt-text">{paPrimaryPrompt}</div>
                <button className="pa-copy-btn" onClick={() => copyToClipboard(paPrimaryPrompt)}>
                  📋 Copy Primary
                </button>
              </div>

              {paSecondaryPrompt && (
                <div className="pa-prompt-section">
                  <label>SECONDARY PROMPT</label>
                  <div className="pa-prompt-text">{paSecondaryPrompt}</div>
                  <button className="pa-copy-btn" onClick={() => copyToClipboard(paSecondaryPrompt)}>
                    📋 Copy Secondary
                  </button>
                </div>
              )}

              {!paShowSecondaryForm ? (
                <button
                  className="pa-secondary-btn"
                  onClick={() => setPaShowSecondaryForm(true)}
                >
                  ✨ Generate Secondary Variant
                </button>
              ) : (
                <div className="pa-refinement-form">
                  <input
                    type="text"
                    className="pa-input"
                    value={paRefinement}
                    onChange={(e) => setPaRefinement(e.target.value)}
                    placeholder="e.g. Make the furniture more deco inspired..."
                  />
                  <div className="pa-refinement-actions">
                    <button
                      className="pa-generate-btn small"
                      onClick={generateSecondaryPrompt}
                      disabled={paIsGeneratingSecondary || !paRefinement.trim()}
                    >
                      {paIsGeneratingSecondary ? '⏳ Generating...' : '✨ Generate'}
                    </button>
                    <button
                      className="pa-cancel-btn"
                      onClick={() => setPaShowSecondaryForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pa-empty-state">
              <span className="pa-empty-icon">✨</span>
              <h3>No prompts yet</h3>
              <p>Configure your settings and click generate to start creating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDNASlider = (label: string, value: number, leftLabel: string, rightLabel: string) => {
    const fiveScaleValue = convertToFiveScale(value);
    const percentage = ((value - 1) / 8) * 100;
    return (
      <div className="dna-slider">
        <div className="dna-slider-header">
          <span className="dna-slider-label">{label}</span>
          <span className="dna-slider-value">{fiveScaleValue.toFixed(1)}</span>
        </div>
        <div className="dna-slider-track">
          <div className="dna-slider-indicator" style={{ left: `${percentage}%` }} />
        </div>
        <div className="dna-slider-labels"><span>{leftLabel}</span><span>{rightLabel}</span></div>
        <div className="dna-scale-numbers"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
      </div>
    );
  };

  const renderAnalysisContent = () => {
    const metrics = calculateStyleMetrics();
    if (!session || !metrics) return null;
    const topRegions = Object.entries(metrics.regionPreferences).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topMaterials = Object.entries(metrics.materialPreferences).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return (
      <div className="analysis-container">
        <div className="analysis-inner">
          <header className="analysis-header">
            <h1>Your Design Profile</h1>
            <p className="analysis-subtitle">Based on your selections across {categoryOrder.length} categories</p>
          </header>
          <div className="style-label-card">
            <h2>{metrics.styleLabel}</h2>
            <p>Your overall design aesthetic</p>
          </div>
          <div className="design-dna-section">
            <h3>Design DNA</h3>
            {renderDNASlider('Style Era', metrics.avgCT, 'Contemporary', 'Traditional')}
            {renderDNASlider('Material Complexity', metrics.avgML, 'Minimal', 'Layered')}
            {renderDNASlider('Color Temperature', metrics.avgWC, 'Warm', 'Cool')}
          </div>
          <div className="preferences-section">
            <div className="preference-card">
              <h3>Regional Influences</h3>
              <div className="preference-list">
                {topRegions.map(([region, count]) => (
                  <div key={region} className="preference-item">
                    <span className="preference-name">{region.replace(/_/g, ' ')}</span>
                    <span className="preference-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="preference-card">
              <h3>Material Preferences</h3>
              <div className="preference-tags">
                {topMaterials.map(([material, count]) => (
                  <span key={material} className="preference-tag">{material.replace(/_/g, ' ')} ({count})</span>
                ))}
              </div>
            </div>
          </div>
          <div className="analysis-actions">
            <button className="btn-primary" onClick={() => {
              const exportData = { session, metrics: { ...metrics, ctScale5: convertToFiveScale(metrics.avgCT), mlScale5: convertToFiveScale(metrics.avgML), wcScale5: convertToFiveScale(metrics.avgWC) }, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `taste-profile-${session.sessionId}.json`;
              link.click();
            }}>Export Results</button>
            <button className="btn-secondary" onClick={() => { localStorage.removeItem(`${SESSION_CONFIG.storageKeyPrefix}current_session`); setSession(null); setView('welcome'); }}>Start New Session</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="app-layout">
        {renderSidebar()}
        <main className="main-content">
          {renderHeader()}
          <div className="page-content">
            {view === 'welcome' && renderWelcomeContent()}
            {view === 'exploration' && renderExplorationContent()}
            {view === 'category-complete' && renderCategoryCompleteContent()}
            {view === 'analysis' && renderAnalysisContent()}
            {view === 'admin' && renderAdminContent()}
            {view === 'prompt-architect' && renderPromptArchitectContent()}
          </div>
        </main>
      </div>
      {hoverPreview && (
        <div 
          className="admin-thumb-preview"
          style={{ 
            display: 'block',
            left: hoverPreview.x, 
            top: hoverPreview.y 
          }}
        >
          <img src={hoverPreview.url} alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default App;
