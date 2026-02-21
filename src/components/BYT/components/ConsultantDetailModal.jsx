/**
 * ConsultantDetailModal.jsx — Full profile overlay for a consultant
 */

import React from 'react';
import {
  X, Edit2, MapPin, Briefcase, Star, Phone, Mail, Globe, Linkedin,
  Award, Calendar, Users, ExternalLink, CheckCircle2, Clock, Image
} from 'lucide-react';

const DISCIPLINES = {
  architect: { label: 'Architect', color: '#315098' },
  interior_designer: { label: 'Interior Designer', color: '#8CA8BE' },
  pm: { label: 'Project Manager', color: '#AFBDB0' },
  gc: { label: 'General Contractor', color: '#C4A484' },
};

const ConsultantDetailModal = ({ consultant, onClose, onEdit }) => {
  if (!consultant) return null;

  const discipline = DISCIPLINES[consultant.role] || { label: consultant.role, color: '#6b6b6b' };
  const portfolio = consultant.portfolio || [];
  const reviews = consultant.reviews || [];
  const sources = consultant.sources || [];

  return (
    <div className="byt-modal-overlay" onClick={onClose}>
      <div className="byt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="byt-modal__header">
          <div>
            <span className="byt-modal__discipline" style={{ background: discipline.color }}>
              {discipline.label}
            </span>
            <h2 className="byt-modal__title">{consultant.firm_name}</h2>
            {(consultant.first_name || consultant.last_name) && (
              <p className="byt-modal__subtitle">{consultant.first_name} {consultant.last_name}</p>
            )}
          </div>
          <div className="byt-modal__header-actions">
            <button className="byt-btn byt-btn--outline" onClick={() => onEdit(consultant)}>
              <Edit2 size={14} /> Edit
            </button>
            <button className="byt-btn byt-btn--ghost" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="byt-modal__body">
          {/* Quick Stats */}
          <div className="byt-detail-stats">
            {consultant.hq_city && (
              <span><MapPin size={14} /> {consultant.hq_city}{consultant.hq_state ? `, ${consultant.hq_state}` : ''}</span>
            )}
            {consultant.years_experience && (
              <span><Briefcase size={14} /> {consultant.years_experience} years experience</span>
            )}
            {consultant.team_size && (
              <span><Users size={14} /> {consultant.team_size} team members</span>
            )}
            {consultant.firm_established_year && (
              <span><Calendar size={14} /> Est. {consultant.firm_established_year}</span>
            )}
            {consultant.avg_rating > 0 && (
              <span><Star size={14} /> {Number(consultant.avg_rating).toFixed(1)} ({consultant.review_count} reviews)</span>
            )}
          </div>

          {/* Bio */}
          {consultant.bio && (
            <div className="byt-detail-section">
              <h3>About</h3>
              <p>{consultant.bio}</p>
            </div>
          )}

          {/* Contact */}
          <div className="byt-detail-section">
            <h3>Contact</h3>
            <div className="byt-detail-contact">
              {consultant.phone && <a href={`tel:${consultant.phone}`}><Phone size={14} /> {consultant.phone}</a>}
              {consultant.email && <a href={`mailto:${consultant.email}`}><Mail size={14} /> {consultant.email}</a>}
              {consultant.website && <a href={consultant.website} target="_blank" rel="noopener noreferrer"><Globe size={14} /> Website <ExternalLink size={10} /></a>}
              {consultant.linkedin_url && <a href={consultant.linkedin_url} target="_blank" rel="noopener noreferrer"><Linkedin size={14} /> LinkedIn <ExternalLink size={10} /></a>}
            </div>
          </div>

          {/* Specialties & Certifications */}
          {((consultant.specialties?.length > 0) || (consultant.certifications?.length > 0)) && (
            <div className="byt-detail-section">
              <h3>Specialties & Certifications</h3>
              {consultant.specialties?.length > 0 && (
                <div className="byt-detail-tags">
                  {consultant.specialties.map((s, i) => (
                    <span key={i} className="byt-tag">{s}</span>
                  ))}
                </div>
              )}
              {consultant.certifications?.length > 0 && (
                <div className="byt-detail-tags" style={{ marginTop: '0.5rem' }}>
                  {consultant.certifications.map((c, i) => (
                    <span key={i} className="byt-tag byt-tag--cert"><Award size={10} /> {c}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Service Areas */}
          {consultant.service_areas?.length > 0 && (
            <div className="byt-detail-section">
              <h3>Service Areas</h3>
              <div className="byt-detail-tags">
                {consultant.service_areas.map((s, i) => (
                  <span key={i} className="byt-tag byt-tag--area">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Budget Range */}
          {(consultant.min_budget || consultant.max_budget) && (
            <div className="byt-detail-section">
              <h3>Project Budget Range</h3>
              <p className="byt-detail-budget">
                ${((consultant.min_budget || 0) / 1e6).toFixed(1)}M – ${((consultant.max_budget || 0) / 1e6).toFixed(1)}M
              </p>
            </div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="byt-detail-section">
              <h3>Portfolio ({portfolio.length} projects)</h3>
              <div className="byt-portfolio-list">
                {portfolio.map(p => (
                  <div key={p.id} className="byt-portfolio-item">
                    <div className="byt-portfolio-item__header">
                      <h4>{p.project_name}</h4>
                      {p.award_winner && <Award size={14} className="byt-gold" />}
                    </div>
                    <div className="byt-portfolio-item__meta">
                      {p.location_city && <span>{p.location_city}{p.location_state ? `, ${p.location_state}` : ''}</span>}
                      {p.completion_year && <span>{p.completion_year}</span>}
                      {p.square_footage && <span>{Number(p.square_footage).toLocaleString()} SF</span>}
                      {p.architectural_style && <span>{p.architectural_style}</span>}
                    </div>
                    {p.description && <p className="byt-portfolio-item__desc">{p.description}</p>}
                    {p.features?.length > 0 && (
                      <div className="byt-detail-tags">
                        {p.features.map((f, i) => <span key={i} className="byt-tag byt-tag--small">{f}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="byt-detail-section">
              <h3>Reviews ({reviews.length})</h3>
              {reviews.map(r => (
                <div key={r.id} className="byt-review-item">
                  <div className="byt-review-item__header">
                    <div className="byt-review-item__stars">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} fill={i <= r.rating ? '#c9a227' : 'none'} color={i <= r.rating ? '#c9a227' : '#e5e5e0'} />
                      ))}
                    </div>
                    {r.reviewer_name && <span className="byt-review-item__author">{r.reviewer_name}</span>}
                    {r.verified_client && <CheckCircle2 size={12} className="byt-green" />}
                  </div>
                  {r.review_text && <p>{r.review_text}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className="byt-detail-section">
              <h3>Discovery Sources</h3>
              {sources.map(s => (
                <div key={s.id} className="byt-source-item">
                  <span className="byt-tag">{s.source_type}</span>
                  <span>{s.source_name}</span>
                  {s.source_url && (
                    <a href={s.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Internal Notes */}
          {consultant.notes && (
            <div className="byt-detail-section byt-detail-section--notes">
              <h3>Internal Notes</h3>
              <p>{consultant.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultantDetailModal;
