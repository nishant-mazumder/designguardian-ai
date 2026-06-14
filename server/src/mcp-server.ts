import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from 'dotenv';
import { AIService } from './services/ai.service';
import { LocalKnowledgeProvider } from './services/providers/local.knowledge';
import { FoundryKnowledgeProvider } from './services/providers/foundry.knowledge';
import { AuditService } from './services/audit.service';
import { DnaService } from './services/dna.service';
import { DriftService } from './services/drift.service';
import { RefactorService } from './services/refactor.service';

dotenv.config();

// Initialize Services
const aiService = new AIService();
const localKnowledge = new LocalKnowledgeProvider();

const endpoint = process.env.FOUNDRY_ENDPOINT || '';
const projectId = process.env.FOUNDRY_PROJECT_ID || '';
const agentId = process.env.FOUNDRY_AGENT_ID || '';
const apiKey = process.env.FOUNDRY_API_KEY || '';

let knowledgeProvider;
if (endpoint && apiKey) {
  console.error('Foundry Configuration Valid. Initializing FoundryKnowledgeProvider for MCP.');
  knowledgeProvider = new FoundryKnowledgeProvider(endpoint, projectId, agentId, apiKey, localKnowledge);
} else {
  console.error('Foundry Credentials Missing. Booting MCP in Demo Foundry Mode.');
  knowledgeProvider = localKnowledge;
}

const auditService = new AuditService(aiService, knowledgeProvider);
const dnaService = new DnaService(aiService);
const driftService = new DriftService(knowledgeProvider);
const refactorService = new RefactorService(aiService, knowledgeProvider);

// Helper for mapping violations
function mapViolation(v: any): any {
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

// 1. Create the MCP Server
const server = new McpServer({
  name: "designguardian-ai",
  version: "1.0.0",
});

// Cast the server to any to bypass complex recursive type inferences in the SDK for Zod shape checking.
const mcp = server as any;

// 2. Tool: audit_component
mcp.registerTool(
  "audit_component",
  {
    description: "Audit a JSX/TSX/HTML code component against design system rules for spacing, typography, colors, borders, shadows, and accessibility.",
    inputSchema: z.object({
      code: z.string().describe("The raw code content of the component to audit."),
      fileName: z.string().optional().describe("The name or path of the component file (e.g. Button.tsx).")
    })
  },
  async ({ code, fileName }: any) => {
    try {
      const file = fileName || 'component.tsx';
      const auditResult = await auditService.auditCode(code, file);
      const dnaReport = await dnaService.extractDna(code, file);
      const driftReport = await driftService.calculateDrift(dnaReport, file);

      const clientViolations = auditResult.violations.map(mapViolation);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            score: auditResult.score,
            driftScore: driftReport.driftScore,
            violations: clientViolations
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error auditing component: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 3. Tool: get_design_dna
mcp.registerTool(
  "get_design_dna",
  {
    description: "Extract a component's visual style characteristics, classification style, minimalism and complexity ratings, and visual strategy narrative.",
    inputSchema: z.object({
      code: z.string().describe("The code content of the component."),
      fileName: z.string().optional().describe("The name or path of the component file.")
    })
  },
  async ({ code, fileName }: any) => {
    try {
      const file = fileName || 'component.tsx';
      const dnaReport = await dnaService.extractDna(code, file);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            style: dnaReport.style || 'Minimalist SaaS',
            confidence: dnaReport.confidence || 85,
            characteristics: dnaReport.characteristics || [],
            narrative: dnaReport.narrative || '',
            palette: dnaReport.palette || [],
            spacing: dnaReport.spacing || [],
            borders: dnaReport.borders || [],
            shadows: dnaReport.shadows || []
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error retrieving Design DNA: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 4. Tool: refactor_violations
mcp.registerTool(
  "refactor_violations",
  {
    description: "Automatically refactor a component's code block to resolve all style sheet guide drift, border radius errors, unapproved colors, and accessibility warnings.",
    inputSchema: z.object({
      code: z.string().describe("The component code content to rewrite/refactor."),
      fileName: z.string().optional().describe("The name or path of the component file.")
    })
  },
  async ({ code, fileName }: any) => {
    try {
      const file = fileName || 'component.tsx';
      const auditResult = await auditService.auditCode(code, file);
      const refactorResult = await refactorService.refactorAll(code, file, auditResult.violations);

      const appliedFixes = auditResult.violations.map(v =>
        `${v.ruleId} (${v.category}): Changed '${v.matchedText}' to '${v.suggestedFix || 'Standard Value'}'`
      );

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            refactoredCode: refactorResult.refactoredCode,
            appliedFixes: appliedFixes.length > 0 ? appliedFixes : ['Code refactored to align with design tokens']
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error refactoring violations: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 5. Tool: get_design_rules
mcp.registerTool(
  "get_design_rules",
  {
    description: "Retrieve the list of registered design guidelines (Spacing, Typography, Accessibility, Borders, Shadows, Colors) from the active knowledge base.",
    inputSchema: z.object({
      category: z.string().optional().describe("Optional category to filter by: spacing, typography, color, accessibility, branding, dna.")
    })
  },
  async ({ category }: any) => {
    try {
      const rules = await knowledgeProvider.getRelevantRules(category);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(rules, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error fetching design rules: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 6. Tool: design_coach_critique
mcp.registerTool(
  "design_coach_critique",
  {
    description: "Get detailed design coach review feedback of a component code from a senior product designer perspective (analyzing typography, margins, hierarchy, accessibility, and visual harmony).",
    inputSchema: z.object({
      code: z.string().describe("The component code content to review."),
      fileName: z.string().optional().describe("The name or path of the component file.")
    })
  },
  async ({ code, fileName }: any) => {
    try {
      const file = fileName || 'component.tsx';
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
${code}
\`\`\`

File Path: ${file}

Please analyze the layout and explain:
1. If the UI feels generic or looks like an AI-generated template (such as having too many rounded corners, oversized shadows, unnecessary gradients, bad margins).
2. How the visual hierarchy, typography pairings, spacing rhythm, and accessibility can be improved to feel world-class.
3. Offer concrete actionable redesign recommendations.

Format your response in beautiful, clean Markdown with headings, bullet points, and brief code block suggestions if necessary.`;

      const feedback = await aiService.generateContent(prompt, {
        jsonMode: false,
        systemInstruction
      });

      return {
        content: [{
          type: "text",
          text: feedback
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error fetching design critique: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Start the stdio transport connector
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DesignGuardian AI MCP Server running on stdio transport.");
}

main().catch((error) => {
  console.error("Fatal error in MCP Server:", error);
  process.exit(1);
});
