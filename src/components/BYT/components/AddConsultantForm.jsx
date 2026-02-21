/**
 * AddConsultantForm.jsx — Manual entry form for BYT consultants
 * 
 * Handles both create and edit modes.
 * Includes inline portfolio project sub-form.
 */

import React, { useState, useCallback } from 'react';
import {
  Save, X, Plus, Trash2, ChevronDown, ChevronRight, Image, Link, Award
} from 'lucide-react';

// Specialty options by discipline
const SPECIALTY_OPTIONS = {
  architect: ['Contemporary', 'Traditional', 'Modern', 'Transitional', 'Mediterranean', 'Ranch', 'Colonial', 'Craftsman', 'Art Deco', 'Sustainable', 'Passive House', 'Historic Preservation', 'Coastal', 'Mountain', 'Urban'],
  interior_designer: ['Contemporary', 'Traditional', 'Modern', 'Transitional', 'Mediterranean', 'Art Deco', 'Mid-Century Modern', 'Minimalist', 'Maximalist', 'Coastal', 'Bohemian', 'Rustic', 'Industrial', 'Scandinavian', 'Luxury Hospitality'],
  pm: ['Luxury Residential', 'New Construction', 'Renovation', 'Historic Restoration', 'Multi-property', 'Smart Home Integration', 'Sustainable Building', 'High-rise', 'Estate Management'],
  gc: ['Luxury Residential', 'New Construction', 'Renovation', 'Addition', 'Historic Restoration', 'Custom Homes', 'Smart Home', 'Pool & Outdoor', 'Wine Cellar', 'Sustainable Building'],
};

const CERTIFICATION_OPTIONS = {
  architect: ['AIA', 'NCARB', 'LEED AP', 'Passive House', 'NAHB'],
  interior_designer: ['ASID', 'IIDA', 'NCIDQ', 'LEED AP', 'WELL AP'],
  pm: ['PMP', 'CCM', 'LEED AP', 'AIA Associate', 'NAHB CGP'],
  gc: ['NAHB', 'LEED AP', 'ICC', 'OSHA 30', 'EPA Lead-Safe'],
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

const ARCH_STYLES = [
  'Contemporary', 'Traditional', 'Modern', 'Transitional', 'Mediterranean',
  'Ranch', 'Colonial', 'Craftsman', 'Art Deco', 'Coastal', 'Mountain', 'Tudor',
  'Georgian', 'Victorian', 'Farmhouse', 'Mid-Century Modern', 'Brutalist', 'Other'
];

const PROJECT_FEATURES = [
  'Pool', 'Wine Cellar', 'Gym', 'Home Theater', 'Staff Quarters', 'Guest House',
  'Tennis Court', 'Spa/Sauna', 'Library', 'Art Gallery', 'Elevator', 'Safe Room',
  'Garage (4+ cars)', 'Boat House', 'Horse Stable', 'Helipad', 'Indoor Pool',
  'Outdoor Kitchen', 'Recording Studio', 'Observatory'
];

const SOURCE_OPTIONS = [
  'Direct Curation', 'Houzz', 'AIA Directory', 'ASID Directory', 'NAHB Directory',
  'Permit Records', 'Publication Feature', 'Award List', 'Referral', 'Web Discovery',
  'Real Estate Listing', 'Conference/Event'
];

const emptyPortfolio = () => ({
  _tempId: Date.now() + Math.random(),
  project_name: '',
  location_city: '',
  location_state: '',
  project_type: 'new_build',
  description: '',
  budget_min: '',
  budget_max: '',
  completion_year: '',
  square_footage: '',
  architectural_style: '',
  features: [],
  featured_in_publications: [],
  award_winner: false,
  award_details: '',
  is_featured: false,
});

const AddConsultantForm = ({ consultant, onSave, onCancel, isEditing }) => {
  // Form state
  const [form, setForm] = useState(() => {
    if (consultant) {
      return {
        role: consultant.role || 'architect',
        first_name: consultant.first_name || '',
        last_name: consultant.last_name || '',
        firm_name: consultant.firm_name || '',
        specialties: consultant.specialties || [],
        service_areas: consultant.service_areas || [],
        hq_city: consultant.hq_city || '',
        hq_state: consultant.hq_state || '',
        hq_country: consultant.hq_country || 'USA',
        min_budget: consultant.min_budget || '',
        max_budget: consultant.max_budget || '',
        certifications: consultant.certifications || [],
        bio: consultant.bio || '',
        phone: consultant.phone || '',
        email: consultant.email || '',
        website: consultant.website || '',
        linkedin_url: consultant.linkedin_url || '',
        years_experience: consultant.years_experience || '',
        firm_established_year: consultant.firm_established_year || '',
        team_size: consultant.team_size || '',
        verification_status: consultant.verification_status || 'pending',
        source_of_discovery: consultant.source_of_discovery || '',
        source_attribution: consultant.source_attribution || '',
        notes: consultant.notes || '',
      };
    }
    return {
      role: 'architect',
      first_name: '', last_name: '', firm_name: '',
      specialties: [], service_areas: [], hq_city: '', hq_state: '', hq_country: 'USA',
      min_budget: '', max_budget: '', certifications: [], bio: '',
      phone: '', email: '', website: '', linkedin_url: '',
      years_experience: '', firm_established_year: '', team_size: '',
      verification_status: 'pending', source_of_discovery: '', source_attribution: '', notes: '',
    };
  });

  // Portfolio projects
  const [portfolioProjects, setPortfolioProjects] = useState(() => {
    if (consultant?.portfolio && consultant.portfolio.length > 0) {
      return consultant.portfolio.map(p => ({ ...p, _existing: true, _tempId: p.id }));
    }
    return [];
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true, contact: true, experience: false, portfolio: false, source: false, notes: false,
  });

  const [saving, setSaving] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayItem = useCallback((field, item) => {
    setForm(prev => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  }, []);

  // Portfolio handlers
  const addPortfolio = useCallback(() => {
    setPortfolioProjects(prev => [...prev, emptyPortfolio()]);
    setExpandedSections(prev => ({ ...prev, portfolio: true }));
  }, []);

  const updatePortfolio = useCallback((tempId, field, value) => {
    setPortfolioProjects(prev =>
      prev.map(p => p._tempId === tempId ? { ...p, [field]: value } : p)
    );
  }, []);

  const togglePortfolioFeature = useCallback((tempId, feature) => {
    setPortfolioProjects(prev =>
      prev.map(p => {
        if (p._tempId !== tempId) return p;
        const features = p.features || [];
        return {
          ...p,
          features: features.includes(feature)
            ? features.filter(f => f !== feature)
            : [...features, feature],
        };
      })
    );
  }, []);

  const removePortfolio = useCallback((tempId) => {
    setPortfolioProjects(prev => prev.filter(p => p._tempId !== tempId));
  }, []);

  // Submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.firm_name.trim()) {
      alert('Firm name is required.');
      return;
    }

    setSaving(true);
    try {
      // Clean numeric fields
      const cleanData = {
        ...form,
        min_budget: form.min_budget ? parseFloat(form.min_budget) : null,
        max_budget: form.max_budget ? parseFloat(form.max_budget) : null,
        years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        firm_established_year: form.firm_established_year ? parseInt(form.firm_established_year) : null,
        team_size: form.team_size ? parseInt(form.team_size) : null,
      };

      // Clean portfolio projects
      const cleanPortfolio = portfolioProjects
        .filter(p => p.project_name?.trim())
        .map(p => ({
          ...p,
          budget_min: p.budget_min ? parseFloat(p.budget_min) : null,
          budget_max: p.budget_max ? parseFloat(p.budget_max) : null,
          completion_year: p.completion_year ? parseInt(p.completion_year) : null,
          square_footage: p.square_footage ? parseFloat(p.square_footage) : null,
        }));

      await onSave(cleanData, cleanPortfolio);
    } catch (err) {
      console.error('[BYT] Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [form, portfolioProjects, onSave]);

  const SectionHeader = ({ id, label, count }) => (
    <button
      type="button"
      className="byt-form-section__toggle"
      onClick={() => toggleSection(id)}
    >
      {expandedSections[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      <span>{label}</span>
      {count !== undefined && <span className="byt-form-section__count">{count}</span>}
    </button>
  );

  return (
    <form className="byt-form" onSubmit={handleSubmit}>
      <div className="byt-form__header">
        <h2>{isEditing ? 'Edit Consultant' : 'Add New Consultant'}</h2>
        <div className="byt-form__header-actions">
          <button type="button" className="byt-btn byt-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="byt-btn byt-btn--primary" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Consultant'}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="byt-form-section">
        <SectionHeader id="basic" label="Basic Information" />
        {expandedSections.basic && (
          <div className="byt-form-section__body">
            <div className="byt-form-row">
              <div className="byt-form-field">
                <label>Discipline *</label>
                <select value={form.role} onChange={(e) => updateField('role', e.target.value)}>
                  <option value="architect">Architect</option>
                  <option value="interior_designer">Interior Designer</option>
                  <option value="pm">Project Manager / Owner's Rep</option>
                  <option value="gc">General Contractor</option>
                </select>
              </div>
              <div className="byt-form-field">
                <label>Verification Status</label>
                <select value={form.verification_status} onChange={(e) => updateField('verification_status', e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
            </div>

            <div className="byt-form-field">
              <label>Firm Name *</label>
              <input
                type="text"
                value={form.firm_name}
                onChange={(e) => updateField('firm_name', e.target.value)}
                placeholder="e.g., Peter Marino Architect PLLC"
                required
              />
            </div>

            <div className="byt-form-row">
              <div className="byt-form-field">
                <label>First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="Principal's first name"
                />
              </div>
              <div className="byt-form-field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Principal's last name"
                />
              </div>
            </div>

            <div className="byt-form-row byt-form-row--3col">
              <div className="byt-form-field">
                <label>HQ City</label>
                <input type="text" value={form.hq_city} onChange={(e) => updateField('hq_city', e.target.value)} placeholder="New York" />
              </div>
              <div className="byt-form-field">
                <label>HQ State</label>
                <select value={form.hq_state} onChange={(e) => updateField('hq_state', e.target.value)}>
                  <option value="">Select...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="byt-form-field">
                <label>Country</label>
                <input type="text" value={form.hq_country} onChange={(e) => updateField('hq_country', e.target.value)} />
              </div>
            </div>

            {/* Service Areas */}
            <div className="byt-form-field">
              <label>Service Areas (states)</label>
              <div className="byt-chip-grid byt-chip-grid--compact">
                {US_STATES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`byt-chip ${(form.service_areas || []).includes(s) ? 'byt-chip--active' : ''}`}
                    onClick={() => toggleArrayItem('service_areas', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="byt-form-field">
              <label>Specialties</label>
              <div className="byt-chip-grid">
                {(SPECIALTY_OPTIONS[form.role] || []).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`byt-chip ${(form.specialties || []).includes(s) ? 'byt-chip--active' : ''}`}
                    onClick={() => toggleArrayItem('specialties', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="byt-form-field">
              <label>Certifications</label>
              <div className="byt-chip-grid">
                {(CERTIFICATION_OPTIONS[form.role] || []).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`byt-chip ${(form.certifications || []).includes(c) ? 'byt-chip--active' : ''}`}
                    onClick={() => toggleArrayItem('certifications', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="byt-form-row">
              <div className="byt-form-field">
                <label>Min Budget ($)</label>
                <input
                  type="number"
                  value={form.min_budget}
                  onChange={(e) => updateField('min_budget', e.target.value)}
                  placeholder="e.g., 5000000"
                  step="100000"
                />
              </div>
              <div className="byt-form-field">
                <label>Max Budget ($)</label>
                <input
                  type="number"
                  value={form.max_budget}
                  onChange={(e) => updateField('max_budget', e.target.value)}
                  placeholder="e.g., 100000000"
                  step="100000"
                />
              </div>
            </div>

            <div className="byt-form-field">
              <label>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Brief description of the firm and their approach..."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="byt-form-section">
        <SectionHeader id="contact" label="Contact Information" />
        {expandedSections.contact && (
          <div className="byt-form-section__body">
            <div className="byt-form-row">
              <div className="byt-form-field">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (212) 555-0100" />
              </div>
              <div className="byt-form-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="info@firm.com" />
              </div>
            </div>
            <div className="byt-form-row">
              <div className="byt-form-field">
                <label>Website</label>
                <input type="url" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://www.firm.com" />
              </div>
              <div className="byt-form-field">
                <label>LinkedIn</label>
                <input type="url" value={form.linkedin_url} onChange={(e) => updateField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="byt-form-section">
        <SectionHeader id="experience" label="Experience & Scale" />
        {expandedSections.experience && (
          <div className="byt-form-section__body">
            <div className="byt-form-row byt-form-row--3col">
              <div className="byt-form-field">
                <label>Years of Experience</label>
                <input type="number" value={form.years_experience} onChange={(e) => updateField('years_experience', e.target.value)} placeholder="25" min="0" />
              </div>
              <div className="byt-form-field">
                <label>Firm Established</label>
                <input type="number" value={form.firm_established_year} onChange={(e) => updateField('firm_established_year', e.target.value)} placeholder="1998" min="1800" max="2026" />
              </div>
              <div className="byt-form-field">
                <label>Team Size</label>
                <input type="number" value={form.team_size} onChange={(e) => updateField('team_size', e.target.value)} placeholder="45" min="1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Projects */}
      <div className="byt-form-section">
        <SectionHeader id="portfolio" label="Portfolio Projects" count={portfolioProjects.length} />
        {expandedSections.portfolio && (
          <div className="byt-form-section__body">
            {portfolioProjects.map((project, idx) => (
              <div key={project._tempId} className="byt-portfolio-entry">
                <div className="byt-portfolio-entry__header">
                  <h4>Project {idx + 1}: {project.project_name || 'Untitled'}</h4>
                  <button type="button" className="byt-btn byt-btn--ghost byt-btn--danger" onClick={() => removePortfolio(project._tempId)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="byt-form-row">
                  <div className="byt-form-field" style={{ flex: 2 }}>
                    <label>Project Name *</label>
                    <input type="text" value={project.project_name} onChange={(e) => updatePortfolio(project._tempId, 'project_name', e.target.value)} placeholder="e.g., Thornwood Estate" />
                  </div>
                  <div className="byt-form-field">
                    <label>Type</label>
                    <select value={project.project_type} onChange={(e) => updatePortfolio(project._tempId, 'project_type', e.target.value)}>
                      <option value="new_build">New Build</option>
                      <option value="renovation">Renovation</option>
                      <option value="addition">Addition</option>
                      <option value="restoration">Restoration</option>
                    </select>
                  </div>
                </div>
                <div className="byt-form-row byt-form-row--3col">
                  <div className="byt-form-field">
                    <label>City</label>
                    <input type="text" value={project.location_city} onChange={(e) => updatePortfolio(project._tempId, 'location_city', e.target.value)} />
                  </div>
                  <div className="byt-form-field">
                    <label>State</label>
                    <select value={project.location_state} onChange={(e) => updatePortfolio(project._tempId, 'location_state', e.target.value)}>
                      <option value="">—</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="byt-form-field">
                    <label>Year</label>
                    <input type="number" value={project.completion_year} onChange={(e) => updatePortfolio(project._tempId, 'completion_year', e.target.value)} placeholder="2024" min="1900" max="2030" />
                  </div>
                </div>
                <div className="byt-form-row byt-form-row--3col">
                  <div className="byt-form-field">
                    <label>Budget Min ($)</label>
                    <input type="number" value={project.budget_min} onChange={(e) => updatePortfolio(project._tempId, 'budget_min', e.target.value)} step="100000" />
                  </div>
                  <div className="byt-form-field">
                    <label>Budget Max ($)</label>
                    <input type="number" value={project.budget_max} onChange={(e) => updatePortfolio(project._tempId, 'budget_max', e.target.value)} step="100000" />
                  </div>
                  <div className="byt-form-field">
                    <label>Square Footage</label>
                    <input type="number" value={project.square_footage} onChange={(e) => updatePortfolio(project._tempId, 'square_footage', e.target.value)} />
                  </div>
                </div>
                <div className="byt-form-field">
                  <label>Architectural Style</label>
                  <select value={project.architectural_style} onChange={(e) => updatePortfolio(project._tempId, 'architectural_style', e.target.value)}>
                    <option value="">Select...</option>
                    {ARCH_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="byt-form-field">
                  <label>Features</label>
                  <div className="byt-chip-grid">
                    {PROJECT_FEATURES.map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`byt-chip ${(project.features || []).includes(f) ? 'byt-chip--active' : ''}`}
                        onClick={() => togglePortfolioFeature(project._tempId, f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="byt-form-field">
                  <label>Description</label>
                  <textarea value={project.description} onChange={(e) => updatePortfolio(project._tempId, 'description', e.target.value)} rows={2} placeholder="Brief project description..." />
                </div>
                <div className="byt-form-row">
                  <label className="byt-checkbox-label">
                    <input type="checkbox" checked={project.award_winner} onChange={(e) => updatePortfolio(project._tempId, 'award_winner', e.target.checked)} />
                    Award Winner
                  </label>
                  <label className="byt-checkbox-label">
                    <input type="checkbox" checked={project.is_featured} onChange={(e) => updatePortfolio(project._tempId, 'is_featured', e.target.checked)} />
                    Featured Project
                  </label>
                </div>
              </div>
            ))}
            <button type="button" className="byt-btn byt-btn--outline" onClick={addPortfolio}>
              <Plus size={16} /> Add Portfolio Project
            </button>
          </div>
        )}
      </div>

      {/* Source */}
      <div className="byt-form-section">
        <SectionHeader id="source" label="Discovery Source" />
        {expandedSections.source && (
          <div className="byt-form-section__body">
            <div className="byt-form-field">
              <label>Source of Discovery</label>
              <select value={form.source_of_discovery} onChange={(e) => updateField('source_of_discovery', e.target.value)}>
                <option value="">Select...</option>
                {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="byt-form-field">
              <label>Source Attribution</label>
              <input type="text" value={form.source_attribution} onChange={(e) => updateField('source_attribution', e.target.value)} placeholder="e.g., AD100 2025 List, AIA NY Chapter Directory" />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="byt-form-section">
        <SectionHeader id="notes" label="Internal Notes" />
        {expandedSections.notes && (
          <div className="byt-form-section__body">
            <div className="byt-form-field">
              <label>LRA Team Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                placeholder="Internal notes visible only to the advisory team..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Footer */}
      <div className="byt-form__footer">
        <button type="button" className="byt-btn byt-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="byt-btn byt-btn--primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : isEditing ? 'Update Consultant' : 'Add Consultant'}
        </button>
      </div>
    </form>
  );
};

export default AddConsultantForm;
