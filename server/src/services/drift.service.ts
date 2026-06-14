import { DesignDNAReport, DriftReport, DriftInconsistency, RuleCategory } from 'shared';
import { KnowledgeProvider } from './providers/knowledge.provider';

export class DriftService {
  constructor(private knowledgeProvider: KnowledgeProvider) {}

  /**
   * Calculate Design Drift by comparing DNA profile against Design System tokens.
   */
  async calculateDrift(dnaReport: DesignDNAReport, filePath: string): Promise<DriftReport> {
    const rules = await this.knowledgeProvider.getRelevantRules();

    // 1. Get Design System reference tokens
    const colorRule = rules.find(r => r.id === 'COLOR-001');
    // Also support custom brand gradient token
    const allowedColors: string[] = colorRule?.value?.hexValues || colorRule?.value || [];
    
    const spacingRule = rules.find(r => r.id === 'SPACE-001');
    const allowedSpacings: number[] = spacingRule?.value || [];

    const typographyFamilyRule = rules.find(r => r.id === 'TYPO-001');
    const allowedFontFamilies: string[] = typographyFamilyRule?.value || [];

    const typographySizeRule = rules.find(r => r.id === 'TYPO-002');
    const allowedFontSizes: string[] = typographySizeRule?.value || [];

    const borderRule = rules.find(r => r.id === 'BORDER-001');
    const allowedBorders: string[] = borderRule?.value || [];

    // 2. Identify deviations and calculate drift
    const unregisteredColors: string[] = [];
    const unregisteredTypography: string[] = [];
    const unregisteredSpacing: string[] = [];
    const inconsistencies: DriftInconsistency[] = [];

    let totalDriftPenalty = 0;

    // A. Check Palette Colors
    dnaReport.palette.forEach(item => {
      const colorVal = item.color.toLowerCase();
      // Skip CSS variables because they are design tokens
      if (colorVal.startsWith('var(') || colorVal === 'transparent' || colorVal === 'inherit') {
        return;
      }
      
      const isAllowed = allowedColors.some(c => c.toLowerCase() === colorVal);
      if (!isAllowed) {
        unregisteredColors.push(item.color);
        totalDriftPenalty += item.count * 6; // 6 points per occurrence of out-of-spec color

        inconsistencies.push({
          type: 'color',
          value: item.color,
          occurrences: item.count,
          files: [filePath]
        });
      }
    });

    // B. Check Spacing Scale
    dnaReport.spacing.forEach(item => {
      const valStr = item.value;
      // Extract numeric value from string (e.g. "13px" -> 13)
      const numMatch = /(\d+)(?:px)?/.exec(valStr);
      if (numMatch) {
        const numVal = parseInt(numMatch[1], 10);
        if (!allowedSpacings.includes(numVal)) {
          unregisteredSpacing.push(valStr);
          totalDriftPenalty += item.count * 3; // 3 points per modular scale violation

          inconsistencies.push({
            type: 'spacing',
            value: valStr,
            occurrences: item.count,
            files: [filePath]
          });
        }
      }
    });

    // C. Check Typography
    dnaReport.typography.forEach(item => {
      const isFamilyAllowed = allowedFontFamilies.some(f => f.toLowerCase() === item.fontFamily.toLowerCase());
      const isSizeAllowed = allowedFontSizes.includes(item.size);

      if (!isFamilyAllowed || !isSizeAllowed) {
        const label = `${item.fontFamily} ${item.size} (${item.weight})`;
        unregisteredTypography.push(label);
        totalDriftPenalty += item.count * 4;

        inconsistencies.push({
          type: 'typography',
          value: label,
          occurrences: item.count,
          files: [filePath]
        });
      }
    });

    // D. Check Borders
    dnaReport.borders.forEach(item => {
      if (!allowedBorders.includes(item.radius)) {
        totalDriftPenalty += item.count * 2;
        inconsistencies.push({
          type: 'borders',
          value: `Border Radius: ${item.radius}`,
          occurrences: item.count,
          files: [filePath]
        });
      }
    });

    // 3. Compute final Drift Score (0 = perfect alignment, 100 = full drift)
    const driftScore = Math.min(100, totalDriftPenalty);

    return {
      driftScore,
      unregisteredColors,
      unregisteredTypography,
      unregisteredSpacing,
      inconsistencies
    };
  }
}
