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

  // Interior Spaces
  const interiorSpaceOptions = [
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
    { value: 'spa-wellness', label: 'Spa/Wellness Suite' },
    { value: 'pool-indoor', label: 'Indoor Pool' },
    { value: 'sauna', label: 'Sauna' },
    { value: 'steam-room', label: 'Steam Room' },
    { value: 'staff-quarters', label: 'Staff Quarters' },
    { value: 'mudroom', label: 'Mudroom' },
    { value: 'laundry', label: 'Laundry Room' },
    { value: 'art-gallery', label: 'Art Gallery' },
    { value: 'music-room', label: 'Music Room' },
    { value: 'safe-room', label: 'Safe Room/Panic Room' },
  ];

  // Exterior Amenities - Pools & Water
  const poolWaterOptions = [
    { value: 'swimming-pool', label: 'Swimming Pool' },
    { value: 'pool-house', label: 'Pool House/Cabana' },
    { value: 'spa-hot-tub', label: 'Spa/Hot Tub' },
    { value: 'reflecting-pool', label: 'Reflecting Pool' },
    { value: 'water-feature', label: 'Fountain/Water Feature' },
    { value: 'koi-pond', label: 'Koi Pond' },
  ];

  // Exterior Amenities - Recreation & Sport
  const sportRecreationOptions = [
    { value: 'tennis-court', label: 'Tennis Court' },
    { value: 'pickleball-court', label: 'Pickleball Court' },
    { value: 'basketball-full', label: 'Basketball Court (Full)' },
    { value: 'basketball-half', label: 'Basketball Court (Half)' },
    { value: 'sport-court', label: 'Multi-Sport Court' },
    { value: 'putting-green', label: 'Putting Green' },
    { value: 'bocce-court', label: 'Bocce Court' },
    { value: 'playground', label: 'Children\'s Play Area' },
  ];

  // Exterior Amenities - Entertaining & Living
  const outdoorLivingOptions = [
    { value: 'outdoor-kitchen', label: 'Summer/Outdoor Kitchen' },
    { value: 'covered-outdoor', label: 'Covered Outdoor Living' },
    { value: 'fire-pit', label: 'Fire Pit' },
    { value: 'outdoor-fireplace', label: 'Outdoor Fireplace' },
    { value: 'event-lawn', label: 'Event Lawn (for tenting)' },
    { value: 'pergola-pavilion', label: 'Pergola/Pavilion' },
    { value: 'outdoor-dining', label: 'Outdoor Dining Terrace' },
    { value: 'bar-lounge', label: 'Outdoor Bar/Lounge' },
  ];

  // Exterior Amenities - Gardens & Landscape
  const gardenLandscapeOptions = [
    { value: 'formal-garden', label: 'Formal Garden' },
    { value: 'kitchen-garden', label: 'Kitchen Garden/Orchard' },
    { value: 'cutting-garden', label: 'Cutting Garden' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'potting-shed', label: 'Potting Shed' },
    { value: 'mature-trees', label: 'Mature Trees/Specimen Plantings' },
  ];

  // Exterior Amenities - Structures
  const ancillaryStructureOptions = [
    { value: 'guest-house', label: 'Guest House (Separate)' },
    { value: 'staff-cottage', label: 'Staff Cottage' },
    { value: 'gym-pavilion', label: 'Gym/Wellness Pavilion' },
    { value: 'art-studio', label: 'Art Studio' },
    { value: 'workshop', label: 'Workshop' },
  ];

  // Exterior Amenities - Access & Arrival
  const arrivalAccessOptions = [
    { value: 'gated-entry', label: 'Private Gated Entry' },
    { value: 'long-driveway', label: 'Long Private Driveway (500ft+)' },
    { value: 'motor-court', label: 'Motor Court' },
    { value: 'porte-cochere', label: 'Porte-Cochère' },
    { value: 'helipad', label: 'Helicopter Landing Area' },
    { value: 'boat-dock', label: 'Boat Dock/Water Access' },
  ];

  // Garage Options
  const garageOptions = [
    { value: '2-car', label: '2-Car Garage' },
    { value: '4-car', label: '4-Car Garage' },
    { value: '6-car', label: '6-Car Garage' },
    { value: '8-car', label: '8-Car Garage' },
    { value: '10-car', label: '10-Car Garage' },
    { value: '12-plus', label: '12+ Car Gallery/Showroom' },
  ];

  // Garage Features
  const garageFeatureOptions = [
    { value: 'climate-controlled', label: 'Climate Controlled' },
    { value: 'car-lift', label: 'Car Lift(s)' },
    { value: 'display-lighting', label: 'Display Lighting' },
    { value: 'viewing-lounge', label: 'Viewing Lounge' },
    { value: 'car-wash-bay', label: 'Car Wash Bay' },
    { value: 'ev-charging', label: 'EV Charging Stations' },
    { value: 'turntable', label: 'Turntable' },
  ];

  // Privacy & Grounds
  const privacyOptions = [
    { value: 'essential', label: 'Essential' },
    { value: 'preferred', label: 'Preferred' },
    { value: 'flexible', label: 'Flexible' },
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
      {/* Interior Spaces - Must Have */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Must-Have Interior Spaces</h3>
        <p className="kyc-section__group-description">
          Select spaces that are essential to your program - non-negotiables.
        </p>
        <div className="chip-select chip-select--wrap">
          {interiorSpaceOptions.map(space => (
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

      {/* Interior Spaces - Nice to Have */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Nice-to-Have Interior Spaces</h3>
        <p className="kyc-section__group-description">
          Spaces you'd like if budget and program allow.
        </p>
        <div className="chip-select chip-select--wrap">
          {interiorSpaceOptions.map(space => (
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

      {/* MVP Space Clarifications */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Space Program Clarifications</h3>
        <p className="kyc-section__group-description">
          These questions help fine-tune your area program and spatial relationships.
        </p>
        
        <div className="form-grid form-grid--2col">
          <div className="form-field">
            <label className="form-field__label">Separate Family Room?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              In addition to the Great Room - a more casual TV/hangout space
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.wantsSeparateFamilyRoom ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsSeparateFamilyRoom', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.wantsSeparateFamilyRoom ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsSeparateFamilyRoom', false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Second Formal Living / Salon?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              A second formal sitting room beyond the main living space
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.wantsSecondFormalLiving ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsSecondFormalLiving', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.wantsSecondFormalLiving ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsSecondFormalLiving', false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Built-in Bar?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              Dedicated bar area (not just kitchen island seating)
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.wantsBar ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBar', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.wantsBar ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBar', false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Kids Bunk Room?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              Extra sleeping for sleepovers (in addition to bedrooms)
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.wantsBunkRoom ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBunkRoom', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.wantsBunkRoom ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBunkRoom', false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label">Breakfast Nook?</label>
            <p className="form-field__help" style={{ marginBottom: '8px' }}>
              Casual eat-in area adjacent to kitchen
            </p>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${data.wantsBreakfastNook ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBreakfastNook', true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`toggle-btn ${!data.wantsBreakfastNook ? 'toggle-btn--active' : ''}`}
                onClick={() => handleChange('wantsBreakfastNook', false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Garage Requirements */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Garage & Auto Collection</h3>
        <p className="kyc-section__group-description">
          For significant car collections, the garage becomes a showroom.
        </p>
        
        <SelectField
          label="Garage Size Requirement"
          value={data.garageSize}
          onChange={(v) => handleChange('garageSize', v)}
          options={garageOptions}
          placeholder="Select minimum garage capacity..."
        />

        <div className="form-field">
          <label className="form-field__label">Garage Features</label>
          <div className="chip-select">
            {garageFeatureOptions.map(feature => (
              <button
                key={feature.value}
                className={`chip ${(data.garageFeatures || []).includes(feature.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('garageFeatures', feature.value)}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exterior Amenities - Pools & Water */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Exterior: Pools & Water Features</h3>
        
        <div className="form-field">
          <label className="form-field__label">Must Have</label>
          <div className="chip-select">
            {poolWaterOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.mustHavePoolWater || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('mustHavePoolWater', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-field__label">Would Like</label>
          <div className="chip-select">
            {poolWaterOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.wouldLikePoolWater || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('wouldLikePoolWater', item.value)}
                disabled={(data.mustHavePoolWater || []).includes(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exterior Amenities - Sport & Recreation */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Exterior: Sport & Recreation</h3>
        
        <div className="form-field">
          <label className="form-field__label">Must Have</label>
          <div className="chip-select">
            {sportRecreationOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.mustHaveSport || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('mustHaveSport', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-field__label">Would Like</label>
          <div className="chip-select">
            {sportRecreationOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.wouldLikeSport || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('wouldLikeSport', item.value)}
                disabled={(data.mustHaveSport || []).includes(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exterior Amenities - Outdoor Living & Entertaining */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Exterior: Outdoor Living & Entertaining</h3>
        
        <div className="form-field">
          <label className="form-field__label">Must Have</label>
          <div className="chip-select">
            {outdoorLivingOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.mustHaveOutdoorLiving || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('mustHaveOutdoorLiving', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-field__label">Would Like</label>
          <div className="chip-select">
            {outdoorLivingOptions.map(item => (
              <button
                key={item.value}
                className={`chip ${(data.wouldLikeOutdoorLiving || []).includes(item.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('wouldLikeOutdoorLiving', item.value)}
                disabled={(data.mustHaveOutdoorLiving || []).includes(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tier !== 'mvp' && (
        <>
          {/* Gardens & Landscape */}
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Exterior: Gardens & Landscape</h3>
            
            <div className="form-field">
              <label className="form-field__label">Must Have</label>
              <div className="chip-select">
                {gardenLandscapeOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.mustHaveGarden || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('mustHaveGarden', item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Would Like</label>
              <div className="chip-select">
                {gardenLandscapeOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.wouldLikeGarden || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('wouldLikeGarden', item.value)}
                    disabled={(data.mustHaveGarden || []).includes(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ancillary Structures */}
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Exterior: Ancillary Structures</h3>
            
            <div className="form-field">
              <label className="form-field__label">Must Have</label>
              <div className="chip-select">
                {ancillaryStructureOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.mustHaveStructures || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('mustHaveStructures', item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Would Like</label>
              <div className="chip-select">
                {ancillaryStructureOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.wouldLikeStructures || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('wouldLikeStructures', item.value)}
                    disabled={(data.mustHaveStructures || []).includes(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Arrival & Access */}
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Arrival & Access</h3>
            
            <div className="form-field">
              <label className="form-field__label">Must Have</label>
              <div className="chip-select">
                {arrivalAccessOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.mustHaveAccess || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('mustHaveAccess', item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Would Like</label>
              <div className="chip-select">
                {arrivalAccessOptions.map(item => (
                  <button
                    key={item.value}
                    className={`chip ${(data.wouldLikeAccess || []).includes(item.value) ? 'chip--selected' : ''}`}
                    onClick={() => toggleOption('wouldLikeAccess', item.value)}
                    disabled={(data.mustHaveAccess || []).includes(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Privacy & Grounds Scale */}
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Privacy & Grounds Scale</h3>
        <p className="kyc-section__group-description">
          These requirements directly impact site selection criteria.
        </p>

        <div className="form-grid form-grid--2col">
          <SelectField
            label="No Visible Neighbors"
            value={data.privacyNoNeighbors}
            onChange={(v) => handleChange('privacyNoNeighbors', v)}
            options={privacyOptions}
            placeholder="How important?"
          />
          <SelectField
            label="Perimeter Fully Walled/Gated"
            value={data.privacyPerimeter}
            onChange={(v) => handleChange('privacyPerimeter', v)}
            options={privacyOptions}
            placeholder="How important?"
          />
        </div>

        <div className="form-grid form-grid--2col">
          <FormField
            label="Minimum Setback from Road"
            value={data.minimumSetback}
            onChange={(v) => handleChange('minimumSetback', v)}
            placeholder="e.g., 200 ft, 500 ft..."
          />
          <FormField
            label="Minimum Lot Size"
            value={data.minimumLotSize}
            onChange={(v) => handleChange('minimumLotSize', v)}
            placeholder="e.g., 2 acres, 5 acres..."
          />
        </div>
      </div>

      {/* View Priorities */}
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
