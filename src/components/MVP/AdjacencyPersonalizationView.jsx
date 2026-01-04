/**
 * AdjacencyPersonalizationView (Updated for Phase 5C)
 * 
 * Now uses useKYCData hook for proper context integration.
 * Includes KYC completeness checking before allowing personalization.
 * 
 * REPLACE: src/components/MVP/AdjacencyPersonalizationView.jsx
 */

import React, { useMemo } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

// Import the hook
import { useKYCData, useKYCCompleteness } from '../../hooks/useKYCData';

// Import from mansion-program TypeScript module
import { 
  AdjacencyPersonalization,
  getPreset
} from '../../mansion-program';

/**
 * KYC Completeness Banner
 * Shows when KYC data is incomplete
 */
function KYCCompletenessCheck({ completeness, onGoToKYC }) {
  const { sections, percentage, hasMinimumData, missingRequired } = completeness;
  
  if (hasMinimumData) {
    return null; // Don't show if we have minimum data
  }
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-800">
            Complete Your Profile for Better Recommendations
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            The personalization engine works best with more information about your lifestyle.
            Currently {percentage}% complete.
          </p>
          
          {missingRequired.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-amber-800">Missing required sections:</p>
              <ul className="mt-1 text-sm text-amber-700">
                {missingRequired.map(section => (
                  <li key={section} className="flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    {formatSectionName(section)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={onGoToKYC}
            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Complete KYC Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Progress indicator showing KYC sections
 */
function KYCProgressIndicator({ completeness }) {
  const { sections, percentage } = completeness;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        {Object.entries(sections).map(([key, complete]) => (
          <div 
            key={key}
            className={`flex items-center gap-1 ${complete ? 'text-green-600' : 'text-gray-400'}`}
          >
            {complete ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-current" />
            )}
            <span>{formatSectionName(key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Format section key to display name
 */
function formatSectionName(key) {
  const names = {
    familyHousehold: 'Family & Household',
    lifestyleLiving: 'Lifestyle',
    workingPreferences: 'Work Preferences',
    projectParameters: 'Property Config',
    spaceRequirements: 'Space Requirements',
    designIdentity: 'Design Identity',
    budgetFramework: 'Budget',
    culturalContext: 'Cultural Context',
    portfolioContext: 'Portfolio'
  };
  return names[key] || key;
}

/**
 * Main Component
 */
export default function AdjacencyPersonalizationView({ 
  onBack,
  onComplete,
  onViewDiagram,
  onGoToKYC,
  showProgress = true
}) {
  // Use the hook to get all KYC data
  const { 
    kycResponse, 
    preset, 
    baseSF, 
    projectId, 
    projectName,
    completeness,
    rawData
  } = useKYCData();
  
  // Get base preset data
  const presetData = useMemo(() => {
    try {
      return getPreset(preset);
    } catch (e) {
      console.error('Failed to get preset:', e);
      return null;
    }
  }, [preset]);
  
  const baseMatrix = presetData?.adjacencyMatrix || [];
  
  // Handle completion
  const handleComplete = (result) => {
    console.log('Personalization complete:', result);
    if (onComplete) {
      onComplete(result);
    }
  };
  
  // If preset data failed, show error
  if (!presetData) {
    return (
      <div className="p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Unable to load Personalization</h3>
          <p className="text-red-600 text-sm mt-1">
            Please ensure property configuration is complete.
          </p>
        </div>
      </div>
    );
  }
  
  // If minimum data not present, show completeness check prominently
  if (!completeness.hasMinimumData) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Complete Your Profile First
            </h2>
            <p className="text-gray-600 mt-2">
              We need some basic information about your household and lifestyle 
              to provide personalized layout recommendations.
            </p>
          </div>
          
          <KYCProgressIndicator completeness={completeness} />
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-amber-800 mb-2">Required sections:</h4>
            <ul className="space-y-2">
              {completeness.missingRequired.map(section => (
                <li key={section} className="flex items-center gap-2 text-amber-700">
                  <XCircle className="w-4 h-4" />
                  {formatSectionName(section)}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onGoToKYC}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to KYC Profile
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the personalization UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional progress indicator at top */}
      {showProgress && completeness.percentage < 100 && (
        <div className="bg-white border-b px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Profile {completeness.percentage}% complete
              </span>
              <button
                onClick={onGoToKYC}
                className="text-blue-600 hover:text-blue-800"
              >
                Improve recommendations →
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      <AdjacencyPersonalization
        kyc={kycResponse}
        preset={preset}
        baseSF={baseSF}
        baseMatrix={baseMatrix}
        onComplete={handleComplete}
        onCancel={onBack}
        onViewDiagram={onViewDiagram}
      />
    </div>
  );
}
