/**
 * Centralized schema definitions for AI-powered idea expansion.
 * 
 * This file contains all schema configurations used throughout the application
 * for generating structured data with AI. Each schema includes rich descriptions
 * that provide context to the AI about what should be generated.
 * 
 * Key principles:
 * - Every schema property must have a descriptive 'description' field
 * - Descriptions should guide the AI on what to generate and how
 * - Schemas can be overridden at runtime for editing purposes
 * - This serves as the single source of truth for all AI generation schemas
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
  description: "Complete expansion schema for transforming simple software ideas into comprehensive, detailed development plans following Deco MCP platform patterns and best practices",
  
  sections: {
    title: {
      description: "A clear, compelling title for the software idea that immediately conveys its purpose and value. Should be concise but descriptive. Example: 'Sistema de Pesquisa Eleitoral' or 'Workshop Management System'",
      type: "string"
    },

    description: {
      description: "Detailed description of what the software does, its main purpose, and how it solves user problems. Should explain the core functionality and user benefits clearly. Example: 'Uma aplicação para simular comportamento eleitoral através da criação de perfis demográficos e aplicação de questionários com respostas geradas por IA.'",
      type: "string"
    },

    features: {
      description: "Main features of the application with clear titles and detailed descriptions that explain user value and functionality. Each feature should be substantial and meaningful to users.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Feature name that clearly identifies what this feature does for users. Should be action-oriented and specific."
          },
          description: {
            type: "string",
            description: "Detailed explanation of the feature's functionality, user benefit, and how it works. Should explain both what it does and why users need it."
          }
        },
        required: ["title", "description"]
      }
    },

    architecture: {
      description: "Project file structure following Deco MCP template patterns, showing the organization of server tools, workflows, frontend components, and database schemas",
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File path relative to project root, following Deco MCP conventions (e.g., 'server/tools/user.ts', 'view/src/routes/dashboard.tsx')"
              },
              description: {
                type: "string",
                description: "Clear explanation of what this file contains and its role in the application architecture"
              }
            },
            required: ["path", "description"]
          }
        }
      }
    },

    dataModels: {
      description: "Database entities with Drizzle ORM schemas that represent the core data structures needed for the application. Should cover all main entities and their relationships.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Name of the database entity/table (e.g., 'Users', 'Orders', 'Products')"
          },
          schema: {
            type: "string",
            description: "Complete Drizzle ORM schema definition as TypeScript code, including all fields, types, relationships, and constraints"
          }
        },
        required: ["title", "schema"]
      }
    },

    tools: {
      description: "MCP tools for the application with Zod schemas that define the core business logic operations. Each tool should represent a specific action users can perform.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Tool name that clearly describes the operation (e.g., 'Create User Account', 'Process Payment', 'Generate Report')"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what the tool does, when it's used, and what business logic it implements"
          },
          inputSchema: {
            type: "string",
            description: "Complete Zod schema definition for the tool's input parameters as TypeScript code"
          },
          outputSchema: {
            type: "string",
            description: "Complete Zod schema definition for the tool's output/return value as TypeScript code"
          }
        },
        required: ["title", "description", "inputSchema", "outputSchema"]
      }
    },

    toolsFromOtherApps: {
      description: "External tools and integrations that would enhance this specific application, focusing on genuine value-add services that solve real user problems. Should be relevant to the application's domain and user needs.",
      type: "array",
      items: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "The service name (e.g., 'GitHub', 'Slack', 'Stripe', 'Twilio', 'SendGrid')"
          },
          toolName: {
            type: "string",
            description: "The specific API or tool name within the service (e.g., 'GitHub API', 'Slack Bot API', 'Stripe Payments')"
          },
          description: {
            type: "string",
            description: "What the tool does and its main capabilities, focusing on the specific features that would be used"
          },
          useCase: {
            type: "string",
            description: "How it would be used specifically in this application context to solve user problems or enhance functionality. Should be concrete and actionable."
          }
        },
        required: ["service", "toolName", "description", "useCase"]
      }
    },

    workflows: {
      description: "Complex workflows using Mastra patterns that orchestrate multiple tools to complete business processes. Should represent multi-step operations that provide significant user value.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Workflow name that describes the complete process (e.g., 'User Onboarding Flow', 'Order Processing Pipeline')"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what the workflow accomplishes and the business process it automates"
          },
          trigger: {
            type: "string",
            description: "What event or condition starts this workflow (e.g., 'User registration', 'Payment received', 'Daily at 9 AM')"
          }
        },
        required: ["title", "description", "trigger"]
      }
    },

    views: {
      description: "Frontend routes with SVG layout examples that show the user interface structure and navigation flow. Should cover all main user journeys and interface patterns.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Page/view name that describes its purpose (e.g., 'User Dashboard', 'Product Catalog', 'Checkout Flow')"
          },
          pathTemplate: {
            type: "string",
            description: "React Router path template (e.g., '/dashboard', '/products/:id', '/users/:userId/profile')"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what this view shows, what users can do on it, and how it fits into the user journey"
          },
          layoutExample: {
            type: "string",
            description: "SVG code showing the visual layout and key UI components of this view, including navigation, content areas, and interactive elements"
          }
        },
        required: ["title", "pathTemplate", "description", "layoutExample"]
      }
    },

    implementationPhases: {
      description: "Implementation phases with realistic timelines that break down the development process into manageable chunks. Should be ordered by priority and dependencies.",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Phase name that clearly indicates what will be built (e.g., 'Core Authentication System', 'Payment Processing', 'Advanced Analytics')"
          },
          description: {
            type: "string",
            description: "Detailed explanation of what will be accomplished in this phase and why it's important for the overall project"
          },
          duration: {
            type: "string",
            description: "Realistic time estimate for completing this phase (e.g., '2-3 weeks', '1 month', '6-8 weeks')"
          },
          tasks: {
            type: "array",
            items: {
              type: "string",
              description: "Specific, actionable tasks that need to be completed in this phase"
            },
            description: "List of concrete tasks and deliverables for this implementation phase"
          }
        },
        required: ["title", "description", "duration", "tasks"]
      }
    },

    successMetrics: {
      description: "Measurable success criteria for the project that define what success looks like. Should include both technical metrics (performance, reliability) and business metrics (user engagement, revenue, efficiency gains).",
      type: "array",
      items: {
        type: "string",
        description: "Specific, measurable metric that can be tracked to determine project success"
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
  return `Based on this expanded software idea, suggest 3-5 relevant external tools and integrations that would enhance the application:

${JSON.stringify(expandedIdea, null, 2)}

${schema.description}

For each suggested tool, provide:
- service: ${schema.items.properties.service.description}
- toolName: ${schema.items.properties.toolName.description}  
- description: ${schema.items.properties.description.description}
- useCase: ${schema.items.properties.useCase.description}

Focus on tools that would genuinely add value to this particular idea.`;
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

Your task is to transform this simple software idea into a comprehensive, detailed development plan:

"${originalPrompt}"

Create a complete plan that follows Deco MCP platform patterns and best practices.`;
}
