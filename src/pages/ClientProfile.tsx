import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Users } from 'lucide-react';
import { Client, ClientProfileData, FamilyMember } from '../types';
import { getClient, saveClient, getClientProfile, saveClientProfile, generateId } from '../utils/storage';

export const ClientProfile: React.FC = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [profileData, setProfileData] = useState<ClientProfileData>({
    familyMembers: [],
    pets: [],
    mustHaveSpaces: [],
    niceToHaveSpaces: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const loadData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    const loadedClient = await getClient(clientId);
    const loadedProfile = await getClientProfile(clientId);
    
    if (loadedClient) setClient(loadedClient);
    if (loadedProfile) setProfileData(loadedProfile);
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!clientId) return;
    
    setSaving(true);
    const saved = await saveClientProfile(clientId, profileData);
    
    if (saved && client) {
      // Update client's updatedAt timestamp
      await saveClient({ ...client, updatedAt: new Date().toISOString() });
      alert('Profile saved successfully!');
    } else {
      alert('Failed to save profile. Please try again.');
    }
    
    setSaving(false);
  };

  const addFamilyMember = () => {
    setProfileData({
      ...profileData,
      familyMembers: [
        ...(profileData.familyMembers || []),
        { id: generateId(), name: '', age: 0, role: '' }
      ]
    });
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setProfileData({
      ...profileData,
      familyMembers: profileData.familyMembers?.map(fm =>
        fm.id === id ? { ...fm, ...updates } : fm
      )
    });
  };

  const removeFamilyMember = (id: string) => {
    setProfileData({
      ...profileData,
      familyMembers: profileData.familyMembers?.filter(fm => fm.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-amber-600"></div>
          <p className="text-slate-600 mt-4">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl font-semibold">Client not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Client Profile Overview
          </h1>
        </div>
        <p className="text-slate-600">
          Comprehensive discovery of lifestyle, preferences, and requirements
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Primary Residence
              </label>
              <input
                type="text"
                value={profileData.primaryResidence || ''}
                onChange={e => setProfileData({ ...profileData, primaryResidence: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Current primary residence location"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Location
              </label>
              <input
                type="text"
                value={profileData.projectLocation || client.location || ''}
                onChange={e => setProfileData({ ...profileData, projectLocation: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="New project location"
              />
            </div>
          </div>
        </div>

        {/* Family Structure */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Family Structure</h2>
            <button
              onClick={addFamilyMember}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Add Family Member
            </button>
          </div>
          
          {profileData.familyMembers && profileData.familyMembers.length > 0 ? (
            <div className="space-y-4">
              {profileData.familyMembers.map(member => (
                <div key={member.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={member.name}
                      onChange={e => updateFamilyMember(member.id, { name: e.target.value })}
                      placeholder="Name"
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="number"
                      value={member.age || ''}
                      onChange={e => updateFamilyMember(member.id, { age: Number(e.target.value) })}
                      placeholder="Age"
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={e => updateFamilyMember(member.id, { role: e.target.value })}
                      placeholder="Role (e.g., Parent, Child)"
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                  </div>
                  <button
                    onClick={() => removeFamilyMember(member.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No family members added yet. Click "Add Family Member" to begin.</p>
          )}
        </div>

        {/* Lifestyle & Entertainment */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Lifestyle & Entertainment</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Daily Routines & Hobbies
              </label>
              <textarea
                value={profileData.hobbies || ''}
                onChange={e => setProfileData({ ...profileData, hobbies: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Describe daily routines, hobbies, and activities..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Entertaining Frequency
                </label>
                <select
                  value={profileData.entertainingFrequency || ''}
                  onChange={e => setProfileData({ ...profileData, entertainingFrequency: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500"
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="rarely">Rarely</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Entertaining Style
                </label>
                <select
                  value={profileData.entertainingStyle || ''}
                  onChange={e => setProfileData({ ...profileData, entertainingStyle: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500"
                >
                  <option value="">Select style</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Space Requirements */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Space Requirements</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Current Space Issues
            </label>
            <textarea
              value={profileData.currentSpaceIssues || ''}
              onChange={e => setProfileData({ ...profileData, currentSpaceIssues: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="What doesn't work in your current space?"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => navigate(`/client/${clientId}/phase-1/overview`)}
          className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};
