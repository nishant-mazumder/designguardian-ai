export type RuleCategory = 
  | 'spacing' 
  | 'typography' 
  | 'color' 
  | 'borders' 
  | 'shadows' 
  | 'accessibility' 
  | 'other';

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  severity: 'info' | 'warning' | 'error';
  value: any; // e.g. token name, pixel scale, color hex/rgba code
  recommendation: string;
}

export interface AuditViolation {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  severity: 'info' | 'warning' | 'error';
  filePath: string;
  selector?: string; // CSS selector, component name, or class name
  lineNumber?: number;
  matchedText: string;
  expectedValue: string;
  actualValue: string;
  suggestedFix?: string; // refactored code snippet or recommendation
  description: string;
  sourceDocument?: string; // The document name retrieved from Foundry IQ (e.g. spacing.md)
  whyThisMatters?: string; // The rationale explaining why this rule exists
  expectedUXImpact?: string; // The predicted visual or usability improvement
  reasoningChain?: string; // Step-by-step audit reasoning
}

export interface AuditResult {
  score: number; // 0 to 100
  violations: AuditViolation[];
  summary: string;
  fileCount: number;
  violationCount: number;
}

export interface DNAPaletteItem {
  color: string;
  count: number;
}

export interface DNATypographyItem {
  fontFamily: string;
  size: string;
  weight: string;
  count: number;
}

export interface DNASpacingItem {
  value: string;
  count: number;
}

export interface DNABordersItem {
  radius: string;
  count: number;
}

export interface DNAShadowsItem {
  value: string;
  count: number;
}

export interface DNAComponentItem {
  name: string;
  count: number;
}

export interface DesignDNAReport {
  palette: DNAPaletteItem[];
  typography: DNATypographyItem[];
  spacing: DNASpacingItem[];
  borders: DNABordersItem[];
  shadows: DNAShadowsItem[];
  components: DNAComponentItem[];
  style?: string;
  characteristics?: string[];
  confidence?: number;
  narrative?: string;
}

export interface DriftInconsistency {
  type: RuleCategory;
  value: string;
  occurrences: number;
  files: string[];
}

export interface DriftReport {
  driftScore: number; // 0 to 100, where 0 is no drift and 100 is high drift
  unregisteredColors: string[];
  unregisteredTypography: string[];
  unregisteredSpacing: string[];
  inconsistencies: DriftInconsistency[];
}

export interface RefactorRequest {
  filePath: string;
  codeContent: string;
  violation: AuditViolation;
}

export interface RefactorResponse {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  appliedRuleId: string;
  success: boolean;
}
