/**
 * CandidateCard.jsx — Discovery Candidate Display Card
 * 
 * Displays a discovery candidate with source tier badge,
 * confidence score bar, notable projects, and action buttons.
 */

import React, { useState } from 'react';
import {
  MapPin, Briefcase, Globe, Award, BookOpen, ChevronDown, ChevronUp,
  Eye, Check, X, Upload, ExternalLink, Star,
} from 'lucide-react';

// Source tier configuration
const SOURCE_TIERS = {
  1: { label: 'T1 – Direct', color: '#2e7d32', bg: '#e8f5e9' },
  2: { label: 'T2 – Professional', color: '#1976d2', bg: '#e3f2fd' },
  3: { label: 'T3 – Research', color: '#1e3a5f', bg: '#e8edf3' },
  4: { label: 'T4 – Secondary', color: '#6b6b6b', bg: '#f0f0f0' },
  5: { label: 'T5 – Referral', color: '#c9a227', bg: '#fdf6e3' },
};

const STATUS_STYLES = {
  pending:   { label: 'Pending Review', color: '#f57c00', bg: '#fff3e0' },
  reviewing: { label: 'Under Review', color: '#1976d2', bg: '#e3f2fd' },
  approved:  { label: 'Approved', color: '#2e7d32', bg: '#e8f5e9' },
  dismissed: { label: 'Dismissed', color: '#d32f2f', bg: '#fce4ec' },
  imported:  { label: 'Imported', color: '#1e3a5f', bg: '#e8edf3' },
};

const DISCIPLINE_LABELS = {
  architect: 'Architect',
  interior_designer: 'Interior Designer',
  pm: 'Project Manager',
  gc: 'General Contractor',
};

const CandidateCard = ({
  candidate,
  selected = false,
  onSelect,
  onApprove,
  onDismiss,
  onImport,
  onPreview,
  showActions = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  const tier = SOURCE_TIERS[candidate.source_tier] || SOURCE_TIERS[3];
  const status = STATUS_STYLES[candidate.status] || STATUS_STYLES.pending;
  const confidence = candidate.confidence_score || 0;
  const notableProjects = candidate.notable_projects || [];
  const awards = candidate.awards || [];
  const specialties = candidate.specialties || [];

  return (
    <div className={`gid-candidate-card ${selected ? 'gid-candidate-card--selected' : ''} ${candidate.status === 'dismissed' ? 'gid-candidate-card--dismissed' : ''}`}>
      {/* Header row */}
      <div className="gid-candidate-card__header">
        <div className="gid-candidate-card__header-left">
          {onSelect && candidate.status !== 'imported' && candidate.status !== 'dismissed' && (
            <label className="gid-candidate-card__checkbox">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(candidate.id)}
              />
              <span className="gid-candidate-card__checkmark" />
            </label>
          )}
          <span className="gid-source-tier-badge" style={{ color: tier.color, background: tier.bg }}>
            {tier.label}
          </span>
          {candidate.discipline && (
            <span className="gid-candidate-card__discipline">
              {DISCIPLINE_LABELS[candidate.discipline] || candidate.discipline}
            </span>
          )}
        </div>
        <span className="gid-candidate-card__status" style={{ color: status.color, background: status.bg }}>
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="gid-candidate-card__body">
        <h3 className="gid-candidate-card__firm">{candidate.firm_name}</h3>
        {candidate.principal_name && (
          <p className="gid-candidate-card__principal">{candidate.principal_name}</p>
        )}

        <div className="gid-candidate-card__meta">
          {(candidate.hq_city || candidate.hq_state) && (
            <span className="gid-meta-item">
              <MapPin size={12} />
              {[candidate.hq_city, candidate.hq_state].filter(Boolean).join(', ')}
            </span>
          )}
          {candidate.years_experience && (
            <span className="gid-meta-item">
              <Briefcase size={12} />
              {candidate.years_experience} yrs
            </span>
          )}
          {candidate.website && (
            <a
              href={candidate.website}
              target="_blank"
              rel="noopener noreferrer"
              className="gid-meta-item gid-meta-item--link"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe size={12} />
              Website
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="gid-candidate-card__tags">
            {specialties.slice(0, 5).map((s, i) => (
              <span key={i} className="gid-tag">{s}</span>
            ))}
            {specialties.length > 5 && (
              <span className="gid-tag gid-tag--more">+{specialties.length - 5}</span>
            )}
          </div>
        )}

        {/* Confidence bar */}
        {confidence > 0 && (
          <div className="gid-confidence-bar">
            <div className="gid-confidence-bar__label">
              <span>Match confidence</span>
              <span className="gid-confidence-bar__value">{confidence}%</span>
            </div>
            <div className="gid-confidence-bar__track">
              <div
                className="gid-confidence-bar__fill"
                style={{
                  width: `${confidence}%`,
                  background: confidence >= 80 ? '#2e7d32' : confidence >= 60 ? '#f57c00' : '#d32f2f',
                }}
              />
            </div>
          </div>
        )}

        {/* Source rationale */}
        {candidate.source_rationale && (
          <p className="gid-candidate-card__rationale">{candidate.source_rationale}</p>
        )}

        {/* Expandable details */}
        {(notableProjects.length > 0 || awards.length > 0) && (
          <button
            className="gid-candidate-card__expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less details' : `${notableProjects.length} projects, ${awards.length} awards`}
          </button>
        )}

        {expanded && (
          <div className="gid-candidate-card__details">
            {notableProjects.length > 0 && (
              <div className="gid-candidate-card__detail-section">
                <h4><Star size={12} /> Notable Projects</h4>
                <ul>
                  {notableProjects.map((p, i) => (
                    <li key={i}>
                      <strong>{p.name}</strong>
                      {p.location && <span> — {p.location}</span>}
                      {p.year && <span className="gid-candidate-card__year"> ({p.year})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {awards.length > 0 && (
              <div className="gid-candidate-card__detail-section">
                <h4><Award size={12} /> Awards</h4>
                <ul>
                  {awards.map((a, i) => (
                    <li key={i}>
                      {a.name}
                      {a.year && <span className="gid-candidate-card__year"> ({a.year})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && candidate.status !== 'imported' && (
        <div className="gid-candidate-card__actions">
          {candidate.status === 'pending' && (
            <>
              {onApprove && (
                <button className="gid-btn gid-btn--success-sm" onClick={() => onApprove(candidate)} title="Approve for import">
                  <Check size={14} /> Approve
                </button>
              )}
              {onDismiss && (
                <button className="gid-btn gid-btn--ghost gid-btn--danger" onClick={() => onDismiss(candidate)} title="Dismiss">
                  <X size={14} /> Dismiss
                </button>
              )}
            </>
          )}
          {candidate.status === 'approved' && onImport && (
            <button className="gid-btn gid-btn--primary" onClick={() => onImport(candidate)} title="Import to Registry">
              <Upload size={14} /> Import to Registry
            </button>
          )}
          {candidate.status === 'dismissed' && onApprove && (
            <button className="gid-btn gid-btn--ghost" onClick={() => onApprove(candidate)} title="Reconsider">
              Reconsider
            </button>
          )}
        </div>
      )}

      {/* Imported link */}
      {candidate.status === 'imported' && candidate.imported_consultant_id && (
        <div className="gid-candidate-card__imported-link">
          <Check size={14} />
          <span>Imported to Registry</span>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
