import { AuditResult, AuditViolation, Rule } from 'shared';
import { AIService } from './ai.service';
import { KnowledgeProvider } from './providers/knowledge.provider';

export class AuditService {
  constructor(
    private aiService: AIService,
    private knowledgeProvider: KnowledgeProvider
  ) {}

  /**
   * Audit code content against design system rules.
   */
  async auditCode(codeContent: string, filePath: string, provider?: 'gemini' | 'openai' | 'mock' | 'auto'): Promise<AuditResult> {
    // 1. Run local rule engine to detect base violations
    const localResult = this.runLocalStaticAudit(codeContent, filePath);
    
    const rules = await this.knowledgeProvider.getRelevantRules();
    
    if (provider === 'mock') {
      return localResult;
    }

    try {
      const systemInstruction = `You are DesignGuardian AI.
You are a senior product designer from Stripe, Linear, Notion, Vercel and Apple.
You are auditing frontend code.
The goal is to eliminate generic AI-generated design patterns and enforce premium, minimalist, enterprise-grade UI.
Use the provided design rules as the source of truth.
Never recommend flashy, trendy or decorative solutions.
Prioritize:
- hierarchy
- spacing
- typography
- accessibility
- brand consistency`;

      const prompt = `
Code to audit:
\`\`\`
${codeContent}
\`\`\`

Our rule engine has detected the following style system violations:
${JSON.stringify(localResult.violations, null, 2)}

Official design guidelines rules for reference:
${JSON.stringify(rules.slice(0, 25), null, 2)}

For each detected violation, enrich the details with:
- description: Explain WHY the UI feels generic and how it looks like a template SaaS layout. Be highly descriptive and call out the traits of AI-generated components (e.g. heavy gradients, aggressive shadows, etc.).
- reasoningChain: Explain the detailed senior-designer reasoning chain explaining why this is unpolished.
- whyThisMatters: A profound product explanation of why this rule is key for conversion/brand.
- expectedUXImpact: Describe the aesthetic boost and professional feeling after fixing.

Also, calculate the design score (0-100) and provide:
- summary: A comprehensive overall review report (design score review).
- strengths: list of design strengths you see in this code (e.g. good typography choice, clear markup structure, etc.)
- weaknesses: list of design weaknesses (e.g. heavy gradients, decorative glow effects, glassmorphic abuse)
- recommendations: list of high-level advice on how to make it feel world-class.

Return the result as a single JSON object matching this exact schema:
{
  "score": number, // Calculate the overall score out of 100
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "violations": [
    {
      "ruleId": "...", // must match the detected violation ruleId exactly
      "selector": "...",
      "lineNumber": number,
      "matchedText": "...",
      "expectedValue": "...",
      "actualValue": "...",
      "suggestedFix": "...",
      "description": "...",
      "whyThisMatters": "...",
      "reasoningChain": "...",
      "expectedUXImpact": "..."
    }
  ]
}
Do not include any text, notes, markdown blocks outside the JSON.`;

      const responseText = await this.aiService.generateContent(prompt, {
        provider,
        jsonMode: true,
        systemInstruction
      });

      const cleanedJson = this.cleanJsonText(responseText);
      const parsedResult = JSON.parse(cleanedJson) as any;

      const violations: AuditViolation[] = [];
      const parsedViolations = parsedResult.violations || [];
      
      // If AI returned enriched violations, map them back. If not, use local violations.
      if (parsedViolations.length > 0) {
        for (const v of parsedViolations) {
          const matchingLocal = localResult.violations.find(x => x.ruleId === v.ruleId && x.matchedText === v.matchedText) || 
                                localResult.violations.find(x => x.ruleId === v.ruleId);
          
          let sourceDocument = v.sourceDocument || (matchingLocal ? matchingLocal.sourceDocument : '');
          if (!sourceDocument) {
            const citations = await this.knowledgeProvider.retrieveRuleCitations(v.ruleId);
            sourceDocument = citations.length > 0 ? citations[0].split(':')[0] : 'general-branding.md';
          }

          violations.push({
            ruleId: v.ruleId,
            ruleName: v.ruleName || (matchingLocal ? matchingLocal.ruleName : 'Design Deviation'),
            category: v.category || (matchingLocal ? matchingLocal.category : 'other'),
            severity: v.severity || (matchingLocal ? matchingLocal.severity : 'warning'),
            filePath: filePath,
            selector: v.selector || (matchingLocal ? matchingLocal.selector : ''),
            lineNumber: v.lineNumber || (matchingLocal ? matchingLocal.lineNumber : 0),
            matchedText: v.matchedText || (matchingLocal ? matchingLocal.matchedText : ''),
            expectedValue: v.expectedValue || (matchingLocal ? matchingLocal.expectedValue : ''),
            actualValue: v.actualValue || (matchingLocal ? matchingLocal.actualValue : ''),
            suggestedFix: v.suggestedFix || (matchingLocal ? matchingLocal.suggestedFix : ''),
            description: v.description || (matchingLocal ? matchingLocal.description : 'Violation detected.'),
            sourceDocument,
            whyThisMatters: v.whyThisMatters || (matchingLocal ? matchingLocal.whyThisMatters : ''),
            reasoningChain: v.reasoningChain || (matchingLocal ? matchingLocal.reasoningChain : ''),
            expectedUXImpact: v.expectedUXImpact || (matchingLocal ? matchingLocal.expectedUXImpact : '')
          });
        }
      } else {
        violations.push(...localResult.violations);
      }

      // Ensure score is correct
      const score = typeof parsedResult.score === 'number' ? parsedResult.score : localResult.score;

      // Construct dynamic audit summary with Strengths/Weaknesses if present
      let finalSummary = parsedResult.summary || localResult.summary;
      if (parsedResult.strengths && parsedResult.strengths.length > 0) {
        finalSummary += `\n\n**Strengths:**\n` + parsedResult.strengths.map((s: string) => `- ${s}`).join('\n');
      }
      if (parsedResult.weaknesses && parsedResult.weaknesses.length > 0) {
        finalSummary += `\n\n**Weaknesses:**\n` + parsedResult.weaknesses.map((w: string) => `- ${w}`).join('\n');
      }
      if (parsedResult.recommendations && parsedResult.recommendations.length > 0) {
        finalSummary += `\n\n**Recommendations:**\n` + parsedResult.recommendations.map((r: string) => `- ${r}`).join('\n');
      }

      return {
        score,
        violations,
        summary: finalSummary,
        fileCount: 1,
        violationCount: violations.length
      };

    } catch (error) {
      console.error('AuditService: Error during AI auditing. Falling back to local rules.', error);
      return localResult;
    }
  }

  private cleanJsonText(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }

  private calculateScore(violations: AuditViolation[]): number {
    let score = 100;
    for (const v of violations) {
      if (v.severity === 'error') {
        score -= 15;
      } else if (v.severity === 'warning') {
        score -= 8;
      } else if (v.severity === 'info') {
        score -= 3;
      }
    }
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Simple rule-based audit fallback when AI service is unavailable or errors out.
   */
  private runLocalStaticAudit(codeContent: string, filePath: string): AuditResult {
    const violations: AuditViolation[] = [];
    const lines = codeContent.split('\n');

    // 1. Check for hex colors
    const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
    const allowedHex = ['#eff6ff', '#3b82f6', '#1e3a8a', '#f8fafc', '#f1f5f9', '#1e293b', '#0f172a', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      let match;
      while ((match = hexRegex.exec(line)) !== null) {
        const fullHex = match[0].toLowerCase();
        if (!allowedHex.includes(fullHex) && fullHex !== '#fff' && fullHex !== '#000') {
          violations.push({
            ruleId: 'COLOR-001',
            ruleName: 'Allowed Color Palette Only',
            category: 'color',
            severity: 'error',
            filePath,
            lineNumber: lineNum,
            matchedText: match[0],
            expectedValue: 'Design Token (e.g. var(--color-primary-500))',
            actualValue: match[0],
            suggestedFix: `var(--color-primary-500)`,
            description: `Hardcoded hex color '${match[0]}' is not in the approved design system palette.`,
            sourceDocument: 'color-system.md',
            whyThisMatters: 'Hardcoded hex values bypass semantic theme mappings, preventing dark mode synchronization.',
            reasoningChain: `Detected raw hex color code '${match[0]}' embedded in styling tags. This deviates from standard tokens.`,
            expectedUXImpact: 'Improved color theme customization and visual accessibility support.'
          });
        }
      }

      // 2. Check spacing values (px patterns)
      const pxRegex = /\b(\d+)px\b/g;
      const allowedSpacing = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
      let pxMatch;
      while ((pxMatch = pxRegex.exec(line)) !== null) {
        const val = parseInt(pxMatch[1], 10);
        if (line.includes('padding') || line.includes('margin') || line.includes('gap') || line.includes('top') || line.includes('left') || line.includes('right') || line.includes('bottom')) {
          if (!allowedSpacing.includes(val)) {
            violations.push({
              ruleId: 'SPACE-001',
              ruleName: 'Modular Spacing Scale',
              category: 'spacing',
              severity: 'warning',
              filePath,
              lineNumber: lineNum,
              matchedText: pxMatch[0],
              expectedValue: 'Standard 4px grid spacing token (e.g. 12px, 16px)',
              actualValue: pxMatch[0],
              suggestedFix: `${Math.round(val / 4) * 4}px`,
              description: `Spacing value '${pxMatch[0]}' is not a valid token size. Layout spacing should align with the 4px modular grid.`,
              sourceDocument: 'spacing.md',
              whyThisMatters: 'Modular spacing grids prevent arbitrary layout shifting and preserve interface visual order.',
              reasoningChain: `Detected custom padding/margin size '${pxMatch[0]}' which is not a modular interval of 4px.`,
              expectedUXImpact: 'Restores layout symmetry and consistent layout rhythm.'
            });
          }
        }
      }

      // 3. Check for image alt tag
      if (line.includes('<img ') && !line.includes('alt=') && !line.includes('role="presentation"')) {
        violations.push({
          ruleId: 'ACC-001',
          ruleName: 'Image Alt Texts Required',
          category: 'accessibility',
          severity: 'error',
          filePath,
          lineNumber: lineNum,
          matchedText: line.trim(),
          expectedValue: 'alt="..." attribute',
          actualValue: 'missing alt tag',
          suggestedFix: line.replace('<img', '<img alt="Describe visual content"'),
          description: 'Image tag lacks an alt attribute, which impairs accessibility for screen readers.',
          sourceDocument: 'accessibility.md',
          whyThisMatters: 'Image alt attributes are required for screen readers to narrate images to visually impaired users.',
          reasoningChain: `Found image tag missing the descriptive 'alt' tag required for standard WCAG compliance.`,
          expectedUXImpact: 'Ensures screen-reader accessibility for visually impaired developers and users.'
        });
      }

      // 4. Check for rounded-3xl
      if (line.includes('rounded-3xl')) {
        violations.push({
          ruleId: 'BORDER-001',
          ruleName: 'Standard Border Radius Scale',
          category: 'borders',
          severity: 'warning',
          filePath,
          lineNumber: lineNum,
          matchedText: 'rounded-3xl',
          expectedValue: 'rounded-xl (12px) or rounded-2xl (16px)',
          actualValue: 'rounded-3xl (24px)',
          suggestedFix: 'rounded-xl',
          description: "Border radius 'rounded-3xl' is not on the standard border-radius scale. Use rounded-xl for standard button/card curvature.",
          sourceDocument: 'premium-branding.md',
          whyThisMatters: 'Standardized corner curves create a structured visual theme. Arbitrary curves look unpolished.',
          reasoningChain: "The border radius 24px (rounded-3xl) violates the concentric scale guidelines.",
          expectedUXImpact: 'Improved geometric visual alignment and layout stability.'
        });
      }

      // 5. Check for shadow-2xl
      if (line.includes('shadow-2xl')) {
        violations.push({
          ruleId: 'SHADOW-001',
          ruleName: 'Approved Box Shadows',
          category: 'shadows',
          severity: 'info',
          filePath,
          lineNumber: lineNum,
          matchedText: 'shadow-2xl',
          expectedValue: 'shadow-md or shadow-lg',
          actualValue: 'shadow-2xl',
          suggestedFix: 'shadow-lg',
          description: "The 'shadow-2xl' elevation style is unapproved. Standardize on shadow-lg for high elevation depth.",
          sourceDocument: 'premium-branding.md',
          whyThisMatters: 'Box shadows simulate lighting. Standard shadows establish consistent elevation layouts.',
          reasoningChain: "A high depth shadow (shadow-2xl) creates massive visual noise and fake elevation structures that break the flat-layered design system hierarchy.",
          expectedUXImpact: 'Establishes a unified dimensional layout hierarchy and clean structures across components.'
        });
      }

      // 6. Check for unapproved gradients
      if (line.includes('from-pink-500') || line.includes('to-purple-500') || line.includes('from-purple-500') || line.includes('to-pink-500') || line.includes('from-red-500') || line.includes('to-yellow-500')) {
        const matchedGrad = line.match(/(from|to)-(pink|purple|red|yellow)-500/g)?.join(' ') || 'gradient-to-r';
        violations.push({
          ruleId: 'GRAD-001',
          ruleName: 'Approved Branding Gradients',
          category: 'color',
          severity: 'error',
          filePath,
          lineNumber: lineNum,
          matchedText: matchedGrad,
          expectedValue: 'Solid brand colors or approved subtle gradients (e.g. bg-blue-600)',
          actualValue: matchedGrad,
          suggestedFix: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg',
          description: 'Hardcoded gradient uses unapproved colors that deviate from the core brand theme.',
          sourceDocument: 'premium-branding.md',
          whyThisMatters: 'Loud gradients reduce premium brand perception and make layouts feel like generic templates.',
          reasoningChain: "The component uses bright pink/purple/red gradients which represent consumer-level visual decoration rather than standard enterprise tokens.",
          expectedUXImpact: 'Enhances brand consistency and visual calm.'
        });
      }

      // 7. Check for icon-only button missing aria-label
      if (line.includes('<button') && (line.includes('Icon') || line.includes('icon')) && !line.includes('aria-label') && !line.includes('aria-labelledby')) {
        violations.push({
          ruleId: 'ACC-002',
          ruleName: 'Aria Label for Interactive Controls',
          category: 'accessibility',
          severity: 'error',
          filePath,
          lineNumber: lineNum,
          matchedText: line.trim(),
          expectedValue: 'aria-label="..." attribute',
          actualValue: 'missing aria-label on icon button',
          suggestedFix: line.replace('<button', '<button aria-label="Perform action"'),
          description: 'Buttons that contain only icons or have no visible text labels must specify an aria-label attribute.',
          sourceDocument: 'accessibility.md',
          whyThisMatters: 'Assistive readers rely on aria-labels to communicate button actions to visually impaired users.',
          reasoningChain: 'Icon-only button has no screen-reader readable text content, violating basic WCAG accessibility.',
          expectedUXImpact: 'Full screen-reader compatibility.'
        });
      }
    });

    const score = this.calculateScore(violations);
    return {
      score,
      violations,
      summary: `Static audit completed (local engine). Found ${violations.length} deviations.`,
      fileCount: 1,
      violationCount: violations.length
    };
  }
}
