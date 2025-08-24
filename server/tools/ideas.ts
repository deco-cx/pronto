/**
 * Ideas-related tools for managing software ideas and their expansion.
 * 
 * This file contains all tools related to idea operations including:
 * - Creating new ideas
 * - Retrieving ideas by ID
 * - Listing ideas with pagination
 * - Deleting ideas
 * - Updating idea data
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { ideas } from "../schema.ts";

export const createCreateIdeaTool = (env: Env) =>
  createTool({
    id: "CREATE_IDEA",
    description: "Create a new idea from user input",
    inputSchema: z.object({
      originalPrompt: z.string().min(10).max(1000),
    }),
    outputSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const id = crypto.randomUUID();
        
        await db.insert(ideas).values({
          id,
          originalPrompt: context.originalPrompt,
          expandedData: null,
        });
        
        return {
          id,
          success: true,
        };
      } catch (error) {
        console.error("Failed to create idea:", error);
        throw new Error("Failed to create idea");
      }
    },
  });

export const createGetIdeaTool = (env: Env) =>
  createTool({
    id: "GET_IDEA",
    description: "Get an idea by ID",
    inputSchema: z.object({
      id: z.string(),
    }),
    outputSchema: z.object({
      idea: z.object({
        id: z.string(),
        originalPrompt: z.string(),
        expandedData: z.any().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }).nullable(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const result = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.id))
          .limit(1);
        
        if (result.length === 0) {
          return { idea: null };
        }
        
        const idea = result[0];
        const parseDate = (dateValue: any): string => {
          if (!dateValue) return new Date().toISOString();
          
          // Handle different date formats
          if (dateValue instanceof Date) {
            if (isNaN(dateValue.getTime())) {
              console.warn('Invalid Date object:', dateValue);
              return new Date().toISOString();
            }
            return dateValue.toISOString();
          }
          
          // Handle Unix timestamp (seconds) - convert to milliseconds for JS Date
          if (typeof dateValue === 'number') {
            const timestamp = dateValue * 1000;
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
              console.warn('Invalid timestamp:', dateValue, 'converted to:', timestamp);
              return new Date().toISOString();
            }
            return date.toISOString();
          }
          
          // Handle string dates
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              console.warn('Invalid date string:', dateValue);
              return new Date().toISOString();
            }
            return date.toISOString();
          }
          
          console.warn('Unknown date format:', dateValue, typeof dateValue);
          return new Date().toISOString();
        };
        
        return {
          idea: {
            id: idea.id,
            originalPrompt: idea.originalPrompt,
            expandedData: idea.expandedData,
            createdAt: parseDate(idea.createdAt),
            updatedAt: parseDate(idea.updatedAt),
          },
        };
      } catch (error) {
        console.error("Failed to get idea:", error);
        throw new Error("Failed to retrieve idea");
      }
    },
  });

export const createListIdeasTool = (env: Env) =>
  createTool({
    id: "LIST_IDEAS",
    description: "List all user ideas with pagination",
    inputSchema: z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
    outputSchema: z.object({
      ideas: z.array(z.object({
        id: z.string(),
        originalPrompt: z.string(),
        hasExpandedData: z.boolean(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
      total: z.number(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const offset = (context.page - 1) * context.limit;
        
        // Get paginated results
        const result = await db.select()
          .from(ideas)
          .orderBy(desc(ideas.createdAt))
          .limit(context.limit)
          .offset(offset);
        
        // Get total count
        const countResult = await db.select({ count: ideas.id }).from(ideas);
        const total = countResult.length;
        
        const processedIdeas = result.map(idea => {
          console.log('Processing idea:', { id: idea.id, createdAt: idea.createdAt, updatedAt: idea.updatedAt, typeof: typeof idea.createdAt });
          
          const parseDate = (dateValue: any): string => {
            if (!dateValue) return new Date().toISOString();
            
            // Handle different date formats
            if (dateValue instanceof Date) {
              if (isNaN(dateValue.getTime())) {
                console.warn('Invalid Date object:', dateValue);
                return new Date().toISOString();
              }
              return dateValue.toISOString();
            }
            
            // Handle Unix timestamp (seconds) - convert to milliseconds for JS Date
            if (typeof dateValue === 'number') {
              const timestamp = dateValue * 1000;
              const date = new Date(timestamp);
              if (isNaN(date.getTime())) {
                console.warn('Invalid timestamp:', dateValue, 'converted to:', timestamp);
                return new Date().toISOString();
              }
              return date.toISOString();
            }
            
            // Handle string dates
            if (typeof dateValue === 'string') {
              const date = new Date(dateValue);
              if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateValue);
                return new Date().toISOString();
              }
              return date.toISOString();
            }
            
            console.warn('Unknown date format:', dateValue, typeof dateValue);
            return new Date().toISOString();
          };
          
          return {
            id: idea.id,
            originalPrompt: idea.originalPrompt,
            hasExpandedData: !!idea.expandedData,
            createdAt: parseDate(idea.createdAt),
            updatedAt: parseDate(idea.updatedAt),
          };
        });
        
        return {
          ideas: processedIdeas,
          total,
        };
      } catch (error) {
        console.error("Failed to list ideas:", error);
        throw new Error("Failed to list ideas");
      }
    },
  });

export const createDeleteIdeaTool = (env: Env) =>
  createTool({
    id: "DELETE_IDEA",
    description: "Delete an idea by ID",
    inputSchema: z.object({
      id: z.string(),
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
        
        // Delete the idea (cascade will handle related records)
        await db.delete(ideas).where(eq(ideas.id, context.id));
        
        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to delete idea:", error);
        throw new Error("Failed to delete idea");
      }
    },
  });

export const createUpdateIdeaTool = (env: Env) =>
  createTool({
    id: "UPDATE_IDEA",
    description: "Update idea expanded data",
    inputSchema: z.object({
      id: z.string(),
      expandedData: z.any(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        console.log('UPDATE_IDEA called with context id:', context.id);
        console.log('UPDATE_IDEA context id type:', typeof context.id);
        console.log('UPDATE_IDEA expandedData keys:', Object.keys(context.expandedData || {}));
        
        // Check if idea exists
        console.log('Searching for idea with id:', context.id);
        const existing = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.id))
          .limit(1);
        
        console.log('Found existing ideas:', existing.length);
        if (existing.length > 0) {
          console.log('Found idea:', { id: existing[0].id, prompt: existing[0].originalPrompt.substring(0, 50) });
        }
        
        if (existing.length === 0) {
          // List all ideas to debug
          const allIdeas = await db.select({ id: ideas.id, prompt: ideas.originalPrompt }).from(ideas);
          console.log('All ideas in database:', allIdeas);
          console.log('Looking for id:', context.id, 'in:', allIdeas.map(i => i.id));
          throw new Error("Idea not found");
        }
        
        // Update the idea
        await db.update(ideas)
          .set({
            expandedData: context.expandedData,
            // Let the database handle updatedAt with default unixepoch()
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

// Export all idea-related tools
export const ideaTools = [
  createCreateIdeaTool,
  createGetIdeaTool,
  createListIdeasTool,
  createDeleteIdeaTool,
  createUpdateIdeaTool,
];