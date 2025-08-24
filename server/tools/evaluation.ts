/**
 * Evaluation-related tools for AI-powered idea assessment.
 * 
 * This file contains all tools related to idea evaluation operations including:
 * - Evaluating ideas across multiple criteria
 * - Retrieving evaluations by idea ID
 * - Managing evaluation history
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { evaluations } from "../schema.ts";

const evaluationSchema = {
  type: 'object',
  properties: {
    ambiguityAvoidance: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    },
    interestLevel: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    },
    marketPotential2025: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    },
    technicalFeasibility: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    },
    innovationLevel: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    },
    userValueProposition: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 1, maximum: 10 },
        feedback: { type: 'string' }
      },
      required: ['score', 'feedback']
    }
  },
  required: ['ambiguityAvoidance', 'interestLevel', 'marketPotential2025', 'technicalFeasibility', 'innovationLevel', 'userValueProposition']
};

export const createEvaluateIdeaTool = (env: Env) =>
  createTool({
    id: "EVALUATE_IDEA",
    description: "Evaluate an idea across multiple criteria using AI",
    inputSchema: z.object({
      ideaId: z.string(),
      expandedData: z.any(),
    }),
    outputSchema: z.object({
      evaluation: z.object({
        id: z.string(),
        ideaId: z.string(),
        criteria: z.any(),
        overallScore: z.number(),
        createdAt: z.string(),
      }),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const prompt = `You are an expert product evaluator and venture capitalist. Evaluate this expanded software idea across the specified criteria:

${JSON.stringify(context.expandedData, null, 2)}

Evaluate the idea on these criteria (score 1-10 for each):

1. **Ambiguity Avoidance** (1-10): How clear and well-defined is the concept? Are there any vague or unclear aspects?

2. **Interest Level** (1-10): How interesting and engaging is this idea? Would it capture people's attention?

3. **Market Potential 2025** (1-10): What is the market potential for this idea in 2025? Consider current trends and future projections.

4. **Technical Feasibility** (1-10): How technically feasible is this project with current technology and the specified stack?

5. **Innovation Level** (1-10): How innovative and novel is this idea? Does it bring something new to the market?

6. **User Value Proposition** (1-10): How much value would this provide to end users? Would they pay for it or use it regularly?

For each criterion, provide a score (1-10) and detailed feedback explaining your reasoning.`;

        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: [{
            role: 'user',
            content: prompt
          }],
          schema: evaluationSchema
        });

        if (!result.object) {
          throw new Error("AI did not return evaluation data");
        }

        // Calculate overall score
        const scores = [
          result.object.ambiguityAvoidance.score,
          result.object.interestLevel.score,
          result.object.marketPotential2025.score,
          result.object.technicalFeasibility.score,
          result.object.innovationLevel.score,
          result.object.userValueProposition.score,
        ];
        
        const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        // Save evaluation to database
        const evaluationId = crypto.randomUUID();
        
        await db.insert(evaluations).values({
          id: evaluationId,
          ideaId: context.ideaId,
          criteria: result.object,
          overallScore,
        });

        return {
          evaluation: {
            id: evaluationId,
            ideaId: context.ideaId,
            criteria: result.object,
            overallScore,
            createdAt: new Date().toISOString(),
          },
          success: true,
        };
      } catch (error) {
        console.error("Failed to evaluate idea:", error);
        throw new Error("Failed to evaluate idea");
      }
    },
  });

export const createGetEvaluationTool = (env: Env) =>
  createTool({
    id: "GET_EVALUATION",
    description: "Get evaluation for an idea",
    inputSchema: z.object({
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      evaluation: z.object({
        id: z.string(),
        ideaId: z.string(),
        criteria: z.any(),
        overallScore: z.number(),
        createdAt: z.string(),
      }).nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const result = await db.select()
          .from(evaluations)
          .where(eq(evaluations.ideaId, context.ideaId))
          .limit(1);
        
        if (result.length === 0) {
          return { evaluation: null };
        }
        
        const evaluation = result[0];
        return {
          evaluation: {
            id: evaluation.id,
            ideaId: evaluation.ideaId,
            criteria: evaluation.criteria,
            overallScore: evaluation.overallScore,
            createdAt: new Date(evaluation.createdAt).toISOString(),
          },
        };
      } catch (error) {
        console.error("Failed to get evaluation:", error);
        throw new Error("Failed to retrieve evaluation");
      }
    },
  });

export const createDeleteEvaluationTool = (env: Env) =>
  createTool({
    id: "DELETE_EVALUATION",
    description: "Delete an evaluation by idea ID",
    inputSchema: z.object({
      ideaId: z.string(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        await db.delete(evaluations).where(eq(evaluations.ideaId, context.ideaId));
        
        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to delete evaluation:", error);
        throw new Error("Failed to delete evaluation");
      }
    },
  });

// Export all evaluation-related tools
export const evaluationTools = [
  createEvaluateIdeaTool,
  createGetEvaluationTool,
  createDeleteEvaluationTool,
];