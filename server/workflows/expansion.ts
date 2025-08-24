/**
 * Self-contained expansion workflow with all steps inlined.
 * 
 * This approach eliminates import dependencies and ensures the workflow
 * has direct control over all its steps.
 */
import {
  createStepFromTool,
  createWorkflow,
  createTool,
} from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq } from "drizzle-orm";

import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { ideas } from "../schema.ts";

// Inline expansion schema
const expansionSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'A clear, compelling title for the software idea. Example: "Sistema de Pesquisa Eleitoral"'
    },
    description: {
      type: 'string',
      description: 'Detailed description of what the software does. Example: "Uma aplicação para simular comportamento eleitoral através da criação de perfis demográficos e aplicação de questionários com respostas geradas por IA."'
    },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['title', 'description']
      },
      description: 'Main features of the application. Example: [{"title": "Gestão de Eleitores", "description": "Criar e gerenciar perfis demográficos detalhados"}]'
    },
    architecture: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              description: { type: 'string' }
            },
            required: ['path', 'description']
          }
        }
      },
      description: 'Project file structure following Deco MCP template patterns'
    },
    dataModels: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          schema: { type: 'string' }
        },
        required: ['title', 'schema']
      },
      description: 'Database entities with Drizzle ORM schemas'
    },
    tools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          inputSchema: { type: 'string' },
          outputSchema: { type: 'string' }
        },
        required: ['title', 'description', 'inputSchema', 'outputSchema']
      },
      description: 'MCP tools for the application with Zod schemas'
    },
    views: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          pathTemplate: { type: 'string' },
          description: { type: 'string' },
          layoutExample: { type: 'string' }
        },
        required: ['title', 'pathTemplate', 'description', 'layoutExample']
      },
      description: 'Frontend routes with SVG layout examples'
    },
    implementationPhases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'string' },
          tasks: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['title', 'description', 'duration', 'tasks']
      },
      description: 'Implementation phases with realistic timelines'
    },
    successMetrics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Measurable success criteria for the project'
    }
  },
  required: ['title', 'description', 'features', 'architecture', 'dataModels', 'tools', 'views', 'implementationPhases', 'successMetrics']
};

// Inline EXPAND_IDEA tool
const createInlineExpandIdeaTool = (env: Env) =>
  createTool({
    id: "INLINE_EXPAND_IDEA",
    description: "Expand a simple idea into a comprehensive plan using AI",
    inputSchema: z.object({
      originalPrompt: z.string(),
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      expandedData: z.any(),
      ideaId: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      try {
        const prompt = `You are an expert software architect and product manager specializing in the Deco MCP platform. 

Your task is to transform this simple software idea into a comprehensive, detailed development plan:

"${context.originalPrompt}"

Create a complete plan that follows Deco MCP platform patterns and best practices.`;

        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: [{
            role: 'user',
            content: prompt
          }],
          schema: expansionSchema
        });

        if (!result.object) {
          throw new Error("AI did not return structured expansion data");
        }

        return {
          expandedData: result.object,
          ideaId: context.ideaId,
          success: true,
        };
      } catch (error) {
        console.error("Failed to expand idea:", error);
        throw new Error("Failed to expand idea with AI");
      }
    },
  });

// Inline SUGGEST_EXTERNAL_TOOLS tool
const createInlineSuggestExternalToolsTool = (env: Env) =>
  createTool({
    id: "INLINE_SUGGEST_EXTERNAL_TOOLS",
    description: "Suggest external tools and integrations based on the idea",
    inputSchema: z.object({
      expandedIdea: z.any(),
    }),
    outputSchema: z.object({
      toolsFromOtherApps: z.array(z.any()),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      try {
        const prompt = `Based on this expanded software idea, suggest 3-5 relevant external tools and integrations that would enhance the application:

${JSON.stringify(context.expandedIdea, null, 2)}

For each suggested tool, provide:
- service: The service name (e.g., "GitHub", "Slack", "Stripe")
- toolName: The specific API or tool name
- description: What the tool does
- useCase: How it would be used in this specific application

Focus on tools that would genuinely add value to this particular idea.`;

        const schema = {
          type: 'object',
          properties: {
            toolsFromOtherApps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  toolName: { type: 'string' },
                  description: { type: 'string' },
                  useCase: { type: 'string' }
                },
                required: ['service', 'toolName', 'description', 'useCase']
              }
            }
          },
          required: ['toolsFromOtherApps']
        };

        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: [{
            role: 'user',
            content: prompt
          }],
          schema
        });

        if (!result.object) {
          throw new Error("AI did not return external tools suggestions");
        }

        return {
          toolsFromOtherApps: (result.object.toolsFromOtherApps as any[]) || [],
          success: true,
        };
      } catch (error) {
        console.error("Failed to suggest external tools:", error);
        throw new Error("Failed to suggest external tools");
      }
    },
  });

// Inline UPDATE_IDEA tool
const createInlineUpdateIdeaTool = (env: Env) =>
  createTool({
    id: "INLINE_UPDATE_IDEA",
    description: "Update idea expanded data",
    inputSchema: z.object({
      id: z.string(),
      expandedData: z.any().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Check if idea exists
        const existing = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.id))
          .limit(1);
        
        if (existing.length === 0) {
          throw new Error("Idea not found");
        }
        
        // Update the idea
        await db.update(ideas)
          .set({
            expandedData: context.expandedData,
          })
          .where(eq(ideas.id, context.id));
        
        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to update idea:", error);
        throw new Error("Failed to update idea");
      }
    },
  });

// Create the complete expansion workflow  
export const createCompleteExpansionWorkflow = (env: Env) => {
  const expandIdeaStep = createStepFromTool(createInlineExpandIdeaTool(env));
  const suggestExternalToolsStep = createStepFromTool(createInlineSuggestExternalToolsTool(env));
  const updateIdeaStep = createStepFromTool(createInlineUpdateIdeaTool(env));

  return createWorkflow({
    id: "COMPLETE_EXPANSION_WORKFLOW",
    inputSchema: z.object({
      originalPrompt: z.string(),
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      expandedIdea: z.any(),
      externalTools: z.array(z.any()),
      success: z.boolean(),
    }),
  })
    // Step 1: Expand the idea
    .then(expandIdeaStep)
    
    // Step 2: Get external tools suggestions
    .map(async ({ inputData, getStepResult }) => {
      const expandedData = getStepResult(expandIdeaStep).expandedData;
      return { expandedIdea: expandedData };
    })
    .then(suggestExternalToolsStep)
    
    // Step 3: Update the idea in database
    .map(async ({ inputData, getStepResult }) => {
      const expandResult = getStepResult(expandIdeaStep);
      const expandedData = expandResult.expandedData;
      const ideaId = expandResult.ideaId;
      const externalTools = getStepResult(suggestExternalToolsStep).toolsFromOtherApps;
      
      if (!ideaId) {
        throw new Error('ideaId is missing from expand step result');
      }
      
      // Combine data
      const completeExpandedData = {
        ...expandedData,
        toolsFromOtherApps: externalTools,
      };
      
      return {
        id: ideaId,
        expandedData: completeExpandedData,
      };
    })
    .then(updateIdeaStep)
    
    // Final output formatting
    .map(async ({ inputData, getStepResult }) => {
      const expandedData = getStepResult(expandIdeaStep).expandedData;
      const externalTools = getStepResult(suggestExternalToolsStep).toolsFromOtherApps;
      
      return {
        expandedIdea: {
          ...expandedData,
          toolsFromOtherApps: externalTools,
        },
        externalTools,
        success: true,
      };
    })
    .commit();
};

// Export the expansion tools for potential reuse
export const expansionTools = [
  createInlineExpandIdeaTool,
  createInlineSuggestExternalToolsTool,
  createInlineUpdateIdeaTool,
];

// Export the expansion workflow
export const expansionWorkflows = [
  createCompleteExpansionWorkflow,
];