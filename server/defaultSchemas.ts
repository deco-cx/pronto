/**
 * Centralized schema definitions for AI-powered idea expansion in Deco MCP applications.
 * 
 * This file contains all schema configurations used throughout the application
 * for generating structured data with AI. Each schema includes rich descriptions
 * that provide context to the AI about what should be generated specifically
 * for Deco MCP platform applications.
 * 
 * Key principles:
 * - Every schema property must have a descriptive 'description' field
 * - Descriptions should guide the AI on what to generate and how
 * - Schemas can be overridden at runtime for editing purposes
 * - This serves as the single source of truth for all AI generation schemas
 * - All examples and patterns are specific to Deco MCP platform architecture
 */

export interface SchemaSection {
  description: string;
  type: string;
  items?: any;
  properties?: any;
  required?: string[];
}

export interface DefaultSchemas {
  description: string;
  sections: Record<string, SchemaSection>;
}

export const defaultSchemas: DefaultSchemas = {
  description: "Complete expansion schema for transforming simple software ideas into comprehensive, detailed Deco MCP application development plans following platform patterns, best practices, and architectural conventions",
  
  sections: {
    title: {
      description: "A clear, compelling title for the Deco MCP application that immediately conveys its purpose and value. Should be concise but descriptive, following naming conventions for MCP servers. Examples: 'Task Management MCP', 'E-commerce Analytics Platform', 'Content Generation Hub'",
      type: "string"
    },

    description: {
      description: "Detailed description of what the Deco MCP application does, its main purpose, and how it solves user problems. Should explain the core functionality, user benefits, and how it leverages the Deco platform's capabilities (AI, workflows, integrations). Example: 'A comprehensive task management MCP application that uses AI to automatically categorize and prioritize tasks, integrates with external services like GitHub and Slack, and provides intelligent workflow automation for development teams.'",
      type: "string"
    },

    features: {
      description: "Main features of the Deco MCP application with clear titles and detailed descriptions that explain user value and functionality. Each feature should leverage Deco platform capabilities like AI generation, workflows, integrations, or database operations. Focus on features that are substantial and meaningful to users.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Feature name that clearly identifies what this feature does for users. Should be action-oriented and specific. Examples: 'AI-Powered Task Categorization', 'Real-time Slack Integration', 'Automated Workflow Triggers'"
          },
          description: {
            type: "string",
            description: "Detailed explanation of the feature's functionality, user benefit, and how it leverages Deco platform capabilities (AI, workflows, integrations, database). Should explain both what it does and why users need it. Include technical implementation details when relevant."
          }
        },
        required: ["title", "description"]
      }
    },

    architecture: {
      description: "Complete project file structure following Deco MCP template patterns and conventions. Should show the organization of server tools, workflows, frontend components, database schemas, and configuration files. Use the exact structure from successful Deco MCP applications.",
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root, following Deco MCP conventions. Examples: 'server/main.ts' (main entry point), 'server/tools/index.ts' (tool aggregation), 'server/tools/[domain].ts' (domain-specific tools), 'server/workflows/[workflow].ts' (workflow definitions), 'server/schema.ts' (Drizzle database schema), 'server/db.ts' (database utilities), 'view/src/main.tsx' (React app entry), 'view/src/routes/[route].tsx' (TanStack Router routes), 'view/src/hooks/use[Feature].ts' (TanStack Query hooks), 'view/src/components/[component].tsx' (UI components), 'wrangler.toml' (Cloudflare Workers config), 'package.json' (dependencies)"
              },
              description: {
                type: "string",
                description: "Clear explanation of what this file contains and its role in the Deco MCP application architecture. Include specific details about imports, exports, and key functionality."
              }
            },
            required: ["path", "description"]
          }
        }
      }
    },

    dataModels: {
      description: "Database entities with Drizzle ORM schemas that represent the core data structures needed for the Deco MCP application. Should cover all main entities, their relationships, and follow Deco platform patterns. Use SQLite with Cloudflare Durable Objects for persistence.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Name of the database entity/table following Drizzle conventions. Examples: 'users', 'tasks', 'projects', 'integrations', 'workflows'"
          },
          schema: {
            type: "string",
            description: "Complete Drizzle ORM schema definition as TypeScript code using SQLite syntax. Must include proper imports from '@deco/workers-runtime/drizzle', field types (text, integer, real), constraints, relationships, and default values. Example: 'export const tasks = sqliteTable(\"tasks\", { id: text(\"id\").primaryKey(), title: text(\"title\").notNull(), completed: integer(\"completed\", { mode: \"boolean\" }).default(false), createdAt: integer(\"created_at\", { mode: \"timestamp\" }).default(sql`(unixepoch())`) });'"
          }
        },
        required: ["title", "schema"]
      }
    },

    tools: {
      description: "MCP tools for the Deco application with Zod schemas that define the core business logic operations. Each tool should represent a specific action users can perform and follow Deco MCP patterns. Tools should be organized by domain and use proper database operations with getDb(env).",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Tool name that clearly describes the operation following Deco conventions. Examples: 'CREATE_TASK', 'UPDATE_USER_PROFILE', 'GENERATE_REPORT', 'SYNC_INTEGRATION_DATA'"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what the tool does, when it's used, what business logic it implements, and how it interacts with the database or external integrations. Include error handling and validation details."
          },
          inputSchema: {
            type: "string",
            description: "Complete Zod schema definition for the tool's input parameters as TypeScript code. Example: 'z.object({ title: z.string().min(1), description: z.string().optional(), priority: z.enum([\"low\", \"medium\", \"high\"]).default(\"medium\") })'"
          },
          outputSchema: {
            type: "string",
            description: "Complete Zod schema definition for the tool's output/return value as TypeScript code. Should include success indicators and relevant data. Example: 'z.object({ id: z.string(), success: z.boolean(), message: z.string().optional() })'"
          }
        },
        required: ["title", "description", "inputSchema", "outputSchema"]
      }
    },

    toolsFromOtherApps: {
      description: "External tools and integrations available through the Deco platform that would enhance this specific application. Focus on genuine value-add services that solve real user problems and are available in the Deco ecosystem. Reference actual integrations from DECO_CHAT_WORKSPACE_API and DECO_CHAT_API.",
      type: "array",
      items: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "The service name available through Deco integrations. Examples from the platform: 'Deco Chat Workspace API' (for AI_GENERATE, AI_GENERATE_OBJECT, DATABASES_RUN_SQL, FS_READ, FS_WRITE), 'Deco Chat API' (for TEAMS_CREATE, PROFILES_UPDATE, INTEGRATIONS_LIST), 'GitHub', 'Slack', 'Google Sheets', 'Notion', 'Stripe', 'Twilio', 'SendGrid'"
          },
          toolName: {
            type: "string",
            description: "The specific API tool name within the service. For Deco services, use exact names like 'AI_GENERATE_OBJECT', 'DATABASES_RUN_SQL', 'FS_WRITE', 'TEAMS_CREATE'. For external services, use descriptive names like 'GitHub Repository API', 'Slack Messaging API', 'Google Sheets API'"
          },
          description: {
            type: "string",
            description: "What the tool does and its main capabilities, focusing on the specific features that would be used. For Deco tools, reference the actual functionality from the API (e.g., 'Generate structured objects using AI models with JSON schema validation', 'Run SQL queries against workspace database', 'Upload files to workspace storage')"
          },
          useCase: {
            type: "string",
            description: "How it would be used specifically in this application context to solve user problems or enhance functionality. Should be concrete and actionable, explaining the integration flow and user benefit. Example: 'Use AI_GENERATE_OBJECT to automatically categorize user inputs and generate structured data, then store results using DATABASES_RUN_SQL for persistence and retrieval.'"
          }
        },
        required: ["service", "toolName", "description", "useCase"]
      }
    },

    workflows: {
      description: "Complex workflows using Mastra patterns that orchestrate multiple tools to complete business processes. Should represent multi-step operations that provide significant user value and follow Deco workflow conventions with proper step separation and control flow.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Workflow name that describes the complete process following Deco conventions. Examples: 'COMPLETE_USER_ONBOARDING', 'PROCESS_DATA_PIPELINE', 'AUTOMATED_CONTENT_GENERATION'"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what the workflow accomplishes, the business process it automates, and how it uses Mastra control flow operators (.then, .map, .branch, .parallel, .dountil). Include the sequence of steps and data transformations."
          },
          trigger: {
            type: "string",
            description: "What event or condition starts this workflow. Examples: 'User creates new account', 'File uploaded to storage', 'Scheduled cron job (daily at 9 AM)', 'Webhook received from external service', 'Manual trigger from UI button'"
          }
        },
        required: ["title", "description", "trigger"]
      }
    },

    views: {
      description: "Frontend routes using TanStack Router with SVG layout examples that show the user interface structure and navigation flow. Should cover all main user journeys, use Tailwind CSS styling, and integrate with TanStack Query hooks for data fetching.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Page/view name that describes its purpose following React conventions. Examples: 'Dashboard Home', 'Task Management', 'User Profile Settings', 'Integration Setup'"
          },
          pathTemplate: {
            type: "string",
            description: "TanStack Router path template following conventions. Examples: '/' (home), '/dashboard', '/tasks/:taskId', '/users/:userId/profile', '/settings/integrations'"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what this view shows, what users can do on it, how it fits into the user journey, what TanStack Query hooks it uses for data fetching, and what components it renders. Include interaction patterns and state management details."
          },
          layoutExample: {
            type: "string",
            description: "SVG code showing the visual layout and key UI components of this view using modern design patterns. Include navigation, content areas, interactive elements, loading states, and responsive design considerations. Use clean, minimal design with proper spacing and typography."
          }
        },
        required: ["title", "pathTemplate", "description", "layoutExample"]
      }
    },

    implementationPhases: {
      description: "Implementation phases with realistic timelines that break down the Deco MCP application development process into manageable chunks. Should be ordered by priority and dependencies, considering Deco platform setup, tool development, workflow creation, and frontend implementation.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Phase name that clearly indicates what will be built in the Deco MCP context. Examples: 'Core MCP Server Setup', 'Database Schema & Tools', 'AI Integration & Workflows', 'Frontend Development', 'External Integrations', 'Testing & Deployment'"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what will be accomplished in this phase, why it's important for the overall Deco MCP project, and what Deco platform features will be implemented (tools, workflows, integrations, database, frontend)."
          },
          duration: {
            type: "string",
            description: "Realistic time estimate for completing this phase considering Deco platform development patterns. Examples: '1-2 weeks' (basic setup), '2-3 weeks' (core features), '3-4 weeks' (complex integrations), '1-2 months' (full application)"
          },
          tasks: {
            type: "array",
            items: {
              type: "string",
              description: "Specific, actionable tasks that need to be completed in this phase, including Deco-specific tasks like tool creation, workflow setup, schema design, integration configuration"
            },
            description: "List of concrete tasks and deliverables for this implementation phase, organized by Deco MCP development workflow"
          }
        },
        required: ["title", "description", "duration", "tasks"]
      }
    },

    successMetrics: {
      description: "Measurable success criteria for the Deco MCP application that define what success looks like. Should include both technical metrics (performance, reliability, scalability) and business metrics (user engagement, adoption, efficiency gains). Consider Deco platform-specific metrics like tool usage, workflow execution, and integration performance.",
      type: "array",
      items: {
        type: "string",
        description: "Specific, measurable metric that can be tracked to determine Deco MCP application success. Examples: 'Tool execution time under 2 seconds', 'Workflow success rate above 95%', 'User retention rate above 80%', 'Database query performance under 100ms', 'AI generation accuracy above 90%', 'Integration uptime above 99.9%'"
      }
    }
  }
};

/**
 * Get schema for a specific section with optional overrides
 * @param sectionKey - The section to get schema for
 * @param overrides - Optional schema overrides for editing purposes
 * @returns The schema object for the section
 */
export function getSchemaForSection(sectionKey: string, overrides?: Partial<SchemaSection>): SchemaSection {
  const baseSchema = defaultSchemas.sections[sectionKey];
  if (!baseSchema) {
    throw new Error(`Unknown section key: ${sectionKey}`);
  }
  
  // Allow runtime overrides for editing
  return overrides ? { ...baseSchema, ...overrides } : baseSchema;
}

/**
 * Get the complete expansion schema with optional section overrides
 * @param sectionOverrides - Optional overrides for specific sections
 * @returns Complete schema object for AI generation
 */
export function getCompleteExpansionSchema(sectionOverrides?: Record<string, Partial<SchemaSection>>) {
  const sections = { ...defaultSchemas.sections };
  
  // Apply any section overrides
  if (sectionOverrides) {
    for (const [key, override] of Object.entries(sectionOverrides)) {
      if (sections[key]) {
        sections[key] = { ...sections[key], ...override };
      }
    }
  }
  
  return {
    type: 'object',
    properties: sections,
    required: ['title', 'description', 'features', 'architecture', 'dataModels', 'tools', 'views', 'implementationPhases', 'successMetrics']
  };
}

/**
 * Get AI prompt description for external tools generation
 * @param expandedIdea - The expanded idea context
 * @param customPrompt - Optional custom prompt override
 * @returns Formatted prompt for AI
 */
export function getExternalToolsPrompt(expandedIdea: any, customPrompt?: string): string {
  if (customPrompt) {
    return customPrompt;
  }
  
  const schema = getSchemaForSection('toolsFromOtherApps');
  return `Based on this expanded Deco MCP application idea, suggest 3-5 relevant external tools and integrations available through the Deco platform that would enhance the application:

${JSON.stringify(expandedIdea, null, 2)}

${schema.description}

Available Deco Platform Services:
- DECO_CHAT_WORKSPACE_API: AI_GENERATE, AI_GENERATE_OBJECT, DATABASES_RUN_SQL, FS_READ, FS_WRITE, AGENTS_CREATE, WORKFLOWS_START, INTEGRATIONS_LIST
- DECO_CHAT_API: TEAMS_CREATE, PROFILES_UPDATE, INTEGRATIONS_CALL_TOOL, API_KEYS_CREATE
- External Integrations: GitHub, Slack, Google Sheets, Notion, Stripe, Twilio, SendGrid (available through Deco marketplace)

For each suggested tool, provide:
- service: ${schema.items.properties.service.description}
- toolName: ${schema.items.properties.toolName.description}  
- description: ${schema.items.properties.description.description}
- useCase: ${schema.items.properties.useCase.description}

Focus on tools that would genuinely add value to this particular Deco MCP application and are available in the platform ecosystem.`;
}

/**
 * Get AI prompt description for main expansion
 * @param originalPrompt - The original user idea
 * @param customPrompt - Optional custom prompt override
 * @returns Formatted prompt for AI
 */
export function getMainExpansionPrompt(originalPrompt: string, customPrompt?: string): string {
  if (customPrompt) {
    return customPrompt;
  }
  
  return `You are an expert software architect and product manager specializing in the Deco MCP platform.

${defaultSchemas.description}

Key Deco MCP Platform Context:
- Deco MCP applications run on Cloudflare Workers with Durable Objects for persistence
- Use Drizzle ORM with SQLite for database operations via getDb(env)
- Tools are created with createTool() and organized by domain (max 300 lines per file)
- Workflows use Mastra patterns with .then, .map, .branch, .parallel, .dountil operators
- Frontend uses React + TanStack Router + TanStack Query + Tailwind CSS
- AI capabilities via DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT
- Integration ecosystem includes GitHub, Slack, Notion, Stripe, and more
- Domain-based architecture: server/tools/[domain].ts, server/workflows/[domain].ts
- Frontend hooks pattern: view/src/hooks/use[Feature].ts with TanStack Query

Your task is to transform this simple software idea into a comprehensive, detailed Deco MCP application development plan:

"${originalPrompt}"

Create a complete plan that follows Deco MCP platform patterns, architectural conventions, and best practices. Focus on leveraging platform capabilities like AI generation, workflow automation, external integrations, and modern frontend patterns.`;
}
