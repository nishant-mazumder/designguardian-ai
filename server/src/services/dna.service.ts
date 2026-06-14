import { DesignDNAReport, DNAPaletteItem, DNASpacingItem, DNATypographyItem, DNABordersItem, DNAShadowsItem, DNAComponentItem } from 'shared';
import { AIService } from './ai.service';

export class DnaService {
  constructor(private aiService: AIService) {}

  /**
   * Analyze code files and extract design tokens and components to construct a Design DNA Report.
   */
  async extractDna(codeContent: string, filePath: string, provider?: 'gemini' | 'openai' | 'mock' | 'auto'): Promise<DesignDNAReport> {
    const prompt = this.buildDnaPrompt(codeContent, filePath);

    try {
      const systemInstruction = 'You are DesignGuardian AI. You are a senior product designer from Stripe, Linear, Notion, Vercel and Apple. Analyze the visual style, characteristics, tokens, and components of the code and return a structured JSON Design DNA profile.';
      
      const responseText = await this.aiService.generateContent(prompt, {
        provider,
        jsonMode: true,
        systemInstruction
      });

      const cleanedJson = this.cleanJsonText(responseText);
      const parsed = JSON.parse(cleanedJson) as Partial<DesignDNAReport>;

      return {
        palette: (parsed.palette || []) as DNAPaletteItem[],
        typography: (parsed.typography || []) as DNATypographyItem[],
        spacing: (parsed.spacing || []) as DNASpacingItem[],
        borders: (parsed.borders || []) as DNABordersItem[],
        shadows: (parsed.shadows || []) as DNAShadowsItem[],
        components: (parsed.components || []) as DNAComponentItem[],
        style: parsed.style || 'Minimalist SaaS',
        characteristics: parsed.characteristics || ['Muted', 'Modern'],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 85,
        narrative: parsed.narrative || 'A clean minimalist component leveraging standard layout hierarchies.'
      };

    } catch (error) {
      console.error('DnaService: AI DNA extraction failed. Running static extraction fallback.', error);
      const localReport = this.runLocalStaticDnaExtraction(codeContent);
      return {
        ...localReport,
        style: 'Minimalist SaaS (Fallback)',
        characteristics: ['Muted', 'Standard Layout'],
        confidence: 70,
        narrative: 'Successfully extracted base tokens. AI design style analysis was skipped.'
      };
    }
  }

  private buildDnaPrompt(codeContent: string, filePath: string): string {
    return `
You are DesignGuardian AI.
Analyze the following source code and extract all instances of UI design styling, classes, tokens, and components. Also classify the design system DNA style and visual characteristics.

File Path: ${filePath}
Source Code:
\`\`\`
${codeContent}
\`\`\`

Analyze the code and compile:
1. Colors: Hex codes, RGB/RGBA, or named CSS variables. Count occurrences.
2. Typography: Fonts (fontFamily), sizes (size), and weights (weight) used. Count occurrences.
3. Spacing: Margin, padding, and gap sizes used. Count occurrences.
4. Borders: Border radii used. Count occurrences.
5. Shadows: Shadow values. Count occurrences.
6. Components: Detected UI Component tags (e.g. Button, Card, Input). Count occurrences.
7. Style Classification: A 1-2 word description of the design style (e.g. "Developer Tool", "Consumer SaaS", "Tactile Admin").
8. Characteristics: A list of 3-5 visual traits (e.g. ["Minimal", "Technical", "Monochromatic", "Dense Information"]).
9. Confidence: Your confidence score (0-100) in this analysis.
10. Narrative: A short, 2-3 sentence explanation of the design DNA choices and whether they feel premium or generic/AI-generated.

Your output must be a single JSON object with the following structure:
{
  "palette": [
    { "color": "#3b82f6", "count": 5 }
  ],
  "typography": [
    { "fontFamily": "Inter", "size": "16px", "weight": "600", "count": 2 }
  ],
  "spacing": [
    { "value": "16px", "count": 4 }
  ],
  "borders": [
    { "radius": "4px", "count": 3 }
  ],
  "shadows": [
    { "value": "0 1px 3px rgba(0,0,0,0.1)", "count": 1 }
  ],
  "components": [
    { "name": "Button", "count": 2 }
  ],
  "style": "Developer Tool",
  "characteristics": ["Minimal", "Technical", "Monochromatic", "Dense Information"],
  "confidence": 89,
  "narrative": "Premium minimalist setup leveraging high information density and structural boundaries..."
}

Return ONLY this JSON object. Do not include markdown code block formatting (like \`\`\`json) in the response text, just return the raw JSON string.
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
   * Static regex parser to extract basic DNA from code when AI is not working.
   */
  private runLocalStaticDnaExtraction(codeContent: string): DesignDNAReport {
    const paletteMap: Record<string, number> = {};
    const spacingMap: Record<string, number> = {};
    const typographyMap: Record<string, string> = {}; // key: string representation, value: fontFamily, size, weight
    const borderMap: Record<string, number> = {};
    const shadowMap: Record<string, number> = {};
    const componentMap: Record<string, number> = {};

    const lines = codeContent.split('\n');

    // Regex definitions
    const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
    const pxRegex = /\b(\d+)px\b/g;
    const varRegex = /var\(--[a-zA-Z0-9-]+\)/g;
    
    // Simple component regex (e.g. <Button, <Card)
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)\b/g;

    lines.forEach(line => {
      // Colors
      let hexMatch;
      while ((hexMatch = hexRegex.exec(line)) !== null) {
        const hex = hexMatch[0].toLowerCase();
        paletteMap[hex] = (paletteMap[hex] || 0) + 1;
      }
      let varMatch;
      while ((varMatch = varRegex.exec(line)) !== null) {
        const variable = varMatch[0];
        paletteMap[variable] = (paletteMap[variable] || 0) + 1;
      }

      // Spacings
      if (line.includes('padding') || line.includes('margin') || line.includes('gap')) {
        let pxMatch;
        while ((pxMatch = pxRegex.exec(line)) !== null) {
          const px = pxMatch[0];
          spacingMap[px] = (spacingMap[px] || 0) + 1;
        }
      }

      // Borders
      if (line.includes('borderRadius') || line.includes('border-radius') || line.includes('rounded')) {
        let borderMatch;
        while ((borderMatch = pxRegex.exec(line)) !== null) {
          const radius = borderMatch[0];
          borderMap[radius] = (borderMap[radius] || 0) + 1;
        }
      }

      // Shadows
      if (line.includes('boxShadow') || line.includes('box-shadow') || line.includes('shadow')) {
        // Look for values inside string literals or css rules
        const shadowLiteral = /(?:box-shadow|shadow)\s*:\s*['"]?([^'";]+)['"]?/i.exec(line);
        if (shadowLiteral && shadowLiteral[1]) {
          const val = shadowLiteral[1].trim();
          shadowMap[val] = (shadowMap[val] || 0) + 1;
        }
      }

      // Components
      let compMatch;
      while ((compMatch = componentRegex.exec(line)) !== null) {
        const comp = compMatch[1];
        if (comp !== 'Fragment' && comp !== 'React') {
          componentMap[comp] = (componentMap[comp] || 0) + 1;
        }
      }
    });

    // Formatting outputs into DNA arrays
    const palette: DNAPaletteItem[] = Object.keys(paletteMap).map(color => ({
      color,
      count: paletteMap[color]
    }));

    const spacing: DNASpacingItem[] = Object.keys(spacingMap).map(value => ({
      value,
      count: spacingMap[value]
    }));

    const borders: DNABordersItem[] = Object.keys(borderMap).map(radius => ({
      radius,
      count: borderMap[radius]
    }));

    const shadows: DNAShadowsItem[] = Object.keys(shadowMap).map(value => ({
      value,
      count: shadowMap[value]
    }));

    const components: DNAComponentItem[] = Object.keys(componentMap).map(name => ({
      name,
      count: componentMap[name]
    }));

    // Guess simple typography patterns if we see font-size, line-height, etc.
    const typography: DNATypographyItem[] = [];
    const sizeMatch = /font-size\s*:\s*['"]?(\d+px|[^'";]+)['"]?/i.exec(codeContent);
    const familyMatch = /font-family\s*:\s*['"]?([^'";]+)['"]?/i.exec(codeContent);
    const weightMatch = /font-weight\s*:\s*['"]?(\d+|[^'";]+)['"]?/i.exec(codeContent);

    if (sizeMatch || familyMatch) {
      typography.push({
        fontFamily: familyMatch ? familyMatch[1].split(',')[0].replace(/['"]/g, '').trim() : 'Inter',
        size: sizeMatch ? sizeMatch[1].trim() : '14px',
        weight: weightMatch ? weightMatch[1].trim() : '400',
        count: 1
      });
    }

    return {
      palette,
      typography,
      spacing,
      borders,
      shadows,
      components
    };
  }
}
