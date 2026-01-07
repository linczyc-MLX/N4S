/**
 * FYI PDF Export Utility
 *
 * Generates downloadable PDF summary of the space program brief.
 * Uses printable HTML approach for compatibility.
 */

import { zones, getSpaceByCode } from '../../../shared/space-registry';

/**
 * Generate FYI Brief PDF
 */
export async function generateFYIPDF(data) {
  // Try jsPDF first
  try {
    const jsPDF = window.jspdf?.jsPDF;
    if (jsPDF) {
      await generateWithJsPDF(data, jsPDF);
      return;
    }
  } catch (e) {
    console.warn('jsPDF not available, using printable HTML');
  }

  // Fallback to printable HTML
  generatePrintableHTML(data);
}

/**
 * Generate PDF using jsPDF
 */
async function generateWithJsPDF(data, jsPDF) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper to add text
  const addText = (text, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, margin, y);
    y += fontSize * 0.5;
  };

  // Helper to check page break
  const checkPageBreak = (neededSpace = 30) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  addText('N4S Interior Area Brief', 18, true);
  y += 5;
  addText(`Generated: ${data.generatedAt}`, 9);
  if (data.projectName) addText(`Project: ${data.projectName}`, 9);
  if (data.clientName) addText(`Client: ${data.clientName}`, 9);
  y += 10;

  // Summary Box
  doc.setDrawColor(30, 58, 95); // NAVY #1e3a5f
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageWidth - 2 * margin, 35);
  y += 8;

  addText('PROGRAM SUMMARY', 12, true);
  y += 3;
  addText(`Target SF: ${data.settings.targetSF.toLocaleString()}`, 10);
  addText(`Program Tier: ${data.settings.programTier.toUpperCase()}`, 10);
  addText(`Basement: ${data.settings.hasBasement ? 'Yes' : 'No'}`, 10);
  y += 10;

  // Totals
  addText('TOTALS', 12, true);
  y += 3;
  addText(`Net Conditioned: ${data.totals.net.toLocaleString()} SF`, 10);
  addText(`Circulation (${data.totals.circulationPct}%): ${data.totals.circulation.toLocaleString()} SF`, 10);
  addText(`Total: ${data.totals.total.toLocaleString()} SF`, 10, true);
  const deltaSign = data.totals.deltaFromTarget >= 0 ? '+' : '';
  addText(`Delta from Target: ${deltaSign}${data.totals.deltaFromTarget.toLocaleString()} SF`, 10);
  if (data.totals.outdoorTotal > 0) {
    addText(`Outdoor (non-conditioned): ${data.totals.outdoorTotal.toLocaleString()} SF`, 10);
  }
  y += 10;

  // Zones
  addText('SPACES BY ZONE', 14, true);
  y += 5;

  data.zonesData.forEach(zone => {
    if (zone.spaces.length === 0) return;

    checkPageBreak(40);

    // Zone header
    doc.setFillColor(250, 250, 248); // Background #fafaf8
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 8, 'F');
    addText(`${zone.name} — ${zone.totalSF.toLocaleString()} SF`, 11, true);
    y += 5;

    // Space table header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Space', margin, y);
    doc.text('Size', margin + 70, y);
    doc.text('SF', margin + 90, y);
    doc.text('Level', margin + 115, y);
    y += 5;

    // Spaces
    doc.setFont('helvetica', 'normal');
    zone.spaces.forEach(space => {
      checkPageBreak(10);
      doc.text(space.name.substring(0, 30), margin, y);
      doc.text(space.size, margin + 70, y);
      doc.text(space.area.toLocaleString(), margin + 90, y);
      doc.text(`L${space.level > 0 ? space.level : space.level}`, margin + 115, y);
      y += 4;

      if (space.notes) {
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`  → ${space.notes.substring(0, 60)}`, margin, y);
        doc.setTextColor(0);
        doc.setFontSize(8);
        y += 4;
      }
    });

    y += 8;
  });

  // Footer
  checkPageBreak(30);
  y = 280;
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text('N4S - Not For Sale | Luxury Residential Advisory', margin, y);
  doc.text(`Page 1`, pageWidth - margin - 20, y);

  // Save
  const filename = data.projectName
    ? `FYI-Brief-${data.projectName.replace(/\s+/g, '-')}.pdf`
    : `FYI-Interior-Brief.pdf`;
  doc.save(filename);
}

/**
 * Generate printable HTML and open print dialog
 */
function generatePrintableHTML(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>N4S Interior Area Brief</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #1e3a5f;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 500;
      color: #1e3a5f;
    }
    .header .meta {
      color: #6b6b6b;
      font-size: 10px;
      margin-top: 5px;
    }
    .summary-box {
      background: #fafaf8;
      border: 1px solid #e5e5e0;
      border-left: 4px solid #c9a227;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      display: flex;
      gap: 40px;
    }
    .summary-section h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8b7355;
      margin-bottom: 8px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .summary-row strong { font-weight: 600; }
    .summary-row.total {
      border-top: 1px solid #e5e5e0;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 13px;
    }
    .summary-row.delta.over { color: #c53030; }
    .summary-row.delta.under { color: #2f855a; }

    .zones { margin-top: 20px; }
    .zone {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .zone-header {
      background: #1e3a5f;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .zone-header h2 {
      font-size: 13px;
      color: white;
      font-weight: 600;
    }
    .zone-header .sf {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    th {
      text-align: left;
      padding: 6px 8px;
      background: #fafaf8;
      border-bottom: 1px solid #e5e5e0;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #6b6b6b;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #f0f0f0;
    }
    td.notes {
      font-size: 9px;
      color: #6b6b6b;
      font-style: italic;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e5e0;
      font-size: 9px;
      color: #6b6b6b;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 0; }
      .zone { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>N4S Interior Area Brief</h1>
    <div class="meta">
      Generated: ${data.generatedAt}
      ${data.projectName ? ` | Project: ${data.projectName}` : ''}
      ${data.clientName ? ` | Client: ${data.clientName}` : ''}
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-section">
      <h3>Program Settings</h3>
      <div class="summary-row">
        <span>Target SF</span>
        <strong>${data.settings.targetSF.toLocaleString()}</strong>
      </div>
      <div class="summary-row">
        <span>Program Tier</span>
        <span>${data.settings.programTier.toUpperCase()}</span>
      </div>
      <div class="summary-row">
        <span>Size Delta</span>
        <span>±${data.settings.deltaPct}%</span>
      </div>
      <div class="summary-row">
        <span>Basement</span>
        <span>${data.settings.hasBasement ? 'Yes' : 'No'}</span>
      </div>
    </div>

    <div class="summary-section">
      <h3>Totals</h3>
      <div class="summary-row">
        <span>Net Conditioned</span>
        <span>${data.totals.net.toLocaleString()} SF</span>
      </div>
      <div class="summary-row">
        <span>Circulation (${data.totals.circulationPct}%)</span>
        <span>${data.totals.circulation.toLocaleString()} SF</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <strong>${data.totals.total.toLocaleString()} SF</strong>
      </div>
      <div class="summary-row delta ${data.totals.deltaFromTarget > 0 ? 'over' : data.totals.deltaFromTarget < 0 ? 'under' : ''}">
        <span>Delta from Target</span>
        <span>${data.totals.deltaFromTarget > 0 ? '+' : ''}${data.totals.deltaFromTarget.toLocaleString()} SF</span>
      </div>
      ${data.totals.outdoorTotal > 0 ? `
      <div class="summary-row">
        <span>Outdoor (non-conditioned)</span>
        <span>${data.totals.outdoorTotal.toLocaleString()} SF</span>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="zones">
    ${data.zonesData.map(zone => zone.spaces.length > 0 ? `
    <div class="zone">
      <div class="zone-header">
        <h2>${zone.name}</h2>
        <span class="sf">${zone.totalSF.toLocaleString()} SF</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 40%">Space</th>
            <th style="width: 10%">Size</th>
            <th style="width: 15%">Area</th>
            <th style="width: 10%">Level</th>
            <th style="width: 25%">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${zone.spaces.map(space => `
          <tr>
            <td>${space.name}</td>
            <td>${space.size}</td>
            <td>${space.area.toLocaleString()} SF</td>
            <td>L${space.level > 0 ? space.level : space.level}</td>
            <td class="notes">${space.notes || '—'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : '').join('')}
  </div>

  <div class="footer">
    <span>N4S - Not For Sale | Luxury Residential Advisory</span>
    <span>Generated ${data.generatedAt}</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `.trim();

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback: download as HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FYI-Interior-Brief.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Build PDF data from FYI state
 */
export function buildFYIPDFData(
  settings,
  selections,
  totals,
  structureTotals,
  availableLevels,
  getSpacesForZone,
  calculateArea,
  projectName,
  clientName
) {
  const zonesData = zones.map(zone => {
    const zoneSpaces = getSpacesForZone(zone.code);
    const includedSpaces = zoneSpaces
      .filter(s => selections[s.code]?.included)
      .map(s => ({
        code: s.code,
        name: s.name,
        size: selections[s.code].size,
        area: calculateArea(s.code),
        level: selections[s.code].level || s.defaultLevel,
        notes: selections[s.code].notes
      }));

    return {
      code: zone.code,
      name: zone.name,
      spaces: includedSpaces,
      totalSF: includedSpaces.reduce((sum, s) => sum + s.area, 0)
    };
  });

  return {
    settings,
    selections,
    totals,
    zonesData,
    projectName,
    clientName,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

export default {
  generateFYIPDF,
  buildFYIPDFData
};
