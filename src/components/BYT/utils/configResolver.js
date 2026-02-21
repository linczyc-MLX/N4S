/**
 * configResolver.js — BYT Configuration Inheritance Engine
 * 
 * Merges global defaults with project-level overrides.
 * 
 * Rules:
 * - Scalar values: project override replaces global (if present)
 * - List values (exclusions, exemplars): additive merge
 * - Absent project keys = inherit from global
 * - "allowDespiteGlobal" list can un-exclude globally excluded firms
 */

// ============================================================================
// DEFAULT VALUES (Factory Defaults — used when global config is empty/missing)
// ============================================================================

export const FACTORY_DEFAULTS = {
  discovery: {
    model: 'claude-sonnet-4-20250514',
    confidenceThreshold: 50,
    resultsPerSearch: 8,
    sourceAttributionRequired: true,
    maxQueueSize: 100,
    autoImportBehavior: 'require_review', // 'auto' | 'require_review' | 'manual'
    disciplineGuidance: {
      architect: null,          // null = use hardcoded default in getDisciplineGuidance()
      interior_designer: null,
      pm: null,
      gc: null,
    },
    exemplarFirms: {
      architect: [],
      interior_designer: [],
      pm: ['Plus Development', 'CPM Link Enterprises'],
      gc: [],
    },
    exclusionList: ['Turner Construction', 'Skanska', 'Toll Brothers', 'Lennar'],
  },

  scoring: {
    weights: {
      scale_match: 15,
      financial_resilience: 10,
      geographic_alignment: 10,
      capability_coverage: 20,
      portfolio_relevance: 15,
      tech_compatibility: 5,
      credentials: 5,
      philosophy_alignment: 10,
      methodology_fit: 5,
      collaboration_maturity: 5,
    },
    tiers: {
      topMatch: 80,
      goodFit: 60,
      consider: 40,
    },
    quantQualSplit: { quantitative: 80, qualitative: 20 },
    perDisciplineOverrides: null,
  },

  rfq: {
    deadlineDays: 14,
    coverLetterVariant: 'standard', // 'standard' | 'personal' | 'formal'
    reminderEnabled: true,
    reminderDaysBefore: 3,
    autoExpire: false,
    minPortfolioProjects: 3,
    branding: {
      logoUrl: null,      // null = N4S default
      accentColor: null,  // null = N4S navy
    },
  },

  pipeline: {
    stageLabels: null, // null = use code defaults
    optionalStages: [],
  },
};

// ============================================================================
// MERGE HELPERS
// ============================================================================

/**
 * Merge exemplar firm lists (additive) with source tracking.
 * Returns { discipline: [{ name, source: 'global'|'project' }] }
 */
function mergeDisciplineLists(globalLists, projectAdditions) {
  const disciplines = ['architect', 'interior_designer', 'pm', 'gc'];
  const merged = {};
  for (const d of disciplines) {
    merged[d] = [
      ...(globalLists?.[d] || []).map(f => (typeof f === 'string' ? { name: f, source: 'global' } : f)),
      ...(projectAdditions?.[d] || []).map(f => (typeof f === 'string' ? { name: f, source: 'project' } : f)),
    ];
  }
  return merged;
}

/**
 * Merge exclusion lists (additive, with allow-override).
 * Returns flat array of firm names.
 */
function mergeExclusions(globalList, projectAdditions, allowDespiteGlobal) {
  const effective = new Set((globalList || []).map(f => typeof f === 'string' ? f : f.name));
  (projectAdditions || []).forEach(f => effective.add(typeof f === 'string' ? f : f.name));
  (allowDespiteGlobal || []).forEach(f => effective.delete(typeof f === 'string' ? f : f.name));
  return [...effective];
}

/**
 * Get exclusion list with source tracking for UI display.
 */
export function getExclusionListWithSources(globalList, projectAdditions, allowDespiteGlobal) {
  const allowSet = new Set((allowDespiteGlobal || []).map(f => typeof f === 'string' ? f : f.name));
  const items = [];

  (globalList || []).forEach(f => {
    const name = typeof f === 'string' ? f : f.name;
    if (!allowSet.has(name)) {
      items.push({ name, source: 'global' });
    }
  });

  (projectAdditions || []).forEach(f => {
    const name = typeof f === 'string' ? f : f.name;
    items.push({ name, source: 'project' });
  });

  return items;
}

// ============================================================================
// MAIN RESOLVER
// ============================================================================

/**
 * Resolve effective configuration by merging global defaults + project overrides.
 * 
 * @param {Object} globalConfig - Global defaults (from byt_global_config table or FACTORY_DEFAULTS)
 * @param {Object} projectOverrides - Project-level overrides from bytData.adminConfig
 * @returns {Object} Fully resolved configuration
 */
export function resolveConfig(globalConfig, projectOverrides) {
  const global = { ...FACTORY_DEFAULTS };

  // Deep merge global config on top of factory defaults
  if (globalConfig) {
    if (globalConfig.discovery) Object.assign(global.discovery, globalConfig.discovery);
    if (globalConfig.scoring) Object.assign(global.scoring, globalConfig.scoring);
    if (globalConfig.rfq) Object.assign(global.rfq, globalConfig.rfq);
    if (globalConfig.pipeline) Object.assign(global.pipeline, globalConfig.pipeline);
    // Preserve nested objects
    if (globalConfig.discovery?.disciplineGuidance) {
      global.discovery.disciplineGuidance = { ...FACTORY_DEFAULTS.discovery.disciplineGuidance, ...globalConfig.discovery.disciplineGuidance };
    }
    if (globalConfig.discovery?.exemplarFirms) {
      global.discovery.exemplarFirms = { ...FACTORY_DEFAULTS.discovery.exemplarFirms, ...globalConfig.discovery.exemplarFirms };
    }
    if (globalConfig.scoring?.weights) {
      global.scoring.weights = { ...FACTORY_DEFAULTS.scoring.weights, ...globalConfig.scoring.weights };
    }
    if (globalConfig.scoring?.tiers) {
      global.scoring.tiers = { ...FACTORY_DEFAULTS.scoring.tiers, ...globalConfig.scoring.tiers };
    }
  }

  const proj = projectOverrides || {};

  return {
    discovery: {
      model: proj.discoveryOverrides?.model ?? global.discovery.model,
      confidenceThreshold: proj.discoveryOverrides?.confidenceThreshold ?? global.discovery.confidenceThreshold,
      resultsPerSearch: proj.discoveryOverrides?.resultsPerSearch ?? global.discovery.resultsPerSearch,
      sourceAttributionRequired: global.discovery.sourceAttributionRequired, // global-only
      maxQueueSize: global.discovery.maxQueueSize, // global-only
      autoImportBehavior: proj.discoveryOverrides?.autoImportBehavior ?? global.discovery.autoImportBehavior,

      // Guidance: project override replaces global for that discipline
      disciplineGuidance: {
        architect: proj.discoveryOverrides?.disciplineGuidance?.architect ?? global.discovery.disciplineGuidance.architect,
        interior_designer: proj.discoveryOverrides?.disciplineGuidance?.interior_designer ?? global.discovery.disciplineGuidance.interior_designer,
        pm: proj.discoveryOverrides?.disciplineGuidance?.pm ?? global.discovery.disciplineGuidance.pm,
        gc: proj.discoveryOverrides?.disciplineGuidance?.gc ?? global.discovery.disciplineGuidance.gc,
      },

      // Lists: additive merge with source tracking
      exemplarFirms: mergeDisciplineLists(
        global.discovery.exemplarFirms,
        proj.discoveryOverrides?.additionalExemplars
      ),

      // Exclusions: additive merge with allow-override
      exclusionList: mergeExclusions(
        global.discovery.exclusionList,
        proj.discoveryOverrides?.additionalExclusions,
        proj.discoveryOverrides?.allowDespiteGlobal
      ),
    },

    scoring: {
      weights: proj.scoringOverrides?.weights ?? global.scoring.weights,
      tiers: proj.scoringOverrides?.tiers ?? global.scoring.tiers,
      quantQualSplit: proj.scoringOverrides?.quantQualSplit ?? global.scoring.quantQualSplit,
      perDisciplineOverrides: proj.scoringOverrides?.perDisciplineOverrides ?? global.scoring.perDisciplineOverrides,
      rationale: proj.scoringOverrides?.rationale ?? null,
    },

    rfq: {
      deadlineDays: proj.rfqOverrides?.deadlineDays ?? global.rfq.deadlineDays,
      coverLetterVariant: proj.rfqOverrides?.coverLetterVariant ?? global.rfq.coverLetterVariant,
      reminderEnabled: proj.rfqOverrides?.reminderEnabled ?? global.rfq.reminderEnabled,
      reminderDaysBefore: proj.rfqOverrides?.reminderDaysBefore ?? global.rfq.reminderDaysBefore,
      autoExpire: proj.rfqOverrides?.autoExpire ?? global.rfq.autoExpire,
      minPortfolioProjects: proj.rfqOverrides?.minPortfolioProjects ?? global.rfq.minPortfolioProjects,
      branding: {
        logoUrl: proj.rfqOverrides?.branding?.logoUrl ?? global.rfq.branding.logoUrl,
        accentColor: proj.rfqOverrides?.branding?.accentColor ?? global.rfq.branding.accentColor,
      },
    },

    pipeline: {
      stageLabels: proj.pipelineOverrides?.stageLabels ?? global.pipeline.stageLabels,
      optionalStages: proj.pipelineOverrides?.optionalStages ?? global.pipeline.optionalStages,
    },

    // Metadata — tracks which values are overridden at project level
    _overrides: {
      discovery: {
        model: proj.discoveryOverrides?.model != null,
        confidenceThreshold: proj.discoveryOverrides?.confidenceThreshold != null,
        resultsPerSearch: proj.discoveryOverrides?.resultsPerSearch != null,
        autoImportBehavior: proj.discoveryOverrides?.autoImportBehavior != null,
        disciplineGuidance: {
          architect: proj.discoveryOverrides?.disciplineGuidance?.architect != null,
          interior_designer: proj.discoveryOverrides?.disciplineGuidance?.interior_designer != null,
          pm: proj.discoveryOverrides?.disciplineGuidance?.pm != null,
          gc: proj.discoveryOverrides?.disciplineGuidance?.gc != null,
        },
        hasAdditionalExemplars: Object.values(proj.discoveryOverrides?.additionalExemplars || {}).some(a => a?.length > 0),
        hasAdditionalExclusions: (proj.discoveryOverrides?.additionalExclusions || []).length > 0,
      },
      scoring: {
        weights: proj.scoringOverrides?.weights != null,
        tiers: proj.scoringOverrides?.tiers != null,
        quantQualSplit: proj.scoringOverrides?.quantQualSplit != null,
      },
      rfq: {
        deadlineDays: proj.rfqOverrides?.deadlineDays != null,
        coverLetterVariant: proj.rfqOverrides?.coverLetterVariant != null,
        reminderEnabled: proj.rfqOverrides?.reminderEnabled != null,
        branding: proj.rfqOverrides?.branding != null,
      },
      pipeline: {
        stageLabels: proj.pipelineOverrides?.stageLabels != null,
        optionalStages: proj.pipelineOverrides?.optionalStages != null,
      },
    },
  };
}

/**
 * Check if total scoring weights sum to 100.
 */
export function validateWeights(weights) {
  const total = Object.values(weights).reduce((sum, w) => sum + (Number(w) || 0), 0);
  return { valid: total === 100, total };
}

/**
 * Get tier label based on score and custom thresholds.
 */
export function getTierLabel(score, tiers) {
  const t = tiers || FACTORY_DEFAULTS.scoring.tiers;
  if (score >= t.topMatch) return 'Top Match';
  if (score >= t.goodFit) return 'Good Fit';
  if (score >= t.consider) return 'Consider';
  return 'Below Threshold';
}

/**
 * Get tier color based on score and custom thresholds.
 */
export function getTierColor(score, tiers) {
  const t = tiers || FACTORY_DEFAULTS.scoring.tiers;
  if (score >= t.topMatch) return '#c9a227';  // gold
  if (score >= t.goodFit) return '#1e3a5f';   // navy
  if (score >= t.consider) return '#f57c00';   // warning
  return '#d32f2f';                             // error
}
