/**
 * PDF Export Utility
 * 
 * Generates downloadable PDF summary of personalization choices.
 * Uses html2canvas + jsPDF approach for rich formatting.
 * 
 * Place in: src/mansion-program/client/utils/pdf-export.ts
 */

import type { PersonalizationResult, AdjacencyDecision } from '../../shared/adjacency-decisions';

export interface PDFExportData {
  result: PersonalizationResult;
  decisions: AdjacencyDecision[];
  presetName: string;
  baseSF: number;
  totalSF: number;
  mermaidCode?: string | null;
}

/**
 * Generate PDF from personalization results
 * 
 * Attempts to use jsPDF if available, falls back to printable HTML
 */
export async function generatePersonalizationPDF(data: PDFExportData): Promise<void> {
  // Try to use jsPDF if available
  try {
    const jsPDF = (window as any).jspdf?.jsPDF;
    if (jsPDF) {
      await generateWithJsPDF(data, jsPDF);
      return;
    }
  } catch (e) {
    console.warn('jsPDF not available, using printable HTML');
  }
  
  // Fallback: Generate printable HTML and trigger print dialog
  generatePrintableHTML(data);
}

/**
 * Generate PDF using jsPDF library
 */
async function generateWithJsPDF(data: PDFExportData, jsPDF: any): Promise<void> {
  const { result, decisions, presetName, totalSF } = data;
  
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(51, 51, 51);
  doc.text('Adjacency Personalization Summary', margin, y);
  y += 12;
  
  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(102, 102, 102);
  doc.text(`${presetName} • Generated ${new Date().toLocaleDateString()}`, margin, y);
  y += 15;
  
  // Summary box
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F');
  y += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text(`Total Program: ${totalSF.toLocaleString()} SF`, margin + 5, y);
  doc.text(`Decisions: ${result.choices.length}`, margin + 70, y);
  doc.text(`Warnings: ${result.warningCount}`, margin + 110, y);
  doc.text(`Bridges: ${result.requiredBridges.length}`, margin + 150, y);
  y += 30;
  
  // Decisions
  doc.setFontSize(14);
  doc.setTextColor(51, 51, 51);
  doc.text('Your Selections', margin, y);
  y += 8;
  
  doc.setFontSize(10);
  for (const choice of result.choices) {
    const decision = decisions.find(d => d.id === choice.decisionId);
    const option = decision?.options.find(o => o.id === choice.selectedOptionId);
    
    if (!decision || !option) continue;
    
    // Check for page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    // Decision title
    doc.setTextColor(51, 51, 51);
    const status = choice.isDefault ? '✓' : '○';
    doc.text(`${status} ${decision.title}`, margin, y);
    y += 5;
    
    // Selection
    doc.setTextColor(102, 102, 102);
    doc.text(`   ${option.label}`, margin, y);
    y += 5;
    
    // Relationship
    doc.setTextColor(153, 153, 153);
    doc.text(`   ${decision.primarySpace} → ${option.targetSpace} (${option.relationship})`, margin, y);
    y += 8;
    
    // Warnings
    if (choice.warnings.length > 0) {
      doc.setTextColor(230, 81, 0);
      for (const warning of choice.warnings) {
        doc.text(`   ⚠ ${warning}`, margin, y);
        y += 5;
      }
      y += 3;
    }
  }
  
  // Bridges section
  if (result.requiredBridges.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    y += 5;
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('Required Bridge Spaces', margin, y);
    y += 8;
    
    doc.setFontSize(10);
    for (const bridge of result.requiredBridges) {
      const name = bridge.replace(/([A-Z])/g, ' $1').trim();
      doc.text(`• ${name}`, margin, y);
      y += 6;
    }
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text(
      `N4S Mansion Validation Program • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`N4S-Adjacency-${presetName.replace(/[^a-z0-9]/gi, '')}-${Date.now()}.pdf`);
}

/**
 * Generate printable HTML and open print dialog
 */
function generatePrintableHTML(data: PDFExportData): void {
  const { result, decisions, presetName, totalSF } = data;
  
  const status = result.redFlagCount > 0 ? 'warning' : result.warningCount > 0 ? 'advisory' : 'pass';
  const statusText = {
    pass: 'Optimized Layout',
    advisory: 'Ready with Advisories',
    warning: 'Review Recommended'
  }[status];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>N4S Adjacency Personalization - ${presetName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 24px 0 12px; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .status { 
      padding: 16px; 
      border-radius: 8px; 
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .status.pass { background: #e8f5e9; color: #2e7d32; }
    .status.advisory { background: #fff3e0; color: #e65100; }
    .status.warning { background: #ffebee; color: #c62828; }
    .status-icon { font-size: 24px; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-item {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-value { font-size: 24px; font-weight: bold; display: block; }
    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .decision-item {
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }
    .decision-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .decision-title { font-weight: 600; }
    .badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .badge.recommended { background: #e8f5e9; color: #2e7d32; }
    .badge.custom { background: #e3f2fd; color: #1565c0; }
    .decision-selection { color: #666; }
    .decision-relationship { color: #999; font-size: 12px; }
    .warning-tag {
      display: inline-block;
      background: #fff3e0;
      color: #e65100;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 8px;
      margin-right: 8px;
    }
    .bridge-item {
      padding: 12px;
      background: #e8f5e9;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .bridge-name { font-weight: 600; text-transform: capitalize; }
    .bridge-desc { font-size: 14px; color: #666; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Adjacency Personalization Summary</h1>
  <p class="subtitle">${presetName} • Generated ${new Date().toLocaleDateString()}</p>
  
  <div class="status ${status}">
    <span class="status-icon">${status === 'pass' ? '✓' : '⚠'}</span>
    <div>
      <strong>${statusText}</strong>
      <div>${result.warningCount} consideration${result.warningCount !== 1 ? 's' : ''}</div>
    </div>
  </div>
  
  <div class="summary-grid">
    <div class="summary-item">
      <span class="summary-value">${totalSF.toLocaleString()}</span>
      <span class="summary-label">Total SF</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${result.choices.length}</span>
      <span class="summary-label">Decisions</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${result.warningCount}</span>
      <span class="summary-label">Warnings</span>
    </div>
    <div class="summary-item">
      <span class="summary-value">${result.requiredBridges.length}</span>
      <span class="summary-label">Bridges</span>
    </div>
  </div>
  
  <h2>Your Selections</h2>
  ${result.choices.map(choice => {
    const decision = decisions.find(d => d.id === choice.decisionId);
    const option = decision?.options.find(o => o.id === choice.selectedOptionId);
    if (!decision || !option) return '';
    
    return `
      <div class="decision-item">
        <div class="decision-header">
          <span class="decision-title">${decision.title}</span>
          <span class="badge ${choice.isDefault ? 'recommended' : 'custom'}">
            ${choice.isDefault ? '✓ Recommended' : 'Custom'}
          </span>
        </div>
        <div class="decision-selection">${option.label}</div>
        <div class="decision-relationship">${decision.primarySpace} → ${option.targetSpace} (${option.relationship})</div>
        ${choice.warnings.map(w => `<span class="warning-tag">⚠ ${w}</span>`).join('')}
      </div>
    `;
  }).join('')}
  
  ${result.requiredBridges.length > 0 ? `
    <h2>Required Bridge Spaces</h2>
    ${result.requiredBridges.map(bridge => {
      const name = bridge.replace(/([A-Z])/g, ' $1').trim();
      const descriptions: Record<string, string> = {
        'butlerPantry': 'Service corridor between kitchen and dining',
        'soundLock': 'Acoustic vestibule for media room isolation',
        'guestAutonomy': 'Independent guest suite facilities',
        'wetFeetIntercept': 'Pool-to-house transition zone',
        'opsCore': 'Staff operations hub'
      };
      return `
        <div class="bridge-item">
          <div class="bridge-name">${name}</div>
          <div class="bridge-desc">${descriptions[bridge] || 'Supporting space'}</div>
        </div>
      `;
    }).join('')}
  ` : ''}
  
  <div class="footer">
    N4S Mansion Validation Program • ${new Date().toLocaleString()}
  </div>
  
  <script>
    // Auto-print when loaded
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
  
  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export default generatePersonalizationPDF;
