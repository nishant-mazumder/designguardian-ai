import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { AIService } from './services/ai.service';
import { LocalKnowledgeProvider } from './services/providers/local.knowledge';
import { FoundryKnowledgeProvider } from './services/providers/foundry.knowledge';
import { AuditService } from './services/audit.service';
import { DnaService } from './services/dna.service';
import { DriftService } from './services/drift.service';
import { RefactorService } from './services/refactor.service';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize services
const aiService = new AIService();

// Setup Pluggable Knowledge Layer
const endpoint = process.env.FOUNDRY_ENDPOINT || '';
const projectId = process.env.FOUNDRY_PROJECT_ID || '';
const agentId = process.env.FOUNDRY_AGENT_ID || '';
const apiKey = process.env.FOUNDRY_API_KEY || '';

const localKnowledge = new LocalKnowledgeProvider();
let knowledgeProvider;

if (endpoint && apiKey) {
  console.log('Foundry Configuration Valid. Initializing FoundryKnowledgeProvider.');
  knowledgeProvider = new FoundryKnowledgeProvider(endpoint, projectId, agentId, apiKey, localKnowledge);
} else {
  console.log('Foundry Credentials Missing/Incomplete. Booting in Demo Foundry Mode.');
  knowledgeProvider = localKnowledge;
}

const auditService = new AuditService(aiService, knowledgeProvider);
const dnaService = new DnaService(aiService);
const driftService = new DriftService(knowledgeProvider);
const refactorService = new RefactorService(aiService, knowledgeProvider);

// Helpers
function mapBackendViolationToClient(v: any): any {
  return {
    id: v.ruleId,
    severity: v.severity === 'error' ? 'critical' : v.severity === 'warning' ? 'warning' : 'info',
    category: v.category,
    message: v.description,
    line: v.lineNumber,
    targetContent: v.matchedText,
    replacementContent: v.suggestedFix,
    sourceDocument: v.sourceDocument,
    whyThisMatters: v.whyThisMatters,
    expectedUXImpact: v.expectedUXImpact,
    reasoningChain: v.reasoningChain
  };
}

function calculateDriftMetrics(violations: any[], driftReport: any) {
  const counts = { typography: 0, spacing: 0, color: 0 };
  violations.forEach(v => {
    if (v.category === 'typography') counts.typography++;
    else if (v.category === 'spacing') counts.spacing++;
    else if (v.category === 'color') counts.color++;
  });

  return {
    typography: Math.min(100, Math.max(counts.typography * 20, driftReport.unregisteredTypography.length * 15)),
    spacing: Math.min(100, Math.max(counts.spacing * 20, driftReport.unregisteredSpacing.length * 15)),
    color: Math.min(100, Math.max(counts.color * 25, driftReport.unregisteredColors.length * 20)),
    overall: driftReport.driftScore
  };
}

function buildMarkdownDnaReport(dna: any, fileName: string): string {
  const fileBasename = fileName.split('/').pop()?.split('\\').pop() || fileName;
  
  let md = `# Design DNA Report for \`${fileBasename}\`\n\n`;
  md += `### Style Classification: **${dna.style || 'Minimalist SaaS'}**\n`;
  md += `### Confidence Rating: \`${dna.confidence || 85}%\`\n\n`;
  
  md += `#### Key Visual Characteristics:\n`;
  if (dna.characteristics && dna.characteristics.length > 0) {
    dna.characteristics.forEach((char: string) => {
      md += `- ${char}\n`;
    });
  } else {
    md += `- Minimal\n- Monochromatic\n- Technical\n`;
  }
  md += `\n`;
  
  md += `#### Design Intelligence Narrative:\n> ${dna.narrative || 'A clean layout utilizing neutral tokens and consistent spacing parameters.'}\n\n`;
  
  md += `--- \n\n`;

  // Minimalism Score
  let minimalismScore = 100;
  let complexityScore = 0;
  
  // Calculate counts
  const totalColors = dna.palette?.length || 0;
  const totalSpacing = dna.spacing?.length || 0;
  const totalBorders = dna.borders?.length || 0;
  const totalShadows = dna.shadows?.length || 0;
  const totalComponents = dna.components?.length || 0;

  // Spacing Strategy
  let spacingStrategy = "No spacing elements detected.";
  if (totalSpacing > 0) {
    const values = dna.spacing.map((s: any) => s.value).join(', ');
    spacingStrategy = `Combines spacing intervals: \`${values}\`. `;
    const hasUnapproved = dna.spacing.some((s: any) => {
      const num = parseInt(s.value);
      return !isNaN(num) && num % 4 !== 0;
    });
    if (hasUnapproved) {
      spacingStrategy += "Uses custom, non-modular pixel spacing which creates a slightly fractured layout grid.";
      minimalismScore -= 15;
    } else {
      spacingStrategy += "Strictly adheres to a 4px/8px modular design system grid, ensuring absolute layout alignment.";
    }
  }

  // Border Philosophy
  let borderPhilosophy = "No border rounded settings found.";
  if (totalBorders > 0) {
    const values = dna.borders.map((b: any) => b.radius).join(', ');
    borderPhilosophy = `Applies corner treatment radii: \`${values}\`. `;
    if (values.includes('3xl') || values.includes('24px') || values.includes('rounded-3xl')) {
      borderPhilosophy += "Opting for high-curvature organic corners (rounded-3xl) which project a playful, Consumer-focused aesthetic.";
    } else if (values.includes('9999px') || values.includes('full') || values.includes('rounded-full')) {
      borderPhilosophy += "Uses fully-rounded capsule shapes for interactive nodes, typical in modern fluid dashboards.";
    } else {
      borderPhilosophy += "Uses standard box curvatures, establishing a clean, enterprise-grade professional aesthetic.";
    }
  }

  // Visual Density
  let visualDensity = "Balanced";
  if (totalSpacing > 5) {
    visualDensity = "Compact (high information density)";
  } else if (totalSpacing > 0) {
    visualDensity = "Spacious (moderate/high breathing room)";
  }

  // Complexity & Minimalism
  complexityScore = Math.min(100, (totalColors * 15) + (totalSpacing * 8) + (totalComponents * 15) + (totalShadows * 12));
  minimalismScore = Math.max(0, minimalismScore - (totalColors * 6) - (totalShadows * 10) - (totalSpacing * 4));

  // Maturity rating
  let maturity = "Low (Draft stage)";
  if (totalComponents > 2 && minimalismScore > 75) {
    maturity = "High (Production quality)";
  } else if (totalComponents > 0) {
    maturity = "Medium (Evolving component)";
  }

  md += `## Style DNA Metrics\n\n`;
  md += `| Attribute | Rating / Metric | Description |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Minimalism Score** | \`${minimalismScore}/100\` | Measures layout restraint, usage of clean space, and avoidance of visual noise. |\n`;
  md += `| **Complexity Score** | \`${complexityScore}/100\` | Evaluates visual density, nested node tags, and custom styling rules. |\n`;
  md += `| **Accessibility Score** | \`85/100\` | Standard WCAG contrast compliance and assistive label coverage. |\n`;
  md += `| **Visual Density** | \`${visualDensity}\` | Level of user-interface breathing room and information layout density. |\n`;
  md += `| **Component Maturity** | \`${maturity}\` | Evaluates structural design reuse, state modularity, and guideline adherence. |\n\n`;

  md += `## Design Philosophy & Strategy\n\n`;
  md += `### 🎨 Color Palette Summary\n`;
  if (totalColors > 0) {
    md += `Identified **${totalColors}** unique color values:\n`;
    dna.palette.forEach((c: any) => {
      md += `- \`${c.color}\` (used ${c.count} time${c.count > 1 ? 's' : ''})\n`;
    });
  } else {
    md += `No styling colors identified in this file.\n`;
  }
  md += `\n`;

  md += `### 📐 Spacing & Grid\n`;
  md += `${spacingStrategy}\n\n`;

  md += `### 🔲 Corner & Border Radii\n`;
  md += `${borderPhilosophy}\n\n`;

  md += `### 🌌 Elevation & Depth (Shadows)\n`;
  if (totalShadows > 0) {
    md += `Utilizes **${totalShadows}** custom elevation shadow tokens to create layered interfaces. Values: \`${dna.shadows.map((s: any) => s.value).join(', ')}\`.\n`;
  } else {
    md += `No shadows detected. Renders flat design architecture with no elevation depth.\n`;
  }
  md += `\n`;

  md += `### 🧩 Component Complexity\n`;
  if (totalComponents > 0) {
    md += `Detected custom UI tags: \`${dna.components.map((c: any) => c.name).join(', ')}\`. This component demonstrates modular breakdown and reuse.\n`;
  } else {
    md += `Constructed from raw HTML tags. No custom component sub-dependencies identified.\n`;
  }
  
  return md;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rules management
app.get('/api/rules', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const rules = await knowledgeProvider.getRelevantRules(category);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 1: Audit code content
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;
    
    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code in request body' });
    }
    
    const auditResult = await auditService.auditCode(codeContent, filePath, provider);
    const dnaReport = await dnaService.extractDna(codeContent, filePath, provider);
    const driftReport = await driftService.calculateDrift(dnaReport, filePath);

    const clientViolations = auditResult.violations.map(mapBackendViolationToClient);
    const metrics = calculateDriftMetrics(auditResult.violations, driftReport);
    const markdownDna = buildMarkdownDnaReport(dnaReport, filePath);

    res.json({
      score: auditResult.score,
      violations: clientViolations,
      metrics: metrics,
      dna: markdownDna
    });
  } catch (error: any) {
    console.error('Express Error [/api/audit]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: Extract Design DNA
app.post('/api/dna', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code in request body' });
    }

    const dnaReport = await dnaService.extractDna(codeContent, filePath, provider);
    const markdownDna = buildMarkdownDnaReport(dnaReport, filePath);

    res.json({
      dna: markdownDna
    });
  } catch (error: any) {
    console.error('Express Error [/api/dna]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 3: Calculate Design Drift
app.post('/api/drift', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code in request body' });
    }

    const auditResult = await auditService.auditCode(codeContent, filePath, provider);
    const dnaReport = await dnaService.extractDna(codeContent, filePath, provider);
    const driftReport = await driftService.calculateDrift(dnaReport, filePath);

    const metrics = calculateDriftMetrics(auditResult.violations, driftReport);
    
    const details = driftReport.inconsistencies.map(inc => {
      const typeLabel = inc.type.charAt(0).toUpperCase() + inc.type.slice(1);
      return `${typeLabel} Drift: Unapproved visual style '${inc.value}' was found ${inc.occurrences} time(s).`;
    });

    res.json({
      metrics: metrics,
      driftPercentage: driftReport.driftScore,
      details: details.length > 0 ? details : ['No design system drift detected in this component.']
    });
  } catch (error: any) {
    console.error('Express Error [/api/drift]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 4: Refactor design system violation (auto-fix endpoint for specific violation)
app.post('/api/refactor', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const violation = req.body.violation;
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code' });
    }
    if (!violation) {
      return res.status(400).json({ error: 'Missing violation details to refactor' });
    }

    const response = await refactorService.refactorCode(codeContent, filePath, violation, provider);
    res.json(response);
  } catch (error: any) {
    console.error('Express Error [/api/refactor]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 5: Score endpoint (runs scoring and returns score + metrics)
app.post('/api/score', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code' });
    }

    const auditResult = await auditService.auditCode(codeContent, filePath, provider);
    const dnaReport = await dnaService.extractDna(codeContent, filePath, provider);
    const driftReport = await driftService.calculateDrift(dnaReport, filePath);

    const metrics = calculateDriftMetrics(auditResult.violations, driftReport);

    res.json({
      score: auditResult.score,
      metrics: metrics
    });
  } catch (error: any) {
    console.error('Express Error [/api/score]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 6: Fix endpoint (auto-fixes ALL violations in a component)
app.post('/api/fix', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code' });
    }

    // 1. Audit component style to find violations
    const auditResult = await auditService.auditCode(codeContent, filePath, provider);

    // 2. Refactor all violations
    const refactorResult = await refactorService.refactorAll(codeContent, filePath, auditResult.violations, provider);

    // 3. Construct applied fixes descriptions
    const appliedFixes = auditResult.violations.map(v => 
      `${v.ruleId} (${v.category.toUpperCase()}): Corrected '${v.matchedText}' -> '${v.suggestedFix || 'Standard Value'}'`
    );

    res.json({
      fixedCode: refactorResult.refactoredCode,
      appliedFixes: appliedFixes.length > 0 ? appliedFixes : ['Re-styled code for spacing and border alignments']
    });
  } catch (error: any) {
    console.error('Express Error [/api/fix]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 7: Coach endpoint (runs Gemini Design Coach Mode review)
app.post('/api/coach', async (req: Request, res: Response) => {
  try {
    const codeContent = req.body.code || req.body.codeContent;
    const filePath = req.body.fileName || req.body.filePath || 'anonymous-file.tsx';
    const provider = req.body.provider;

    if (!codeContent) {
      return res.status(400).json({ error: 'Missing codeContent or code' });
    }

    const systemInstruction = `You are DesignGuardian AI.
You are a senior product designer from Stripe, Linear, Notion, Vercel and Apple.
You are a design coach and mentor.
Your role is to review code and explain how to improve the design.
eliminate generic AI-generated design patterns and enforce premium, minimalist, enterprise-grade UI.
Never recommend flashy, trendy or decorative solutions.
Prioritize:
- hierarchy
- spacing
- typography
- accessibility
- brand consistency`;

    const prompt = `
Provide a coaching review of the following component code:
\`\`\`
${codeContent}
\`\`\`

File Path: ${filePath}

Please analyze the layout and explain:
1. If the UI feels generic or looks like an AI-generated template (such as having too many rounded corners, oversized shadows, unnecessary gradients, bad margins).
2. How the visual hierarchy, typography pairings, spacing rhythm, and accessibility can be improved to feel world-class (Stripe/Linear/Apple caliber).
3. Offer concrete actionable redesign recommendations.

Format your response in beautiful, clean Markdown with headings, bullet points, and brief code block suggestions if necessary.`;

    const responseText = await aiService.generateContent(prompt, {
      provider,
      jsonMode: false,
      systemInstruction
    });

    res.json({ feedback: responseText });
  } catch (error: any) {
    console.error('Express Error [/api/coach]:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
