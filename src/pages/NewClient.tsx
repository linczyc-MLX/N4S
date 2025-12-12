import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Home, Wrench, Check } from 'lucide-react';
import { Client, ClientPath, PortfolioContext } from '../types';
import { saveClient, generateId } from '../utils/storage';

export const NewClient: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    path: '' as ClientPath,
    portfolioContext: '' as PortfolioContext,
    landValue: 0,
    buildingCost: 0,
    timeline: ''
  });

  const handleSubmit = async () => {
    // Calculate land projection (simple 40% appreciation assumption)
    const landProjected = formData.landValue * 1.4;

    const newClient: Client = {
      id: generateId(),
      name: formData.name,
      path: formData.path,
      portfolioContext: formData.portfolioContext,
      phase: 1,
      stage: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      landValue: formData.landValue,
      landProjected: landProjected,
      buildingCost: formData.buildingCost,
      location: formData.location,
      timeline: formData.timeline
    };

    const saved = await saveClient(newClient);
    if (saved) {
      navigate(`/client/${newClient.id}/phase-1/launch`);
    } else {
      alert('Failed to create client. Please try again.');
    }
  };

  const pathOptions = [
    {
      id: 'B2',
      icon: Building2,
      title: 'Build',
      description: 'New construction from ground up',
      details: 'Green field development with full design freedom'
    },
    {
      id: 'B3',
      icon: Wrench,
      title: 'Bespoke',
      description: 'Renovation or repositioning',
      details: 'Transform existing property with strategic improvements'
    },
    {
      id: 'B1',
      icon: Home,
      title: 'Buying',
      description: 'Evaluate existing property',
      details: 'Advisory for property acquisition decisions',
      disabled: true
    }
  ];

  const portfolioOptions = [
    {
      id: 'forever',
      title: 'Forever Home',
      description: '30+ year hold',
      kycWeight: 70,
      kymWeight: 30,
      focus: 'Personal satisfaction prioritized'
    },
    {
      id: '10-year',
      title: '10-Year Hold',
      description: 'Medium-term investment',
      kycWeight: 50,
      kymWeight: 50,
      focus: 'Balanced approach'
    },
    {
      id: '5-year',
      title: '5-Year Hold',
      description: 'Short-term strategy',
      kycWeight: 30,
      kymWeight: 70,
      focus: 'Market alignment essential'
    },
    {
      id: 'investment',
      title: 'Investment Property',
      description: 'Pure ROI focus',
      kycWeight: 20,
      kymWeight: 80,
      focus: 'Maximum market appeal'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-white mb-4">
            Start New Client Engagement
          </h1>
          <p className="text-xl text-slate-300">
            Initialize the N4S advisory journey
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 transition-all ${
                  step > s ? 'bg-amber-600' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Jones Family, Smith Trust"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Miami Beach, Palm Jumeirah Dubai"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estimated Timeline
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g., 18-24 months"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Select Client Path
              </h2>
              <p className="text-slate-600 mb-8">
                Choose the type of engagement that matches this project
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {pathOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => !option.disabled && setFormData({ ...formData, path: option.id as ClientPath })}
                      disabled={option.disabled}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        formData.path === option.id
                          ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100'
                          : option.disabled
                          ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 hover:border-amber-300 hover:shadow-lg'
                      }`}
                    >
                      <Icon className={`w-10 h-10 mb-4 ${
                        formData.path === option.id ? 'text-amber-600' : 'text-slate-400'
                      }`} />
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{option.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{option.description}</p>
                      <p className="text-xs text-slate-500">{option.details}</p>
                      {option.disabled && (
                        <div className="mt-3 text-xs font-semibold text-amber-600">
                          Available in future release
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Portfolio Context
              </h2>
              <p className="text-slate-600 mb-8">
                Define the investment strategy to set KYC/KYM weighting
              </p>
              <div className="space-y-4">
                {portfolioOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, portfolioContext: option.id as PortfolioContext })}
                    className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                      formData.portfolioContext === option.id
                        ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100'
                        : 'border-slate-200 hover:border-amber-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{option.title}</h3>
                        <p className="text-sm text-slate-600">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Scoring Weights</div>
                        <div className="font-mono text-sm text-slate-700">
                          KYC: {option.kycWeight}% | KYM: {option.kymWeight}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-amber-700 font-semibold bg-amber-100 px-3 py-2 rounded">
                      {option.focus}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                Investment Parameters
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Land/Site Value (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.landValue || ''}
                    onChange={e => setFormData({ ...formData, landValue: Number(e.target.value) })}
                    placeholder="5000000"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Construction Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.buildingCost || ''}
                    onChange={e => setFormData({ ...formData, buildingCost: Number(e.target.value) })}
                    placeholder="15000000"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-mono"
                  />
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    These values initialize the Two-Investment Tracker and ROI projections throughout the journey.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-slate-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.name) ||
                  (step === 2 && !formData.path) ||
                  (step === 3 && !formData.portfolioContext)
                }
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.landValue || !formData.buildingCost}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Check className="w-5 h-5" />
                Create Client & Start Journey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
