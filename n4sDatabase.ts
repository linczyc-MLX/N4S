/**
 * N4S API Client
 *
 * This module provides access to N4S data via the N4S Dashboard's REST API.
 * The API endpoint is publicly accessible at the IONOS-hosted N4S Dashboard.
 *
 * Why API instead of direct DB connection:
 * - IONOS shared hosting blocks external database connections
 * - API provides authentication and access control
 * - Maintains N4S as single source of truth
 * - Cleaner separation of concerns
 *
 * FALLBACK: When N4S API is unavailable (IONOS blocks external PHP),
 * embedded project data is used as fallback.
 */

// N4S Dashboard API base URL
const N4S_API_URL = process.env.N4S_API_URL || 'https://home-5019406629.app-ionos.space/api';
const N4S_API_KEY = process.env.N4S_API_KEY || 'n4s-portal-2026-secure';

/**
 * FALLBACK DATA: Embedded project data for when N4S API is unavailable
 * This ensures the portal works even when IONOS blocks external API access.
 * Data is synced manually from N4S Dashboard when updated.
 */
const FALLBACK_PROJECTS: Record<string, any> = {
  'thornwood-estate': {
    id: '1',
    clientData: {
      projectName: 'Thornwood Estate',
      projectCode: 'THW-2026-001',
      createdAt: '2026-01-15T10:00:00Z',
      lastUpdated: '2026-02-01T14:30:00Z'
    },
    lcdData: {
      portalSlug: 'thornwood-estate',
      portalActive: true,
      clientPasswordPlain: 'thornwood2026',
      advisorPasswordPlain: 'advisor2026',
      visibility: {
        kyc: { enabled: true, profileReport: true, luxebriefPrincipal: true, luxebriefSecondary: true, partnerAlignment: true },
        fyi: { enabled: true, spaceProgram: true, zoneBreakdown: true },
        mvp: { enabled: false },
        ifc: { enabled: false },
        tac: { enabled: false },
        lah: { enabled: false }
      },
      milestones: {},
      phases: { p1Complete: false, p2Unlocked: false, p3Unlocked: false },
      clientActivity: []
    },
    kycData: {
      principal: {
        portfolioContext: {
          principalFirstName: 'Jonathan',
          principalLastName: 'Whitfield',
          principalEmail: 'j.whitfield@example.com',
          secondaryFirstName: 'Margaret',
          secondaryLastName: 'Whitfield',
          secondaryEmail: 'm.whitfield@example.com',
          familyOfficeContact: 'Whitfield Family Office',
          currentPropertyCount: 4,
          thisPropertyRole: 'primary',
          investmentHorizon: 'forever',
          exitStrategy: 'inheritance',
          lifeStage: 'established',
          decisionTimeline: 'standard',
          landAcquisitionCost: 4500000
        },
        familyHousehold: {
          familyMembers: [
            { name: 'Jonathan Whitfield', role: 'Principal', age: 58 },
            { name: 'Margaret Whitfield', role: 'Spouse', age: 55 },
            { name: 'Elizabeth Whitfield', role: 'Daughter', age: 28 },
            { name: 'Thomas Whitfield', role: 'Son', age: 25 }
          ],
          pets: [
            { type: 'Golden Retrievers', count: 2 },
            { type: 'Maine Coon Cat', count: 1 }
          ],
          staffingLevel: 'full_time',
          liveInStaff: true,
          multiGenerational: false,
          anticipatedChanges: 'Adult children may visit frequently with potential future grandchildren. Planning for aging in place.'
        },
        projectParameters: {
          projectName: 'Thornwood Estate',
          propertyLocation: 'Greenwich, Connecticut',
          city: 'Greenwich',
          targetGSF: 18500,
          bedroomCount: 7,
          bathroomCount: 9,
          levelCount: 3,
          additionalStructures: ['Pool House', 'Detached Garage (6-car)', 'Tennis Court', 'Guest Cottage'],
          targetCompletion: 'Q4 2028',
          complexity: 'High - Historic estate renovation with modern additions'
        },
        budgetFramework: {
          totalProjectBudget: 12000000,
          interiorBudget: 3500000,
          budgetPhilosophy: 'Quality-first approach with emphasis on timeless craftsmanship and materials that will appreciate over generations.',
          interiorQualityTier: 'signature',
          artBudget: 500000
        },
        designIdentity: {
          principalTasteResults: null,
          secondaryTasteResults: null,
          tasteSessionId: null
        },
        lifestyleLiving: {
          workFromHome: 'sometimes',
          wfhPeopleCount: 2,
          hobbies: ['Golf', 'Wine Collecting', 'Equestrian', 'Art Collecting', 'Entertaining'],
          entertainingStyle: 'both',
          entertainingFrequency: 'weekly',
          wellnessPriorities: ['Home Gym', 'Spa/Sauna', 'Pool', 'Meditation Space'],
          privacyLevel: 'High - Gated entry with extensive landscaping buffers',
          environmentalPreferences: 'LEED certification preferred, geothermal heating, solar backup',
          luxeBriefSessionId: null,
          luxeLivingSessionId: null,
          luxeBriefStatus: 'pending',
          luxeLivingStatus: 'pending'
        },
        culturalContext: {
          heritage: 'Anglo-American, New England roots spanning five generations',
          religiousPractices: 'Episcopalian - dedicated prayer/meditation space appreciated',
          culturalObservances: 'Traditional American holidays, emphasis on Thanksgiving and Christmas gatherings',
          languages: 'English primary, some French',
          communicationPreferences: 'Formal written correspondence for decisions, informal calls for updates'
        },
        workingPreferences: {
          preferredCommunication: 'Email for documentation, phone for quick decisions',
          meetingFrequency: 'Bi-weekly progress meetings, monthly in-person reviews',
          involvementLevel: 'High - principals want to be involved in all major decisions',
          decisionStyle: 'Collaborative between spouses, final decisions made jointly',
          priorExperience: 'Previous renovation of NYC apartment and vacation home in Nantucket',
          designerStylePreference: 'Traditional with refined modern touches, nothing trendy',
          constructionAdminPreferences: 'Full CA services with weekly site visits'
        }
      },
      secondary: {
        lifestyleLiving: {
          luxeBriefSessionId: null,
          luxeLivingSessionId: null,
          luxeBriefStatus: 'pending',
          luxeLivingStatus: 'pending'
        },
        designIdentity: {
          luxebriefStatus: 'not_started'
        }
      }
    },
    fyiData: {
      spaceProgram: {
        totalGSF: 18500,
        zones: [
          { name: 'Living/Social', gsf: 4200 },
          { name: 'Private/Bedrooms', gsf: 5800 },
          { name: 'Kitchen/Service', gsf: 2500 },
          { name: 'Recreation', gsf: 3000 },
          { name: 'Staff Quarters', gsf: 1200 },
          { name: 'Garage/Storage', gsf: 1800 }
        ]
      }
    },
    settingsData: {
      advisorAuthorityLevel: 'full'
    }
  }
};

// Activity log entry
interface ActivityEntry {
  action: string;
  details: string;
  timestamp: string;
}

// Sign-off data
interface SignOffData {
  signed: boolean;
  signedAt: string;
  signedBy: string;
}

// Phase data
interface PhaseData {
  p1Complete?: boolean;
  p2Unlocked?: boolean;
  p3Unlocked?: boolean;
}

// Client project from N4S
interface ClientProject {
  projectId: string;
  projectName: string;
  projectCode: string;
  role: 'principal' | 'secondary';
  principalName: string;
  secondaryName: string | null;
  kycCompletion: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch helper with error handling
 */
async function n4sFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${N4S_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': N4S_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`N4S API error (${response.status}): ${error}`);
  }

  return response.json();
}

export class N4SDatabase {
  private static initialized = false;

  /**
   * Initialize - just logs that we're using API mode
   */
  static async initialize(): Promise<void> {
    console.log('[N4S API] Using N4S REST API at:', N4S_API_URL);
    this.initialized = true;
  }

  /**
   * Get projects for a client by email
   */
  static async getClientProjects(email: string): Promise<ClientProject[]> {
    try {
      const data = await n4sFetch(`/portal.php?action=client-projects&email=${encodeURIComponent(email)}`);
      return data.projects || [];
    } catch (error) {
      console.error('[N4S API] getClientProjects error:', error);
      return [];
    }
  }

  /**
   * Get project status for a specific project
   */
  static async getProjectStatus(projectId: string, email: string): Promise<any | null> {
    try {
      return await n4sFetch(`/portal.php?action=project-status&projectId=${projectId}&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('[N4S API] getProjectStatus error:', error);
      return null;
    }
  }

  /**
   * Cache for project data by slug (avoids repeated API calls)
   */
  private static projectCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static CACHE_TTL = 60000; // 1 minute cache

  /**
   * Get full project data by portal slug using portal.php endpoint
   * This is the primary method - uses API key authentication
   * Falls back to embedded data when N4S API is unavailable
   */
  private static async getFullProjectBySlug(slug: string): Promise<any | null> {
    // Check cache first
    const cached = this.projectCache.get(slug);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const data = await n4sFetch(`/portal.php?action=get-by-slug&slug=${encodeURIComponent(slug)}`);
      // Cache the result
      this.projectCache.set(slug, { data, timestamp: Date.now() });
      console.log(`[N4S API] Successfully fetched project data for slug: ${slug}`);
      return data;
    } catch (error) {
      console.error('[N4S API] getFullProjectBySlug error:', error);

      // FALLBACK: Use embedded data when API is unavailable
      const fallbackData = FALLBACK_PROJECTS[slug];
      if (fallbackData) {
        console.log(`[N4S API] Using FALLBACK data for slug: ${slug}`);
        // Cache the fallback data too
        this.projectCache.set(slug, { data: fallbackData, timestamp: Date.now() });
        return fallbackData;
      }

      console.log(`[N4S API] No fallback data available for slug: ${slug}`);
      return null;
    }
  }

  /**
   * Get LCD data by portal slug
   */
  static async getLCDDataBySlug(slug: string): Promise<any | null> {
    try {
      const fullProject = await this.getFullProjectBySlug(slug);
      if (!fullProject?.lcdData) return null;

      return {
        ...fullProject.lcdData,
        projectId: fullProject.id,
      };
    } catch (error) {
      console.error('[N4S API] getLCDDataBySlug error:', error);
      return null;
    }
  }

  /**
   * Get project data by portal slug
   */
  static async getProjectBySlug(slug: string): Promise<any | null> {
    try {
      const fullProject = await this.getFullProjectBySlug(slug);
      if (!fullProject) return null;

      // Get client name from kycData (N4S stores it in principal.portfolioContext)
      const portfolioContext = fullProject.kycData?.principal?.portfolioContext || {};
      const clientName = [
        portfolioContext.principalFirstName,
        portfolioContext.principalLastName
      ].filter(Boolean).join(' ') || 'Client';

      // Calculate KYC completion
      const kycSections = ['portfolioContext', 'familyHousehold', 'projectParameters', 'budgetFramework', 'designIdentity', 'lifestyleLiving'];
      const principalData = fullProject.kycData?.principal || {};
      const completedSections = kycSections.filter(s => principalData[s] && Object.keys(principalData[s]).length > 0).length;
      const kycCompleted = completedSections >= kycSections.length - 1; // 5/6 or more = complete

      return {
        id: fullProject.id,
        projectName: fullProject.clientData?.projectName,
        clientName,
        advisorAuthorityLevel: fullProject.settingsData?.advisorAuthorityLevel || 'limited',
        kycCompleted,
        budgetRange: fullProject.clientData?.budgetRange || null,
      };
    } catch (error) {
      console.error('[N4S API] getProjectBySlug error:', error);
      return null;
    }
  }

  /**
   * Get KYC data by portal slug
   */
  static async getKYCDataBySlug(slug: string): Promise<any | null> {
    try {
      const fullProject = await this.getFullProjectBySlug(slug);
      return fullProject?.kycData || null;
    } catch (error) {
      console.error('[N4S API] getKYCDataBySlug error:', error);
      return null;
    }
  }

  /**
   * Get FYI data by portal slug
   */
  static async getFYIDataBySlug(slug: string): Promise<any | null> {
    try {
      const fullProject = await this.getFullProjectBySlug(slug);
      return fullProject?.fyiData || null;
    } catch (error) {
      console.error('[N4S API] getFYIDataBySlug error:', error);
      return null;
    }
  }

  /**
   * Get documents for a module
   */
  static async getDocuments(slug: string, module: string): Promise<any[]> {
    // Placeholder - actual implementation would check N4S file storage
    return [];
  }

  /**
   * Get PDF document by proxying to LuXeBrief's export/pdf endpoint
   *
   * Data flow (matching N4S P1.A.6 behavior):
   * 1. N4S stores LuXeBrief session IDs in kycData:
   *    - kycData.principal.lifestyleLiving.luxeBriefSessionId (Lifestyle questionnaire)
   *    - kycData.principal.lifestyleLiving.luxeLivingSessionId (Living questionnaire)
   *    - kycData.secondary.lifestyleLiving.luxeBriefSessionId (Secondary Lifestyle)
   *    - kycData.secondary.lifestyleLiving.luxeLivingSessionId (Secondary Living)
   * 2. LuXeBrief generates PDFs on-demand via /api/sessions/{sessionId}/export/pdf
   * 3. Portal fetches session ID from N4S, then proxies PDF from LuXeBrief
   */
  static async getPDF(slug: string, module: string, type: string): Promise<Buffer | null> {
    // Only KYC module has LuXeBrief reports for now
    if (module !== 'kyc') {
      console.log(`[N4S API] PDF for module ${module} not yet supported`);
      return null;
    }

    try {
      // Get the project by portal slug using the portal.php endpoint
      const projectData = await this.getFullProjectBySlug(slug);

      if (!projectData) {
        console.log(`[N4S API] No project found for slug: ${slug}`);
        return null;
      }

      /**
       * Document Types:
       *
       * RECORD Documents (immutable, dated, stored at completion):
       *   - Lifestyle Questionnaire: Completed once, timestamped, stored as record
       *   - Living Questionnaire: Completed once, timestamped, stored as record
       *   - Taste Exploration: Completed once, timestamped, stored as record
       *   → Use /stored-pdf endpoint to retrieve the original record
       *   → If retaken, new session created, old archived
       *
       * LIVE Documents (generated on-demand from current data):
       *   - KYC Profile Report: Rendered each time from current kycData
       *   - Partner Alignment: Rendered each time from current data
       *   → Generated fresh with current date on each request
       */

      const kycData = projectData.kycData || {};
      let sessionId: number | null = null;

      switch (type) {
        // ========== LIVE DOCUMENTS (generated on-demand) ==========
        case 'profile-report':
          // LIVE: KYC Profile Report - generated from current kycData each time
          console.log('[N4S API] LIVE Document: Generating KYC Profile Report PDF on-demand');
          return await this.generateKYCProfileReport(projectData);

        case 'partner-alignment':
          // LIVE: Partner Alignment Report - generated from current data
          console.log('[N4S API] Partner alignment report not yet implemented');
          return null;

        // ========== RECORD DOCUMENTS (retrieve stored, immutable) ==========
        case 'principal-lifestyle':
          // RECORD: Principal's Lifestyle questionnaire - retrieve stored record
          sessionId = kycData.principal?.lifestyleLiving?.luxeBriefSessionId;
          console.log(`[N4S API] RECORD Document: Principal Lifestyle, session ${sessionId}`);
          break;

        case 'principal-living':
          // RECORD: Principal's Living questionnaire - retrieve stored record
          sessionId = kycData.principal?.lifestyleLiving?.luxeLivingSessionId;
          console.log(`[N4S API] RECORD Document: Principal Living, session ${sessionId}`);
          break;

        case 'secondary-lifestyle':
          // RECORD: Secondary's Lifestyle questionnaire - retrieve stored record
          sessionId = kycData.secondary?.lifestyleLiving?.luxeBriefSessionId;
          console.log(`[N4S API] RECORD Document: Secondary Lifestyle, session ${sessionId}`);
          break;

        case 'secondary-living':
          // RECORD: Secondary's Living questionnaire - retrieve stored record
          sessionId = kycData.secondary?.lifestyleLiving?.luxeLivingSessionId;
          console.log(`[N4S API] RECORD Document: Secondary Living, session ${sessionId}`);
          break;

        case 'principal-taste':
          // RECORD: Principal's Taste Exploration - retrieve stored record
          sessionId = kycData.principal?.designIdentity?.tasteSessionId;
          console.log(`[N4S API] RECORD Document: Principal Taste, session ${sessionId}`);
          break;

        case 'secondary-taste':
          // RECORD: Secondary's Taste Exploration - retrieve stored record
          sessionId = kycData.secondary?.designIdentity?.tasteSessionId;
          console.log(`[N4S API] RECORD Document: Secondary Taste, session ${sessionId}`);
          break;

        default:
          console.log(`[N4S API] Unknown report type: ${type}`);
          return null;
      }

      if (!sessionId) {
        console.log(`[N4S API] No session ID found for RECORD document type: ${type}`);
        console.log(`[N4S API] kycData.principal.lifestyleLiving:`, JSON.stringify(kycData.principal?.lifestyleLiving || {}, null, 2));
        console.log(`[N4S API] kycData.secondary.lifestyleLiving:`, JSON.stringify(kycData.secondary?.lifestyleLiving || {}, null, 2));
        return null;
      }

      // RECORD Documents: Fetch from LuXeBrief export endpoint
      const LUXEBRIEF_URL = process.env.LUXEBRIEF_URL || 'https://luxebrief.not-4.sale';
      const pdfUrl = `${LUXEBRIEF_URL}/api/sessions/${sessionId}/export/pdf`;

      console.log(`[N4S API] Fetching RECORD PDF from: ${pdfUrl}`);

      const response = await fetch(pdfUrl);

      if (!response.ok) {
        console.log(`[N4S API] LuXeBrief returned ${response.status}: ${response.statusText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      console.log(`[N4S API] Successfully retrieved RECORD PDF for ${type}, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;

    } catch (error) {
      console.error('[N4S API] getPDF error:', error);
      return null;
    }
  }

  /**
   * Log client activity
   */
  static async logActivity(slug: string, entry: ActivityEntry): Promise<void> {
    try {
      // Get project by slug first
      const projects = await n4sFetch('/projects.php');

      for (const project of projects) {
        const fullProject = await n4sFetch(`/projects.php?id=${project.id}`);
        if (fullProject.lcdData?.portalSlug === slug) {
          // Update with new activity
          const activity = fullProject.lcdData.clientActivity || [];
          activity.unshift(entry);
          if (activity.length > 100) activity.splice(100);

          await n4sFetch(`/projects.php?id=${project.id}&action=update`, {
            method: 'POST',
            body: JSON.stringify({
              lcdData: {
                ...fullProject.lcdData,
                clientActivity: activity,
              },
            }),
          });
          return;
        }
      }
    } catch (error) {
      console.error('[N4S API] logActivity error:', error);
    }
  }

  /**
   * Update milestone sign-off
   */
  static async updateMilestone(slug: string, module: string, data: SignOffData): Promise<void> {
    try {
      const projects = await n4sFetch('/projects.php');

      for (const project of projects) {
        const fullProject = await n4sFetch(`/projects.php?id=${project.id}`);
        if (fullProject.lcdData?.portalSlug === slug) {
          const milestones = fullProject.lcdData.milestones || {};
          milestones[module] = {
            ...milestones[module],
            ...data,
          };

          await n4sFetch(`/projects.php?id=${project.id}&action=update`, {
            method: 'POST',
            body: JSON.stringify({
              lcdData: {
                ...fullProject.lcdData,
                milestones,
              },
            }),
          });
          return;
        }
      }
    } catch (error) {
      console.error('[N4S API] updateMilestone error:', error);
    }
  }

  /**
   * Update phase status
   */
  static async updatePhases(slug: string, phases: PhaseData): Promise<void> {
    try {
      const projects = await n4sFetch('/projects.php');

      for (const project of projects) {
        const fullProject = await n4sFetch(`/projects.php?id=${project.id}`);
        if (fullProject.lcdData?.portalSlug === slug) {
          const currentPhases = fullProject.lcdData.phases || {};

          await n4sFetch(`/projects.php?id=${project.id}&action=update`, {
            method: 'POST',
            body: JSON.stringify({
              lcdData: {
                ...fullProject.lcdData,
                phases: { ...currentPhases, ...phases },
              },
            }),
          });
          return;
        }
      }
    } catch (error) {
      console.error('[N4S API] updatePhases error:', error);
    }
  }

  /**
   * Generate KYC Summary Report PDF
   *
   * 8 sections (P1.A.1 - P1.A.8) with blue bar headers.
   * Uses LIVE data from N4S API.
   * Smart page breaks - if section takes <1/3 of bottom, start new page.
   */
  private static async generateKYCProfileReport(projectData: any): Promise<Buffer> {
    const PDFDocument = (await import('pdfkit')).default;

    return new Promise((resolve) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);
      const footerHeight = 40;
      const usableHeight = pageHeight - footerHeight;

      // N4S Brand Colors
      const NAVY = '#1e3a5f';
      const GOLD = '#c9a227';
      const BLUE = '#315098';
      const TEXT = '#333333';
      const MUTED = '#666666';
      const LIGHT_BG = '#f8f6f3';
      const BORDER = '#e0e0e0';

      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      // ========== EXTRACT ALL DATA ==========
      const kycData = projectData.kycData || {};
      const principal = kycData.principal || {};
      const clientData = projectData.clientData || {};

      // P1.A.1 Portfolio Context
      const portfolioContext = principal.portfolioContext || {};
      const principalFirst = portfolioContext.principalFirstName || '';
      const principalLast = portfolioContext.principalLastName || '';
      const clientName = [principalFirst, principalLast].filter(Boolean).join(' ') || 'Client';
      const secondaryFirst = portfolioContext.secondaryFirstName || '';
      const secondaryLast = portfolioContext.secondaryLastName || '';
      const secondaryName = [secondaryFirst, secondaryLast].filter(Boolean).join(' ') || null;
      const advisorName = portfolioContext.familyOfficeContact || null;

      // P1.A.2 Family & Household
      const familyHousehold = principal.familyHousehold || {};

      // P1.A.3 Project Parameters
      const projectParameters = principal.projectParameters || {};
      const projectName = projectParameters.projectName || clientData.projectName || 'Luxury Residence';

      // P1.A.4 Budget Framework
      const budgetFramework = principal.budgetFramework || {};

      // P1.A.5 Design Identity
      const designIdentity = principal.designIdentity || {};

      // P1.A.6 Lifestyle & Living
      const lifestyleLiving = principal.lifestyleLiving || {};

      // P1.A.7 Cultural Context
      const culturalContext = principal.culturalContext || {};

      // P1.A.8 Working Preferences
      const workingPreferences = principal.workingPreferences || {};

      // ========== LABEL MAPS ==========
      const roleLabels: Record<string, string> = {
        'primary': 'Primary Residence', 'secondary': 'Secondary/Vacation Home',
        'vacation': 'Vacation Property', 'investment': 'Investment Property', 'legacy': 'Legacy/Generational Asset'
      };
      const horizonLabels: Record<string, string> = {
        'forever': 'Forever Home', '10yr': '10+ Years', '5yr': '5-10 Years', 'generational': 'Generational (Multi-decade)'
      };
      const exitLabels: Record<string, string> = {
        'personal': 'Personal Use Only', 'rental': 'Potential Rental Income', 'sale': 'Future Sale', 'inheritance': 'Family Inheritance'
      };
      const lifeStageLabels: Record<string, string> = {
        'building': 'Building Family (Young Children)', 'established': 'Established Family (Teen/Adult Children)',
        'empty-nest': 'Empty Nest', 'retirement': 'Retirement', 'multi-gen': 'Multi-Generational Household'
      };
      const timelineLabels: Record<string, string> = {
        'urgent': 'Urgent (< 6 months)', 'standard': 'Standard (6-12 months)', 'flexible': 'Flexible (12+ months)'
      };
      const staffLabels: Record<string, string> = {
        'none': 'No Staff', 'part_time': 'Part-Time Staff', 'full_time': 'Full-Time Staff', 'live_in': 'Live-In Staff'
      };
      const tierLabels: Record<string, string> = {
        'select': 'I - Select: The Curated Standard', 'reserve': 'II - Reserve: Exceptional Materials',
        'signature': 'III - Signature: Bespoke Design', 'legacy': 'IV - Legacy: Enduring Heritage'
      };
      const wfhLabels: Record<string, string> = {
        'never': 'Never', 'sometimes': 'Sometimes (1-2 days/week)', 'often': 'Often (3-4 days/week)', 'always': 'Always (Full Remote)'
      };
      const entertainLabels: Record<string, string> = { 'formal': 'Formal (Seated Dinners)', 'casual': 'Casual (Relaxed Gatherings)', 'both': 'Both Formal & Casual' };
      const freqLabels: Record<string, string> = { 'rarely': 'Rarely (Few times/year)', 'monthly': 'Monthly', 'weekly': 'Weekly', 'daily': 'Daily' };

      // ========== HELPER FUNCTIONS ==========
      let currentY = 0;

      const formatCurrency = (v: number) => v ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v) : '—';
      const getLabel = (map: Record<string, string>, key: string) => map[key] || key || '—';

      const getRemainingSpace = () => usableHeight - currentY;

      const smartPageBreak = (neededHeight: number, isNewSection: boolean = false) => {
        const remaining = getRemainingSpace();
        // If new section and would take less than 1/3 of remaining space, start new page
        if (isNewSection && remaining < pageHeight / 3 && neededHeight > 0) {
          doc.addPage();
          currentY = margin;
          return;
        }
        // Standard check: not enough room
        if (currentY + neededHeight > usableHeight) {
          doc.addPage();
          currentY = margin;
        }
      };

      const addPageHeader = () => {
        doc.rect(0, 0, pageWidth, 28).fill(NAVY);
        doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold').text('N4S', margin, 9);
        doc.fontSize(7).font('Helvetica').text('Luxury Residential Advisory', margin + 22, 10);
        doc.fontSize(8).text('KYC Summary Report', pageWidth - margin - 100, 9, { width: 100, align: 'right' });
        doc.fontSize(7).text(generatedDate, pageWidth - margin - 100, 18, { width: 100, align: 'right' });
      };

      const addSectionHeader = (code: string, title: string) => {
        smartPageBreak(50, true);
        currentY += 8;
        // Blue bar
        doc.rect(margin, currentY, contentWidth, 22).fill(BLUE);
        doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold').text(`${code}  ${title}`, margin + 10, currentY + 7);
        currentY += 30;
      };

      const addSubheading = (title: string) => {
        smartPageBreak(20);
        doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold').text(title, margin, currentY);
        currentY += 14;
      };

      const addField = (label: string, value: any, indent: number = 0) => {
        smartPageBreak(14);
        const displayValue = (value !== undefined && value !== null && value !== '') ? String(value) : '—';
        doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold').text(label + ':', margin + indent, currentY);
        doc.fillColor(TEXT).font('Helvetica').text(displayValue, margin + indent + 110, currentY, { width: contentWidth - indent - 110 });
        currentY += 14;
      };

      const addTwoColumn = (label1: string, value1: any, label2: string, value2: any) => {
        smartPageBreak(14);
        const v1 = (value1 !== undefined && value1 !== null && value1 !== '') ? String(value1) : '—';
        const v2 = (value2 !== undefined && value2 !== null && value2 !== '') ? String(value2) : '—';
        const col2Start = margin + contentWidth / 2;
        doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold').text(label1 + ':', margin, currentY);
        doc.fillColor(TEXT).font('Helvetica').text(v1, margin + 90, currentY);
        doc.fillColor(MUTED).font('Helvetica-Bold').text(label2 + ':', col2Start, currentY);
        doc.fillColor(TEXT).font('Helvetica').text(v2, col2Start + 90, currentY);
        currentY += 14;
      };

      const addBulletList = (items: string[], indent: number = 10) => {
        if (!items || items.length === 0) {
          doc.fontSize(8).fillColor(MUTED).font('Helvetica-Oblique').text('None specified', margin + indent, currentY);
          currentY += 12;
          return;
        }
        items.forEach(item => {
          smartPageBreak(12);
          doc.fontSize(8).fillColor(TEXT).font('Helvetica').text('• ' + item, margin + indent, currentY, { width: contentWidth - indent });
          currentY += 12;
        });
      };

      const addSpacer = (height: number = 10) => {
        currentY += height;
      };

      // ========== BUILD PDF ==========

      // Page 1 Header
      addPageHeader();
      currentY = 40;

      // Title Block
      doc.rect(margin, currentY, contentWidth, 50).fill(LIGHT_BG);
      doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold').text('CLIENT', margin + 12, currentY + 10);
      doc.fontSize(16).fillColor(NAVY).font('Helvetica-Bold').text(clientName, margin + 12, currentY + 22);
      doc.fontSize(10).fillColor(TEXT).font('Helvetica').text(projectName, margin + 12, currentY + 40);
      if (secondaryName) {
        doc.fontSize(9).fillColor(MUTED).text('Partner: ' + secondaryName, pageWidth - margin - 150, currentY + 25, { width: 140, align: 'right' });
      }
      currentY += 60;

      // ===== P1.A.1 PORTFOLIO CONTEXT =====
      addSectionHeader('P1.A.1', 'Portfolio Context');

      addSubheading('Project Stakeholders');
      addField('Principal', clientName);
      if (secondaryName) addField('Secondary', secondaryName);
      if (advisorName) addField('Advisor/Family Office', advisorName);
      addSpacer(6);

      addSubheading('Portfolio Context');
      addField('Current Property Count', portfolioContext.currentPropertyCount);
      addField("This Property's Role", getLabel(roleLabels, portfolioContext.thisPropertyRole));
      addTwoColumn('Investment Horizon', getLabel(horizonLabels, portfolioContext.investmentHorizon), 'Exit Strategy', getLabel(exitLabels, portfolioContext.exitStrategy));
      addSpacer(6);

      addSubheading('Life Stage & Timeline');
      addTwoColumn('Life Stage', getLabel(lifeStageLabels, portfolioContext.lifeStage), 'Decision Timeline', getLabel(timelineLabels, portfolioContext.decisionTimeline));

      // ===== P1.A.2 FAMILY & HOUSEHOLD =====
      addSectionHeader('P1.A.2', 'Family & Household');

      addSubheading('Family Members');
      const members = familyHousehold.familyMembers || [];
      if (members.length > 0) {
        members.forEach((m: any) => {
          smartPageBreak(12);
          const age = m.age ? `, age ${m.age}` : '';
          doc.fontSize(8).fillColor(TEXT).font('Helvetica').text(`• ${m.name || 'Member'} (${m.role || 'member'}${age})`, margin + 10, currentY);
          currentY += 12;
        });
      } else {
        doc.fontSize(8).fillColor(MUTED).font('Helvetica-Oblique').text('No family members specified', margin + 10, currentY);
        currentY += 12;
      }
      addSpacer(6);

      addSubheading('Pets');
      const pets = familyHousehold.pets || [];
      if (pets.length > 0) {
        addBulletList(pets.map((p: any) => `${p.type || 'Pet'}${p.count ? ' (' + p.count + ')' : ''}`));
      } else {
        doc.fontSize(8).fillColor(MUTED).font('Helvetica-Oblique').text('No pets', margin + 10, currentY);
        currentY += 12;
      }
      addSpacer(6);

      addSubheading('Staff & Household');
      addField('Staffing Level', getLabel(staffLabels, familyHousehold.staffingLevel));
      if (familyHousehold.liveInStaff) addField('Live-In Staff', 'Yes');
      if (familyHousehold.multiGenerational) addField('Multi-Generational', 'Yes');
      addSpacer(6);

      addSubheading('Anticipated Changes');
      addField('Expected Changes', familyHousehold.anticipatedChanges || 'None specified');

      // ===== P1.A.3 PROJECT PARAMETERS =====
      addSectionHeader('P1.A.3', 'Project Parameters');

      addSubheading('Project Identification');
      addField('Project Name', projectName);
      addSpacer(6);

      addSubheading('Location');
      addField('Property Location', projectParameters.propertyLocation || projectParameters.city);
      addSpacer(6);

      addSubheading('Project Scope');
      addTwoColumn('Target GSF', projectParameters.targetGSF ? projectParameters.targetGSF.toLocaleString() + ' SF' : '—', 'Bedrooms', projectParameters.bedroomCount);
      addField('Bathrooms', projectParameters.bathroomCount);
      addSpacer(6);

      addSubheading('Level Configuration');
      addField('Number of Levels', projectParameters.levelCount);
      addSpacer(6);

      addSubheading('Additional Structures');
      const structures = projectParameters.additionalStructures || [];
      addBulletList(structures.length > 0 ? structures : ['None specified']);
      addSpacer(6);

      addSubheading('Timeline & Complexity');
      addField('Target Completion', projectParameters.targetCompletion);
      addField('Project Complexity', projectParameters.complexity);

      // ===== P1.A.4 BUDGET FRAMEWORK =====
      addSectionHeader('P1.A.4', 'Budget Framework');

      addSubheading('Project Budget');
      const landCost = budgetFramework.landAcquisitionCost || portfolioContext.landAcquisitionCost || 0;
      const constructionBudget = budgetFramework.totalProjectBudget || 0;
      const interiorBudget = budgetFramework.interiorBudget || 0;
      const grandTotal = landCost + constructionBudget;

      addTwoColumn('Land Acquisition', formatCurrency(landCost), 'Construction', formatCurrency(constructionBudget));
      addField('Interior Budget', formatCurrency(interiorBudget));

      smartPageBreak(30);
      doc.rect(margin, currentY, contentWidth, 24).fill(NAVY);
      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text('GRAND TOTAL', margin + 12, currentY + 8);
      doc.fontSize(12).text(formatCurrency(grandTotal), pageWidth - margin - 12, currentY + 7, { width: contentWidth - 24, align: 'right' });
      currentY += 32;

      addSubheading('Budget Philosophy');
      addField('Budget Approach', budgetFramework.budgetPhilosophy);
      addSpacer(6);

      addSubheading('Interior Quality Tier');
      addField('Quality Tier', getLabel(tierLabels, budgetFramework.interiorQualityTier));
      addSpacer(6);

      addSubheading('Art Budget');
      addField('Art Budget', formatCurrency(budgetFramework.artBudget));

      // ===== P1.A.5 DESIGN IDENTITY =====
      addSectionHeader('P1.A.5', 'Design Identity');

      const principalTaste = designIdentity.principalTasteResults;
      const secondaryTaste = designIdentity.secondaryTasteResults;
      const hasPrincipalTaste = principalTaste?.completedAt;
      const hasSecondaryTaste = secondaryTaste?.completedAt;

      addSubheading('Principal Taste Exploration');
      if (hasPrincipalTaste) {
        addField('Status', 'Complete');
        addField('Completed', new Date(principalTaste.completedAt).toLocaleDateString());
      } else {
        addField('Status', 'Not yet completed');
      }
      addSpacer(6);

      addSubheading('Secondary Taste Exploration');
      if (hasSecondaryTaste) {
        addField('Status', 'Complete');
        addField('Completed', new Date(secondaryTaste.completedAt).toLocaleDateString());
      } else {
        addField('Status', secondaryName ? 'Not yet completed' : 'No secondary stakeholder');
      }
      addSpacer(6);

      addSubheading('Partner Alignment');
      if (hasPrincipalTaste && hasSecondaryTaste) {
        const pS = principalTaste?.profile?.scores || {};
        const sS = secondaryTaste?.profile?.scores || {};
        const dims = ['tradition', 'formality', 'warmth', 'drama', 'openness', 'art_focus'];
        let totalDiff = 0;
        dims.forEach(d => totalDiff += Math.abs((pS[d] || 5) - (sS[d] || 5)));
        const alignment = Math.max(0, Math.round(100 - (totalDiff / dims.length / 9 * 100)));
        addField('Alignment Score', alignment + '%');
      } else {
        addField('Alignment Score', 'Requires both taste explorations');
      }

      // ===== P1.A.6 LIFESTYLE & LIVING =====
      addSectionHeader('P1.A.6', 'Lifestyle & Living');

      addSubheading('Work From Home');
      addTwoColumn('WFH Frequency', getLabel(wfhLabels, lifestyleLiving.workFromHome), 'Offices Needed', lifestyleLiving.wfhPeopleCount || '—');
      addSpacer(6);

      addSubheading('Hobbies & Activities');
      const hobbies = lifestyleLiving.hobbies || [];
      addBulletList(hobbies.length > 0 ? hobbies : ['None specified']);
      addSpacer(6);

      addSubheading('Entertaining');
      addTwoColumn('Style', getLabel(entertainLabels, lifestyleLiving.entertainingStyle), 'Frequency', getLabel(freqLabels, lifestyleLiving.entertainingFrequency));
      addSpacer(6);

      addSubheading('Wellness');
      const wellness = lifestyleLiving.wellnessPriorities || [];
      addBulletList(wellness.length > 0 ? wellness : ['None specified']);
      addSpacer(6);

      addSubheading('Privacy & Environment');
      addField('Privacy Level', lifestyleLiving.privacyLevel);
      addField('Environmental Preferences', lifestyleLiving.environmentalPreferences);

      // ===== P1.A.7 CULTURAL CONTEXT =====
      addSectionHeader('P1.A.7', 'Cultural Context');

      addSubheading('Cultural Background');
      addField('Heritage', culturalContext.heritage);
      addSpacer(6);

      addSubheading('Religious & Cultural Observances');
      addField('Religious Practices', culturalContext.religiousPractices);
      addField('Cultural Observances', culturalContext.culturalObservances);
      addSpacer(6);

      addSubheading('Cross-Cultural Considerations');
      addField('Languages Spoken', culturalContext.languages);
      addField('Communication Preferences', culturalContext.communicationPreferences);

      // ===== P1.A.8 WORKING PREFERENCES =====
      addSectionHeader('P1.A.8', 'Working Preferences');

      addSubheading('Communication & Collaboration Style');
      addField('Preferred Communication', workingPreferences.preferredCommunication);
      addField('Meeting Frequency', workingPreferences.meetingFrequency);
      addSpacer(6);

      addSubheading('Principal Involvement');
      addField('Involvement Level', workingPreferences.involvementLevel);
      addField('Decision Style', workingPreferences.decisionStyle);
      addSpacer(6);

      addSubheading('Previous Experience');
      addField('Prior Projects', workingPreferences.priorExperience);
      addSpacer(6);

      addSubheading('Designer Profile Preferences');
      addField('Preferred Designer Style', workingPreferences.designerStylePreference);
      addSpacer(6);

      addSubheading('Construction Administration');
      addField('CA Preferences', workingPreferences.constructionAdminPreferences);

      // ========== ADD FOOTERS TO ALL PAGES ==========
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        // Footer line
        doc.moveTo(margin, pageHeight - 35).lineTo(pageWidth - margin, pageHeight - 35).strokeColor(BORDER).lineWidth(0.5).stroke();
        doc.fontSize(7).fillColor(MUTED).font('Helvetica');
        doc.text('© 2026 Not4Sale LLC • Confidential', margin, pageHeight - 28);
        doc.text(`Page ${i + 1} of ${totalPages}`, pageWidth - margin - 50, pageHeight - 28, { width: 50, align: 'right' });
      }

      doc.end();
    });
  }

  /**
   * Get questionnaire status from LuXeBrief sessions
   */
  static async getQuestionnaireStatus(slug: string): Promise<any> {
    // This queries the local LuXeBrief database, not N4S
    return {
      principal: {
        lifestyle: { status: 'not_started', sessionId: null },
        living: { status: 'not_started', sessionId: null },
        taste: { status: 'not_started', sessionId: null },
      },
      secondary: {
        lifestyle: { status: 'not_started', sessionId: null },
        living: { status: 'not_started', sessionId: null },
        taste: { status: 'not_started', sessionId: null },
      },
    };
  }

  /**
   * Close - no-op for API mode
   */
  static async close(): Promise<void> {
    // No connection to close in API mode
  }
}
