import { Rule, RuleCategory } from 'shared';

export class KnowledgeService {
  private rules: Rule[] = [
    // Colors
    {
      id: 'COLOR-001',
      name: 'Allowed Color Palette Only',
      category: 'color',
      description: 'Only use colors defined in the design system tokens. Hardcoded hex, rgb, or color strings are not permitted.',
      severity: 'error',
      value: {
        tokens: {
          '--color-primary-100': '#eff6ff',
          '--color-primary-500': '#3b82f6',
          '--color-primary-900': '#1e3a8a',
          '--color-neutral-50': '#f8fafc',
          '--color-neutral-100': '#f1f5f9',
          '--color-neutral-800': '#1e293b',
          '--color-neutral-900': '#0f172a',
          '--color-danger-500': '#ef4444',
          '--color-success-500': '#22c55e',
          '--color-warning-500': '#eab308'
        },
        hexValues: ['#eff6ff', '#3b82f6', '#1e3a8a', '#f8fafc', '#f1f5f9', '#1e293b', '#0f172a', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000']
      },
      recommendation: 'Replace hardcoded colors with CSS variables (e.g. var(--color-primary-500)) or Design Utility classes (e.g. text-primary-500).'
    },
    {
      id: 'COLOR-002',
      name: 'Consistent Color Semantic Meanings',
      category: 'color',
      description: 'Ensure semantic colors (danger, success, warning) are only used for their intended UI state messages.',
      severity: 'warning',
      value: null,
      recommendation: 'Do not use red/danger colors for positive status buttons or links.'
    },

    // Spacing
    {
      id: 'SPACE-001',
      name: 'Modular Spacing Scale',
      category: 'spacing',
      description: 'All layout padding, margin, and gaps must follow the modular spacing grid (multiples of 4px).',
      severity: 'warning',
      value: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
      recommendation: 'Adjust spacing to the nearest token value on the 4px modular scale (e.g. 12px or 16px instead of 13px).'
    },

    // Typography
    {
      id: 'TYPO-001',
      name: 'Approved Font Families',
      category: 'typography',
      description: 'Only use brand approved font families in the application interface.',
      severity: 'error',
      value: ['Inter', 'system-ui', 'sans-serif'],
      recommendation: 'Ensure custom font-family specifications resolve to Inter or default system-ui fonts.'
    },
    {
      id: 'TYPO-002',
      name: 'Standardized Font Sizes',
      category: 'typography',
      description: 'Use standard font sizes from the design system type scale.',
      severity: 'warning',
      value: ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'],
      recommendation: 'Set font size to one of the standard sizes (e.g., 14px or 16px) using corresponding CSS/tailwind utility class.'
    },

    // Borders
    {
      id: 'BORDER-001',
      name: 'Standard Border Radius Scale',
      category: 'borders',
      description: 'UI card, button, and container corners must use standard border radius values.',
      severity: 'info',
      value: ['0px', '2px', '4px', '6px', '8px', '12px', '16px', '9999px'],
      recommendation: 'Select a border radius from the standard tokens (e.g., rounded-sm, rounded-md, rounded-full).'
    },

    // Shadows
    {
      id: 'SHADOW-001',
      name: 'Approved Box Shadows',
      category: 'shadows',
      description: 'Avoid arbitrary box-shadow styles; use standard shadow tokens to ensure consistent elevation physics.',
      severity: 'warning',
      value: {
        shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
      },
      recommendation: 'Replace custom CSS box-shadows with standard design utility shadow classes.'
    },

    // Accessibility
    {
      id: 'ACC-001',
      name: 'Image Alt Texts Required',
      category: 'accessibility',
      description: 'All <img> elements must have a valid alt text or role="presentation" to be accessible to screen readers.',
      severity: 'error',
      value: null,
      recommendation: 'Add an alt description or role="presentation" to the image element.'
    },
    {
      id: 'ACC-002',
      name: 'Aria Label for Interactive Controls',
      category: 'accessibility',
      description: 'Buttons and inputs that contain only icons or have no visible text labels must specify an aria-label attribute.',
      severity: 'error',
      value: null,
      recommendation: 'Add an aria-label attribute to clearly describe the control for assistive technologies.'
    }
  ];

  /**
   * Get all loaded design system rules.
   */
  getAllRules(): Rule[] {
    return this.rules;
  }

  /**
   * Get design system rules by category.
   */
  getRulesByCategory(category: RuleCategory): Rule[] {
    return this.rules.filter(r => r.category === category);
  }

  /**
   * Get a single design system rule by its ID.
   */
  getRuleById(id: string): Rule | undefined {
    return this.rules.find(r => r.id === id);
  }

  /**
   * Add a new design system rule dynamically.
   */
  addRule(rule: Rule): void {
    if (this.rules.some(r => r.id === rule.id)) {
      throw new Error(`Rule with ID ${rule.id} already exists`);
    }
    this.rules.push(rule);
  }

  /**
   * Remove a rule by ID.
   */
  deleteRule(id: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== id);
    return this.rules.length < initialLength;
  }
}
