import * as fs from 'fs';
import * as path from 'path';
import { Rule, RuleCategory } from 'shared';
import { KnowledgeProvider } from './knowledge.provider';

export class LocalKnowledgeProvider implements KnowledgeProvider {
  private skillsDir: string;
  private rulesCache: Rule[] | null = null;

  constructor(skillsPath?: string) {
    // Navigate from out/dist or src directory to the project root skills/ directory
    this.skillsDir = skillsPath || path.resolve(__dirname, '../../../skills');
    
    // Double check paths, fallback if running in compiled mode vs ts-node mode
    if (!fs.existsSync(this.skillsDir)) {
      this.skillsDir = path.resolve(__dirname, '../../../../skills');
    }
  }

  // Load and parse all markdown rules
  private async loadRules(): Promise<Rule[]> {
    if (this.rulesCache) return this.rulesCache;

    const rules: Rule[] = [];
    const files = ['spacing.md', 'typography.md', 'color-system.md', 'accessibility.md', 'premium-branding.md'];
    
    for (const file of files) {
      const filePath = path.join(this.skillsDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`LocalKnowledgeProvider: File not found: ${filePath}`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileRules = this.parseMarkdownRules(content, file);
        rules.push(...fileRules);
      } catch (err) {
        console.error(`LocalKnowledgeProvider: Error reading ${file}`, err);
      }
    }

    // Fallback if no rules were loaded from files
    if (rules.length === 0) {
      console.log('LocalKnowledgeProvider: No file rules resolved. Falling back to static in-memory design tokens.');
      return this.getFallbackRules();
    }

    this.rulesCache = rules;
    return rules;
  }

  private parseMarkdownRules(content: string, filename: string): Rule[] {
    const rules: Rule[] = [];
    // Split by Rule headers
    const sections = content.split(/### Rule:\s*/);
    
    // The first section is just the document header, skip it
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const lines = section.split('\n');
      const headerLine = lines[0].trim();
      
      const idMatch = /- \*\*ID\*\*:\s*([A-Z0-9-]+)/i.exec(section);
      const severityMatch = /- \*\*Severity\*\*:\s*([a-z]+)/i.exec(section);
      const descMatch = /- \*\*Description\*\*:\s*(.*)/i.exec(section);
      const rationalMatch = /- \*\*Rationale\*\*:\s*(.*)/i.exec(section);
      const recMatch = /- \*\*Refactoring Guidance\*\*:\s*(.*)/i.exec(section);

      const id = idMatch ? idMatch[1].trim() : 'UNKNOWN';
      const severity = (severityMatch ? severityMatch[1].trim() : 'warning') as 'info' | 'warning' | 'error';
      const description = descMatch ? descMatch[1].trim() : headerLine;
      const recommendation = recMatch ? recMatch[1].trim() : 'Follow the style guide.';
      const rationale = rationalMatch ? rationalMatch[1].trim() : '';

      // Determine Category from ID prefix
      let category: RuleCategory = 'other';
      if (id.startsWith('SPACE')) category = 'spacing';
      else if (id.startsWith('TYPO')) category = 'typography';
      else if (id.startsWith('COLOR')) category = 'color';
      else if (id.startsWith('BORDER')) category = 'borders';
      else if (id.startsWith('SHADOW')) category = 'shadows';
      else if (id.startsWith('ACC')) category = 'accessibility';
      else if (id.startsWith('GRAD')) category = 'color';

      // Parse Allowed Values
      let allowedValue: any = null;
      const allowedMatch = /- \*\*Allowed Values\*\*:\s*(.*)/i.exec(section);
      if (allowedMatch) {
        const valStr = allowedMatch[1].trim();
        if (valStr.includes(',')) {
          allowedValue = valStr.split(',').map(s => s.trim().replace(/['"`]/g, ''));
        } else {
          allowedValue = valStr;
        }
      }

      rules.push({
        id,
        name: headerLine.split(' - ')[1] || headerLine,
        category,
        description,
        severity,
        value: allowedValue,
        // Embed the description and rationale directly so it passes through semantic engines
        recommendation: `${recommendation} [Why this matters: ${rationale}]`
      });
    }

    return rules;
  }

  // Fallback in-memory dataset
  private getFallbackRules(): Rule[] {
    return [
      {
        id: 'COLOR-001',
        name: 'Allowed Color Palette Only',
        category: 'color',
        description: 'Only use colors defined in the design system tokens. Hardcoded hex, rgb, or color strings are not permitted.',
        severity: 'error',
        value: ['#eff6ff', '#3b82f6', '#1e3a8a', '#f8fafc', '#f1f5f9', '#1e293b', '#0f172a', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'],
        recommendation: 'Replace hardcoded colors with CSS variables (e.g. var(--color-primary-500)) or approved Tailwind classes. [Why this matters: Hardcoded colors block dark mode synchronization.]'
      },
      {
        id: 'SPACE-001',
        name: 'Modular Spacing Scale',
        category: 'spacing',
        description: 'All layout padding, margin, and gaps must follow the modular spacing grid (multiples of 4px).',
        severity: 'warning',
        value: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
        recommendation: 'Adjust spacing to the nearest token value on the 4px modular scale (e.g. 12px or 16px instead of 13px). [Why this matters: Eliminates layout grid shifts.]'
      },
      {
        id: 'TYPO-001',
        name: 'Approved Font Families',
        category: 'typography',
        description: 'Only use brand approved font families in the application interface.',
        severity: 'error',
        value: ['Inter', 'system-ui', 'sans-serif'],
        recommendation: 'Ensure custom font-family specifications resolve to Inter or default system-ui fonts. [Why this matters: Ensures visual brand tone consistency.]'
      },
      {
        id: 'BORDER-001',
        name: 'Standard Border Radius Scale',
        category: 'borders',
        description: 'UI card, button, and container corners must use standard border radius values.',
        severity: 'info',
        value: ['0px', '2px', '4px', '6px', '8px', '12px', '16px', '9999px'],
        recommendation: 'Select a border radius from the standard tokens (e.g. rounded-xl). [Why this matters: Harmonizes corners layout rhythm.]'
      },
      {
        id: 'SHADOW-001',
        name: 'Approved Box Shadows',
        category: 'shadows',
        description: 'Avoid arbitrary box-shadow styles; use standard shadow tokens to ensure consistent elevation physics.',
        severity: 'warning',
        value: ['shadow-sm', 'shadow-md', 'shadow-lg'],
        recommendation: 'Replace custom CSS box-shadows with standard design utility shadow classes. [Why this matters: Standardizes card elevation depth.]'
      },
      {
        id: 'ACC-001',
        name: 'Image Alt Texts Required',
        category: 'accessibility',
        description: 'All <img> elements must have a valid alt text or role="presentation" to be accessible to screen readers.',
        severity: 'error',
        value: null,
        recommendation: 'Add alt description or role="presentation" to image elements. [Why this matters: Critical for WCAG 2.1 compliance.]'
      }
    ];
  }

  async getRelevantRules(category?: string): Promise<Rule[]> {
    const rules = await this.loadRules();
    if (category) {
      return rules.filter(r => r.category === category);
    }
    return rules;
  }

  async searchKnowledge(query: string): Promise<Rule[]> {
    const rules = await this.loadRules();
    const lcQuery = query.toLowerCase();
    return rules.filter(r => 
      r.id.toLowerCase().includes(lcQuery) || 
      r.name.toLowerCase().includes(lcQuery) || 
      r.description.toLowerCase().includes(lcQuery) || 
      r.category.toLowerCase().includes(lcQuery)
    );
  }

  async retrieveRuleCitations(ruleId: string): Promise<string[]> {
    const fileMap: Record<string, string> = {
      'SPACE': 'spacing.md',
      'TYPO': 'typography.md',
      'COLOR': 'color-system.md',
      'BORDER': 'premium-branding.md',
      'SHADOW': 'premium-branding.md',
      'GRAD': 'premium-branding.md',
      'ACC': 'accessibility.md'
    };

    const prefix = ruleId.split('-')[0].toUpperCase();
    const doc = fileMap[prefix] || 'premium-branding.md';
    const filePath = path.join(this.skillsDir, doc);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const matches = lines.filter(l => l.includes(ruleId));
        if (matches.length > 0) {
          return matches.map(m => `${doc}: ${m.trim()}`);
        }
        return [`${doc}: Refer to design system rule ${ruleId}`];
      } catch (err) {
        // Fallback below
      }
    }
    return [`${doc}: Refer to standard guideline rule ${ruleId}`];
  }

  async getDesignContext(query: string): Promise<string> {
    const filePath = path.join(this.skillsDir, 'design-dna.md');
    if (fs.existsSync(filePath)) {
      try {
        return fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        // Fallback below
      }
    }
    
    return `# Design DNA Style Guide

Design Style: Premium Minimalist
Traits:
- Whitespace: Large whitespace and breathing margins.
- Shadows: Subtle elevations and standardized shadow depths.
- Palette: Dark slate backgrounds, brand blue highlights.
- Typography: Strong typographic hierarchies.`;
  }
}
