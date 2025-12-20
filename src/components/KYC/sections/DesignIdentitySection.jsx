import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import SliderField from '../../shared/SliderField';

const DesignIdentitySection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].designIdentity;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'designIdentity', { [field]: value });
  };

  const interiorStyleTags = [
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'modern', label: 'Modern' },
    { value: 'transitional', label: 'Transitional' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'organic-modern', label: 'Organic Modern' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'mid-century', label: 'Mid-Century Modern' },
    { value: 'art-deco', label: 'Art Deco' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'bohemian', label: 'Bohemian/Eclectic' },
    { value: 'scandinavian', label: 'Scandinavian' },
    { value: 'japanese', label: 'Japanese-Influenced' },
  ];

  const architectureStyleTags = [
    { value: 'modernist', label: 'Modernist' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'mediterranean', label: 'Mediterranean Revival' },
    { value: 'coastal', label: 'Coastal Contemporary' },
    { value: 'desert-modern', label: 'Desert Modern' },
    { value: 'mountain', label: 'Mountain Contemporary' },
    { value: 'european-classical', label: 'European Classical' },
    { value: 'tropical', label: 'Tropical Modern' },
    { value: 'vernacular', label: 'Vernacular Modern' },
  ];

  const materialOptions = [
    { value: 'natural-stone', label: 'Natural Stone' },
    { value: 'marble', label: 'Marble' },
    { value: 'hardwood', label: 'Hardwood' },
    { value: 'reclaimed-wood', label: 'Reclaimed Wood' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'steel', label: 'Steel' },
    { value: 'brass', label: 'Brass/Bronze' },
    { value: 'leather', label: 'Leather' },
    { value: 'velvet', label: 'Velvet/Textiles' },
    { value: 'glass', label: 'Glass' },
    { value: 'ceramic', label: 'Ceramic/Tile' },
    { value: 'plaster', label: 'Plaster' },
  ];

  const exteriorMaterialOptions = [
    { value: 'stone', label: 'Natural Stone' },
    { value: 'stucco', label: 'Stucco' },
    { value: 'wood-siding', label: 'Wood Siding' },
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal Cladding' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'brick', label: 'Brick' },
    { value: 'timber', label: 'Heavy Timber' },
  ];

  const massingOptions = [
    { value: 'compact', label: 'Compact - Single Mass' },
    { value: 'sprawling', label: 'Sprawling - Spread Out' },
    { value: 'vertical', label: 'Vertical - Multi-Story Tower' },
    { value: 'courtyard', label: 'Courtyard - Central Open Space' },
    { value: 'pavilion', label: 'Pavilion - Multiple Connected Buildings' },
  ];

  const roofFormOptions = [
    { value: 'flat', label: 'Flat Roof' },
    { value: 'low-slope', label: 'Low Slope' },
    { value: 'pitched', label: 'Pitched/Gabled' },
    { value: 'butterfly', label: 'Butterfly' },
    { value: 'green-roof', label: 'Green Roof' },
  ];

  const toggleTag = (field, tag) => {
    const current = data[field] || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : current.length < 5 ? [...current, tag] : current;
    handleChange(field, updated);
  };

  return (
    <div className="kyc-section">
      {/* Taste Profile Notice */}
      <div className="kyc-section__group">
        <div className="info-banner info-banner--highlight">
          <p><strong>Taste Exploration:</strong> These design preferences are best captured through our visual Taste Exploration module, where your choices reveal your aesthetic DNA. The sliders below show your derived taste profile once Taste Exploration is complete.</p>
          <p className="info-banner__subtext">Manual adjustment available for initial discussions or refinement.</p>
        </div>
      </div>

      {/* Style Axes - The Core */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Design DNA: Style Axes</h3>
        <p className="kyc-section__group-description">
          Your position on each spectrum, derived from Taste Exploration or manually adjusted.
        </p>

        <div className="style-axes">
          <SliderField
            label="Style Era"
            value={data.axisContemporaryTraditional || 5}
            onChange={(v) => handleChange('axisContemporaryTraditional', v)}
            min={1}
            max={10}
            leftLabel="Contemporary"
            rightLabel="Traditional"
          />

          <SliderField
            label="Visual Density"
            value={data.axisMinimalLayered || 5}
            onChange={(v) => handleChange('axisMinimalLayered', v)}
            min={1}
            max={10}
            leftLabel="Minimal"
            rightLabel="Layered"
          />

          <SliderField
            label="Color Temperature"
            value={data.axisWarmCool || 5}
            onChange={(v) => handleChange('axisWarmCool', v)}
            min={1}
            max={10}
            leftLabel="Warm"
            rightLabel="Cool"
          />

          {tier !== 'mvp' && (
            <>
              <SliderField
                label="Form Language"
                value={data.axisOrganicGeometric || 5}
                onChange={(v) => handleChange('axisOrganicGeometric', v)}
                min={1}
                max={10}
                leftLabel="Organic"
                rightLabel="Geometric"
              />

              <SliderField
                label="Curation Level"
                value={data.axisRefinedEclectic || 5}
                onChange={(v) => handleChange('axisRefinedEclectic', v)}
                min={1}
                max={10}
                leftLabel="Refined"
                rightLabel="Eclectic"
              />
            </>
          )}
        </div>
      </div>

      {/* Architecture-Specific Axes */}
      {tier !== 'mvp' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Architecture Axes</h3>
          
          <div className="style-axes">
            <SliderField
              label="Architectural Detail"
              value={data.axisArchMinimalOrnate || 5}
              onChange={(v) => handleChange('axisArchMinimalOrnate', v)}
              min={1}
              max={10}
              leftLabel="Minimal"
              rightLabel="Ornate"
            />

            <SliderField
              label="Regional Expression"
              value={data.axisArchRegionalInternational || 5}
              onChange={(v) => handleChange('axisArchRegionalInternational', v)}
              min={1}
              max={10}
              leftLabel="Regional/Vernacular"
              rightLabel="International/Universal"
            />
          </div>
        </div>
      )}

      {/* Style Tags */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Style Tags</h3>
        
        <div className="form-field">
          <label className="form-field__label">Interior Style Tags (select up to 5)</label>
          <div className="chip-select">
            {interiorStyleTags.map(tag => (
              <button
                key={tag.value}
                className={`chip ${(data.interiorStyleTags || []).includes(tag.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleTag('interiorStyleTags', tag.value)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {tier !== 'mvp' && (
          <div className="form-field">
            <label className="form-field__label">Architecture Style Tags (select up to 5)</label>
            <div className="chip-select">
              {architectureStyleTags.map(tag => (
                <button
                  key={tag.value}
                  className={`chip ${(data.architectureStyleTags || []).includes(tag.value) ? 'chip--selected' : ''}`}
                  onClick={() => toggleTag('architectureStyleTags', tag.value)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aspiration Keywords */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Aspiration & Anti-Inspiration</h3>
        
        <FormField
          label="Aspiration Keywords (3-5 words)"
          value={(data.aspirationKeywords || []).join(', ')}
          onChange={(v) => handleChange('aspirationKeywords', v.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="e.g., Sanctuary, Bold, Curated, Timeless, Serene"
          helpText="The emotional qualities you want your home to evoke"
        />

        <FormField
          label="Anti-Inspiration"
          type="textarea"
          value={data.antiInspiration}
          onChange={(v) => handleChange('antiInspiration', v)}
          placeholder="Styles, materials, or approaches you want to avoid..."
          rows={2}
          helpText="Equally important to know what you DON'T want"
        />
      </div>

      {/* Materials */}
      {tier !== 'mvp' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Material Preferences</h3>
          
          <div className="form-field">
            <label className="form-field__label">Interior Material Affinities</label>
            <div className="chip-select">
              {materialOptions.map(mat => (
                <button
                  key={mat.value}
                  className={`chip ${(data.materialAffinities || []).includes(mat.value) ? 'chip--selected' : ''}`}
                  onClick={() => toggleTag('materialAffinities', mat.value)}
                >
                  {mat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Exterior Material Preferences</label>
            <div className="chip-select">
              {exteriorMaterialOptions.map(mat => (
                <button
                  key={mat.value}
                  className={`chip ${(data.exteriorMaterialPreferences || []).includes(mat.value) ? 'chip--selected' : ''}`}
                  onClick={() => toggleTag('exteriorMaterialPreferences', mat.value)}
                >
                  {mat.label}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="Color Preferences"
            value={data.colorPreferences}
            onChange={(v) => handleChange('colorPreferences', v)}
            placeholder="Describe your color palette preferences..."
          />
        </div>
      )}

      {/* Architecture Form */}
      {tier !== 'mvp' && (
        <div className="kyc-section__group">
          <h3 className="kyc-section__group-title">Architectural Form</h3>
          
          <div className="form-grid form-grid--2col">
            <SelectField
              label="Massing Preference"
              value={data.massingPreference}
              onChange={(v) => handleChange('massingPreference', v)}
              options={massingOptions}
              placeholder="How should the building mass be organized?"
            />
            <SelectField
              label="Roof Form Preference"
              value={data.roofFormPreference}
              onChange={(v) => handleChange('roofFormPreference', v)}
              options={roofFormOptions}
              placeholder="Roof style preference..."
            />
          </div>
        </div>
      )}

      {/* Benchmarks */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Benchmark Properties</h3>
        
        <FormField
          label="Properties You Admire"
          type="textarea"
          value={(data.benchmarkProperties || []).join('\n')}
          onChange={(v) => handleChange('benchmarkProperties', v.split('\n').filter(Boolean))}
          placeholder="Enter specific properties, hotels, or buildings you love (one per line)&#10;e.g., Aman Tokyo&#10;Nobu Hotel Malibu&#10;Edition Barcelona"
          rows={4}
          helpText="These help us understand your aesthetic through concrete examples"
        />
      </div>
    </div>
  );
};

export default DesignIdentitySection;
