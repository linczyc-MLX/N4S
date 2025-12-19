import React from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const SpaceRequirementsSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].spaceRequirements;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'spaceRequirements', { [field]: value });
  };

  const spaceOptions = [
    { value: 'primary-suite', label: 'Primary Suite' },
    { value: 'secondary-suites', label: 'Guest Suites' },
    { value: 'kids-bedrooms', label: 'Children\'s Bedrooms' },
    { value: 'great-room', label: 'Great Room/Living' },
    { value: 'formal-living', label: 'Formal Living Room' },
    { value: 'family-room', label: 'Family Room' },
    { value: 'formal-dining', label: 'Formal Dining' },
    { value: 'casual-dining', label: 'Casual Dining/Breakfast' },
    { value: 'chef-kitchen', label: 'Chef\'s Kitchen' },
    { value: 'catering-kitchen', label: 'Catering Kitchen' },
    { value: 'home-office', label: 'Home Office' },
    { value: 'library', label: 'Library' },
    { value: 'media-room', label: 'Media Room/Theater' },
    { value: 'game-room', label: 'Game Room' },
    { value: 'wine-cellar', label: 'Wine Cellar' },
    { value: 'gym', label: 'Home Gym' },
    { value: 'spa', label: 'Spa/Wellness' },
    { value: 'pool-indoor', label: 'Indoor Pool' },
    { value: 'pool-outdoor', label: 'Outdoor Pool' },
    { value: 'garage', label: 'Garage (Multi-car)' },
    { value: 'motor-court', label: 'Motor Court' },
    { value: 'staff-quarters', label: 'Staff Quarters' },
    { value: 'mudroom', label: 'Mudroom' },
    { value: 'laundry', label: 'Laundry Room' },
    { value: 'outdoor-kitchen', label: 'Outdoor Kitchen' },
    { value: 'covered-outdoor', label: 'Covered Outdoor Living' },
  ];

  const viewPriorityOptions = [
    { value: 'primary-suite', label: 'Primary Suite' },
    { value: 'living', label: 'Living Room' },
    { value: 'dining', label: 'Dining Room' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'office', label: 'Home Office' },
  ];

  const storageOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'above-average', label: 'Above Average' },
    { value: 'extensive', label: 'Extensive' },
  ];

  const techOptions = [
    { value: 'smart-home', label: 'Smart Home System' },
    { value: 'av-integration', label: 'AV Integration' },
    { value: 'security', label: 'Advanced Security' },
    { value: 'lighting-control', label: 'Lighting Control' },
    { value: 'climate-zones', label: 'Climate Zones' },
    { value: 'ev-charging', label: 'EV Charging' },
  ];

  const sustainabilityOptions = [
    { value: 'solar', label: 'Solar Power' },
    { value: 'geothermal', label: 'Geothermal' },
    { value: 'leed', label: 'LEED Certification' },
    { value: 'passive-house', label: 'Passive House' },
    { value: 'net-zero', label: 'Net Zero' },
    { value: 'water-reclaim', label: 'Water Reclamation' },
  ];

  const toggleOption = (field, option) => {
    const current = data[field] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleChange(field, updated);
  };

  return (
    <div className="kyc-section">
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Must-Have Spaces</h3>
        <p className="kyc-section__group-description">
          Select spaces that are essential to your program - non-negotiables.
        </p>
        <div className="chip-select chip-select--wrap">
          {spaceOptions.map(space => (
            <button
              key={space.value}
              className={`chip ${(data.mustHaveSpaces || []).includes(space.value) ? 'chip--selected' : ''}`}
              onClick={() => toggleOption('mustHaveSpaces', space.value)}
            >
              {space.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Nice-to-Have Spaces</h3>
        <p className="kyc-section__group-description">
          Spaces you'd like if budget and program allow.
        </p>
        <div className="chip-select chip-select--wrap">
          {spaceOptions.map(space => (
            <button
              key={space.value}
              className={`chip ${(data.niceToHaveSpaces || []).includes(space.value) ? 'chip--selected' : ''}`}
              onClick={() => toggleOption('niceToHaveSpaces', space.value)}
              disabled={(data.mustHaveSpaces || []).includes(space.value)}
            >
              {space.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">View Priorities</h3>
        <div className="form-field">
          <label className="form-field__label">Which rooms MUST have views?</label>
          <div className="chip-select">
            {viewPriorityOptions.map(room => (
              <button
                key={room.value}
                className={`chip ${(data.viewPriorityRooms || []).includes(room.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('viewPriorityRooms', room.value)}
              >
                {room.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tier !== 'mvp' && (
        <>
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Adjacencies & Pain Points</h3>
            
            <FormField
              label="Adjacency Requirements"
              type="textarea"
              value={data.adjacencyRequirements}
              onChange={(v) => handleChange('adjacencyRequirements', v)}
              placeholder="e.g., Kitchen must be near outdoor dining, Primary suite away from children's rooms..."
              rows={2}
            />

            <FormField
              label="Current Space Pain Points"
              type="textarea"
              value={data.currentSpacePainPoints}
              onChange={(v) => handleChange('currentSpacePainPoints', v)}
              placeholder="What's wrong with your current home that you want to fix?"
              rows={2}
            />
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Storage, Accessibility & Technology</h3>
            
            <SelectField
              label="Storage Needs"
              value={data.storageNeeds}
              onChange={(v) => handleChange('storageNeeds', v)}
              options={storageOptions}
              placeholder="How much storage do you need?"
            />

            <FormField
              label="Accessibility Requirements"
              value={data.accessibilityRequirements}
              onChange={(v) => handleChange('accessibilityRequirements', v)}
              placeholder="ADA compliance, aging in place, mobility accommodations..."
            />

            <div className="form-field">
              <label className="form-field__label">Technology Requirements</label>
              <div className="chip-select">
                {techOptions.map(tech => (
                  <button
                    key={tech.value}
                    className={`chip ${(data.technologyRequirements || []).includes(tech.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('technologyRequirements', tech.value)}
                  >
                    {tech.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Sustainability Priorities</label>
              <div className="chip-select">
                {sustainabilityOptions.map(sus => (
                  <button
                    key={sus.value}
                    className={`chip ${(data.sustainabilityPriorities || []).includes(sus.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('sustainabilityPriorities', sus.value)}
                  >
                    {sus.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpaceRequirementsSection;
