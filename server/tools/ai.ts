/**
 * AI-related tools for proxying AI functionality from the Deco platform.
 * 
 * This file contains tools that proxy AI functionality to provide typed
 * interfaces and centralized configuration for AI operations.
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";

export const createAIGenerateObjectTool = (env: Env) =>
  createTool({
    id: "AI_GENERATE_OBJECT",
    description: "Generate structured objects using AI models with JSON schema validation",
    inputSchema: z.object({
      messages: z.array(z.object({
        id: z.string().optional(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        createdAt: z.string().optional(),
        experimental_attachments: z.array(z.object({
          name: z.string().optional(),
          contentType: z.string().optional(),
          url: z.string()
        })).optional()
      })),
      schema: z.record(z.any()),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      tools: z.record(z.array(z.string())).optional()
    }),
    outputSchema: z.object({
      object: z.record(z.any()).optional(),
      usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number(),
        transactionId: z.string()
      }),
      finishReason: z.string().optional()
    }),
    execute: async ({ context }) => {
      // Proxy to the actual deco platform AI tool
      return await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
        messages: context.messages,
        schema: context.schema,
        model: context.model,
        maxTokens: context.maxTokens,
        temperature: context.temperature,
        tools: context.tools
      });
    },
  });

// Export all AI-related tools
export const aiTools = [
  createAIGenerateObjectTool,
];