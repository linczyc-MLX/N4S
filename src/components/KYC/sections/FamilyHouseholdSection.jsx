import React, { useState } from 'react';
import { Plus, X, User } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';

const FamilyHouseholdSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData } = useAppContext();
  const data = kycData[respondent].familyHousehold;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'familyHousehold', { [field]: value });
  };

  const [newMember, setNewMember] = useState({ name: '', age: '', role: '', specialNeeds: '' });

  const roleOptions = [
    { value: 'adult', label: 'Adult' },
    { value: 'teenager', label: 'Teenager (13-17)' },
    { value: 'child', label: 'Child (6-12)' },
    { value: 'young-child', label: 'Young Child (0-5)' },
    { value: 'elderly', label: 'Elderly Parent/Relative' },
  ];

  const addFamilyMember = () => {
    if (newMember.name) {
      const updatedMembers = [...(data.familyMembers || []), { ...newMember, id: Date.now() }];
      handleChange('familyMembers', updatedMembers);
      setNewMember({ name: '', age: '', role: '', specialNeeds: '' });
    }
  };

  const removeFamilyMember = (id) => {
    const updatedMembers = data.familyMembers.filter(m => m.id !== id);
    handleChange('familyMembers', updatedMembers);
  };

  return (
    <div className="kyc-section">
      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Family Members</h3>
        <p className="kyc-section__group-description">
          Add all family members who will use this residence. This helps us understand spatial requirements and room programming.
        </p>

        {/* Existing Members */}
        {data.familyMembers && data.familyMembers.length > 0 && (
          <div className="family-members-list">
            {data.familyMembers.map((member) => (
              <div key={member.id} className="family-member-card">
                <div className="family-member-card__icon">
                  <User size={20} />
                </div>
                <div className="family-member-card__content">
                  <span className="family-member-card__name">{member.name}</span>
                  <span className="family-member-card__details">
                    {member.age && `Age ${member.age}`}
                    {member.role && ` • ${roleOptions.find(r => r.value === member.role)?.label || member.role}`}
                  </span>
                  {member.specialNeeds && (
                    <span className="family-member-card__needs">{member.specialNeeds}</span>
                  )}
                </div>
                <button 
                  className="family-member-card__remove"
                  onClick={() => removeFamilyMember(member.id)}
                  aria-label="Remove member"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Member Form */}
        <div className="add-member-form">
          <div className="form-grid form-grid--4col">
            <FormField
              label="Name"
              value={newMember.name}
              onChange={(v) => setNewMember({ ...newMember, name: v })}
              placeholder="First name"
            />
            <FormField
              label="Age"
              type="number"
              value={newMember.age}
              onChange={(v) => setNewMember({ ...newMember, age: v })}
              placeholder="Age"
              min={0}
              max={120}
            />
            <SelectField
              label="Role"
              value={newMember.role}
              onChange={(v) => setNewMember({ ...newMember, role: v })}
              options={roleOptions}
              placeholder="Select..."
            />
            <div className="form-field">
              <label className="form-field__label">&nbsp;</label>
              <button 
                className="btn btn--secondary btn--full"
                onClick={addFamilyMember}
                disabled={!newMember.name}
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>
          
          {tier !== 'mvp' && (
            <FormField
              label="Special Needs / Accommodations"
              value={newMember.specialNeeds}
              onChange={(v) => setNewMember({ ...newMember, specialNeeds: v })}
              placeholder="Mobility, sensory, medical requirements..."
            />
          )}
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Pets</h3>
        <FormField
          label="Pets"
          value={data.pets}
          onChange={(v) => handleChange('pets', v)}
          placeholder="e.g., 2 dogs (Golden Retrievers), 1 cat - all indoor"
          helpText="Include type, quantity, and indoor/outdoor status"
        />
        
        {data.pets && data.pets.trim() !== '' && (
          <div className="form-grid form-grid--2col" style={{ marginTop: '1rem' }}>
            <div className="form-field">
              <label className="form-field__label">Pet Grooming/Washing Room?</label>
              <p className="form-field__help" style={{ marginBottom: '8px' }}>
                Dedicated space for pet bathing and grooming
              </p>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${data.petGroomingRoom ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('petGroomingRoom', true)}
                >
                  Yes
                </button>
                <button
                  className={`toggle-btn ${!data.petGroomingRoom ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('petGroomingRoom', false)}
                >
                  No
                </button>
              </div>
            </div>
            <div className="form-field">
              <label className="form-field__label">Outdoor Dog Run?</label>
              <p className="form-field__help" style={{ marginBottom: '8px' }}>
                Fenced outdoor area for dogs to exercise
              </p>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${data.petDogRun ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('petDogRun', true)}
                >
                  Yes
                </button>
                <button
                  className={`toggle-btn ${!data.petDogRun ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('petDogRun', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {tier !== 'mvp' && (
        <>
          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Staff & Multi-Generational</h3>
            
            <SelectField
              label="Staffing Level"
              value={data.staffingLevel}
              onChange={(v) => handleChange('staffingLevel', v)}
              options={[
                { value: 'none', label: 'No Staff' },
                { value: 'part_time', label: 'Part-Time Staff (cleaning, etc.)' },
                { value: 'full_time', label: 'Full-Time Staff (daily presence)' },
                { value: 'live_in', label: 'Live-In Staff (requires quarters)' },
              ]}
              placeholder="Select staffing level..."
              helpText="Affects service areas and staff accommodation requirements"
            />
            
            {data.staffingLevel === 'live_in' && (
              <div className="form-grid form-grid--2col">
                <FormField
                  label="Live-in Staff Count"
                  type="number"
                  value={data.liveInStaff}
                  onChange={(v) => handleChange('liveInStaff', parseInt(v) || null)}
                  placeholder="Number of live-in staff"
                  min={0}
                />
                <div className="form-field">
                  <label className="form-field__label">Staff Quarters Required?</label>
                  <div className="toggle-group">
                    <button
                      className={`toggle-btn ${data.staffAccommodationRequired ? 'toggle-btn--active' : ''}`}
                      onClick={() => handleChange('staffAccommodationRequired', true)}
                    >
                      Yes
                    </button>
                    <button
                      className={`toggle-btn ${!data.staffAccommodationRequired ? 'toggle-btn--active' : ''}`}
                      onClick={() => handleChange('staffAccommodationRequired', false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="form-field">
              <label className="form-field__label">Multi-Generational Needs?</label>
              <p className="form-field__help" style={{ marginBottom: '8px' }}>
                Will parents or in-laws be living with you?
              </p>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${data.multigenerationalNeeds ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('multigenerationalNeeds', true)}
                >
                  Yes
                </button>
                <button
                  className={`toggle-btn ${!data.multigenerationalNeeds ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('multigenerationalNeeds', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div className="kyc-section__group">
            <h3 className="kyc-section__group-title">Anticipated Changes</h3>
            <FormField
              label="Family Changes Expected"
              type="textarea"
              value={data.anticipatedFamilyChanges}
              onChange={(v) => handleChange('anticipatedFamilyChanges', v)}
              placeholder="Any expected changes? Growing family, children leaving for college, aging parents moving in..."
              rows={3}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FamilyHouseholdSection;
