/**
 * AlignmentBadges.jsx — Shortlist Alignment Badge Display
 *
 * Shows binary alignment badges instead of fake-precision percentages.
 * Badges: Style Aligned | Budget Aligned | Geographic Aligned | Scale Aligned
 *
 * Logic per handover doc:
 * - Style: consultant AS position within ±2.0 of client AS position
 * - Budget: consultant budget range encompasses project budget (±25%)
 * - Geographic: same state or region
 * - Scale: years_experience ≥ 15 AND budget tier matches
 */

import React from 'react';
import { Palette, DollarSign, MapPin, Layers } from 'lucide-react';

// ============================================================================
// ALIGNMENT CALCULATION
// ============================================================================

/**
 * Compute alignment badges for a consultant against client/project data.
 * Returns array of { key, label, icon, aligned, detail }
 */
export function computeAlignmentBadges(consultant, kycData, fyiData) {
  const badges = [];

  // 1. Style Aligned
  // Client AS position from taste exploration or KYC
  const clientAS = deriveClientASPosition(kycData);
  const consultantAS = deriveConsultantASPosition(consultant);
  const styleAligned = clientAS !== null && consultantAS !== null
    ? Math.abs(clientAS - consultantAS) <= 2.0
    : null; // indeterminate if no data

  badges.push({
    key: 'style',
    label: 'Style Aligned',
    icon: Palette,
    aligned: styleAligned,
    detail: styleAligned === null
      ? 'Insufficient style data'
      : styleAligned
        ? `AS positions within ±2.0`
        : `AS positions differ by ${clientAS !== null && consultantAS !== null ? Math.abs(clientAS - consultantAS).toFixed(1) : '?'}`,
  });

  // 2. Budget Aligned
  const projectBudget = extractProjectBudget(fyiData, kycData);
  const consultantBudgetRange = {
    min: consultant.min_budget || 0,
    max: consultant.max_budget || Infinity,
  };
  const budgetTolerance = projectBudget ? projectBudget * 0.25 : 0;
  const budgetAligned = projectBudget
    ? (consultantBudgetRange.min <= projectBudget + budgetTolerance) &&
      (consultantBudgetRange.max >= projectBudget - budgetTolerance)
    : null;

  badges.push({
    key: 'budget',
    label: 'Budget Aligned',
    icon: DollarSign,
    aligned: budgetAligned,
    detail: budgetAligned === null
      ? 'No project budget set'
      : budgetAligned
        ? 'Within ±25% of project budget'
        : 'Outside budget range',
  });

  // 3. Geographic Aligned
  const projectState = extractProjectState(kycData);
  const consultantState = consultant.hq_state || '';
  const geoAligned = projectState && consultantState
    ? projectState.toLowerCase() === consultantState.toLowerCase() ||
      isSameRegion(projectState, consultantState)
    : null;

  badges.push({
    key: 'geographic',
    label: 'Geographic Aligned',
    icon: MapPin,
    aligned: geoAligned,
    detail: geoAligned === null
      ? 'No location data'
      : geoAligned
        ? consultantState === projectState ? 'Same state' : 'Same region'
        : `${consultantState || 'Unknown'} vs ${projectState}`,
  });

  // 4. Scale Aligned
  const yearsExp = parseInt(consultant.years_experience) || 0;
  const budgetTierMatch = consultantBudgetRange.max >= 5000000; // $5M+ = luxury tier
  const scaleAligned = yearsExp >= 15 && budgetTierMatch;

  badges.push({
    key: 'scale',
    label: 'Scale Aligned',
    icon: Layers,
    aligned: scaleAligned,
    detail: !scaleAligned
      ? yearsExp < 15
        ? `${yearsExp} yrs experience (need 15+)`
        : 'Budget tier mismatch'
      : `${yearsExp}+ yrs, luxury tier`,
  });

  return badges;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function deriveClientASPosition(kycData) {
  // Try taste exploration first
  const tasteResults = kycData?.principal?.designIdentity?.principalTasteResults;
  if (tasteResults?.profile?.scores) {
    const scores = tasteResults.profile.scores;
    // AS position derived from traditional-contemporary axis
    const tradScore = scores.traditional || 0;
    const contScore = scores.contemporary || 0;
    // Map to AS1-AS9 scale (1=ultra traditional, 9=ultra contemporary)
    return 1 + ((contScore - tradScore + 100) / 200) * 8;
  }

  // Fallback to KYC slider data
  const sliders = kycData?.principal?.designIdentity?.stylePreferences;
  if (sliders?.traditionalContemporary !== undefined) {
    // Slider value 0-100 maps to AS1-AS9
    return 1 + (sliders.traditionalContemporary / 100) * 8;
  }

  return null;
}

function deriveConsultantASPosition(consultant) {
  // From structured data
  if (consultant.as_position) return parseFloat(consultant.as_position);

  // From specialties heuristic
  const specs = (consultant.specialties || []).map(s => s.toLowerCase());
  const contemporaryKeywords = ['contemporary', 'modern', 'minimalist', 'avant-garde'];
  const traditionalKeywords = ['traditional', 'classical', 'colonial', 'georgian', 'tudor'];
  const transitionalKeywords = ['transitional', 'eclectic', 'craftsman', 'farmhouse'];

  const contHits = specs.filter(s => contemporaryKeywords.some(k => s.includes(k))).length;
  const tradHits = specs.filter(s => traditionalKeywords.some(k => s.includes(k))).length;
  const transHits = specs.filter(s => transitionalKeywords.some(k => s.includes(k))).length;

  if (contHits + tradHits + transHits === 0) return null;
  if (contHits > tradHits && contHits > transHits) return 7.0;
  if (tradHits > contHits && tradHits > transHits) return 3.0;
  if (transHits > 0) return 5.0;

  return 5.0; // default middle
}

function extractProjectBudget(fyiData, kycData) {
  // FYI budget data
  if (fyiData?.budgetRange?.constructionBudget) {
    return fyiData.budgetRange.constructionBudget;
  }
  // KYC budget
  if (kycData?.principal?.portfolioContext?.estimatedBudget) {
    return kycData.principal.portfolioContext.estimatedBudget;
  }
  return null;
}

function extractProjectState(kycData) {
  const location = kycData?.principal?.portfolioContext?.projectLocation;
  if (location?.state) return location.state;
  if (typeof location === 'string') {
    // Try to extract state from "City, ST" format
    const parts = location.split(',');
    if (parts.length >= 2) return parts[parts.length - 1].trim();
  }
  return null;
}

const US_REGIONS = {
  northeast: ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
  southeast: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
  midwest: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
  southwest: ['AZ', 'NM', 'OK', 'TX'],
  west: ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  midatlantic: ['DC', 'DE', 'MD', 'NJ', 'NY', 'PA'],
};

function isSameRegion(state1, state2) {
  const s1 = state1.toUpperCase().trim();
  const s2 = state2.toUpperCase().trim();
  for (const region of Object.values(US_REGIONS)) {
    if (region.includes(s1) && region.includes(s2)) return true;
  }
  return false;
}


// ============================================================================
// BADGE DISPLAY COMPONENT
// ============================================================================

const AlignmentBadges = ({ consultant, kycData, fyiData, compact = false }) => {
  const badges = computeAlignmentBadges(consultant, kycData, fyiData);

  return (
    <div className={`gid-alignment-badges ${compact ? 'gid-alignment-badges--compact' : ''}`}>
      {badges.map(badge => {
        const Icon = badge.icon;
        const isIndeterminate = badge.aligned === null;

        return (
          <span
            key={badge.key}
            className={`gid-alignment-badge ${
              isIndeterminate
                ? 'gid-alignment-badge--unknown'
                : badge.aligned
                  ? 'gid-alignment-badge--aligned'
                  : 'gid-alignment-badge--misaligned'
            }`}
            title={badge.detail}
          >
            <Icon size={compact ? 12 : 14} />
            {!compact && <span>{badge.label}</span>}
          </span>
        );
      })}
    </div>
  );
};

export default AlignmentBadges;
