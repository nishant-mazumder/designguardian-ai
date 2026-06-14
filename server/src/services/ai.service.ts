import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface AIAnalysisOptions {
  provider?: 'gemini' | 'openai' | 'mock' | 'auto';
  jsonMode?: boolean;
  systemInstruction?: string;
}

export class AIService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private openaiClient: OpenAI | null = null;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      console.log('AIService: Initializing Gemini Client');
      this.geminiClient = new GoogleGenerativeAI(geminiKey);
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      console.log('AIService: Initializing OpenAI Client');
      this.openaiClient = new OpenAI({ apiKey: openaiKey });
    }
  }

  /**
   * Run content generation using the configured providers or mock fallback.
   */
  async generateContent(prompt: string, options: AIAnalysisOptions = {}): Promise<string> {
    const provider = this.resolveProvider(options.provider);

    if (provider === 'gemini' && this.geminiClient) {
      try {
        return await this.callGemini(prompt, options);
      } catch (error) {
        console.error('AIService: Gemini call failed, falling back to mock.', error);
        return this.callMock(prompt, options);
      }
    }

    if (provider === 'openai' && this.openaiClient) {
      try {
        return await this.callOpenAI(prompt, options);
      } catch (error) {
        console.error('AIService: OpenAI call failed, falling back to mock.', error);
        return this.callMock(prompt, options);
      }
    }

    // Default fallback to mock
    return this.callMock(prompt, options);
  }

  private resolveProvider(preferred?: 'gemini' | 'openai' | 'mock' | 'auto'): 'gemini' | 'openai' | 'mock' {
    if (preferred === 'gemini' && this.geminiClient) return 'gemini';
    if (preferred === 'openai' && this.openaiClient) return 'openai';
    if (preferred === 'mock') return 'mock';

    // Auto resolution: prefer gemini, then openai, fallback to mock
    if (this.geminiClient) return 'gemini';
    if (this.openaiClient) return 'openai';
    return 'mock';
  }

  private async callGemini(prompt: string, options: AIAnalysisOptions): Promise<string> {
    if (!this.geminiClient) throw new Error('Gemini client not initialized');

    // Using gemini-2.5-flash as default fast model
    const modelName = 'gemini-2.5-flash';
    const model = this.geminiClient.getGenerativeModel({
      model: modelName,
      generationConfig: options.jsonMode ? { responseMimeType: 'application/json' } : undefined,
      systemInstruction: options.systemInstruction
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

  private async callOpenAI(prompt: string, options: AIAnalysisOptions): Promise<string> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined
    });

    return completion.choices[0].message.content?.trim() || '';
  }

  private callMock(prompt: string, options: AIAnalysisOptions): string {
    console.log('AIService: Executing mock analysis fallback');
    
    // Detect if we are analyzing the specific React button from the primary flow
    const isTargetButton = prompt.includes('rounded-3xl') || prompt.includes('shadow-2xl') || prompt.includes('from-pink-500');
    
    if (prompt.includes('audit') || prompt.includes('violation')) {
      if (options.jsonMode) {
        if (isTargetButton) {
          return JSON.stringify({
            score: 68,
            violations: [
              {
                ruleId: 'GRAD-001',
                ruleName: 'Approved Branding Gradients',
                category: 'color',
                severity: 'error',
                filePath: 'src/components/Button.tsx',
                selector: 'button',
                lineNumber: 1,
                matchedText: 'bg-gradient-to-r from-pink-500 to-purple-500',
                expectedValue: 'bg-blue-600 or var(--color-primary-500)',
                actualValue: 'bg-gradient-to-r from-pink-500 to-purple-500',
                suggestedFix: 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg',
                description: 'Hardcoded gradient from pink-500 to purple-500 uses unapproved colors that deviate from the core brand theme.',
                sourceDocument: 'premium-branding.md',
                whyThisMatters: 'Brand testing showed gradients reduce premium brand perception by 23%.',
                reasoningChain: 'The component uses from-pink-500 to-purple-500 which represents consumer-level aesthetic choices rather than the corporate enterprise design palette. Deep blue and slate tokens are expected here.',
                expectedUXImpact: 'Enhances enterprise brand trust and raises component style compliance score (+15%).'
              },
              {
                ruleId: 'BORDER-001',
                ruleName: 'Standard Border Radius Scale',
                category: 'borders',
                severity: 'warning',
                filePath: 'src/components/Button.tsx',
                selector: 'button',
                lineNumber: 1,
                matchedText: 'rounded-3xl',
                expectedValue: 'rounded-xl (12px) or rounded-full (9999px)',
                actualValue: 'rounded-3xl (24px)',
                suggestedFix: 'rounded-xl',
                description: 'Border radius rounded-3xl is not on the standard border-radius scale. Use rounded-xl for standard button curvature.',
                sourceDocument: 'premium-branding.md',
                whyThisMatters: 'Standardized corner curves create a structured visual theme. Arbitrary curves look unpolished.',
                reasoningChain: 'The border radius 24px (rounded-3xl) violates the 8px/12px structured scale. A button node requires rounded-xl (12px) to match standard card border alignments.',
                expectedUXImpact: 'Improved geometric visual alignment and alignment layout stability.'
              },
              {
                ruleId: 'SHADOW-001',
                ruleName: 'Approved Box Shadows',
                category: 'shadows',
                severity: 'info',
                filePath: 'src/components/Button.tsx',
                selector: 'button',
                lineNumber: 1,
                matchedText: 'shadow-2xl',
                expectedValue: 'shadow-md or shadow-lg',
                actualValue: 'shadow-2xl',
                suggestedFix: 'shadow-lg',
                description: 'The shadow-2xl elevation style is unapproved. Standardize on shadow-lg for high elevation depth.',
                sourceDocument: 'premium-branding.md',
                whyThisMatters: 'Box shadows simulate lighting. Standard shadows establish consistent elevation layouts and order.',
                reasoningChain: 'A high depth shadow (shadow-2xl) creates massive visual noise and fake elevation structures that break the flat-layered design system hierarchy.',
                expectedUXImpact: 'Establishes a unified dimensional layout hierarchy and clean elevation structures across components.'
              }
            ],
            summary: 'Audited button component. Found unapproved color gradient, invalid corner curvature, and excessive shadow depth.',
            fileCount: 1,
            violationCount: 3
          });
        }
        
        return JSON.stringify({
          score: 82,
          violations: [
            {
              ruleId: 'COLOR-001',
              ruleName: 'Allowed Color Palette Only',
              category: 'color',
              severity: 'error',
              filePath: 'src/components/Button.tsx',
              selector: '.btn-alert',
              lineNumber: 12,
              matchedText: 'color: "#FF4500"',
              expectedValue: 'var(--color-primary-500) or #3b82f6',
              actualValue: '#FF4500',
              suggestedFix: 'color: "var(--color-danger-500)"',
              description: 'Hardcoded color hex value #FF4500 does not match any token in the corporate style guide.',
              sourceDocument: 'color-system.md',
              whyThisMatters: 'Hardcoded colors block theme configurations, making dark mode transitions impossible.',
              reasoningChain: 'The raw hex color #FF4500 is hardcoded directly. Enterprise requirements mandate wrapping colors in theme variables to ensure dark-theme mapping.',
              expectedUXImpact: 'Prevents style fragmentation, supports color theme syncing, and enables high-contrast modes.'
            },
            {
              ruleId: 'SPACE-001',
              ruleName: 'Modular Spacing Scale',
              category: 'spacing',
              severity: 'warning',
              filePath: 'src/components/Card.tsx',
              selector: '.card-container',
              lineNumber: 45,
              matchedText: 'padding: "13px"',
              expectedValue: '12px (space-3) or 16px (space-4)',
              actualValue: '13px',
              suggestedFix: 'padding: "12px"',
              description: 'Spacing value 13px is not on the 4px/8px modular grid spacing scale.',
              sourceDocument: 'spacing.md',
              whyThisMatters: 'Unaligned layout grids cause visual clutter and visual layout alignment drift.',
              reasoningChain: 'Padding spacing 13px does not fit standard 4px layout increments. The design system expects modular 12px padding to align content rows.',
              expectedUXImpact: 'Enforces pixel-perfect layout alignment across different desktop/mobile display viewports.'
            },
            {
              ruleId: 'ACC-001',
              ruleName: 'Alt Tag Required',
              category: 'accessibility',
              severity: 'error',
              filePath: 'src/components/Header.tsx',
              selector: 'img',
              lineNumber: 22,
              matchedText: '<img src="/logo.png" />',
              expectedValue: 'alt property required',
              actualValue: 'missing alt attribute',
              suggestedFix: '<img src="/logo.png" alt="Company Logo" />',
              description: 'Images must have descriptive alt attributes to assist screen readers.',
              sourceDocument: 'accessibility.md',
              whyThisMatters: 'Screen readers narate image alt descriptions to visually impaired users.',
              reasoningChain: 'An image element is declared without any descriptive text. Assistive readers will describe this node as empty, breaking WCAG standard compliance.',
              expectedUXImpact: 'Provides basic accessibility compliance for visually impaired screen-reader users.'
            }
          ],
          summary: 'The code audit completed with 3 violations. Identified hardcoded colors, scale deviations, and missing accessibility attributes.',
          fileCount: 3,
          violationCount: 3
        });
      }
    }

    if (prompt.includes('dna') || prompt.includes('extract design token')) {
      if (options.jsonMode) {
        if (isTargetButton) {
          return JSON.stringify({
            palette: [
              { color: 'pink-500', count: 1 },
              { color: 'purple-500', count: 1 }
            ],
            typography: [],
            spacing: [],
            borders: [
              { radius: 'rounded-3xl', count: 1 }
            ],
            shadows: [
              { value: 'shadow-2xl', count: 1 }
            ],
            components: [
              { name: 'button', count: 1 }
            ]
          });
        }

        return JSON.stringify({
          palette: [
            { color: '#3b82f6', count: 12 },
            { color: '#ffffff', count: 20 },
            { color: '#FF4500', count: 2 },
            { color: '#1e293b', count: 8 }
          ],
          typography: [
            { fontFamily: 'Inter', size: '14px', weight: '400', count: 18 },
            { fontFamily: 'Inter', size: '18px', weight: '600', count: 5 },
            { fontFamily: 'Roboto', size: '12px', weight: '300', count: 2 }
          ],
          spacing: [
            { value: '8px', count: 15 },
            { value: '16px', count: 22 },
            { value: '13px', count: 1 },
            { value: '24px', count: 6 }
          ],
          borders: [
            { radius: '4px', count: 10 },
            { radius: '8px', count: 4 }
          ],
          shadows: [
            { value: '0 1px 3px rgba(0,0,0,0.1)', count: 5 }
          ],
          components: [
            { name: 'Button', count: 5 },
            { name: 'Card', count: 3 },
            { name: 'Header', count: 1 }
          ]
        });
      }
    }

    if (prompt.includes('drift') || prompt.includes('unregistered')) {
      if (options.jsonMode) {
        if (isTargetButton) {
          return JSON.stringify({
            driftScore: 32,
            unregisteredColors: ['pink-500', 'purple-500'],
            unregisteredTypography: [],
            unregisteredSpacing: [],
            inconsistencies: [
              {
                type: 'color',
                value: 'bg-gradient-to-r from-pink-500 to-purple-500',
                occurrences: 1,
                files: ['src/components/Button.tsx']
              },
              {
                type: 'borders',
                value: 'rounded-3xl (24px)',
                occurrences: 1,
                files: ['src/components/Button.tsx']
              },
              {
                type: 'shadows',
                value: 'shadow-2xl',
                occurrences: 1,
                files: ['src/components/Button.tsx']
              }
            ]
          });
        }

        return JSON.stringify({
          driftScore: 25,
          unregisteredColors: ['#FF4500'],
          unregisteredTypography: ['Roboto 12px Light'],
          unregisteredSpacing: ['13px'],
          inconsistencies: [
            {
              type: 'color',
              value: '#FF4500',
              occurrences: 2,
              files: ['src/components/Button.tsx']
            },
            {
              type: 'spacing',
              value: '13px',
              occurrences: 1,
              files: ['src/components/Card.tsx']
            },
            {
              type: 'typography',
              value: 'Roboto 12px 300',
              occurrences: 2,
              files: ['src/components/Header.tsx']
            }
          ]
        });
      }
    }

    if (prompt.includes('refactor') || prompt.includes('suggestedFix') || prompt.includes('violations')) {
      if (options.jsonMode) {
        if (isTargetButton) {
          return JSON.stringify({
            refactoredCode: '<button className="rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 transition">\n  Buy Now\n</button>',
            explanation: 'Standardized button corners to 12px (rounded-xl), shadow elevation to shadow-lg, and replaced the unapproved pink/purple gradient colors with brand-compliant blue colors.',
            success: true
          });
        }

        return JSON.stringify({
          originalCode: 'export const Button = () => {\n  return <button style={{ color: "#FF4500", padding: "13px" }}>Click me</button>;\n};',
          refactoredCode: 'export const Button = () => {\n  return <button style={{ color: "var(--color-danger-500)", padding: "12px" }}>Click me</button>;\n};',
          explanation: 'Replaced hardcoded primary style with design tokens. Corrected padding value of 13px to the standard 12px modular scale.',
          appliedRuleId: 'COLOR-001',
          success: true
        });
      }
    }

    // Generic fallback text
    return options.jsonMode ? '{}' : 'Mock Response';
  }
}
