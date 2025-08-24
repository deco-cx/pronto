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
import { 
  getCompleteExpansionSchema, 
  getSchemaForSection, 
  getExternalToolsPrompt, 
  getMainExpansionPrompt 
} from "../defaultSchemas.ts";

// Get expansion schema from centralized definitions
// This can now be overridden at runtime for editing purposes

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
        const prompt = getMainExpansionPrompt(context.originalPrompt);
        const schema = getCompleteExpansionSchema();

        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: [{
            role: 'user',
            content: prompt
          }],
          schema
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
        const prompt = getExternalToolsPrompt(context.expandedIdea);
        const toolsSchema = getSchemaForSection('toolsFromOtherApps');
        
        const schema = {
          type: 'object',
          properties: {
            toolsFromOtherApps: toolsSchema
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