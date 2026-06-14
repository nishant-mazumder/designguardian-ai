import { AuditViolation, RefactorResponse } from 'shared';
import { AIService } from './ai.service';
import { KnowledgeProvider } from './providers/knowledge.provider';

export class RefactorService {
  constructor(
    private aiService: AIService,
    private knowledgeProvider: KnowledgeProvider
  ) {}

  /**
   * Refactor source code to fix a specific design system violation.
   */
  async refactorCode(
    codeContent: string,
    filePath: string,
    violation: AuditViolation,
    provider?: 'gemini' | 'openai' | 'mock' | 'auto'
  ): Promise<RefactorResponse> {
    const rules = await this.knowledgeProvider.getRelevantRules();
    const rule = rules.find(r => r.id === violation.ruleId);
    const prompt = this.buildRefactorPrompt(codeContent, filePath, violation, rule);

    try {
      const systemInstruction = `You are DesignGuardian AI.
You are a senior product designer from Stripe, Linear, Notion, Vercel and Apple.
You are an automated refactoring engine for design systems.
The goal is to eliminate generic AI-generated design patterns and enforce premium, minimalist, enterprise-grade UI.
Use the provided design rules as the source of truth.
Never recommend flashy, trendy or decorative solutions.
Prioritize:
- hierarchy
- spacing
- typography
- accessibility
- brand consistency

You return ONLY a valid JSON object matching the RefactorResponse schema, fixing the code and explaining your modifications. Do not output markdown other than JSON.`;
      
      const responseText = await this.aiService.generateContent(prompt, {
        provider,
        jsonMode: true,
        systemInstruction
      });

      const cleanedJson = this.cleanJsonText(responseText);
      const parsed = JSON.parse(cleanedJson) as Partial<RefactorResponse>;

      return {
        originalCode: codeContent,
        refactoredCode: parsed.refactoredCode || codeContent,
        explanation: parsed.explanation || 'Refactored code to comply with design tokens.',
        appliedRuleId: violation.ruleId,
        success: parsed.success !== false
      };

    } catch (error) {
      console.error('RefactorService: AI refactoring failed. Running local fallback refactor.', error);
      return this.runLocalFallbackRefactor(codeContent, violation);
    }
  }

  /**
   * Refactor source code resolving ALL of the provided violations.
   */
  async refactorAll(
    codeContent: string,
    filePath: string,
    violations: AuditViolation[],
    provider?: 'gemini' | 'openai' | 'mock' | 'auto'
  ): Promise<RefactorResponse> {
    if (violations.length === 0) {
      return {
        originalCode: codeContent,
        refactoredCode: codeContent,
        explanation: 'No design violations identified; code is compliant.',
        appliedRuleId: 'NONE',
        success: true
      };
    }

    const prompt = `
You are a senior design engineer refactoring code to adhere to our corporate Design System.
Review the following list of design violations identified in the file:

${JSON.stringify(violations, null, 2)}

---
Source Code to Refactor:
\`\`\`
${codeContent}
\`\`\`
---

Please refactor the Source Code to resolve ALL of these violations while preserving the exact layout, state, event handlers, and functional logic of the component.
Do not remove styling unless it is hardcoded and violates a rule. Replace hardcoded values, classes, or patterns with correct design system tokens as described.

Your output must be a single JSON object with this structure:
{
  "refactoredCode": "The full code content after resolving all violations",
  "explanation": "Brief description of the changes made to correct the violations",
  "success": true
}

Return ONLY this JSON object. Do not include markdown code block formatting (like \`\`\`json) in the response text itself, just output the raw JSON string.
`;

    try {
      const systemInstruction = `You are DesignGuardian AI.
You are a senior product designer from Stripe, Linear, Notion, Vercel and Apple.
You are an automated refactoring engine for design systems.
The goal is to eliminate generic AI-generated design patterns and enforce premium, minimalist, enterprise-grade UI.
Use the provided design rules as the source of truth.
Never recommend flashy, trendy or decorative solutions.
Prioritize:
- hierarchy
- spacing
- typography
- accessibility
- brand consistency

You return ONLY a valid JSON object matching the RefactorResponse schema, fixing the code and explaining your modifications.`;
      
      const responseText = await this.aiService.generateContent(prompt, {
        provider,
        jsonMode: true,
        systemInstruction
      });

      const cleanedJson = this.cleanJsonText(responseText);
      const parsed = JSON.parse(cleanedJson) as Partial<RefactorResponse>;

      return {
        originalCode: codeContent,
        refactoredCode: parsed.refactoredCode || codeContent,
        explanation: parsed.explanation || 'Refactored code to comply with design tokens.',
        appliedRuleId: violations.map(v => v.ruleId).join(', '),
        success: parsed.success !== false
      };

    } catch (error) {
      console.error('RefactorService: AI refactoring failed. Running local fallback refactor for all violations.', error);
      
      // Fallback: apply each refactoring sequentially using local fallback logic
      let currentCode = codeContent;
      const appliedFixes: string[] = [];
      
      for (const violation of violations) {
        const step = this.runLocalFallbackRefactor(currentCode, violation);
        if (step.success) {
          currentCode = step.refactoredCode;
          appliedFixes.push(`${violation.ruleId}: ${step.explanation}`);
        }
      }
      
      return {
        originalCode: codeContent,
        refactoredCode: currentCode,
        explanation: appliedFixes.length > 0 
          ? `Local fallback applied fixes:\n${appliedFixes.join('\n')}` 
          : 'Failed to apply any automatic fixes locally.',
        appliedRuleId: violations.map(v => v.ruleId).join(', '),
        success: appliedFixes.length > 0
      };
    }
  }

  private buildRefactorPrompt(codeContent: string, filePath: string, violation: AuditViolation, rule?: any): string {
    return `
You are a design engineer refactoring code to adhere to our corporate Design System.
Review the following design violation details:

Rule ID: ${violation.ruleId}
Rule Name: ${violation.ruleName}
Category: ${violation.category}
File Path: ${filePath}
Violating Code Segment: "${violation.matchedText}"
Line Number: ${violation.lineNumber || 'unknown'}
Actual Value Found: "${violation.actualValue}"
Expected Value/Scale: "${violation.expectedValue}"
Suggested Fix Guidance: "${violation.suggestedFix || ''}"
Rule Recommendation: "${rule?.recommendation || ''}"

---
Source Code to Refactor:
\`\`\`
${codeContent}
\`\`\`
---

Please refactor the Source Code to resolve this specific violation while preserving all surrounding logic and functionality.
Replace hardcoded values, classes, or patterns with correct design system tokens as described.

Your output must be a single JSON object with this structure:
{
  "refactoredCode": "The full code content after resolving the violation",
  "explanation": "Brief description of the changes made to correct the violation",
  "success": true
}

Return ONLY this JSON object. Do not include markdown code block formatting (like \`\`\`json) in the response text itself, just output the raw JSON string.
`;
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

  /**
   * Deterministic local fallback refactor when AI is not available.
   * Performs string replacement of matched violating text if possible.
   */
  private runLocalFallbackRefactor(codeContent: string, violation: AuditViolation): RefactorResponse {
    let refactoredCode = codeContent;
    let success = false;
    let explanation = `Failed to apply automatic fallback fix for ${violation.ruleId}.`;

    if (violation.matchedText && violation.suggestedFix) {
      // Check if the exact matched text exists in the code
      if (codeContent.includes(violation.matchedText)) {
        refactoredCode = codeContent.replace(violation.matchedText, violation.suggestedFix);
        success = true;
        explanation = `Successfully replaced '${violation.matchedText}' with '${violation.suggestedFix}' (Local engine fallback).`;
      } else {
        // Try to replace value directly if matched text is not identical but exists partially
        const escapedMatchedText = violation.matchedText.trim();
        if (codeContent.includes(escapedMatchedText)) {
          refactoredCode = codeContent.replace(escapedMatchedText, violation.suggestedFix);
          success = true;
          explanation = `Partially matched and replaced '${escapedMatchedText}' with '${violation.suggestedFix}' (Local engine fallback).`;
        }
      }
    }

    if (!success) {
      // If we couldn't match, we check rule types to make smart adjustments
      if (violation.ruleId === 'COLOR-001' && violation.actualValue && violation.suggestedFix) {
        if (codeContent.includes(violation.actualValue)) {
          refactoredCode = codeContent.split(violation.actualValue).join(violation.suggestedFix);
          success = true;
          explanation = `Replaced all instances of hardcoded color '${violation.actualValue}' with token '${violation.suggestedFix}' (Local engine fallback).`;
        }
      }
    }

    return {
      originalCode: codeContent,
      refactoredCode,
      explanation,
      appliedRuleId: violation.ruleId,
      success
    };
  }
}
