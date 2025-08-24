/**
 * Debug tools for direct database operations and troubleshooting.
 * 
 * This file contains debugging tools that allow direct SQL execution
 * and database inspection for development and troubleshooting purposes.
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { sql } from "drizzle-orm";

export const createRunSqlTool = (env: Env) =>
  createTool({
    id: "RUN_SQL",
    description: "Execute raw SQL query for debugging purposes",
    inputSchema: z.object({
      query: z.string().min(1),
      params: z.array(z.any()).optional().default([]),
    }),
    outputSchema: z.object({
      results: z.any(),
      success: z.boolean(),
      rowCount: z.number().optional(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        console.log('Executing SQL query:', context.query);
        console.log('With parameters:', context.params);
        
        // Use Drizzle's raw SQL execution
        const results = await db.all(sql.raw(context.query, context.params));
        
        console.log('SQL query results:', results);
        
        return {
          results,
          success: true,
          rowCount: Array.isArray(results) ? results.length : 1,
        };
      } catch (error) {
        console.error("Failed to execute SQL:", error);
        throw new Error(`SQL execution failed: ${error}`);
      }
    },
  });

// Export all debug tools
export const debugTools = [
  createRunSqlTool,
];