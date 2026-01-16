/**
 * N4S Context Integration for VMX
 *
 * This module handles reading project context from N4S when VMX is hosted
 * inside the N4S application. It reads from window globals set by N4S.
 *
 * Data Contract: N4S → VMX (Phase A + Phase B1)
 */

import { useState, useEffect } from "react";
import { TierId } from "../data/benchmark-library-storage";

// ============================================================================
// TYPE DEFINITIONS (matching N4S integration spec)
// ============================================================================

export type RegionId =
  | "national_avg"
  | "fl_miami_palmbeach"
  | "co_denver"
  | "co_aspen_vail"
  | "ca_la_oc"
  | "ny_nyc_hamptons"
  // Also support existing VMX region IDs
  | "us"
  | "me";

export type TypologyId =
  | "suburban"
  | "hillside"
  | "waterfront"
  | "urban"
  | "rural"
  | "desert";

export type VmxIncomingScenario = {
  areaSqft?: number;
  tier?: "Select" | "Reserve" | "Signature" | "Legacy";
  locationPreset?: "national" | "custom";
  regionId?: RegionId;
  locationCustomMultiplier?: number;
  typologyId?: TypologyId;
  landCost?: number;
};

export type VmxIncomingContextV1 = {
  version: "1";
  clientName?: string;
  projectName?: string;
  compareModeEnabled?: boolean;
  scenarioA?: VmxIncomingScenario;
  scenarioB?: VmxIncomingScenario;
};

export type N4SProjectEntry = {
  id: string;
  label: string;
  updatedAtISO?: string;
  context?: VmxIncomingContextV1;
};

export type VmxProgramProfile = {
  totalSF: number;
  byZoneSF: Record<string, number>;
};

// ============================================================================
// WINDOW GLOBALS INTERFACE
// ============================================================================

declare global {
  interface Window {
    __N4S_VMX_PROJECTS__?: N4SProjectEntry[];
    __N4S_VMX_CONTEXT__?: VmxIncomingContextV1;
    __N4S_VMX_ALLOW_PRO__?: boolean;
  }
}

// ============================================================================
// CONTEXT DETECTION
// ============================================================================

/**
 * Check if VMX is running inside N4S (context globals are set)
 */
export function isHostedInN4S(): boolean {
  return typeof window !== "undefined" && window.__N4S_VMX_CONTEXT__ !== undefined;
}

/**
 * Get the N4S context if available
 */
export function getN4SContext(): VmxIncomingContextV1 | null {
  if (typeof window === "undefined") return null;
  return window.__N4S_VMX_CONTEXT__ || null;
}

/**
 * Get the N4S project list if available
 */
export function getN4SProjectList(): N4SProjectEntry[] {
  if (typeof window === "undefined") return [];
  return window.__N4S_VMX_PROJECTS__ || [];
}

/**
 * Check if Pro mode is allowed
 */
export function isProModeAllowed(): boolean {
  if (typeof window === "undefined") return true;
  return window.__N4S_VMX_ALLOW_PRO__ !== false;
}

/**
 * Get the program profile from localStorage (FYI zone totals)
 */
export function getProgramProfile(): VmxProgramProfile | null {
  try {
    const raw = localStorage.getItem("vmx_program_profile_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.totalSF === "number" && parsed.byZoneSF) {
      return parsed as VmxProgramProfile;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Map N4S tier string to VMX TierId
 */
export function mapTierToVmx(tier?: string): TierId {
  const tierMap: Record<string, TierId> = {
    Select: "select",
    Reserve: "reserve",
    Signature: "signature",
    Legacy: "legacy",
    // Lowercase variants
    select: "select",
    reserve: "reserve",
    signature: "signature",
    legacy: "legacy",
  };
  return tierMap[tier || ""] || "reserve";
}

/**
 * Map N4S region ID to VMX region ID
 * For now, VMX only supports 'us' and 'me', so we map detailed regions to 'us'
 */
export function mapRegionToVmx(regionId?: RegionId): string {
  if (!regionId) return "us";

  // If it's already a VMX region ID, use it
  if (regionId === "us" || regionId === "me") {
    return regionId;
  }

  // Map detailed US regions to 'us'
  // In the future, VMX can be updated to support detailed regions
  return "us";
}

// ============================================================================
// APPLY CONTEXT
// ============================================================================

export type ApplyContextResult = {
  areaSqft: number;
  tier: TierId;
  regionId: string;
  compareMode: boolean;
  regionBId?: string;
  clientName?: string;
  projectName?: string;
  landCost?: number;
  typologyId?: TypologyId;
};

/**
 * Extract VMX-compatible values from N4S context
 */
export function extractVmxValues(context: VmxIncomingContextV1 | null): ApplyContextResult | null {
  if (!context) return null;

  const scenarioA = context.scenarioA;
  if (!scenarioA) return null;

  return {
    areaSqft: scenarioA.areaSqft || 15000,
    tier: mapTierToVmx(scenarioA.tier),
    regionId: mapRegionToVmx(scenarioA.regionId),
    compareMode: context.compareModeEnabled || false,
    regionBId: context.scenarioB ? mapRegionToVmx(context.scenarioB.regionId) : undefined,
    clientName: context.clientName,
    projectName: context.projectName,
    landCost: scenarioA.landCost,
    typologyId: scenarioA.typologyId,
  };
}

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * React hook to get and monitor N4S context
 */
export function useN4SContext() {
  const [context, setContext] = useState<VmxIncomingContextV1 | null>(() => getN4SContext());
  const [projects, setProjects] = useState<N4SProjectEntry[]>(() => getN4SProjectList());
  const [programProfile, setProgramProfile] = useState<VmxProgramProfile | null>(() => getProgramProfile());

  useEffect(() => {
    // Re-check on mount in case globals changed
    setContext(getN4SContext());
    setProjects(getN4SProjectList());
    setProgramProfile(getProgramProfile());

    // Listen for storage changes (in case program profile is updated)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "vmx_program_profile_v1") {
        setProgramProfile(getProgramProfile());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    isHosted: isHostedInN4S(),
    context,
    projects,
    programProfile,
    proAllowed: isProModeAllowed(),
    values: extractVmxValues(context),
  };
}
