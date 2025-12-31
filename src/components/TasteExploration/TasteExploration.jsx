import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, Check, X, RotateCcw,
  Eye, Palette, Home, UtensilsCrossed, Bed, Bath, TreeDeciduous,
  Heart, ThumbsDown
} from 'lucide-react';
import { quads, categories, categoryOrder, getTotalQuadCount } from '../../data/tasteQuads';

// Category icons mapping
const categoryIcons = {
  living_spaces: Home,
  exterior_architecture: Palette,
  dining_spaces: UtensilsCrossed,
  kitchens: UtensilsCrossed,
  primary_bedrooms: Bed,
  primary_bathrooms: Bath,
  exterior_landscape: TreeDeciduous
};

// ============================================================
// QUAD CARD COMPONENT - Option E: Top 2 + Bottom 1
// ============================================================
const QuadCard = ({ quad, selections, onSelectionChange, onSkip, onConfirm, isComplete }) => {
  const [imageErrors, setImageErrors] = useState({});
  
  // selections = { favorites: [index, index], least: index | null }
  const { favorites = [], least = null } = selections || {};
  
  const handleImageClick = (index) => {
    // If already selected as favorite, remove it
    if (favorites.includes(index)) {
      onSelectionChange({
        favorites: favorites.filter(i => i !== index),
        least
      });
      return;
    }
    
    // If already selected as least favorite, remove it
    if (least === index) {
      onSelectionChange({
        favorites,
        least: null
      });
      return;
    }
    
    // If we don't have 2 favorites yet, add as favorite
    if (favorites.length < 2) {
      onSelectionChange({
        favorites: [...favorites, index],
        least
      });
      return;
    }
    
    // If we have 2 favorites but no least, add as least
    if (least === null) {
      onSelectionChange({
        favorites,
        least: index
      });
    }
  };

  const getSelectionType = (index) => {
    if (favorites.includes(index)) {
      return favorites.indexOf(index) === 0 ? 'favorite-1' : 'favorite-2';
    }
    if (least === index) return 'least';
    return null;
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const selectionsComplete = favorites.length === 2 && least !== null;
  
  // Determine current instruction
  const getInstruction = () => {
    if (favorites.length === 0) return 'Select your 2 favorite images';
    if (favorites.length === 1) return 'Select 1 more favorite';
    if (least === null) return 'Now select your least favorite';
    return 'Ready to confirm';
  };

  return (
    <div className="taste-quad">
      <div className="taste-quad__header">
        <h3 className="taste-quad__title">{quad.title}</h3>
        <p className="taste-quad__subtitle">{quad.variation}</p>
      </div>
      
      {/* Instruction reminder */}
      <div className={`taste-quad__instruction ${selectionsComplete ? 'taste-quad__instruction--complete' : ''}`}>
        {getInstruction()}
        <span className="taste-quad__tap-hint">Tap a selection to change it</span>
      </div>
      
      <div className="taste-quad__grid">
        {[0, 1, 2, 3].map((index) => {
          const selectionType = getSelectionType(index);
          
          return (
            <div 
              key={index}
              className={`taste-quad__image-wrapper ${selectionType ? `taste-quad__image-wrapper--${selectionType}` : ''}`}
              onClick={() => handleImageClick(index)}
            >
              {imageErrors[index] ? (
                <div className="taste-quad__image-placeholder">
                  <Eye size={32} />
                  <span>Image unavailable</span>
                </div>
              ) : (
                <img
                  src={quad.images[index]}
                  alt={`${quad.title} - Option ${String.fromCharCode(65 + index)}`}
                  className="taste-quad__image"
                  onError={() => handleImageError(index)}
                  loading="lazy"
                />
              )}
              
              <div className="taste-quad__image-label">
                {String.fromCharCode(65 + index)}
              </div>
              
              {selectionType === 'favorite-1' && (
                <div className="taste-quad__selection-badge taste-quad__selection-badge--fav1">
                  <Heart size={20} /> 1st
                </div>
              )}
              {selectionType === 'favorite-2' && (
                <div className="taste-quad__selection-badge taste-quad__selection-badge--fav2">
                  <Heart size={20} /> 2nd
                </div>
              )}
              {selectionType === 'least' && (
                <div className="taste-quad__selection-badge taste-quad__selection-badge--least">
                  <ThumbsDown size={20} />
                </div>
              )}
              
              <div className="taste-quad__image-title">
                {quad.labels[index]}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="taste-quad__actions">
        <button 
          className="taste-quad__skip-btn"
          onClick={onSkip}
          title="None of these resonate with me"
        >
          <X size={16} /> Skip - Not My Style
        </button>
        
        {(favorites.length > 0 || least !== null) && (
          <button 
            className="taste-quad__reset-btn"
            onClick={() => onSelectionChange({ favorites: [], least: null })}
            title="Clear all selections"
          >
            <RotateCcw size={16} /> Reset
          </button>
        )}
        
        <button 
          className={`taste-quad__confirm-btn ${selectionsComplete ? 'taste-quad__confirm-btn--ready' : ''}`}
          onClick={onConfirm}
          disabled={!selectionsComplete}
        >
          <Check size={16} /> Confirm & Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================
// CATEGORY DIVIDER COMPONENT
// ============================================================
const CategoryDivider = ({ category, categoryIndex, totalCategories, quadCount, onContinue, isFirstCategory }) => {
  const categoryData = categories[category];
  const Icon = categoryIcons[category] || Palette;
  
  return (
    <div className="taste-divider">
      <div className="taste-divider__progress">
        Category {categoryIndex + 1} of {totalCategories}
      </div>
      
      <div className="taste-divider__icon" style={{ backgroundColor: categoryData.color }}>
        <Icon size={48} />
      </div>
      
      <h2 className="taste-divider__title">{categoryData.name}</h2>
      <p className="taste-divider__description">{categoryData.description}</p>
      
      <div className="taste-divider__info">
        <span>{quadCount} comparison{quadCount > 1 ? 's' : ''} in this category</span>
      </div>
      
      {/* Instructions - more prominent on first category */}
      {isFirstCategory ? (
        <div className="taste-divider__instructions">
          <h4>How It Works</h4>
          <div className="taste-divider__instruction-steps">
            <div className="taste-divider__step">
              <span className="taste-divider__step-icon taste-divider__step-icon--fav">❤️</span>
              <span><strong>Step 1:</strong> Tap your <strong>2 favorite</strong> images</span>
            </div>
            <div className="taste-divider__step">
              <span className="taste-divider__step-icon taste-divider__step-icon--least">👎</span>
              <span><strong>Step 2:</strong> Tap your <strong>least favorite</strong> image</span>
            </div>
            <div className="taste-divider__step">
              <span className="taste-divider__step-icon taste-divider__step-icon--confirm">✓</span>
              <span><strong>Step 3:</strong> Press <strong>Confirm</strong> to continue</span>
            </div>
          </div>
          <p className="taste-divider__tip">
            💡 You can tap any selection to change it before confirming
          </p>
        </div>
      ) : (
        <p className="taste-divider__instruction">
          Select your <strong>2 favorites</strong>, then your <strong>least favorite</strong>, and confirm.
        </p>
      )}
      
      <button className="taste-divider__btn" onClick={onContinue}>
        Begin {categoryData.name}
      </button>
    </div>
  );
};

// ============================================================
// RESULTS SUMMARY COMPONENT
// ============================================================
const ResultsSummary = ({ selections, skipped, onRestart }) => {
  const calculateProfile = useMemo(() => {
    // Initialize scores
    const scores = {
      warmth: 0,
      formality: 0,
      drama: 0,
      tradition: 0,
      openness: 0,
      art_focus: 0,
      materials: {}
    };
    
    // Weight values for Option E (Top 2 + Bottom 1)
    const FAVORITE_1_WEIGHT = 4.0;  // Strong positive
    const FAVORITE_2_WEIGHT = 2.5;  // Positive
    const LEAST_WEIGHT = -2.0;      // Negative signal
    
    let totalWeight = 0;
    
    // Process each selection
    Object.entries(selections).forEach(([quadId, selection]) => {
      const quad = quads.find(q => q.quadId === quadId);
      if (!quad || !quad.attributes || !selection) return;
      
      const { favorites = [], least } = selection;
      
      // Process favorites
      favorites.forEach((imageIndex, position) => {
        const weight = position === 0 ? FAVORITE_1_WEIGHT : FAVORITE_2_WEIGHT;
        totalWeight += Math.abs(weight);
        
        // Score attributes
        Object.entries(quad.attributes).forEach(([attr, values]) => {
          if (Array.isArray(values) && values[imageIndex] !== undefined) {
            if (attr === 'material_focus') {
              const material = values[imageIndex];
              scores.materials[material] = (scores.materials[material] || 0) + weight;
            } else if (scores[attr] !== undefined) {
              scores[attr] += values[imageIndex] * weight;
            }
          }
        });
      });
      
      // Process least favorite (negative weight)
      if (least !== null && least !== undefined) {
        totalWeight += Math.abs(LEAST_WEIGHT);
        
        Object.entries(quad.attributes).forEach(([attr, values]) => {
          if (Array.isArray(values) && values[least] !== undefined) {
            if (attr === 'material_focus') {
              const material = values[least];
              scores.materials[material] = (scores.materials[material] || 0) + LEAST_WEIGHT;
            } else if (scores[attr] !== undefined) {
              scores[attr] += values[least] * LEAST_WEIGHT;
            }
          }
        });
      }
    });
    
    // Normalize scores to 1-10 scale
    const normalizedScores = {};
    ['warmth', 'formality', 'drama', 'tradition', 'openness', 'art_focus'].forEach(attr => {
      normalizedScores[attr] = totalWeight > 0 
        ? Math.min(10, Math.max(1, Math.round((scores[attr] / totalWeight + 5) * 10) / 10))
        : 5;
    });
    
    // Get top materials (filter out negatives)
    const topMaterials = Object.entries(scores.materials)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([material]) => material);
    
    return {
      scores: normalizedScores,
      topMaterials,
      completedQuads: Object.keys(selections).length,
      skippedQuads: skipped.length,
      totalQuads: quads.length
    };
  }, [selections, skipped]);

  const getScoreLabel = (score) => {
    if (score >= 8) return 'High';
    if (score >= 6) return 'Moderate-High';
    if (score >= 4) return 'Moderate';
    if (score >= 2) return 'Moderate-Low';
    return 'Low';
  };

  return (
    <div className="taste-results">
      <div className="taste-results__header">
        <Check size={48} className="taste-results__icon" />
        <h2>Taste Exploration Complete</h2>
        <p>Your aesthetic preferences have been captured</p>
      </div>

      <div className="taste-results__stats">
        <div className="taste-results__stat">
          <span className="taste-results__stat-value">{calculateProfile.completedQuads}</span>
          <span className="taste-results__stat-label">Quads Ranked</span>
        </div>
        <div className="taste-results__stat">
          <span className="taste-results__stat-value">{calculateProfile.skippedQuads}</span>
          <span className="taste-results__stat-label">Skipped</span>
        </div>
      </div>

      <div className="taste-results__profile">
        <h3>Your Design Profile</h3>
        
        <div className="taste-results__axes">
          {Object.entries(calculateProfile.scores).map(([axis, score]) => (
            <div key={axis} className="taste-results__axis">
              <div className="taste-results__axis-header">
                <span className="taste-results__axis-name">
                  {axis.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className="taste-results__axis-value">{score}/10</span>
              </div>
              <div className="taste-results__axis-bar">
                <div 
                  className="taste-results__axis-fill" 
                  style={{ width: `${score * 10}%` }}
                />
              </div>
              <span className="taste-results__axis-label">{getScoreLabel(score)}</span>
            </div>
          ))}
        </div>

        {calculateProfile.topMaterials.length > 0 && (
          <div className="taste-results__materials">
            <h4>Material Affinities</h4>
            <div className="taste-results__material-tags">
              {calculateProfile.topMaterials.map(material => (
                <span key={material} className="taste-results__material-tag">
                  {material.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="taste-results__restart-btn" onClick={onRestart}>
        <RotateCcw size={16} /> Start Over
      </button>
    </div>
  );
};

// ============================================================
// MAIN TASTE EXPLORATION COMPONENT
// ============================================================
const TasteExploration = ({ clientName, respondentType, onComplete, onBack }) => {
  // Build sequence of quads grouped by category
  const sequence = useMemo(() => {
    const seq = [];
    let quadIndex = 0;
    
    categoryOrder.forEach((categoryKey, catIndex) => {
      const categoryQuads = quads.filter(q => q.category === categoryKey);
      if (categoryQuads.length === 0) return;
      
      // Add divider
      seq.push({
        type: 'divider',
        category: categoryKey,
        categoryIndex: catIndex,
        quadCount: categoryQuads.length
      });
      
      // Add quads
      categoryQuads.forEach(quad => {
        seq.push({
          type: 'quad',
          quad,
          globalIndex: quadIndex++
        });
      });
    });
    
    return seq;
  }, []);

  const totalCategories = categoryOrder.filter(cat => 
    quads.some(q => q.category === cat)
  ).length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState({}); // { quadId: { favorites: [idx, idx], least: idx } }
  const [skipped, setSkipped] = useState([]); // [quadId, ...]
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = sequence[currentIndex];
  const totalQuads = getTotalQuadCount();
  const completedCount = Object.keys(selections).length + skipped.length;
  const overallProgress = Math.round((completedCount / totalQuads) * 100);

  // Handle selection change for a quad
  const handleSelectionChange = useCallback((quadId, selection) => {
    setSelections(prev => ({
      ...prev,
      [quadId]: selection
    }));
  }, []);

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Complete
      setIsComplete(true);
      if (onComplete) {
        onComplete({
          selections,
          skipped,
          completedAt: new Date().toISOString()
        });
      }
    }
  }, [currentIndex, sequence.length, selections, skipped, onComplete]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Handle skip (must be after goToNext)
  const handleSkip = useCallback((quadId) => {
    setSkipped(prev => [...prev, quadId]);
    // Remove from selections if it was there
    setSelections(prev => {
      const updated = { ...prev };
      delete updated[quadId];
      return updated;
    });
    // Auto-advance
    goToNext();
  }, [goToNext]);

  // Handle confirm - explicit advance when user confirms their selection
  const handleConfirm = useCallback((quadId) => {
    const selection = selections[quadId];
    if (selection && selection.favorites?.length === 2 && selection.least !== null) {
      goToNext();
    }
  }, [selections, goToNext]);

  // Restart
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelections({});
    setSkipped([]);
    setIsComplete(false);
  };

  // Completed view
  if (isComplete) {
    return (
      <div className="taste-exploration">
        <ResultsSummary 
          selections={selections}
          skipped={skipped}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="taste-exploration">
      {/* Header */}
      <div className="taste-exploration__header">
        <div className="taste-exploration__info">
          <span className="taste-exploration__client">
            {clientName || 'Client'} • {respondentType === 'secondary' ? 'Secondary' : 'Principal'}
          </span>
          <div className="taste-exploration__progress-bar">
            <div 
              className="taste-exploration__progress-fill" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="taste-exploration__progress-text">
            {completedCount} of {totalQuads} complete ({overallProgress}%)
          </span>
        </div>
        
        {onBack && (
          <button className="taste-exploration__back-btn" onClick={onBack}>
            <ChevronLeft size={20} /> Exit
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="taste-exploration__content">
        {currentItem?.type === 'divider' && (
          <CategoryDivider
            category={currentItem.category}
            categoryIndex={currentItem.categoryIndex}
            totalCategories={totalCategories}
            quadCount={currentItem.quadCount}
            onContinue={goToNext}
            isFirstCategory={currentItem.categoryIndex === 0}
          />
        )}
        
        {currentItem?.type === 'quad' && (
          <QuadCard
            quad={currentItem.quad}
            selections={selections[currentItem.quad.quadId] || { favorites: [], least: null }}
            onSelectionChange={(selection) => handleSelectionChange(currentItem.quad.quadId, selection)}
            onSkip={() => handleSkip(currentItem.quad.quadId)}
            onConfirm={() => handleConfirm(currentItem.quad.quadId)}
            isComplete={
              selections[currentItem.quad.quadId]?.favorites?.length === 2 && 
              selections[currentItem.quad.quadId]?.least !== null
            }
          />
        )}
      </div>

      {/* Navigation - Previous only, Confirm is now in QuadCard */}
      {currentItem?.type === 'quad' && (
        <div className="taste-exploration__nav taste-exploration__nav--simple">
          <button 
            className="taste-exploration__nav-btn"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
        </div>
      )}
    </div>
  );
};

export default TasteExploration;
