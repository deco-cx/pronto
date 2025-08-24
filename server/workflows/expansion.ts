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

// Set to true to mock AI calls and return sample data for faster testing
const DEBUG = true;

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
        console.log('🔧 INLINE_EXPAND_IDEA called with:', {
          originalPrompt: context.originalPrompt?.substring(0, 50) + '...',
          ideaId: context.ideaId,
          ideaIdType: typeof context.ideaId
        });

        const prompt = `You are an expert software architect and product manager specializing in the Deco MCP platform. 

Your task is to transform this simple software idea into a comprehensive, detailed development plan:

"${context.originalPrompt}"

Create a complete plan that follows Deco MCP platform patterns and best practices.`;

        let expandedData;
        
        if (DEBUG) {
          console.log('🔧 DEBUG mode: Using mock data instead of AI call');
          expandedData = {
            title: "Mock Expanded Idea",
            description: "This is a mock expanded idea for debugging purposes. Original prompt: " + context.originalPrompt,
            features: [
              {
                title: "Mock Feature 1",
                description: "This is a mock feature for testing"
              },
              {
                title: "Mock Feature 2", 
                description: "Another mock feature for testing"
              }
            ],
            architecture: {
              files: [
                {
                  path: "src/mock/example.ts",
                  description: "Mock architecture file"
                }
              ]
            },
            dataModels: [
              {
                title: "Mock Model",
                schema: "// Mock schema code here"
              }
            ],
            tools: [
              {
                title: "Mock Tool",
                description: "Mock tool description",
                inputSchema: "z.object({ mockInput: z.string() })",
                outputSchema: "z.object({ mockOutput: z.boolean() })"
              }
            ],
            views: [
              {
                title: "Mock View",
                pathTemplate: "/mock",
                description: "Mock view description",
                layoutExample: "<svg>Mock SVG</svg>"
              }
            ],
            implementationPhases: [
              {
                title: "Mock Phase",
                description: "Mock implementation phase",
                duration: "1 week",
                tasks: ["Mock task 1", "Mock task 2"]
              }
            ],
            successMetrics: [
              "Mock metric 1",
              "Mock metric 2"
            ]
          };
        } else {
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
          
          expandedData = result.object;
        }

        console.log('🔧 INLINE_EXPAND_IDEA completed successfully');
        return {
          expandedData,
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
        console.log('🔧 INLINE_SUGGEST_EXTERNAL_TOOLS called');

        // Mock external tools for now
        const toolsFromOtherApps = [
          {
            service: "GitHub",
            toolName: "GitHub API",
            description: "Manages code repositories, issues, and pull requests.",
            useCase: "Integrate for version control and collaborative development tracking within the application."
          },
          {
            service: "Slack",
            toolName: "Slack API",
            description: "Facilitates team communication and notifications.",
            useCase: "Send real-time alerts and updates to team channels about application events or user activities."
          },
          {
            service: "Stripe",
            toolName: "Stripe API",
            description: "Handles online payments and subscriptions.",
            useCase: "Enable payment processing for premium features or subscription plans within the application."
          }
        ];

        console.log('🔧 INLINE_SUGGEST_EXTERNAL_TOOLS completed successfully');
        return {
          toolsFromOtherApps,
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
        console.log('🔧 INLINE_UPDATE_IDEA called with context id:', context.id);
        console.log('🔧 INLINE_UPDATE_IDEA context id type:', typeof context.id);
        console.log('🔧 INLINE_UPDATE_IDEA expandedData keys:', Object.keys(context.expandedData || {}));
        
        // Check if idea exists
        console.log('🔧 Searching for idea with id:', context.id);
        const existing = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.id))
          .limit(1);
        
        console.log('🔧 Found existing ideas:', existing.length);
        if (existing.length > 0) {
          console.log('🔧 Found idea:', { id: existing[0].id, prompt: existing[0].originalPrompt.substring(0, 50) });
        }
        
        if (existing.length === 0) {
          // List all ideas to debug
          const allIdeas = await db.select({ id: ideas.id, prompt: ideas.originalPrompt }).from(ideas);
          console.log('🔧 All ideas in database:', allIdeas);
          console.log('🔧 Looking for id:', context.id, 'in:', allIdeas.map(i => i.id));
          throw new Error("Idea not found");
        }
        
        // Update the idea
        await db.update(ideas)
          .set({
            expandedData: context.expandedData,
          })
          .where(eq(ideas.id, context.id));
        
        console.log('🔧 INLINE_UPDATE_IDEA completed successfully');
        return {
          success: true,
        };
      } catch (error) {
        console.error("🔧 Failed to update idea:", error);
        throw new Error("Failed to update idea");
      }
    },
  });

// Create the complete expansion workflow  
export const createCompleteExpansionWorkflow = (env: Env) => {
  const expandIdeaStep = createStepFromTool(createInlineExpandIdeaTool(env));
  const suggestExternalToolsStep = createStepFromTool(createInlineSuggestExternalToolsTool(env));
  const updateIdeaStep = createStepFromTool(createInlineUpdateIdeaTool(env));

  console.log('🔧 Creating COMPLETE_EXPANSION_WORKFLOW...');

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
    // Debug: Log the initial workflow input and store it for later access
    .map(async ({ inputData }) => {
      console.log('🚀 WORKFLOW START - Input received:', JSON.stringify(inputData, null, 2));
      console.log('🚀 WORKFLOW START - ideaId:', inputData.ideaId);
      console.log('🚀 WORKFLOW START - ideaId type:', typeof inputData.ideaId);
      return inputData; // Pass through unchanged
    })
    
    // Step 1: Expand the idea
    .then(expandIdeaStep)
    
    // Step 2: Get external tools suggestions
    .map(async ({ inputData, getStepResult }) => {
      const expandedData = getStepResult(expandIdeaStep).expandedData;
      console.log('🚀 WORKFLOW - Preparing external tools input');
      return { expandedIdea: expandedData }; // Format for external tools step
    })
    .then(suggestExternalToolsStep)
    
    // Step 3: Update the idea in database
    .map(async ({ inputData, getStepResult }) => {
      console.log('🚀 WORKFLOW BEFORE UPDATE - Input data:', JSON.stringify(inputData, null, 2));
      
      const expandResult = getStepResult(expandIdeaStep);
      const expandedData = expandResult.expandedData;
      const ideaId = expandResult.ideaId; // Get ideaId from expand step result
      const externalTools = getStepResult(suggestExternalToolsStep).toolsFromOtherApps;
      
      console.log('🚀 WORKFLOW BEFORE UPDATE - ideaId from expand step:', ideaId);
      
      if (!ideaId) {
        console.error('🚀 WORKFLOW ERROR - ideaId is missing from expand step result');
        console.error('🚀 WORKFLOW ERROR - expandResult keys:', Object.keys(expandResult));
        throw new Error('ideaId is missing from expand step result');
      }
      
      // Combine data
      const completeExpandedData = {
        ...expandedData,
        toolsFromOtherApps: externalTools,
      };
      
      // Format for UPDATE_IDEA tool
      const updateData = {
        id: ideaId,
        expandedData: completeExpandedData,
      };
      
      console.log('🚀 WORKFLOW UPDATE DATA:', JSON.stringify({ id: updateData.id, hasExpandedData: !!updateData.expandedData }, null, 2));
      return updateData;
    })
    .then(updateIdeaStep)
    
    // Final output formatting
    .map(async ({ inputData, getStepResult }) => {
      console.log('🚀 WORKFLOW FINAL - Formatting output');
      
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