/**
 * Database schema for Pronto - AI-powered idea expansion platform
 *
 * After making changes to this file, run `npm run db:generate` to generate the migration file.
 * Then, by just using the app, the migration is lazily ensured at runtime.
 */
import { integer, sqliteTable, text, real } from "@deco/workers-runtime/drizzle";
import { sql } from "drizzle-orm";

// Types for expanded data structures
export interface ExpandedIdea {
  title: string;
  description: string;
  features: Feature[];
  architecture: Architecture;
  dataModels: Entity[];
  tools: Tool[];
  toolsFromOtherApps: ExternalTool[];
  workflows: Workflow[];
  views: View[];
  implementationPhases: Phase[];
  successMetrics: string[];
}

export interface Feature {
  title: string;
  description: string;
}

export interface Architecture {
  files: ArchitectureFile[];
}

export interface ArchitectureFile {
  path: string;
  description: string;
}

export interface Entity {
  title: string;
  schema: string; // Drizzle schema as string
}

export interface Tool {
  title: string;
  description: string;
  inputSchema: string; // Zod schema as string
  outputSchema: string; // Zod schema as string
}

export interface ExternalTool {
  service: string; // Gmail, Discord, GitHub, etc.
  toolName: string;
  description: string;
  useCase: string;
}

export interface Workflow {
  title: string;
  description: string;
  trigger: string;
}

export interface View {
  title: string;
  pathTemplate: string;
  description: string;
  layoutExample: string; // SVG as string
}

export interface Phase {
  title: string;
  description: string;
  duration: string;
  tasks: string[];
}

export interface EvaluationCriteria {
  ambiguityAvoidance: {
    score: number; // 1-10
    feedback: string;
  };
  interestLevel: {
    score: number; // 1-10
    feedback: string;
  };
  marketPotential2025: {
    score: number; // 1-10
    feedback: string;
  };
  technicalFeasibility: {
    score: number; // 1-10
    feedback: string;
  };
  innovationLevel: {
    score: number; // 1-10
    feedback: string;
  };
  userValueProposition: {
    score: number; // 1-10
    feedback: string;
  };
}

// Database tables
export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  originalPrompt: text('original_prompt').notNull(),
  expandedData: text('expanded_data', { mode: 'json' }).$type<ExpandedIdea>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const evaluations = sqliteTable('evaluations', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id),
  criteria: text('criteria', { mode: 'json' }).$type<EvaluationCriteria>().notNull(),
  overallScore: real('overall_score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const exports = sqliteTable('exports', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id),
  format: text('format', { enum: ['prompt', 'markdown'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Schema configuration for managing AI prompt schema
export interface SchemaField {
  key: string; // e.g. 'title', 'features', 'architecture.files'
  type: 'string' | 'array' | 'object';
  description: string; // The important prompt description for AI
  required: boolean;
  parentField?: string; // For nested fields like 'architecture.files' has parent 'architecture'
}

export const schemaConfigs = sqliteTable('schema_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. 'expansion_schema', 'external_tools_schema'
  description: text('description').notNull(), // Human description of what this schema is for
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const schemaFields = sqliteTable('schema_fields', {
  id: text('id').primaryKey(),
  configId: text('config_id').notNull().references(() => schemaConfigs.id),
  key: text('key').notNull(), // The field key like 'title', 'features', etc.
  type: text('type', { enum: ['string', 'array', 'object'] }).notNull(),
  description: text('description').notNull(), // The AI prompt description
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  parentField: text('parent_field'), // For nested fields
  order: integer('order').notNull().default(0), // For ordering fields in UI
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
