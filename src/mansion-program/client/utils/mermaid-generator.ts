/**
 * Mermaid Diagram Generator
 *
 * Generates Mermaid.js diagram code from space and adjacency data.
 */

import type { BriefSpace, AdjacencyRequirement } from '../../shared/schema';

export interface MermaidOptions {
  diagramType: 'bubble' | 'circulation' | 'separation' | 'full';
  showLabels: boolean;
  filterZone?: string;
  filterLevel?: number;
  highlightSpace?: string;
}

/**
 * Generate a Mermaid flowchart from spaces and adjacencies
 */
export function generateMermaidDiagram(
  spaces: BriefSpace[],
  adjacencyMatrix: AdjacencyRequirement[],
  options: Partial<MermaidOptions> = {}
): string {
  const {
    showLabels = true,
    filterZone,
    filterLevel
  } = options;

  // Filter spaces if needed
  let filteredSpaces = [...spaces];
  if (filterZone) {
    filteredSpaces = filteredSpaces.filter(s => s.zone === filterZone);
  }
  if (filterLevel !== undefined) {
    filteredSpaces = filteredSpaces.filter(s => s.level === filterLevel);
  }

  const spaceCodes = new Set(filteredSpaces.map(s => s.code));

  // Filter adjacencies to only include filtered spaces
  const filteredAdjacencies = adjacencyMatrix.filter(
    adj => spaceCodes.has(adj.fromSpaceCode || '') && spaceCodes.has(adj.toSpaceCode || '')
  );

  // Build Mermaid code
  let mermaid = 'flowchart TB\n';

  // Add subgraphs for zones
  const zones = [...new Set(filteredSpaces.map(s => s.zone))];

  for (const zone of zones) {
    const zoneSpaces = filteredSpaces.filter(s => s.zone === zone);
    const zoneId = zone.replace(/[^a-zA-Z0-9]/g, '_');

    mermaid += `  subgraph ${zoneId}["${zone}"]\n`;
    for (const space of zoneSpaces) {
      const label = showLabels ? `${space.code}: ${space.name}` : space.code;
      mermaid += `    ${space.code}["${label}"]\n`;
    }
    mermaid += `  end\n`;
  }

  // Add edges based on adjacency relationships
  for (const adj of filteredAdjacencies) {
    if (!adj.fromSpaceCode || !adj.toSpaceCode || !adj.relationship) continue;

    const style = getEdgeStyle(adj.relationship);
    mermaid += `  ${adj.fromSpaceCode} ${style} ${adj.toSpaceCode}\n`;
  }

  return mermaid;
}

/**
 * Generate bubble diagram (zones as clusters)
 */
export function generateBubbleDiagram(
  spaces: BriefSpace[],
  adjacencyMatrix: AdjacencyRequirement[]
): string {
  return generateMermaidDiagram(spaces, adjacencyMatrix, {
    diagramType: 'bubble',
    showLabels: true
  });
}

/**
 * Generate circulation diagram (focus on A relationships)
 */
export function generateCirculationDiagram(
  spaces: BriefSpace[],
  adjacencyMatrix: AdjacencyRequirement[]
): string {
  const circulationAdjacencies = adjacencyMatrix.filter(
    adj => adj.relationship === 'A' || adj.relationship === 'N'
  );
  return generateMermaidDiagram(spaces, circulationAdjacencies, {
    diagramType: 'circulation',
    showLabels: true
  });
}

/**
 * Generate separation diagram (focus on S and B relationships)
 */
export function generateSeparationDiagram(
  spaces: BriefSpace[],
  adjacencyMatrix: AdjacencyRequirement[]
): string {
  const separationAdjacencies = adjacencyMatrix.filter(
    adj => adj.relationship === 'S' || adj.relationship === 'B'
  );
  return generateMermaidDiagram(spaces, separationAdjacencies, {
    diagramType: 'separation',
    showLabels: true
  });
}

/**
 * Get Mermaid edge style based on relationship type
 */
function getEdgeStyle(relationship: string): string {
  switch (relationship) {
    case 'A': return '===';  // Adjacent - thick line
    case 'N': return '---';  // Near - normal line
    case 'B': return '-.-';  // Buffered - dashed line
    case 'S': return 'x--x'; // Separate - crossed line
    default: return '---';
  }
}

const mermaidGenerator = {
  generateMermaidDiagram,
  generateBubbleDiagram,
  generateCirculationDiagram,
  generateSeparationDiagram
};

export default mermaidGenerator;
