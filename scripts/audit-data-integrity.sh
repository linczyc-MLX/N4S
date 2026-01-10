#!/bin/bash
# ============================================
# N4S DATA INTEGRITY AUDIT SCRIPT
# Run before every deployment
# Usage: bash scripts/audit-data-integrity.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

echo "============================================"
echo "N4S DATA INTEGRITY AUDIT"
echo "============================================"
echo ""

# ============================================
# 1. CHECK FOR USESTATE THAT SHOULD PERSIST
# ============================================
echo "1. CHECKING useState PERSISTENCE..."
echo "   Looking for local state that might need backend sync..."

# Find useState with object/array initializers (potential data storage)
SUSPICIOUS_STATE=$(grep -rn "useState(\[\]\|useState({\|useState(null)" src/components --include="*.jsx" 2>/dev/null | \
  grep -v "isLoading\|isOpen\|show\|Show\|active\|Active\|expanded\|Expanded\|selected\|Selected\|error\|Error\|message\|Message\|modal\|Modal\|visible\|Visible\|hover\|Hover\|focus\|Focus\|disabled\|Disabled\|generating\|Generating\|refreshing\|Refreshing\|exporting\|Exporting\|saving\|Saving\|status\|Status\|initialized\|Initialized" || true)

if [ -n "$SUSPICIOUS_STATE" ]; then
  echo -e "${YELLOW}   ⚠ REVIEW NEEDED - Local state found:${NC}"
  echo "$SUSPICIOUS_STATE" | head -20
  echo ""
  echo "   Verify each has corresponding context update function."
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}   ✓ No obvious orphaned state found${NC}"
fi
echo ""

# ============================================
# 2. CHECK FOR HARDCODED DISPLAY VALUES
# ============================================
echo "2. CHECKING FOR HARDCODED VALUES..."
echo "   Looking for suspicious numeric literals in display code..."

HARDCODED=$(grep -rn "value:\s*[0-9]\.[0-9]\|:\s*[0-9]\.[0-9][0-9]*\s*}" src --include="*.js" --include="*.jsx" 2>/dev/null | \
  grep -v "width\|height\|size\|margin\|padding\|opacity\|radius\|spacing\|duration\|delay\|circulationPct\|deltaPct\|normalize\|fallback\|default\|DEFAULT\|test\|Test\|spec\|Spec" | \
  grep -v "Version:\|// " || true)

if [ -n "$HARDCODED" ]; then
  echo -e "${YELLOW}   ⚠ REVIEW NEEDED - Potential hardcoded values:${NC}"
  echo "$HARDCODED" | head -15
  echo ""
  echo "   Verify these are intentional defaults, not placeholder data."
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}   ✓ No suspicious hardcoded values found${NC}"
fi
echo ""

# ============================================
# 3. CHECK CONTEXT UPDATE FUNCTION USAGE
# ============================================
echo "3. CHECKING UPDATE FUNCTION COVERAGE..."

echo "   Counting reads vs writes per module..."
echo ""

# KYC
KYC_READS=$(grep -rn "kycData\." src/components/KYC --include="*.jsx" 2>/dev/null | wc -l)
KYC_WRITES=$(grep -rn "updateKYCData" src/components/KYC --include="*.jsx" 2>/dev/null | wc -l)
echo "   KYC:  Reads: $KYC_READS | Writes: $KYC_WRITES"

# FYI
FYI_READS=$(grep -rn "fyiData\." src/components/FYI --include="*.jsx" 2>/dev/null | wc -l)
FYI_WRITES=$(grep -rn "updateFYI" src/components/FYI --include="*.jsx" 2>/dev/null | wc -l)
echo "   FYI:  Reads: $FYI_READS | Writes: $FYI_WRITES"

# MVP
MVP_READS=$(grep -rn "mvpData\." src/components/MVP --include="*.jsx" 2>/dev/null | wc -l)
MVP_WRITES=$(grep -rn "updateMVP" src/components/MVP --include="*.jsx" 2>/dev/null | wc -l)
echo "   MVP:  Reads: $MVP_READS | Writes: $MVP_WRITES"

echo ""
echo -e "${GREEN}   ✓ Update function analysis complete${NC}"
echo ""

# ============================================
# 4. CHECK SCALE CONSISTENCY
# ============================================
echo "4. CHECKING SCALE CONVERSIONS..."
echo "   Looking for scale conversion formulas..."

SCALE_FORMULAS=$(grep -rn "/ 4\b\|/ 5\b\|/ 9\b\|/ 10\b\|\* 4\b\|\* 9\b" src --include="*.js" --include="*.jsx" 2>/dev/null | \
  grep -v "node_modules\|\.css\|test\|spec" | head -20 || true)

if [ -n "$SCALE_FORMULAS" ]; then
  echo "   Found scale conversions:"
  echo "$SCALE_FORMULAS"
  echo ""
  echo -e "${YELLOW}   ⚠ VERIFY: All use consistent scales (1-5 vs 1-10)${NC}"
else
  echo -e "${GREEN}   ✓ No scale conversion issues detected${NC}"
fi
echo ""

# ============================================
# 5. CHECK LOCALSTORAGE USAGE
# ============================================
echo "5. CHECKING localStorage USAGE..."

LOCALSTORAGE=$(grep -rn "localStorage" src --include="*.js" --include="*.jsx" 2>/dev/null | \
  grep -v "node_modules" | wc -l)

echo "   Found $LOCALSTORAGE localStorage references"

if [ "$LOCALSTORAGE" -gt 0 ]; then
  echo "   Locations:"
  grep -rn "localStorage" src --include="*.js" --include="*.jsx" 2>/dev/null | \
    grep -v "node_modules" | cut -d: -f1 | sort -u | head -10
  echo ""
  echo -e "${YELLOW}   ⚠ VERIFY: All localStorage has backend sync${NC}"
else
  echo -e "${GREEN}   ✓ No localStorage usage${NC}"
fi
echo ""

# ============================================
# 6. CHECK markChanged() USAGE
# ============================================
echo "6. CHECKING markChanged() COVERAGE..."

MARK_CHANGED=$(grep -rn "markChanged()" src/contexts/AppContext.jsx 2>/dev/null | wc -l)
UPDATE_FUNCTIONS=$(grep -rn "const update" src/contexts/AppContext.jsx 2>/dev/null | wc -l)

echo "   Update functions: $UPDATE_FUNCTIONS"
echo "   markChanged() calls: $MARK_CHANGED"

if [ "$MARK_CHANGED" -lt "$UPDATE_FUNCTIONS" ]; then
  echo -e "${YELLOW}   ⚠ POSSIBLE ISSUE: Some update functions may not call markChanged()${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}   ✓ markChanged() coverage looks good${NC}"
fi
echo ""

# ============================================
# 7. CHECK TASTE DATA PATHS
# ============================================
echo "7. CHECKING TASTE DATA PATHS..."
echo "   Verifying taste results are read from correct location..."

# Check if any code reads from wrong path
WRONG_PATH=$(grep -rn "kycData\.secondary.*tasteResults\|kycData\[.secondary.\].*tasteResults" src --include="*.jsx" 2>/dev/null || true)

if [ -n "$WRONG_PATH" ]; then
  echo -e "${RED}   ✗ ERROR: Taste data being read from wrong path!${NC}"
  echo "$WRONG_PATH"
  echo ""
  echo "   NOTE: Both principalTasteResults AND secondaryTasteResults"
  echo "         should be read from kycData.principal.designIdentity"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}   ✓ Taste data paths look correct${NC}"
fi
echo ""

# ============================================
# 8. CHECK PROJECT DATA STRUCTURE
# ============================================
echo "8. CHECKING PROJECT DATA STRUCTURE..."
echo "   Verifying all expected fields exist..."

EXPECTED_FIELDS=("clientData" "kycData" "fyiData" "mvpData" "activeRespondent")
MISSING=0

for field in "${EXPECTED_FIELDS[@]}"; do
  if ! grep -q "$field" src/contexts/AppContext.jsx 2>/dev/null; then
    echo -e "${RED}   ✗ MISSING: $field${NC}"
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -eq 0 ]; then
  echo -e "${GREEN}   ✓ All expected fields present${NC}"
else
  ISSUES_FOUND=$((ISSUES_FOUND + MISSING))
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "============================================"
echo "AUDIT SUMMARY"
echo "============================================"

if [ "$ISSUES_FOUND" -eq 0 ]; then
  echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo "  Safe to deploy."
else
  echo -e "${YELLOW}⚠ ISSUES FOUND: $ISSUES_FOUND${NC}"
  echo "  Review items above before deploying."
  echo ""
  echo "  Run 'npm run build' to check for compile errors."
fi

echo ""
echo "============================================"
echo "MANUAL TESTS REQUIRED"
echo "============================================"
echo "1. [ ] Make change in KYC → Save → Navigate → Return → Verify"
echo "2. [ ] Make change in FYI → Save → Refresh → Verify"
echo "3. [ ] Make change in MVP → Save → Navigate → Return → Verify"
echo "4. [ ] Generate PDF → Compare values with UI"
echo "5. [ ] Check all cross-module data displays"
echo ""

exit $ISSUES_FOUND
