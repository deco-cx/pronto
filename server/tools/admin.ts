/**
 * Admin tools for managing schema configurations and prompt descriptions.
 * 
 * This file contains tools for managing the AI schema configurations used
 * in idea expansion, allowing admins to adjust prompt descriptions for better AI responses.
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import type { Env } from "../main.ts";
import { getDb } from "../db.ts";
import { schemaConfigs, schemaFields, ideas } from "../schema.ts";
import { v4 as uuidv4 } from "uuid";

export const createGetSchemaConfigsTool = (env: Env) =>
  createTool({
    id: "GET_SCHEMA_CONFIGS",
    description: "Get all schema configurations",
    inputSchema: z.object({}),
    outputSchema: z.object({
      configs: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        isActive: z.boolean(),
        createdAt: z.string(),
        updatedAt: z.string(),
        fieldsCount: z.number(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const configs = await db.select({
          id: schemaConfigs.id,
          name: schemaConfigs.name,
          description: schemaConfigs.description,
          isActive: schemaConfigs.isActive,
          createdAt: schemaConfigs.createdAt,
          updatedAt: schemaConfigs.updatedAt,
        }).from(schemaConfigs);
        
        // Get field counts for each config
        const configsWithCounts = await Promise.all(configs.map(async (config) => {
          const fields = await db.select().from(schemaFields).where(eq(schemaFields.configId, config.id));
          return {
            ...config,
            createdAt: new Date(config.createdAt * 1000).toISOString(),
            updatedAt: new Date(config.updatedAt * 1000).toISOString(),
            fieldsCount: fields.length,
          };
        }));
        
        return {
          configs: configsWithCounts,
        };
      } catch (error) {
        console.error("Failed to get schema configs:", error);
        throw new Error("Failed to get schema configs");
      }
    },
  });

export const createGetSchemaFieldsTool = (env: Env) =>
  createTool({
    id: "GET_SCHEMA_FIELDS",
    description: "Get all fields for a schema configuration",
    inputSchema: z.object({
      configId: z.string(),
    }),
    outputSchema: z.object({
      fields: z.array(z.object({
        id: z.string(),
        configId: z.string(),
        key: z.string(),
        type: z.enum(['string', 'array', 'object']),
        description: z.string(),
        required: z.boolean(),
        parentField: z.string().nullable(),
        order: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const fields = await db.select()
          .from(schemaFields)
          .where(eq(schemaFields.configId, context.configId));
        
        return {
          fields: fields.map(field => ({
            ...field,
            createdAt: new Date(field.createdAt * 1000).toISOString(),
            updatedAt: new Date(field.updatedAt * 1000).toISOString(),
          })),
        };
      } catch (error) {
        console.error("Failed to get schema fields:", error);
        throw new Error("Failed to get schema fields");
      }
    },
  });

export const createCreateSchemaConfigTool = (env: Env) =>
  createTool({
    id: "CREATE_SCHEMA_CONFIG",
    description: "Create a new schema configuration",
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
    }),
    outputSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const id = uuidv4();
        
        await db.insert(schemaConfigs).values({
          id,
          name: context.name,
          description: context.description,
        });
        
        return {
          id,
          success: true,
        };
      } catch (error) {
        console.error("Failed to create schema config:", error);
        throw new Error("Failed to create schema config");
      }
    },
  });

export const createUpdateSchemaFieldTool = (env: Env) =>
  createTool({
    id: "UPDATE_SCHEMA_FIELD",
    description: "Update a schema field's description or other properties",
    inputSchema: z.object({
      fieldId: z.string(),
      key: z.string().optional(),
      type: z.enum(['string', 'array', 'object']).optional(),
      description: z.string().optional(),
      required: z.boolean().optional(),
      parentField: z.string().nullable().optional(),
      order: z.number().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const updateData: any = {};
        
        if (context.key !== undefined) updateData.key = context.key;
        if (context.type !== undefined) updateData.type = context.type;
        if (context.description !== undefined) updateData.description = context.description;
        if (context.required !== undefined) updateData.required = context.required;
        if (context.parentField !== undefined) updateData.parentField = context.parentField;
        if (context.order !== undefined) updateData.order = context.order;
        
        await db.update(schemaFields)
          .set(updateData)
          .where(eq(schemaFields.id, context.fieldId));
        
        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to update schema field:", error);
        throw new Error("Failed to update schema field");
      }
    },
  });

export const createCreateSchemaFieldTool = (env: Env) =>
  createTool({
    id: "CREATE_SCHEMA_FIELD",
    description: "Create a new schema field",
    inputSchema: z.object({
      configId: z.string(),
      key: z.string(),
      type: z.enum(['string', 'array', 'object']),
      description: z.string(),
      required: z.boolean().default(false),
      parentField: z.string().nullable().optional(),
      order: z.number().default(0),
    }),
    outputSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        const id = uuidv4();
        
        await db.insert(schemaFields).values({
          id,
          configId: context.configId,
          key: context.key,
          type: context.type,
          description: context.description,
          required: context.required,
          parentField: context.parentField || null,
          order: context.order,
        });
        
        return {
          id,
          success: true,
        };
      } catch (error) {
        console.error("Failed to create schema field:", error);
        throw new Error("Failed to create schema field");
      }
    },
  });

export const createInitializeDefaultSchemasTool = (env: Env) =>
  createTool({
    id: "INITIALIZE_DEFAULT_SCHEMAS",
    description: "Initialize default schema configurations from existing expansion schemas",
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Check if already initialized
        const existing = await db.select().from(schemaConfigs);
        if (existing.length > 0) {
          return {
            success: true,
            message: "Default schemas already exist",
          };
        }
        
        // Create expansion schema config
        const expansionConfigId = uuidv4();
        await db.insert(schemaConfigs).values({
          id: expansionConfigId,
          name: 'expansion_schema',
          description: 'Main schema for expanding ideas into comprehensive plans',
        });
        
        // Create expansion schema fields
        const expansionFields = [
          { key: 'title', type: 'string', description: 'A clear, compelling title for the software idea. Example: "Sistema de Pesquisa Eleitoral"', required: true, order: 1 },
          { key: 'description', type: 'string', description: 'Detailed description of what the software does. Example: "Uma aplicação para simular comportamento eleitoral através da criação de perfis demográficos e aplicação de questionários com respostas geradas por IA."', required: true, order: 2 },
          { key: 'features', type: 'array', description: 'Main features of the application. Example: [{"title": "Gestão de Eleitores", "description": "Criar e gerenciar perfis demográficos detalhados"}]', required: true, order: 3 },
          { key: 'architecture', type: 'object', description: 'Project file structure following Deco MCP template patterns', required: true, order: 4 },
          { key: 'dataModels', type: 'array', description: 'Database entities with Drizzle ORM schemas', required: true, order: 5 },
          { key: 'tools', type: 'array', description: 'MCP tools for the application with Zod schemas', required: true, order: 6 },
          { key: 'workflows', type: 'array', description: 'Complex workflows using Mastra patterns', required: false, order: 7 },
          { key: 'views', type: 'array', description: 'Frontend routes with SVG layout examples', required: true, order: 8 },
          { key: 'implementationPhases', type: 'array', description: 'Implementation phases with realistic timelines', required: true, order: 9 },
          { key: 'successMetrics', type: 'array', description: 'Measurable success criteria for the project', required: true, order: 10 },
        ];
        
        for (const field of expansionFields) {
          await db.insert(schemaFields).values({
            id: uuidv4(),
            configId: expansionConfigId,
            key: field.key,
            type: field.type as any,
            description: field.description,
            required: field.required,
            parentField: null,
            order: field.order,
          });
        }
        
        // Create external tools schema config
        const externalConfigId = uuidv4();
        await db.insert(schemaConfigs).values({
          id: externalConfigId,
          name: 'external_tools_schema',
          description: 'Schema for suggesting external tools and integrations',
        });
        
        await db.insert(schemaFields).values({
          id: uuidv4(),
          configId: externalConfigId,
          key: 'toolsFromOtherApps',
          type: 'array',
          description: 'External tools and integrations that would enhance this application',
          required: true,
          parentField: null,
          order: 1,
        });
        
        return {
          success: true,
          message: "Default schema configurations created successfully",
        };
      } catch (error) {
        console.error("Failed to initialize default schemas:", error);
        throw new Error("Failed to initialize default schemas");
      }
    },
  });

export const createGetSectionSchemaTool = (env: Env) =>
  createTool({
    id: "GET_SECTION_SCHEMA",
    description: "Get the current schema/prompt for a specific section",
    inputSchema: z.object({
      sectionKey: z.string(), // e.g. 'features', 'tools', 'architecture'
    }),
    outputSchema: z.object({
      sectionKey: z.string(),
      description: z.string(),
      currentSchema: z.any(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      try {
        // Map section keys to their schema descriptions
        const sectionSchemas: Record<string, any> = {
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
        };

        const schema = sectionSchemas[context.sectionKey];
        if (!schema) {
          throw new Error(`Unknown section key: ${context.sectionKey}`);
        }

        return {
          sectionKey: context.sectionKey,
          description: schema.description,
          currentSchema: schema,
          success: true,
        };
      } catch (error) {
        console.error("Failed to get section schema:", error);
        throw new Error("Failed to get section schema");
      }
    },
  });

export const createReExpandSectionTool = (env: Env) =>
  createTool({
    id: "RE_EXPAND_SECTION",
    description: "Re-expand a specific section of an idea with optional custom prompt",
    inputSchema: z.object({
      ideaId: z.string(),
      sectionKey: z.string(),
      customPrompt: z.string().optional(), // Optional custom prompt modification
      originalPrompt: z.string(), // Original idea prompt for context
    }),
    outputSchema: z.object({
      sectionKey: z.string(),
      newData: z.any(),
      previousData: z.any(),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Get current idea data
        const existingIdea = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.ideaId))
          .limit(1);

        if (existingIdea.length === 0) {
          throw new Error("Idea not found");
        }

        const currentData = existingIdea[0].expandedData;
        const previousSectionData = currentData?.[context.sectionKey];

        // Get section schema
        const sectionSchemaResult = await createGetSectionSchemaTool(env).execute({
          context: { sectionKey: context.sectionKey },
          runtimeContext: new Map(),
        });

        const sectionSchema = sectionSchemaResult.currentSchema;
        let promptDescription = sectionSchemaResult.description;

        // If custom prompt provided, use it instead
        if (context.customPrompt) {
          promptDescription = context.customPrompt;
        }

        // Create AI prompt for this specific section
        const prompt = `You are an expert software architect and product manager specializing in the Deco MCP platform.

Your task is to generate ONLY the "${context.sectionKey}" section for this software idea:

Original Idea: "${context.originalPrompt}"

Current Context: ${JSON.stringify(currentData, null, 2)}

Section Requirements: ${promptDescription}

Generate ONLY the ${context.sectionKey} data that matches this exact schema structure. Do not include any other sections or wrapper objects.`;

        // Use AI to generate the new section data
        const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
          messages: [{
            role: 'user',
            content: prompt
          }],
          schema: sectionSchema
        });

        if (!result.object) {
          throw new Error("AI did not return section data");
        }

        const newSectionData = result.object;

        return {
          sectionKey: context.sectionKey,
          newData: newSectionData,
          previousData: previousSectionData,
          success: true,
        };
      } catch (error) {
        console.error("Failed to re-expand section:", error);
        throw new Error("Failed to re-expand section");
      }
    },
  });

export const createUpdateSectionDataTool = (env: Env) =>
  createTool({
    id: "UPDATE_SECTION_DATA",
    description: "Update a specific section of an idea with new data",
    inputSchema: z.object({
      ideaId: z.string(),
      sectionKey: z.string(),
      newData: z.any(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      updatedIdea: z.any(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      try {
        // Get current idea
        const existingIdea = await db.select()
          .from(ideas)
          .where(eq(ideas.id, context.ideaId))
          .limit(1);

        if (existingIdea.length === 0) {
          throw new Error("Idea not found");
        }

        const currentData = existingIdea[0].expandedData || {};
        
        // Update the specific section
        const updatedData = {
          ...currentData,
          [context.sectionKey]: context.newData
        };

        // Save to database
        const updated = await db.update(ideas)
          .set({ 
            expandedData: updatedData,
            updatedAt: new Date()
          })
          .where(eq(ideas.id, context.ideaId))
          .returning();

        return {
          success: true,
          updatedIdea: updated[0],
        };
      } catch (error) {
        console.error("Failed to update section data:", error);
        throw new Error("Failed to update section data");
      }
    },
  });

export const createGetEvaluationCriteriaTool = (env: Env) =>
  createTool({
    id: "GET_EVALUATION_CRITERIA",
    description: "Get current evaluation criteria configuration",
    inputSchema: z.object({}),
    outputSchema: z.object({
      criteria: z.array(z.object({
        key: z.string(),
        title: z.string(),
        description: z.string(),
        prompt: z.string(),
      })),
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      try {
        // For now, return the current hardcoded criteria
        // TODO: Make this configurable via database
        const criteria = [
          {
            key: "ambiguityAvoidance",
            title: "Ambiguity Avoidance",
            description: "How clear and well-defined is the concept?",
            prompt: "How clear and well-defined is the concept? Are there any vague or unclear aspects? Score 1-10."
          },
          {
            key: "interestLevel",
            title: "Interest Level", 
            description: "How interesting and engaging is this idea?",
            prompt: "How interesting and engaging is this idea? Would it capture people's attention? Score 1-10."
          },
          {
            key: "marketPotential2025",
            title: "Market Potential 2025",
            description: "What is the market potential for this idea in 2025?",
            prompt: "What is the market potential for this idea in 2025? Consider current trends and future projections. Score 1-10."
          },
          {
            key: "technicalFeasibility",
            title: "Technical Feasibility",
            description: "How technically feasible is this project?",
            prompt: "How technically feasible is this project with current technology and the specified stack? Score 1-10."
          },
          {
            key: "innovationLevel",
            title: "Innovation Level",
            description: "How innovative and novel is this idea?",
            prompt: "How innovative and novel is this idea? Does it bring something new to the market? Score 1-10."
          },
          {
            key: "userValueProposition",
            title: "User Value Proposition",
            description: "How much value would this provide to end users?",
            prompt: "How much value would this provide to end users? Would they pay for it or use it regularly? Score 1-10."
          }
        ];

        return {
          criteria,
          success: true,
        };
      } catch (error) {
        console.error("Failed to get evaluation criteria:", error);
        throw new Error("Failed to get evaluation criteria");
      }
    },
  });

export const createUpdateEvaluationCriteriaTool = (env: Env) =>
  createTool({
    id: "UPDATE_EVALUATION_CRITERIA",
    description: "Update evaluation criteria configuration",
    inputSchema: z.object({
      criteria: z.array(z.object({
        key: z.string(),
        title: z.string(),
        description: z.string(),
        prompt: z.string(),
      })),
    }),
    outputSchema: z.object({
      success: z.boolean(),
    }),
    execute: async ({ context }) => {
      try {
        // For now, just return success
        // TODO: Save to database when we implement full configurability
        console.log("Evaluation criteria update requested:", context.criteria);
        
        return {
          success: true,
        };
      } catch (error) {
        console.error("Failed to update evaluation criteria:", error);
        throw new Error("Failed to update evaluation criteria");
      }
    },
  });

// Export all admin-related tools
export const adminTools = [
  createGetSchemaConfigsTool,
  createGetSchemaFieldsTool,
  createCreateSchemaConfigTool,
  createUpdateSchemaFieldTool,
  createCreateSchemaFieldTool,
  createInitializeDefaultSchemasTool,
  createGetSectionSchemaTool,
  createReExpandSectionTool,
  createUpdateSectionDataTool,
  createGetEvaluationCriteriaTool,
  createUpdateEvaluationCriteriaTool,
];