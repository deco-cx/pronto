/**
 * Export-related tools for generating prompts and documentation.
 * 
 * This file contains all tools related to export operations including:
 * - Exporting expanded ideas as textual prompts
 * - Generating markdown documentation
 * - Managing export history
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { exports, ideas } from "../schema.ts";

export const createExportPromptTool = (env: Env) =>
  createTool({
    id: "EXPORT_PROMPT",
    description: "Export expanded idea as a textual prompt",
    inputSchema: z.object({
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      prompt: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Get the idea
        const ideaResult = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.ideaId))
          .limit(1);
        
        if (ideaResult.length === 0 || !ideaResult[0].expandedData) {
          throw new Error("Idea not found or not expanded");
        }
        
        const idea = ideaResult[0];
        const expanded = idea.expandedData;
        
        // Generate comprehensive prompt
        let prompt = `# ${expanded.title}\n\n`;
        prompt += `## Original Idea\n${idea.originalPrompt}\n\n`;
        prompt += `## Description\n${expanded.description}\n\n`;
        
        // Features
        if (expanded.features && expanded.features.length > 0) {
          prompt += `## Features\n`;
          expanded.features.forEach((feature: any, index: number) => {
            prompt += `${index + 1}. **${feature.title}**: ${feature.description}\n`;
          });
          prompt += `\n`;
        }
        
        // Architecture
        if (expanded.architecture && expanded.architecture.files) {
          prompt += `## Architecture\n`;
          expanded.architecture.files.forEach((file: any) => {
            prompt += `- \`${file.path}\`: ${file.description}\n`;
          });
          prompt += `\n`;
        }
        
        // Data Models
        if (expanded.dataModels && expanded.dataModels.length > 0) {
          prompt += `## Data Models\n`;
          expanded.dataModels.forEach((model: any) => {
            prompt += `### ${model.title}\n\`\`\`typescript\n${model.schema}\n\`\`\`\n\n`;
          });
        }
        
        // Tools
        if (expanded.tools && expanded.tools.length > 0) {
          prompt += `## Tools\n`;
          expanded.tools.forEach((tool: any, index: number) => {
            prompt += `${index + 1}. **${tool.title}**: ${tool.description}\n`;
            prompt += `   - Input: \`${tool.inputSchema}\`\n`;
            prompt += `   - Output: \`${tool.outputSchema}\`\n\n`;
          });
        }
        
        // External Tools
        if (expanded.toolsFromOtherApps && expanded.toolsFromOtherApps.length > 0) {
          prompt += `## External Integrations\n`;
          expanded.toolsFromOtherApps.forEach((tool: any, index: number) => {
            prompt += `${index + 1}. **${tool.service} - ${tool.toolName}**: ${tool.description}\n`;
            prompt += `   - Use case: ${tool.useCase}\n\n`;
          });
        }
        
        // Workflows
        if (expanded.workflows && expanded.workflows.length > 0) {
          prompt += `## Workflows\n`;
          expanded.workflows.forEach((workflow: any, index: number) => {
            prompt += `${index + 1}. **${workflow.title}**: ${workflow.description}\n`;
            prompt += `   - Trigger: ${workflow.trigger}\n\n`;
          });
        }
        
        // Views
        if (expanded.views && expanded.views.length > 0) {
          prompt += `## Views\n`;
          expanded.views.forEach((view: any, index: number) => {
            prompt += `${index + 1}. **${view.title}** (\`${view.pathTemplate}\`): ${view.description}\n\n`;
          });
        }
        
        // Implementation Phases
        if (expanded.implementationPhases && expanded.implementationPhases.length > 0) {
          prompt += `## Implementation Plan\n`;
          expanded.implementationPhases.forEach((phase: any, index: number) => {
            prompt += `### Phase ${index + 1}: ${phase.title} (${phase.duration})\n`;
            prompt += `${phase.description}\n\n`;
            if (phase.tasks && phase.tasks.length > 0) {
              prompt += `**Tasks:**\n`;
              phase.tasks.forEach((task: string) => {
                prompt += `- ${task}\n`;
              });
              prompt += `\n`;
            }
          });
        }
        
        // Success Metrics
        if (expanded.successMetrics && expanded.successMetrics.length > 0) {
          prompt += `## Success Metrics\n`;
          expanded.successMetrics.forEach((metric: string, index: number) => {
            prompt += `${index + 1}. ${metric}\n`;
          });
          prompt += `\n`;
        }
        
        prompt += `## Development Instructions\n`;
        prompt += `This application should be built using the Deco MCP platform with:\n`;
        prompt += `- Server: Cloudflare Workers + Deco runtime\n`;
        prompt += `- Frontend: React + Tailwind CSS + TanStack Router/Query\n`;
        prompt += `- Database: SQLite with Drizzle ORM\n`;
        prompt += `- Follow the Deco MCP template patterns and best practices\n\n`;
        
        // Save export to database
        const exportId = crypto.randomUUID();
        await db.insert(exports).values({
          id: exportId,
          ideaId: context.ideaId,
          format: 'prompt',
          content: prompt,
        });
        
        return {
          prompt,
          success: true,
        };
      } catch (error) {
        console.error("Failed to export prompt:", error);
        throw new Error("Failed to export prompt");
      }
    },
  });

export const createGenerateMarkdownTool = (env: Env) =>
  createTool({
    id: "GENERATE_MARKDOWN",
    description: "Generate markdown documentation from expanded idea",
    inputSchema: z.object({
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      markdown: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Get the idea
        const ideaResult = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.ideaId))
          .limit(1);
        
        if (ideaResult.length === 0 || !ideaResult[0].expandedData) {
          throw new Error("Idea not found or not expanded");
        }
        
        const idea = ideaResult[0];
        const expanded = idea.expandedData;
        
        // Generate comprehensive markdown documentation
        let markdown = `# ${expanded.title}\n\n`;
        
        // Table of contents
        markdown += `## Table of Contents\n`;
        markdown += `- [Overview](#overview)\n`;
        markdown += `- [Features](#features)\n`;
        markdown += `- [Architecture](#architecture)\n`;
        markdown += `- [Data Models](#data-models)\n`;
        markdown += `- [API Tools](#api-tools)\n`;
        markdown += `- [External Integrations](#external-integrations)\n`;
        markdown += `- [Workflows](#workflows)\n`;
        markdown += `- [User Interface](#user-interface)\n`;
        markdown += `- [Implementation Plan](#implementation-plan)\n`;
        markdown += `- [Success Metrics](#success-metrics)\n\n`;
        
        // Overview
        markdown += `## Overview\n\n`;
        markdown += `**Original Concept:** ${idea.originalPrompt}\n\n`;
        markdown += `${expanded.description}\n\n`;
        
        // Features
        if (expanded.features && expanded.features.length > 0) {
          markdown += `## Features\n\n`;
          expanded.features.forEach((feature: any) => {
            markdown += `### ${feature.title}\n\n`;
            markdown += `${feature.description}\n\n`;
          });
        }
        
        // Architecture
        if (expanded.architecture && expanded.architecture.files) {
          markdown += `## Architecture\n\n`;
          markdown += `### Project Structure\n\n`;
          markdown += `\`\`\`\n`;
          expanded.architecture.files.forEach((file: any) => {
            markdown += `${file.path}  # ${file.description}\n`;
          });
          markdown += `\`\`\`\n\n`;
        }
        
        // Data Models
        if (expanded.dataModels && expanded.dataModels.length > 0) {
          markdown += `## Data Models\n\n`;
          expanded.dataModels.forEach((model: any) => {
            markdown += `### ${model.title}\n\n`;
            markdown += `\`\`\`typescript\n${model.schema}\n\`\`\`\n\n`;
          });
        }
        
        // Tools
        if (expanded.tools && expanded.tools.length > 0) {
          markdown += `## API Tools\n\n`;
          expanded.tools.forEach((tool: any) => {
            markdown += `### ${tool.title}\n\n`;
            markdown += `${tool.description}\n\n`;
            markdown += `**Input Schema:**\n\`\`\`typescript\n${tool.inputSchema}\n\`\`\`\n\n`;
            markdown += `**Output Schema:**\n\`\`\`typescript\n${tool.outputSchema}\n\`\`\`\n\n`;
          });
        }
        
        // External Tools
        if (expanded.toolsFromOtherApps && expanded.toolsFromOtherApps.length > 0) {
          markdown += `## External Integrations\n\n`;
          markdown += `| Service | Tool | Description | Use Case |\n`;
          markdown += `|---------|------|-------------|----------|\n`;
          expanded.toolsFromOtherApps.forEach((tool: any) => {
            markdown += `| ${tool.service} | ${tool.toolName} | ${tool.description} | ${tool.useCase} |\n`;
          });
          markdown += `\n`;
        }
        
        // Workflows
        if (expanded.workflows && expanded.workflows.length > 0) {
          markdown += `## Workflows\n\n`;
          expanded.workflows.forEach((workflow: any) => {
            markdown += `### ${workflow.title}\n\n`;
            markdown += `${workflow.description}\n\n`;
            markdown += `**Trigger:** ${workflow.trigger}\n\n`;
          });
        }
        
        // Views
        if (expanded.views && expanded.views.length > 0) {
          markdown += `## User Interface\n\n`;
          expanded.views.forEach((view: any) => {
            markdown += `### ${view.title}\n\n`;
            markdown += `**Route:** \`${view.pathTemplate}\`\n\n`;
            markdown += `${view.description}\n\n`;
          });
        }
        
        // Implementation Phases
        if (expanded.implementationPhases && expanded.implementationPhases.length > 0) {
          markdown += `## Implementation Plan\n\n`;
          expanded.implementationPhases.forEach((phase: any, index: number) => {
            markdown += `### Phase ${index + 1}: ${phase.title}\n\n`;
            markdown += `**Duration:** ${phase.duration}\n\n`;
            markdown += `${phase.description}\n\n`;
            if (phase.tasks && phase.tasks.length > 0) {
              markdown += `**Tasks:**\n\n`;
              phase.tasks.forEach((task: string) => {
                markdown += `- [ ] ${task}\n`;
              });
              markdown += `\n`;
            }
          });
        }
        
        // Success Metrics
        if (expanded.successMetrics && expanded.successMetrics.length > 0) {
          markdown += `## Success Metrics\n\n`;
          expanded.successMetrics.forEach((metric: string) => {
            markdown += `- ${metric}\n`;
          });
          markdown += `\n`;
        }
        
        // Development notes
        markdown += `## Development Notes\n\n`;
        markdown += `This project is designed for the Deco MCP platform with the following tech stack:\n\n`;
        markdown += `- **Backend:** Cloudflare Workers + Deco runtime\n`;
        markdown += `- **Frontend:** React + Tailwind CSS\n`;
        markdown += `- **Routing:** TanStack Router\n`;
        markdown += `- **State Management:** TanStack Query\n`;
        markdown += `- **Database:** SQLite with Drizzle ORM\n`;
        markdown += `- **Validation:** Zod schemas\n`;
        markdown += `- **Deployment:** Cloudflare Workers\n\n`;
        
        markdown += `Follow the Deco MCP template patterns and cursor rules for optimal development experience.\n`;
        
        // Save export to database
        const exportId = crypto.randomUUID();
        await db.insert(exports).values({
          id: exportId,
          ideaId: context.ideaId,
          format: 'markdown',
          content: markdown,
        });
        
        return {
          markdown,
          success: true,
        };
      } catch (error) {
        console.error("Failed to generate markdown:", error);
        throw new Error("Failed to generate markdown");
      }
    },
  });

export const createGetExportsTool = (env: Env) =>
  createTool({
    id: "GET_EXPORTS",
    description: "Get all exports for an idea",
    inputSchema: z.object({
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      exports: z.array(z.object({
        id: z.string(),
        format: z.string(),
        content: z.string(),
        createdAt: z.string(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const result = await db.select()
          .from(exports)
          .where(eq(exports.ideaId, context.ideaId));
        
        const processedExports = result.map(exp => ({
          id: exp.id,
          format: exp.format,
          content: exp.content,
          createdAt: new Date(exp.createdAt).toISOString(),
        }));
        
        return {
          exports: processedExports,
        };
      } catch (error) {
        console.error("Failed to get exports:", error);
        throw new Error("Failed to retrieve exports");
      }
    },
  });

// Export all export-related tools
export const exportTools = [
  createExportPromptTool,
  createGenerateMarkdownTool,
  createGetExportsTool,
];