import React, { useState } from 'react';
import { AlertTriangle, Send, Clock, CheckCircle, ExternalLink, Mail, RefreshCw, Users, ClipboardList, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';
import FormField from '../../shared/FormField';
import SelectField from '../../shared/SelectField';
import SliderField from '../../shared/SliderField';

const LifestyleLivingSection = ({ respondent, tier }) => {
  const { kycData, updateKYCData, clientData, saveNow } = useAppContext();
  const data = kycData[respondent].lifestyleLiving;

  // LuXeBrief Lifestyle state - now supports dual respondent
  const [luxeBriefLoading, setLuxeBriefLoading] = useState({ principal: false, secondary: false });
  const [luxeBriefError, setLuxeBriefError] = useState({ principal: null, secondary: null });

  // LuXeBrief Living state (form-based questionnaire)
  const [luxeLivingLoading, setLuxeLivingLoading] = useState({ principal: false, secondary: false });
  const [luxeLivingError, setLuxeLivingError] = useState({ principal: null, secondary: null });

  // Track if user has confirmed they want to send Secondary questionnaire
  const [secondaryConfirmed, setSecondaryConfirmed] = useState({
    lifestyle: false,
    living: false
  });

  // State for Manual Entry panel expansion
  const [manualEntryExpanded, setManualEntryExpanded] = useState(false);

  // State for export loading/error
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Get LuXeBrief Lifestyle status from lifestyleLiving data (for current respondent view)
  const luxeBriefStatus = data.luxeBriefStatus || 'not_sent'; // not_sent, sent, completed
  const luxeBriefSessionId = data.luxeBriefSessionId;
  const luxeBriefSentAt = data.luxeBriefSentAt;
  const luxeBriefCompletedAt = data.luxeBriefCompletedAt;

  // Get LuXeBrief Living status (form-based questionnaire)
  const luxeLivingStatus = data.luxeLivingStatus || 'not_sent';
  const luxeLivingSessionId = data.luxeLivingSessionId;
  const luxeLivingSentAt = data.luxeLivingSentAt;
  const luxeLivingCompletedAt = data.luxeLivingCompletedAt;

  // Get principal's WFH data for Secondary confirmation
  const principalLifestyle = kycData.principal?.lifestyleLiving || {};
  const principalWfhCount = principalLifestyle.wfhPeopleCount || 0;
  const principalFirstName = kycData.principal?.portfolioContext?.principalFirstName || 'Principal';
  const showWfhConfirmation = respondent === 'secondary' && principalWfhCount >= 2;

  // Get stakeholder data for LuXeBrief
  const portfolioContext = kycData.principal?.portfolioContext || {};

  // Check questionnaire respondent preference (from Settings)
  const questionnaireRespondent = portfolioContext.questionnaireRespondent || 'principal_only';
  const isDualRespondent = questionnaireRespondent === 'principal_and_secondary';

  // Get both Principal and Secondary data for dual-respondent mode
  const principalName = `${portfolioContext.principalFirstName || ''} ${portfolioContext.principalLastName || ''}`.trim();
  const principalEmail = portfolioContext.principalEmail;
  const secondaryName = `${portfolioContext.secondaryFirstName || ''} ${portfolioContext.secondaryLastName || ''}`.trim();
  const secondaryEmail = portfolioContext.secondaryEmail;

  // Current respondent's data (for single respondent mode)
  const stakeholderName = respondent === 'principal' ? principalName : secondaryName;
  const stakeholderEmail = respondent === 'principal' ? principalEmail : secondaryEmail;
  const projectName = clientData?.projectName || 'Untitled Project';

  // Get LuXeBrief status for both respondents (for dual-respondent mode)
  const principalLuxeBriefData = kycData.principal?.lifestyleLiving || {};
  const secondaryLuxeBriefData = kycData.secondary?.lifestyleLiving || {};

  // Check if we can send LuXeBrief (need name and email)
  const canSendLuXeBrief = stakeholderName && stakeholderEmail;
  const canSendPrincipalLuXeBrief = principalName && principalEmail;
  const canSendSecondaryLuXeBrief = secondaryName && secondaryEmail;

  const handleChange = (field, value) => {
    updateKYCData(respondent, 'lifestyleLiving', { [field]: value });
  };

  // Handle sending LuXeBrief invitation - now supports target parameter for dual-respondent mode
  const handleSendLuXeBrief = async (target = respondent) => {
    const targetName = target === 'principal' ? principalName : secondaryName;
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;

    if (!targetName || !targetEmail) return;

    setLuxeBriefLoading(prev => ({ ...prev, [target]: true }));
    setLuxeBriefError(prev => ({ ...prev, [target]: null }));

    try {
      // Generate subdomain from name (e.g., "Peter Thornwood" → "pthornwood")
      const nameParts = targetName.split(' ');
      const subdomain = nameParts.length >= 2
        ? `${nameParts[0].charAt(0).toLowerCase()}${nameParts[nameParts.length - 1].toLowerCase()}`
        : targetName.toLowerCase().replace(/\s+/g, '');

      const response = await fetch('https://luxebrief.not-4.sale/api/sessions/from-n4s', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer luxebrief-admin-2024'
        },
        body: JSON.stringify({
          n4sProjectId: clientData?.id || 'unknown',
          principalType: target,
          clientName: targetName,
          clientEmail: targetEmail,
          projectName: projectName,
          subdomain: subdomain
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create LuXeBrief session');
      }

      const result = await response.json();

      // Data to save for this target
      const lifestyleData = {
        luxeBriefStatus: 'sent',
        luxeBriefSessionId: result.sessionId,
        luxeBriefSentAt: new Date().toISOString(),
        luxeBriefSubdomain: subdomain
      };

      // Update status in KYC data for the target respondent
      updateKYCData(target, 'lifestyleLiving', lifestyleData);

      // Persist to server immediately with the data (fixes race condition)
      if (saveNow) {
        saveNow({
          kycData: {
            [target]: {
              lifestyleLiving: lifestyleData
            }
          }
        });
      }

    } catch (error) {
      console.error('LuXeBrief send error:', error);
      setLuxeBriefError(prev => ({ ...prev, [target]: error.message || 'Failed to send LuXeBrief invitation' }));
    } finally {
      setLuxeBriefLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Handle checking LuXeBrief status - now supports target parameter
  // Enhanced to search by email if stored session is not completed (handles session ID mismatch)
  const handleRefreshStatus = async (target = respondent) => {
    const targetData = target === 'principal' ? principalLuxeBriefData : secondaryLuxeBriefData;
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;
    const sessionId = targetData.luxeBriefSessionId;

    setLuxeBriefLoading(prev => ({ ...prev, [target]: true }));
    try {
      // First, check the stored session ID if we have one
      if (sessionId) {
        const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/${sessionId}`);
        if (response.ok) {
          const session = await response.json();
          if (session.status === 'completed' && targetData.luxeBriefStatus !== 'completed') {
            const completedData = {
              luxeBriefStatus: 'completed',
              luxeBriefSessionId: session.id,
              luxeBriefCompletedAt: session.completedAt || new Date().toISOString()
            };
            updateKYCData(target, 'lifestyleLiving', completedData);
            // Persist immediately with data (fixes race condition)
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: completedData } } });
            return; // Done - found completed session
          }
        }
      }

      // If stored session not completed (or not found), search by email for any completed session
      // This handles the session ID mismatch case (e.g., CORS failed on original send, user completed via curl-created session)
      if (targetEmail) {
        const emailResponse = await fetch(`https://luxebrief.not-4.sale/api/sessions/by-email/${encodeURIComponent(targetEmail)}`);
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          // If we found a completed session with a different ID, update our stored session ID
          if (emailData.status === 'completed') {
            const completedData = {
              luxeBriefStatus: 'completed',
              luxeBriefSessionId: emailData.sessionId,
              luxeBriefCompletedAt: emailData.completedAt || new Date().toISOString()
            };
            updateKYCData(target, 'lifestyleLiving', completedData);
            // Persist immediately with data (fixes race condition)
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: completedData } } });
          } else if (!sessionId && emailData.sessionId) {
            // If we had no session ID but found one by email, store it
            const sessionData = { luxeBriefSessionId: emailData.sessionId };
            updateKYCData(target, 'lifestyleLiving', sessionData);
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: sessionData } } });
          }
        }
      }
    } catch (error) {
      console.error('Status refresh error:', error);
    } finally {
      setLuxeBriefLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Handle sending LuXeBrief Living invitation (form-based questionnaire)
  const handleSendLuxeLiving = async (target = respondent) => {
    const targetName = target === 'principal' ? principalName : secondaryName;
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;

    if (!targetName || !targetEmail) return;

    setLuxeLivingLoading(prev => ({ ...prev, [target]: true }));
    setLuxeLivingError(prev => ({ ...prev, [target]: null }));

    try {
      // Generate subdomain from name
      const nameParts = targetName.split(' ');
      const subdomain = nameParts.length >= 2
        ? `${nameParts[0].charAt(0).toLowerCase()}${nameParts[nameParts.length - 1].toLowerCase()}`
        : targetName.toLowerCase().replace(/\s+/g, '');

      const response = await fetch('https://luxebrief.not-4.sale/api/sessions/from-n4s', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer luxebrief-admin-2024'
        },
        body: JSON.stringify({
          n4sProjectId: clientData?.id || 'unknown',
          principalType: target,
          clientName: targetName,
          clientEmail: targetEmail,
          projectName: projectName,
          subdomain: subdomain,
          sessionType: 'living' // Key difference: form-based questionnaire
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create LuXeBrief Living session');
      }

      const result = await response.json();

      // Data to save for this target
      const livingData = {
        luxeLivingStatus: 'sent',
        luxeLivingSessionId: result.sessionId,
        luxeLivingSentAt: new Date().toISOString(),
        luxeLivingSubdomain: subdomain
      };

      // Update status in KYC data for the target respondent
      updateKYCData(target, 'lifestyleLiving', livingData);

      // Persist to server immediately with the data (fixes race condition)
      if (saveNow) {
        saveNow({
          kycData: {
            [target]: {
              lifestyleLiving: livingData
            }
          }
        });
      }

    } catch (error) {
      console.error('LuXeBrief Living send error:', error);
      setLuxeLivingError(prev => ({ ...prev, [target]: error.message || 'Failed to send LuXeBrief Living invitation' }));
    } finally {
      setLuxeLivingLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Sync Living responses to KYC spaceRequirements
  const syncLivingToSpaceRequirements = async (sessionId, target) => {
    try {
      // Fetch the living responses from LuXeBrief
      const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/${sessionId}/living-responses`);
      if (!response.ok) {
        console.error('Failed to fetch Living responses for sync');
        return;
      }

      const livingResponses = await response.json();

      // Parse and map responses to KYC spaceRequirements fields
      const spaceRequirements = {};

      for (const resp of livingResponses) {
        try {
          const data = JSON.parse(resp.data);

          // Map Interior step data
          if (resp.stepId === 'interior') {
            if (data.mustHaveSpaces?.length) spaceRequirements.mustHaveSpaces = data.mustHaveSpaces;
            if (data.niceToHaveSpaces?.length) spaceRequirements.niceToHaveSpaces = data.niceToHaveSpaces;
            if (data.wantsSeparateFamilyRoom !== undefined) spaceRequirements.wantsSeparateFamilyRoom = data.wantsSeparateFamilyRoom;
            if (data.wantsSecondFormalLiving !== undefined) spaceRequirements.wantsSecondFormalLiving = data.wantsSecondFormalLiving;
            if (data.wantsBar !== undefined) spaceRequirements.wantsBar = data.wantsBar;
            if (data.wantsBunkRoom !== undefined) spaceRequirements.wantsBunkRoom = data.wantsBunkRoom;
            if (data.wantsBreakfastNook !== undefined) spaceRequirements.wantsBreakfastNook = data.wantsBreakfastNook;
          }

          // Map Exterior step data
          if (resp.stepId === 'exterior') {
            if (data.mustHavePoolWater?.length) spaceRequirements.mustHavePoolWater = data.mustHavePoolWater;
            if (data.wouldLikePoolWater?.length) spaceRequirements.wouldLikePoolWater = data.wouldLikePoolWater;
            if (data.mustHaveSport?.length) spaceRequirements.mustHaveSport = data.mustHaveSport;
            if (data.wouldLikeSport?.length) spaceRequirements.wouldLikeSport = data.wouldLikeSport;
            if (data.mustHaveOutdoorLiving?.length) spaceRequirements.mustHaveOutdoorLiving = data.mustHaveOutdoorLiving;
            if (data.wouldLikeOutdoorLiving?.length) spaceRequirements.wouldLikeOutdoorLiving = data.wouldLikeOutdoorLiving;
            if (data.mustHaveGarden?.length) spaceRequirements.mustHaveGarden = data.mustHaveGarden;
            if (data.wouldLikeGarden?.length) spaceRequirements.wouldLikeGarden = data.wouldLikeGarden;
            if (data.mustHaveStructures?.length) spaceRequirements.mustHaveStructures = data.mustHaveStructures;
            if (data.wouldLikeStructures?.length) spaceRequirements.wouldLikeStructures = data.wouldLikeStructures;
            if (data.mustHaveAccess?.length) spaceRequirements.mustHaveAccess = data.mustHaveAccess;
            if (data.wouldLikeAccess?.length) spaceRequirements.wouldLikeAccess = data.wouldLikeAccess;
          }

          // Map Final step data (garage, tech, views, etc.)
          if (resp.stepId === 'final') {
            if (data.garageSize) spaceRequirements.garageSize = data.garageSize;
            if (data.garageFeatures?.length) spaceRequirements.garageFeatures = data.garageFeatures;
            if (data.technologyRequirements?.length) spaceRequirements.technologyRequirements = data.technologyRequirements;
            if (data.sustainabilityPriorities?.length) spaceRequirements.sustainabilityPriorities = data.sustainabilityPriorities;
            if (data.viewPriorityRooms?.length) spaceRequirements.viewPriorityRooms = data.viewPriorityRooms;
            if (data.minimumLotSize) spaceRequirements.minimumLotSize = data.minimumLotSize;
            if (data.minimumSetback) spaceRequirements.minimumSetback = data.minimumSetback;
            if (data.currentSpacePainPoints) spaceRequirements.currentSpacePainPoints = data.currentSpacePainPoints;
            if (data.dailyRoutinesSummary) spaceRequirements.dailyRoutinesSummary = data.dailyRoutinesSummary;
          }
        } catch (e) {
          console.error('Error parsing Living response:', e);
        }
      }

      // Update KYC spaceRequirements with synced data
      if (Object.keys(spaceRequirements).length > 0) {
        console.log(`[Living Sync] Syncing ${Object.keys(spaceRequirements).length} fields to ${target} spaceRequirements`);
        updateKYCData(target, 'spaceRequirements', spaceRequirements);
      }
    } catch (error) {
      console.error('Error syncing Living to spaceRequirements:', error);
    }
  };

  // Handle checking LuXeBrief Living status
  const handleRefreshLivingStatus = async (target = respondent) => {
    const targetData = target === 'principal' ? principalLuxeBriefData : secondaryLuxeBriefData;
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;
    const sessionId = targetData.luxeLivingSessionId;

    setLuxeLivingLoading(prev => ({ ...prev, [target]: true }));
    try {
      // First, check the stored session ID if we have one
      if (sessionId) {
        const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/${sessionId}`);
        if (response.ok) {
          const session = await response.json();
          if (session.status === 'completed' && targetData.luxeLivingStatus !== 'completed') {
            // Update Living status
            const completedData = {
              luxeLivingStatus: 'completed',
              luxeLivingSessionId: session.id,
              luxeLivingCompletedAt: session.completedAt || new Date().toISOString()
            };
            updateKYCData(target, 'lifestyleLiving', completedData);

            // CRITICAL: Sync Living responses to KYC spaceRequirements for FYI module
            await syncLivingToSpaceRequirements(session.id, target);
            // Persist immediately with data (fixes race condition)
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: completedData } } });
            return;
          }
        }
      }

      // If stored session not completed, search by email for any completed Living session
      if (targetEmail) {
        const emailResponse = await fetch(`https://luxebrief.not-4.sale/api/sessions/by-email/${encodeURIComponent(targetEmail)}?sessionType=living`);
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          if (emailData.status === 'completed') {
            const completedData = {
              luxeLivingStatus: 'completed',
              luxeLivingSessionId: emailData.sessionId,
              luxeLivingCompletedAt: emailData.completedAt || new Date().toISOString()
            };
            updateKYCData(target, 'lifestyleLiving', completedData);

            // CRITICAL: Sync Living responses to KYC spaceRequirements for FYI module
            await syncLivingToSpaceRequirements(emailData.sessionId, target);
            // Persist immediately with data (fixes race condition)
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: completedData } } });
          } else if (!sessionId && emailData.sessionId) {
            const sessionData = { luxeLivingSessionId: emailData.sessionId };
            updateKYCData(target, 'lifestyleLiving', sessionData);
            if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: sessionData } } });
          }
        }
      }
    } catch (error) {
      console.error('Living status refresh error:', error);
    } finally {
      setLuxeLivingLoading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Get correct Lifestyle session ID by email lookup (returns sessionId or null)
  const getCorrectLifestyleSessionId = async (targetEmail) => {
    if (!targetEmail) return null;
    try {
      const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/by-email/${encodeURIComponent(targetEmail)}?sessionType=lifestyle`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed' && data.sessionId) {
          return data.sessionId;
        }
      }
    } catch (e) {
      console.error('Error getting correct Lifestyle session ID:', e);
    }
    return null;
  };

  // Handle clicking the Lifestyle Report button - verify session ID first
  const handleLifestyleReportClick = async (e, target) => {
    e.preventDefault();
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;
    const targetData = target === 'principal' ? principalLuxeBriefData : secondaryLuxeBriefData;
    const storedSessionId = targetData.luxeBriefSessionId;

    // Get the correct session ID from LuXeBrief
    const correctSessionId = await getCorrectLifestyleSessionId(targetEmail);

    if (correctSessionId && correctSessionId !== storedSessionId) {
      // Session ID mismatch - update N4S and use correct one
      console.log(`[Lifestyle Report] Correcting session ID from ${storedSessionId} to ${correctSessionId}`);
      const correctedData = {
        luxeBriefSessionId: correctSessionId,
        luxeBriefStatus: 'completed'
      };
      updateKYCData(target, 'lifestyleLiving', correctedData);
      if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: correctedData } } });
      window.open(`https://luxebrief.not-4.sale/api/sessions/${correctSessionId}/export/pdf`, '_blank');
    } else if (correctSessionId) {
      // Session ID is correct, just open
      window.open(`https://luxebrief.not-4.sale/api/sessions/${correctSessionId}/export/pdf`, '_blank');
    } else if (storedSessionId) {
      // Couldn't verify, use stored (fallback)
      window.open(`https://luxebrief.not-4.sale/api/sessions/${storedSessionId}/export/pdf`, '_blank');
    } else {
      alert('No Lifestyle session found. Please refresh the status.');
    }
  };

  // Get correct Living session ID by email lookup (returns sessionId or null)
  const getCorrectLivingSessionId = async (targetEmail) => {
    if (!targetEmail) return null;
    try {
      const response = await fetch(`https://luxebrief.not-4.sale/api/sessions/by-email/${encodeURIComponent(targetEmail)}?sessionType=living`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completed' && data.sessionId) {
          return data.sessionId;
        }
      }
    } catch (e) {
      console.error('Error getting correct Living session ID:', e);
    }
    return null;
  };

  // Handle clicking the Living Report button - verify session ID first
  const handleLivingReportClick = async (e, target) => {
    e.preventDefault();
    const targetEmail = target === 'principal' ? principalEmail : secondaryEmail;
    const targetData = target === 'principal' ? principalLuxeBriefData : secondaryLuxeBriefData;
    const storedSessionId = targetData.luxeLivingSessionId;

    // Get the correct session ID from LuXeBrief
    const correctSessionId = await getCorrectLivingSessionId(targetEmail);

    if (correctSessionId && correctSessionId !== storedSessionId) {
      // Session ID mismatch - update N4S and use correct one
      console.log(`[Living Report] Correcting session ID from ${storedSessionId} to ${correctSessionId}`);
      const correctedData = {
        luxeLivingSessionId: correctSessionId,
        luxeLivingStatus: 'completed'
      };
      updateKYCData(target, 'lifestyleLiving', correctedData);
      if (saveNow) saveNow({ kycData: { [target]: { lifestyleLiving: correctedData } } });
      window.open(`https://luxebrief.not-4.sale/api/sessions/${correctSessionId}/export/pdf`, '_blank');
    } else if (correctSessionId) {
      // Session ID is correct, just open
      window.open(`https://luxebrief.not-4.sale/api/sessions/${correctSessionId}/export/pdf`, '_blank');
    } else if (storedSessionId) {
      // Couldn't verify, use stored (fallback)
      window.open(`https://luxebrief.not-4.sale/api/sessions/${storedSessionId}/export/pdf`, '_blank');
    } else {
      alert('No Living session found. Please refresh the status.');
    }
  };

  // Handle exporting the Manual Lifestyle & Living Report
  const handleExportManualReport = async () => {
    setExportError(null);

    // Get space requirements data from principal
    const spaceReqs = kycData.principal?.spaceRequirements || {};

    // Validate: Check that at least SOME data has been entered
    const hasInteriorData = spaceReqs.mustHaveSpaces?.length > 0 || spaceReqs.niceToHaveSpaces?.length > 0;
    const hasExteriorData = spaceReqs.mustHavePoolWater?.length > 0 || spaceReqs.wouldLikePoolWater?.length > 0 ||
                            spaceReqs.mustHaveSport?.length > 0 || spaceReqs.wouldLikeSport?.length > 0 ||
                            spaceReqs.mustHaveOutdoorLiving?.length > 0 || spaceReqs.wouldLikeOutdoorLiving?.length > 0;
    const hasOtherData = spaceReqs.garageSize || spaceReqs.technologyRequirements?.length > 0;
    const hasLifestyleData = data.workFromHome || data.hobbies?.length > 0 || data.entertainingFrequency;

    if (!hasInteriorData && !hasExteriorData && !hasOtherData && !hasLifestyleData) {
      setExportError('Please enter some data before exporting the report.');
      return;
    }

    setExportLoading(true);

    try {
      // Collect ALL manual entry data from KYC
      const manualData = {
        // Interior Spaces
        mustHaveSpaces: spaceReqs.mustHaveSpaces || [],
        niceToHaveSpaces: spaceReqs.niceToHaveSpaces || [],
        wantsSeparateFamilyRoom: spaceReqs.wantsSeparateFamilyRoom,
        wantsSecondFormalLiving: spaceReqs.wantsSecondFormalLiving,
        wantsBar: spaceReqs.wantsBar,
        wantsBunkRoom: spaceReqs.wantsBunkRoom,
        wantsBreakfastNook: spaceReqs.wantsBreakfastNook,

        // Exterior - Pool & Water
        mustHavePoolWater: spaceReqs.mustHavePoolWater || [],
        wouldLikePoolWater: spaceReqs.wouldLikePoolWater || [],

        // Exterior - Sports
        mustHaveSport: spaceReqs.mustHaveSport || [],
        wouldLikeSport: spaceReqs.wouldLikeSport || [],

        // Exterior - Outdoor Living
        mustHaveOutdoorLiving: spaceReqs.mustHaveOutdoorLiving || [],
        wouldLikeOutdoorLiving: spaceReqs.wouldLikeOutdoorLiving || [],

        // Exterior - Garden
        mustHaveGarden: spaceReqs.mustHaveGarden || [],
        wouldLikeGarden: spaceReqs.wouldLikeGarden || [],

        // Exterior - Structures
        mustHaveStructures: spaceReqs.mustHaveStructures || [],
        wouldLikeStructures: spaceReqs.wouldLikeStructures || [],

        // Exterior - Access
        mustHaveAccess: spaceReqs.mustHaveAccess || [],
        wouldLikeAccess: spaceReqs.wouldLikeAccess || [],

        // Final/Additional Details
        garageSize: spaceReqs.garageSize,
        garageFeatures: spaceReqs.garageFeatures || [],
        technologyRequirements: spaceReqs.technologyRequirements || [],
        sustainabilityPriorities: spaceReqs.sustainabilityPriorities || [],
        viewPriorityRooms: spaceReqs.viewPriorityRooms || [],
        minimumLotSize: spaceReqs.minimumLotSize,
        minimumSetback: spaceReqs.minimumSetback,
        currentSpacePainPoints: spaceReqs.currentSpacePainPoints,

        // Lifestyle data from this section
        workFromHome: data.workFromHome,
        wfhPeopleCount: data.wfhPeopleCount,
        separateOfficesRequired: data.separateOfficesRequired,
        officeRequirements: data.officeRequirements,
        hobbies: data.hobbies || [],
        hobbyDetails: data.hobbyDetails,
        lateNightMediaUse: data.lateNightMediaUse,
        entertainingFrequency: data.entertainingFrequency,
        entertainingStyle: data.entertainingStyle,
        typicalGuestCount: data.typicalGuestCount,
        wellnessPriorities: data.wellnessPriorities || [],
        privacyLevelRequired: data.privacyLevelRequired,
        noiseSensitivity: data.noiseSensitivity,
        indoorOutdoorLiving: data.indoorOutdoorLiving,
        dailyRoutinesSummary: data.dailyRoutinesSummary,

        // Project/Client Info
        projectName: clientData?.projectName || 'N4S Project',
        clientName: `${portfolioContext.principalFirstName || ''} ${portfolioContext.principalLastName || ''}`.trim() || 'Client',
        generatedDate: new Date().toISOString(),
        isManualEntry: true
      };

      // Call API to generate PDF
      const response = await fetch('https://luxebrief.not-4.sale/api/manual-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer luxebrief-admin-2024'
        },
        body: JSON.stringify(manualData)
      });

      if (response.ok) {
        // Download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Manual-Lifestyle-Living-Report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error exporting manual report:', error);
      setExportError('Failed to export report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const wfhOptions = [
    { value: 'never', label: 'Never' },
    { value: 'sometimes', label: 'Sometimes (1-2 days/week)' },
    { value: 'often', label: 'Often (3-4 days/week)' },
    { value: 'always', label: 'Always (Full Remote)' },
  ];

  const entertainingOptions = [
    { value: 'rarely', label: 'Rarely (Few times/year)' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily/Constantly' },
  ];

  const entertainingStyleOptions = [
    { value: 'formal', label: 'Formal (Seated dinners)' },
    { value: 'casual', label: 'Casual (Relaxed gatherings)' },
    { value: 'both', label: 'Both Formal & Casual' },
  ];

  const hobbyOptions = [
    { value: 'art', label: 'Art/Painting' },
    { value: 'music', label: 'Music/Instruments' },
    { value: 'fitness', label: 'Fitness/Home Gym' },
    { value: 'yoga', label: 'Yoga/Meditation' },
    { value: 'cooking', label: 'Cooking/Culinary' },
    { value: 'wine', label: 'Wine Collection' },
    { value: 'cars', label: 'Car Collection' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'reading', label: 'Reading/Library' },
    { value: 'gaming', label: 'Gaming/Media' },
    { value: 'spa', label: 'Spa/Wellness' },
    { value: 'crafts', label: 'Crafts/Making' },
  ];

  const wellnessOptions = [
    { value: 'gym', label: 'Home Gym' },
    { value: 'pool', label: 'Pool' },
    { value: 'spa', label: 'Spa/Sauna' },
    { value: 'yoga', label: 'Yoga Studio' },
    { value: 'massage', label: 'Massage Room' },
    { value: 'meditation', label: 'Meditation Space' },
    { value: 'cold-plunge', label: 'Cold Plunge' },
  ];

  const toggleOption = (field, option) => {
    const current = data[field] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    handleChange(field, updated);
  };

  // Helper component to render a single respondent's LuXeBrief card
  const renderLuXeBriefCard = (target, targetName, targetEmail, targetData, isCompact = false) => {
    const status = targetData.luxeBriefStatus || 'not_sent';
    const sessionId = targetData.luxeBriefSessionId;
    const sentAt = targetData.luxeBriefSentAt;
    const completedAt = targetData.luxeBriefCompletedAt;
    const subdomain = targetData.luxeBriefSubdomain;
    const canSend = targetName && targetEmail;
    const loading = luxeBriefLoading[target];
    const error = luxeBriefError[target];

    // Check if this secondary has been confirmed (4-step workflow)
    const isConfirmed = target === 'secondary' && secondaryConfirmed.lifestyle;

    return (
      <div className={`luxebrief-card ${isCompact ? 'luxebrief-card--compact' : ''}`}>
        <div className="luxebrief-card__header">
          <span className="luxebrief-card__role">{target === 'principal' ? 'Principal' : 'Secondary'}</span>
          {/* Status Badge - State 4: Completed */}
          {status === 'completed' && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--complete">
              <CheckCircle size={12} /> Completed
            </span>
          )}
          {/* Status Badge - State 3: Awaiting */}
          {status === 'sent' && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--pending">
              <Clock size={12} /> Awaiting
            </span>
          )}
          {/* Status Badge - State 2: Ready to Send (Secondary confirmed) */}
          {status === 'not_sent' && isConfirmed && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--ready">
              Ready to Send
            </span>
          )}
          {/* Toggle Badge - State 1: Complete toggle (Secondary not confirmed) */}
          {status === 'not_sent' && !isConfirmed && target === 'secondary' && canSend && (
            <button
              className="luxebrief-panel__badge luxebrief-panel__badge--toggle"
              onClick={() => setSecondaryConfirmed(prev => ({ ...prev, lifestyle: true }))}
            >
              <span className="toggle-circle"></span> Complete
            </button>
          )}
        </div>

        {/* Not Sent State */}
        {status === 'not_sent' && (
          <div className="luxebrief-card__content">
            {!canSend ? (
              <div className="luxebrief-panel__notice luxebrief-panel__notice--sm">
                <AlertTriangle size={14} />
                <span>Configure {target === 'principal' ? 'Principal' : 'Secondary'} in Settings</span>
              </div>
            ) : (
              <>
                <div className="luxebrief-card__recipient">
                  <span className="luxebrief-card__name">{targetName}</span>
                  <span className="luxebrief-card__email">{targetEmail}</span>
                </div>
                {/* State 1: Secondary Not Confirmed - Empty placeholder */}
                {target === 'secondary' && !isConfirmed && (
                  <div className="luxebrief-card__placeholder"></div>
                )}
                {/* Principal shows Send directly */}
                {target === 'principal' && (
                  <button
                    className="btn btn--primary"
                    onClick={() => handleSendLuXeBrief(target)}
                    disabled={loading}
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send</>
                    )}
                  </button>
                )}
                {/* State 2: Secondary Confirmed - Show "Send" button */}
                {target === 'secondary' && isConfirmed && (
                  <button
                    className="btn btn--primary"
                    onClick={() => handleSendLuXeBrief(target)}
                    disabled={loading}
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send</>
                    )}
                  </button>
                )}
              </>
            )}
            {error && (
              <div className="luxebrief-panel__error luxebrief-panel__error--sm">
                <AlertTriangle size={12} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sent/Awaiting State */}
        {status === 'sent' && (
          <div className="luxebrief-card__content">
            <div className="luxebrief-card__recipient">
              <span className="luxebrief-card__name">{targetName}</span>
              <span className="luxebrief-card__meta">Sent {sentAt ? new Date(sentAt).toLocaleDateString() : ''}</span>
            </div>
            <button
              className="btn btn--secondary"
              onClick={() => handleRefreshStatus(target)}
              disabled={loading}
            >
              {loading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
            </button>
          </div>
        )}

        {/* Step 4: Completed State */}
        {status === 'completed' && (
          <div className="luxebrief-card__content">
            <div className="luxebrief-card__recipient">
              <span className="luxebrief-card__name">{targetName}</span>
              <span className="luxebrief-card__meta">Completed {completedAt ? new Date(completedAt).toLocaleDateString() : ''}</span>
            </div>
            {sessionId && (
              <button
                onClick={(e) => handleLifestyleReportClick(e, target)}
                className="btn btn--primary"
              >
                <ExternalLink size={14} /> Report
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper component to render a single respondent's LuXeBrief Living card
  const renderLuxeLivingCard = (target, targetName, targetEmail, targetData, isCompact = false) => {
    const status = targetData.luxeLivingStatus || 'not_sent';
    const sessionId = targetData.luxeLivingSessionId;
    const sentAt = targetData.luxeLivingSentAt;
    const completedAt = targetData.luxeLivingCompletedAt;
    const subdomain = targetData.luxeLivingSubdomain;
    const canSend = targetName && targetEmail;
    const loading = luxeLivingLoading[target];
    const error = luxeLivingError[target];

    // Check if this secondary has been confirmed (4-step workflow)
    const isConfirmed = target === 'secondary' && secondaryConfirmed.living;

    return (
      <div className={`luxebrief-card ${isCompact ? 'luxebrief-card--compact' : ''}`}>
        <div className="luxebrief-card__header">
          <span className="luxebrief-card__role">{target === 'principal' ? 'Principal' : 'Secondary'}</span>
          {/* Status Badge - State 4: Completed */}
          {status === 'completed' && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--complete">
              <CheckCircle size={12} /> Completed
            </span>
          )}
          {/* Status Badge - State 3: Awaiting */}
          {status === 'sent' && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--pending">
              <Clock size={12} /> Awaiting
            </span>
          )}
          {/* Status Badge - State 2: Ready to Send (Secondary confirmed) */}
          {status === 'not_sent' && isConfirmed && (
            <span className="luxebrief-panel__badge luxebrief-panel__badge--ready">
              Ready to Send
            </span>
          )}
          {/* Toggle Badge - State 1: Complete toggle (Secondary not confirmed) */}
          {status === 'not_sent' && !isConfirmed && target === 'secondary' && canSend && (
            <button
              className="luxebrief-panel__badge luxebrief-panel__badge--toggle"
              onClick={() => setSecondaryConfirmed(prev => ({ ...prev, living: true }))}
            >
              <span className="toggle-circle"></span> Complete
            </button>
          )}
        </div>

        {/* Not Sent State */}
        {status === 'not_sent' && (
          <div className="luxebrief-card__content">
            {!canSend ? (
              <div className="luxebrief-panel__notice luxebrief-panel__notice--sm">
                <AlertTriangle size={14} />
                <span>Configure {target === 'principal' ? 'Principal' : 'Secondary'} in Settings</span>
              </div>
            ) : (
              <>
                <div className="luxebrief-card__recipient">
                  <span className="luxebrief-card__name">{targetName}</span>
                  <span className="luxebrief-card__email">{targetEmail}</span>
                </div>
                {/* State 1: Secondary Not Confirmed - Empty placeholder */}
                {target === 'secondary' && !isConfirmed && (
                  <div className="luxebrief-card__placeholder"></div>
                )}
                {/* Principal shows Send directly */}
                {target === 'principal' && (
                  <button
                    className="btn btn--primary"
                    onClick={() => handleSendLuxeLiving(target)}
                    disabled={loading}
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send</>
                    )}
                  </button>
                )}
                {/* State 2: Secondary Confirmed - Show "Send" button */}
                {target === 'secondary' && isConfirmed && (
                  <button
                    className="btn btn--primary"
                    onClick={() => handleSendLuxeLiving(target)}
                    disabled={loading}
                  >
                    {loading ? (
                      <><RefreshCw size={14} className="spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Send</>
                    )}
                  </button>
                )}
              </>
            )}
            {error && (
              <div className="luxebrief-panel__error luxebrief-panel__error--sm">
                <AlertTriangle size={12} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sent/Awaiting State */}
        {status === 'sent' && (
          <div className="luxebrief-card__content">
            <div className="luxebrief-card__recipient">
              <span className="luxebrief-card__name">{targetName}</span>
              <span className="luxebrief-card__meta">Sent {sentAt ? new Date(sentAt).toLocaleDateString() : ''}</span>
            </div>
            <button
              className="btn btn--secondary"
              onClick={() => handleRefreshLivingStatus(target)}
              disabled={loading}
            >
              {loading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
            </button>
          </div>
        )}

        {/* Step 4: Completed State */}
        {status === 'completed' && (
          <div className="luxebrief-card__content">
            <div className="luxebrief-card__recipient">
              <span className="luxebrief-card__name">{targetName}</span>
              <span className="luxebrief-card__meta">Completed {completedAt ? new Date(completedAt).toLocaleDateString() : ''}</span>
            </div>
            {sessionId && (
              <button
                onClick={(e) => handleLivingReportClick(e, target)}
                className="btn btn--primary"
              >
                <ExternalLink size={14} /> Report
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="kyc-section">
      {/* LuXeBrief Lifestyle Integration Panel */}
      <div className="kyc-section__group luxebrief-panel">
        <div className="luxebrief-panel__header">
          <div className="luxebrief-panel__title">
            <Mail size={20} />
            <h3>LuXeBrief Lifestyle Questionnaire</h3>
          </div>
          {isDualRespondent && (
            <span className="luxebrief-panel__mode-badge">
              <Users size={14} /> Principal + Secondary
            </span>
          )}
        </div>

        <p className="luxebrief-panel__description">
          {isDualRespondent
            ? 'Send voice-guided lifestyle questionnaires to both Principal and Secondary for individual insights into their daily routines and preferences.'
            : `Send a voice-guided lifestyle questionnaire to ${stakeholderName || 'the client'} for deeper insights into their daily routines and preferences.`
          }
        </p>

        {/* Dual Respondent Mode - Show two cards side by side */}
        {isDualRespondent ? (
          <div className="luxebrief-panel__dual-cards">
            {renderLuXeBriefCard('principal', principalName, principalEmail, principalLuxeBriefData, true)}
            {renderLuXeBriefCard('secondary', secondaryName, secondaryEmail, secondaryLuxeBriefData, true)}
          </div>
        ) : (
          /* Single Respondent Mode - Original layout */
          <>
            {/* Not Sent State */}
            {luxeBriefStatus === 'not_sent' && (
              <div className="luxebrief-panel__actions">
                {!canSendLuXeBrief ? (
                  <div className="luxebrief-panel__notice">
                    <AlertTriangle size={16} />
                    <span>
                      Please configure {respondent === 'principal' ? 'Principal' : 'Secondary'} name and email in <strong>Settings</strong> before sending.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="luxebrief-panel__recipient">
                      <span className="luxebrief-panel__recipient-label">Send to:</span>
                      <span className="luxebrief-panel__recipient-value">{stakeholderName}</span>
                      <span className="luxebrief-panel__recipient-email">{stakeholderEmail}</span>
                    </div>
                    <button
                      className="btn btn--primary luxebrief-panel__send-btn"
                      onClick={() => handleSendLuXeBrief()}
                      disabled={luxeBriefLoading[respondent]}
                    >
                      {luxeBriefLoading[respondent] ? (
                        <>
                          <RefreshCw size={16} className="spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Send LuXeBrief Questionnaire
                        </>
                      )}
                    </button>
                  </>
                )}
                {luxeBriefError[respondent] && (
                  <div className="luxebrief-panel__error">
                    <AlertTriangle size={14} /> {luxeBriefError[respondent]}
                  </div>
                )}
              </div>
            )}

            {/* Sent State */}
            {luxeBriefStatus === 'sent' && (
              <div className="luxebrief-panel__status">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent to:</span>
                    <span>{stakeholderName} ({stakeholderEmail})</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent:</span>
                    <span>{luxeBriefSentAt ? new Date(luxeBriefSentAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                  {data.luxeBriefSubdomain && (
                    <div className="luxebrief-panel__status-row">
                      <span className="luxebrief-panel__status-label">Link:</span>
                      <a
                        href={`https://${data.luxeBriefSubdomain}.luxebrief.not-4.sale`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="luxebrief-panel__link"
                      >
                        {data.luxeBriefSubdomain}.luxebrief.not-4.sale <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleRefreshStatus()}
                  disabled={luxeBriefLoading[respondent]}
                >
                  {luxeBriefLoading[respondent] ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                  Check Status
                </button>
              </div>
            )}

            {/* Completed State */}
            {luxeBriefStatus === 'completed' && (
              <div className="luxebrief-panel__status luxebrief-panel__status--complete">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed by:</span>
                    <span>{stakeholderName}</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed:</span>
                    <span>{luxeBriefCompletedAt ? new Date(luxeBriefCompletedAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                </div>
                {luxeBriefSessionId && (
                  <button
                    onClick={(e) => handleLifestyleReportClick(e, respondent)}
                    className="btn btn--primary btn--sm"
                  >
                    <ExternalLink size={14} /> View Report
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* LuXeBrief Living Integration Panel (Form-based) */}
      <div className="kyc-section__group luxebrief-panel luxebrief-panel--living">
        <div className="luxebrief-panel__header">
          <div className="luxebrief-panel__title">
            <ClipboardList size={20} />
            <h3>LuXeBrief Living Questionnaire</h3>
          </div>
          {isDualRespondent && (
            <span className="luxebrief-panel__mode-badge">
              <Users size={14} /> Principal + Secondary
            </span>
          )}
        </div>

        <p className="luxebrief-panel__description">
          {isDualRespondent
            ? 'Send form-based space program questionnaires to both Principal and Secondary to define interior and exterior space requirements.'
            : `Send a form-based space program questionnaire to ${stakeholderName || 'the client'} to define interior and exterior space requirements.`
          }
        </p>

        {/* Dual Respondent Mode - Show two cards side by side */}
        {isDualRespondent ? (
          <div className="luxebrief-panel__dual-cards">
            {renderLuxeLivingCard('principal', principalName, principalEmail, principalLuxeBriefData, true)}
            {renderLuxeLivingCard('secondary', secondaryName, secondaryEmail, secondaryLuxeBriefData, true)}
          </div>
        ) : (
          /* Single Respondent Mode */
          <>
            {/* Not Sent State */}
            {luxeLivingStatus === 'not_sent' && (
              <div className="luxebrief-panel__actions">
                {!canSendLuXeBrief ? (
                  <div className="luxebrief-panel__notice">
                    <AlertTriangle size={16} />
                    <span>
                      Please configure {respondent === 'principal' ? 'Principal' : 'Secondary'} name and email in <strong>Settings</strong> before sending.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="luxebrief-panel__recipient">
                      <span className="luxebrief-panel__recipient-label">Send to:</span>
                      <span className="luxebrief-panel__recipient-value">{stakeholderName}</span>
                      <span className="luxebrief-panel__recipient-email">{stakeholderEmail}</span>
                    </div>
                    <button
                      className="btn btn--primary luxebrief-panel__send-btn"
                      onClick={() => handleSendLuxeLiving()}
                      disabled={luxeLivingLoading[respondent]}
                    >
                      {luxeLivingLoading[respondent] ? (
                        <>
                          <RefreshCw size={16} className="spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Send Living Questionnaire
                        </>
                      )}
                    </button>
                  </>
                )}
                {luxeLivingError[respondent] && (
                  <div className="luxebrief-panel__error">
                    <AlertTriangle size={14} /> {luxeLivingError[respondent]}
                  </div>
                )}
              </div>
            )}

            {/* Sent State */}
            {luxeLivingStatus === 'sent' && (
              <div className="luxebrief-panel__status">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent to:</span>
                    <span>{stakeholderName} ({stakeholderEmail})</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Sent:</span>
                    <span>{luxeLivingSentAt ? new Date(luxeLivingSentAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                  {data.luxeLivingSubdomain && (
                    <div className="luxebrief-panel__status-row">
                      <span className="luxebrief-panel__status-label">Link:</span>
                      <a
                        href={`https://${data.luxeLivingSubdomain}.luxebrief.not-4.sale/living/${luxeLivingSessionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="luxebrief-panel__link"
                      >
                        View questionnaire <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleRefreshLivingStatus()}
                  disabled={luxeLivingLoading[respondent]}
                >
                  {luxeLivingLoading[respondent] ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                  Check Status
                </button>
              </div>
            )}

            {/* Completed State */}
            {luxeLivingStatus === 'completed' && (
              <div className="luxebrief-panel__status luxebrief-panel__status--complete">
                <div className="luxebrief-panel__status-info">
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed by:</span>
                    <span>{stakeholderName}</span>
                  </div>
                  <div className="luxebrief-panel__status-row">
                    <span className="luxebrief-panel__status-label">Completed:</span>
                    <span>{luxeLivingCompletedAt ? new Date(luxeLivingCompletedAt).toLocaleString() : 'Unknown'}</span>
                  </div>
                </div>
                {luxeLivingSessionId && (
                  <button
                    onClick={(e) => handleLivingReportClick(e, respondent)}
                    className="btn btn--primary btn--sm"
                  >
                    <ExternalLink size={14} /> View Report
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual Entry Toggle Section */}
      <div className="kyc-section__manual-toggle">
        <span className="kyc-section__manual-toggle-text">
          ALTERNATIVELY ENTER DETAILS MANUALLY
        </span>
        <button
          className={`btn ${manualEntryExpanded ? 'btn--secondary' : 'btn--toggle'}`}
          onClick={() => setManualEntryExpanded(!manualEntryExpanded)}
          aria-expanded={manualEntryExpanded}
          aria-controls="manual-entry-content"
        >
          {manualEntryExpanded ? (
            <><ChevronUp size={14} /> Collapse</>
          ) : (
            <><ChevronDown size={14} /> Manual Entry</>
          )}
        </button>
      </div>

      {/* Collapsible Manual Entry Content */}
      {manualEntryExpanded && (
        <div
          className="kyc-section__manual-entry"
          id="manual-entry-content"
          role="region"
          aria-label="Manual Entry Section"
        >
          {/* Export Manual Report Button */}
          <div className="kyc-section__manual-entry-header">
            <button
              className="btn btn--primary"
              onClick={handleExportManualReport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <><RefreshCw size={14} className="spin" /> Generating...</>
              ) : (
                <><Download size={14} /> Export Manual Report</>
              )}
            </button>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="kyc-section__manual-entry-error">
              <AlertTriangle size={14} /> {exportError}
            </div>
          )}

      {/* WFH Confirmation for Secondary when Principal indicated 2+ offices */}
      {showWfhConfirmation && (
        <div className="kyc-section__group">
          <div className={`wfh-confirmation ${data.wfhConfirmation === false ? 'wfh-confirmation--discuss' : ''}`}>
            <div className="wfh-confirmation__message">
              <strong>{principalFirstName}</strong> has indicated requirement for <strong>{principalWfhCount} dedicated Home Offices</strong>.
            </div>
            <div className="wfh-confirmation__actions">
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${data.wfhConfirmation === true ? 'toggle-btn--active' : ''}`}
                  onClick={() => handleChange('wfhConfirmation', true)}
                >
                  ✓ Confirm
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${data.wfhConfirmation === false ? 'toggle-btn--active toggle-btn--warning' : ''}`}
                  onClick={() => handleChange('wfhConfirmation', false)}
                >
                  ⚠ Discuss
                </button>
              </div>
            </div>
            {data.wfhConfirmation === false && (
              <div className="wfh-confirmation__flag">
                <AlertTriangle size={16} />
                <span>Flagged for discussion - WFH requirements need alignment</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Work From Home</h3>

        <SelectField
          label="Work From Home Frequency"
          value={data.workFromHome}
          onChange={(v) => handleChange('workFromHome', v)}
          options={wfhOptions}
          placeholder="How often do you work from home?"
        />

        {data.workFromHome && data.workFromHome !== 'never' && (
          <>
            <FormField
              label="Number of People WFH"
              type="number"
              value={data.wfhPeopleCount}
              onChange={(v) => handleChange('wfhPeopleCount', parseInt(v) || null)}
              placeholder="How many people need home office space?"
              min={1}
              helpText="Include anyone who regularly works from home"
            />

            {/* Second Office Question - appears when 2+ people WFH */}
            {(data.wfhPeopleCount >= 2) && (
              <div className="form-field">
                <label className="form-field__label">Separate Offices Required?</label>
                <p className="form-field__help" style={{ marginBottom: '8px' }}>
                  Do you need separate, private office spaces for each person working from home?
                </p>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${data.separateOfficesRequired === true ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('separateOfficesRequired', true)}
                  >
                    Yes, separate offices
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${data.separateOfficesRequired === false ? 'toggle-btn--active' : ''}`}
                    onClick={() => handleChange('separateOfficesRequired', false)}
                  >
                    No, can share space
                  </button>
                </div>
                {data.separateOfficesRequired && (
                  <p className="form-field__note" style={{ marginTop: '8px', color: 'var(--teal)' }}>
                    ✓ Program will include {data.wfhPeopleCount} separate home offices
                  </p>
                )}
              </div>
            )}

            {/* Office needs details */}
            <FormField
              label="Office Requirements"
              type="textarea"
              value={data.officeRequirements}
              onChange={(v) => handleChange('officeRequirements', v)}
              placeholder="Any specific requirements? Video calls, client meetings, specialized equipment..."
              rows={2}
            />
          </>
        )}
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Hobbies & Activities</h3>
        
        <div className="form-field">
          <label className="form-field__label">Space-Requiring Hobbies</label>
          <p className="form-field__help" style={{ marginBottom: '12px' }}>
            Select hobbies that need dedicated space in your home
          </p>
          <div className="chip-select">
            {hobbyOptions.map(hobby => (
              <button
                key={hobby.value}
                className={`chip ${(data.hobbies || []).includes(hobby.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('hobbies', hobby.value)}
              >
                {hobby.label}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Hobby Details"
          type="textarea"
          value={data.hobbyDetails}
          onChange={(v) => handleChange('hobbyDetails', v)}
          placeholder="Specific equipment needs, space requirements, or details about your hobbies..."
          rows={2}
        />

        <div className="form-field">
          <label className="form-field__label">Late Night Media Use?</label>
          <p className="form-field__help" style={{ marginBottom: '8px' }}>
            Do you watch movies or game late at night when others are sleeping? (Affects acoustic planning)
          </p>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${data.lateNightMediaUse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('lateNightMediaUse', true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`toggle-btn ${!data.lateNightMediaUse ? 'toggle-btn--active' : ''}`}
              onClick={() => handleChange('lateNightMediaUse', false)}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Entertaining</h3>
        
        <div className="form-grid form-grid--2col">
          <SelectField
            label="Entertaining Frequency"
            value={data.entertainingFrequency}
            onChange={(v) => handleChange('entertainingFrequency', v)}
            options={entertainingOptions}
            placeholder="How often do you entertain?"
          />
          <SelectField
            label="Entertaining Style"
            value={data.entertainingStyle}
            onChange={(v) => handleChange('entertainingStyle', v)}
            options={entertainingStyleOptions}
            placeholder="What type of entertaining?"
          />
        </div>

        <FormField
          label="Typical Guest Count"
          value={data.typicalGuestCount}
          onChange={(v) => handleChange('typicalGuestCount', v)}
          placeholder="e.g., 8-12 for dinners, 50-100 for parties"
        />
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Wellness</h3>
        
        <div className="form-field">
          <label className="form-field__label">Wellness Priorities</label>
          <div className="chip-select">
            {wellnessOptions.map(wellness => (
              <button
                key={wellness.value}
                className={`chip ${(data.wellnessPriorities || []).includes(wellness.value) ? 'chip--selected' : ''}`}
                onClick={() => toggleOption('wellnessPriorities', wellness.value)}
              >
                {wellness.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="kyc-section__group">
        <h3 className="kyc-section__group-title">Privacy & Environment</h3>
        
        <SliderField
          label="Privacy Level Required"
          value={data.privacyLevelRequired || 3}
          onChange={(v) => handleChange('privacyLevelRequired', v)}
          min={1}
          max={5}
          leftLabel="Open/Social"
          rightLabel="Maximum Privacy"
        />

        <SliderField
          label="Noise Sensitivity"
          value={data.noiseSensitivity || 3}
          onChange={(v) => handleChange('noiseSensitivity', v)}
          min={1}
          max={5}
          leftLabel="Tolerant"
          rightLabel="Very Sensitive"
        />

        <SliderField
          label="Indoor-Outdoor Living"
          value={data.indoorOutdoorLiving || 3}
          onChange={(v) => handleChange('indoorOutdoorLiving', v)}
          min={1}
          max={5}
          leftLabel="Indoor Focused"
          rightLabel="Seamless Integration"
        />
      </div>

      <FormField
        label="Daily Routines Summary"
        type="textarea"
        value={data.dailyRoutinesSummary}
        onChange={(v) => handleChange('dailyRoutinesSummary', v)}
        placeholder="Describe a typical day - morning routines, how you use spaces, evening patterns..."
        rows={3}
      />
        </div>
      )}
    </div>
  );
};

export default LifestyleLivingSection;
