import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Check, X, RotateCcw,
  Eye, Palette, Home, UtensilsCrossed, Bed, Bath, TreeDeciduous
} from 'lucide-react';
import { quads, categories, categoryOrder, RANK_WEIGHTS, SKIP_WEIGHT, getTotalQuadCount } from '../../data/tasteQuads';

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
// QUAD CARD COMPONENT
// ============================================================
const QuadCard = ({ quad, ranking, onSelect, onSkip }) => {
  const [imageErrors, setImageErrors] = useState({});
  
  const handleImageClick = (index) => {
    if (ranking.includes(index)) {
      // Already ranked - remove it and all after
      const position = ranking.indexOf(index);
      onSelect(ranking.slice(0, position));
    } else {
      // Add to ranking
      onSelect([...ranking, index]);
    }
  };

  const getRankPosition = (index) => {
    const pos = ranking.indexOf(index);
    return pos >= 0 ? pos + 1 : null;
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="taste-quad">
      <div className="taste-quad__header">
        <h3 className="taste-quad__title">{quad.title}</h3>
        <p className="taste-quad__subtitle">{quad.variation}</p>
      </div>
      
      <div className="taste-quad__grid">
        {[0, 1, 2, 3].map((index) => {
          const rank = getRankPosition(index);
          const isRanked = rank !== null;
          
          return (
            <div 
              key={index}
              className={`taste-quad__image-wrapper ${isRanked ? 'taste-quad__image-wrapper--ranked' : ''}`}
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
              
              {isRanked && (
                <div className={`taste-quad__rank-badge taste-quad__rank-badge--${rank}`}>
                  {rank}
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
          title="Not My Style - Skip this quad"
        >
          <X size={16} /> Not My Style
        </button>
        
        {ranking.length > 0 && (
          <button 
            className="taste-quad__reset-btn"
            onClick={() => onSelect([])}
            title="Reset selections"
          >
            <RotateCcw size={16} /> Reset
          </button>
        )}
        
        <div className="taste-quad__progress-hint">
          {ranking.length === 0 && 'Tap images in order of preference (1st to 4th)'}
          {ranking.length > 0 && ranking.length < 4 && `${4 - ranking.length} more to complete`}
          {ranking.length === 4 && <span className="taste-quad__complete"><Check size={16} /> Complete</span>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CATEGORY DIVIDER COMPONENT
// ============================================================
const CategoryDivider = ({ category, categoryIndex, totalCategories, quadCount, onContinue }) => {
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
      
      <p className="taste-divider__instruction">
        For each set of four images, tap them in order of preference—from your favorite (1st) to least favorite (4th).
      </p>
      
      <button className="taste-divider__btn" onClick={onContinue}>
        Begin {categoryData.name}
      </button>
    </div>
  );
};

// ============================================================
// RESULTS SUMMARY COMPONENT
// ============================================================
const ResultsSummary = ({ rankings, skipped, onRestart }) => {
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
    
    let totalWeight = 0;
    
    // Process each ranking
    Object.entries(rankings).forEach(([quadId, ranking]) => {
      const quad = quads.find(q => q.quadId === quadId);
      if (!quad || !quad.attributes) return;
      
      ranking.forEach((imageIndex, position) => {
        const weight = RANK_WEIGHTS[position + 1] || 1;
        totalWeight += weight;
        
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
    });
    
    // Normalize scores to 1-10 scale
    const normalizedScores = {};
    ['warmth', 'formality', 'drama', 'tradition', 'openness', 'art_focus'].forEach(attr => {
      normalizedScores[attr] = totalWeight > 0 
        ? Math.round((scores[attr] / totalWeight) * 10) / 10 
        : 5;
    });
    
    // Get top materials
    const topMaterials = Object.entries(scores.materials)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([material]) => material);
    
    return {
      scores: normalizedScores,
      topMaterials,
      completedQuads: Object.keys(rankings).length,
      skippedQuads: skipped.length,
      totalQuads: quads.length
    };
  }, [rankings, skipped]);

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
  const [rankings, setRankings] = useState({}); // { quadId: [imageIndex, ...] }
  const [skipped, setSkipped] = useState([]); // [quadId, ...]
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = sequence[currentIndex];
  const totalQuads = getTotalQuadCount();
  const completedCount = Object.keys(rankings).length + skipped.length;
  const overallProgress = Math.round((completedCount / totalQuads) * 100);

  // Handle ranking selection
  const handleRankingChange = useCallback((quadId, ranking) => {
    setRankings(prev => ({
      ...prev,
      [quadId]: ranking
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
          rankings,
          skipped,
          completedAt: new Date().toISOString()
        });
      }
    }
  }, [currentIndex, sequence.length, rankings, skipped, onComplete]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Handle skip (must be after goToNext)
  const handleSkip = useCallback((quadId) => {
    setSkipped(prev => [...prev, quadId]);
    // Remove from rankings if it was there
    setRankings(prev => {
      const updated = { ...prev };
      delete updated[quadId];
      return updated;
    });
    // Auto-advance
    goToNext();
  }, [goToNext]);

  // Auto-advance when quad is complete
  useEffect(() => {
    if (currentItem?.type === 'quad') {
      const quadId = currentItem.quad.quadId;
      const ranking = rankings[quadId];
      if (ranking && ranking.length === 4) {
        // Short delay before advancing
        const timer = setTimeout(goToNext, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [rankings, currentItem, goToNext]);

  // Restart
  const handleRestart = () => {
    setCurrentIndex(0);
    setRankings({});
    setSkipped([]);
    setIsComplete(false);
  };

  // Completed view
  if (isComplete) {
    return (
      <div className="taste-exploration">
        <ResultsSummary 
          rankings={rankings}
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
          />
        )}
        
        {currentItem?.type === 'quad' && (
          <QuadCard
            quad={currentItem.quad}
            ranking={rankings[currentItem.quad.quadId] || []}
            onSelect={(ranking) => handleRankingChange(currentItem.quad.quadId, ranking)}
            onSkip={() => handleSkip(currentItem.quad.quadId)}
          />
        )}
      </div>

      {/* Navigation */}
      {currentItem?.type === 'quad' && (
        <div className="taste-exploration__nav">
          <button 
            className="taste-exploration__nav-btn"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          <button 
            className="taste-exploration__nav-btn taste-exploration__nav-btn--next"
            onClick={goToNext}
            disabled={!(rankings[currentItem.quad.quadId]?.length === 4 || skipped.includes(currentItem.quad.quadId))}
          >
            {currentIndex === sequence.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TasteExploration;
