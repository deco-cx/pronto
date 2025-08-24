# Pronto - Prompts with Purpose
## Planning Document

### 🎯 Overview

**Pronto** is an AI-powered application that transforms simple software ideas into comprehensive, structured development plans. Users input a basic concept (like "I want to analyze my emails and find important ones") and receive a detailed, actionable blueprint for building their software.

### 🔄 Core Flow

1. **Input**: User enters a simple idea description in a ChatGPT-style textarea
2. **Expand**: AI generates a comprehensive structured plan using `AI_GENERATE_OBJECT`
3. **Edit**: Interactive editing interface with AI assistance for each section
4. **Evaluate**: AI-powered evaluation of the idea across multiple criteria
5. **Export**: Generate a textual prompt from the structured data

---

## 🏗️ System Architecture

### Project Structure
```
pronto/
├── server/                 # MCP Server (Cloudflare Workers + Deco)
│   ├── main.ts            # Entry point principal
│   ├── deco.gen.ts        # Tipos gerados das integrações
│   ├── schema.ts          # Schemas de dados (Drizzle ORM)
│   ├── db.ts              # Configuração do banco
│   ├── tools/             # Ferramentas organizadas por domínio
│   │   ├── index.ts       # Export central
│   │   ├── ideas.ts       # Gestão de ideias
│   │   ├── expansion.ts   # Expansão com IA
│   │   ├── evaluation.ts  # Avaliação de ideias
│   │   └── export.ts      # Exportação de prompts
│   ├── workflows/         # Workflows complexos
│   │   ├── index.ts       # Export central
│   │   └── expansion.ts   # Workflow de expansão completa
│   ├── drizzle/          # Migrações do banco
│   └── wrangler.toml     # Config Cloudflare
└── view/                 # Frontend React + Tailwind
    ├── src/
    │   ├── routes/       # Rotas da aplicação
    │   │   ├── home.tsx  # Página inicial com textarea
    │   │   ├── expand.tsx # Resultado da expansão
    │   │   ├── edit.tsx   # Interface de edição
    │   │   └── history.tsx # Histórico de ideias
    │   ├── components/   # Componentes reutilizáveis
    │   │   ├── idea-input.tsx      # Textarea principal
    │   │   ├── expansion-display.tsx # Display da expansão
    │   │   ├── section-editor.tsx   # Editor de seções
    │   │   ├── route-card.tsx      # Card de rota com SVG
    │   │   ├── tool-list.tsx       # Lista de tools
    │   │   ├── evaluation-panel.tsx # Painel de avaliação
    │   │   └── export-modal.tsx    # Modal de exportação
    │   ├── lib/         # RPC client e utilitários
    │   └── hooks/       # Custom hooks
    └── package.json
```

---

## 🗄️ Data Models

### 1. Idea (Ideia)
```typescript
interface Idea {
  id: string;
  originalPrompt: string;
  expandedData: ExpandedIdea;
  evaluations?: Evaluation[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. ExpandedIdea (Ideia Expandida)
```typescript
interface ExpandedIdea {
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

interface Feature {
  title: string;
  description: string;
}

interface Architecture {
  files: ArchitectureFile[];
}

interface ArchitectureFile {
  path: string;
  description: string;
}

interface Entity {
  title: string;
  schema: string; // Drizzle schema as string
}

interface Tool {
  title: string;
  description: string;
  inputSchema: string; // Zod schema as string
  outputSchema: string; // Zod schema as string
}

interface ExternalTool {
  service: string; // Gmail, Discord, GitHub, etc.
  toolName: string;
  description: string;
  useCase: string;
}

interface Workflow {
  title: string;
  description: string;
  trigger: string;
}

interface View {
  title: string;
  pathTemplate: string;
  description: string;
  layoutExample: string; // SVG as string
}

interface Phase {
  title: string;
  description: string;
  duration: string;
  tasks: string[];
}
```

### 3. Evaluation (Avaliação)
```typescript
interface Evaluation {
  id: string;
  ideaId: string;
  criteria: EvaluationCriteria;
  overallScore: number;
  createdAt: Date;
}

interface EvaluationCriteria {
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
```

---

## 🛠️ Tools (Ferramentas)

### ideas.ts
```typescript
// Gestão de ideias
export const createIdea = createTool({
  id: "CREATE_IDEA",
  description: "Create a new idea from user input",
  inputSchema: z.object({
    originalPrompt: z.string().min(10).max(1000),
  }),
  outputSchema: z.object({
    id: z.string(),
    success: z.boolean(),
  }),
});

export const getIdea = createTool({
  id: "GET_IDEA",
  description: "Get an idea by ID",
  inputSchema: z.object({
    id: z.string(),
  }),
  outputSchema: z.object({
    idea: z.any(), // Idea interface
  }),
});

export const listIdeas = createTool({
  id: "LIST_IDEAS",
  description: "List all user ideas with pagination",
  inputSchema: z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
  }),
  outputSchema: z.object({
    ideas: z.array(z.any()),
    total: z.number(),
  }),
});

export const deleteIdea = createTool({
  id: "DELETE_IDEA",
  description: "Delete an idea by ID",
  inputSchema: z.object({
    id: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
});
```

### expansion.ts
```typescript
// Expansão com IA
export const expandIdea = createTool({
  id: "EXPAND_IDEA",
  description: "Expand a simple idea into a comprehensive plan using AI",
  inputSchema: z.object({
    originalPrompt: z.string(),
    ideaId: z.string(),
  }),
  outputSchema: z.object({
    expandedData: z.any(), // ExpandedIdea interface
    success: z.boolean(),
  }),
});

export const editSection = createTool({
  id: "EDIT_SECTION",
  description: "Edit a specific section of an expanded idea using AI",
  inputSchema: z.object({
    ideaId: z.string(),
    section: z.enum(['title', 'description', 'features', 'architecture', 'dataModels', 'tools', 'workflows', 'views', 'phases']),
    editPrompt: z.string(),
    currentData: z.any(),
  }),
  outputSchema: z.object({
    updatedSection: z.any(),
    success: z.boolean(),
  }),
});

export const suggestExternalTools = createTool({
  id: "SUGGEST_EXTERNAL_TOOLS",
  description: "Suggest external tools/integrations based on the idea",
  inputSchema: z.object({
    expandedIdea: z.any(),
  }),
  outputSchema: z.object({
    externalTools: z.array(z.object({
      service: z.string(),
      toolName: z.string(),
      description: z.string(),
      useCase: z.string(),
    })),
  }),
});
```

### evaluation.ts
```typescript
// Avaliação de ideias
export const evaluateIdea = createTool({
  id: "EVALUATE_IDEA",
  description: "Evaluate an idea across multiple criteria using AI",
  inputSchema: z.object({
    ideaId: z.string(),
    expandedData: z.any(),
  }),
  outputSchema: z.object({
    evaluation: z.any(), // Evaluation interface
    success: z.boolean(),
  }),
});

export const getEvaluation = createTool({
  id: "GET_EVALUATION",
  description: "Get evaluation for an idea",
  inputSchema: z.object({
    ideaId: z.string(),
  }),
  outputSchema: z.object({
    evaluation: z.any(),
  }),
});
```

### export.ts
```typescript
// Exportação de prompts
export const exportPrompt = createTool({
  id: "EXPORT_PROMPT",
  description: "Export expanded idea as a textual prompt",
  inputSchema: z.object({
    ideaId: z.string(),
  }),
  outputSchema: z.object({
    prompt: z.string(),
    success: z.boolean(),
  }),
});

export const generateMarkdown = createTool({
  id: "GENERATE_MARKDOWN",
  description: "Generate markdown documentation from expanded idea",
  inputSchema: z.object({
    ideaId: z.string(),
  }),
  outputSchema: z.object({
    markdown: z.string(),
    success: z.boolean(),
  }),
});
```

---

## 🔄 Workflows

### expansion.ts
```typescript
// Workflow completo de expansão
export const completeExpansionWorkflow = createWorkflow({
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
  .then(expandIdeaStep)
  .map(async ({ inputData, getStepResult }) => ({
    ...inputData,
    expandedData: getStepResult(expandIdeaStep).expandedData,
  }))
  .then(suggestExternalToolsStep)
  .map(async ({ inputData, getStepResult }) => ({
    expandedIdea: getStepResult(expandIdeaStep).expandedData,
    externalTools: getStepResult(suggestExternalToolsStep).externalTools,
    success: true,
  }))
  .commit();
```

---

## 🎨 Frontend Views

### 1. Home Page (home.tsx)
- **Rota**: `/`
- **Funcionalidade**: Página inicial com textarea para input da ideia
- **Componentes**:
  - Hero section com explicação
  - Textarea grande estilo ChatGPT
  - Botão "Expand" proeminente
  - Exemplos de ideias
  - Histórico recente (se houver)

### 2. Expansion Result (expand.tsx)
- **Rota**: `/expand/:id`
- **Funcionalidade**: Exibe o resultado da expansão
- **Componentes**:
  - Título e descrição expandidos
  - Seções organizadas (Features, Architecture, etc.)
  - Botões de edição para cada seção
  - Botão de avaliação
  - Botão de exportação

### 3. Edit Interface (edit.tsx)
- **Rota**: `/edit/:id`
- **Funcionalidade**: Interface completa de edição
- **Componentes**:
  - Sidebar com navegação entre seções
  - Editor principal com preview
  - Modais de edição com IA
  - Save/discard changes

### 4. History (history.tsx)
- **Rota**: `/history`
- **Funcionalidade**: Lista todas as ideias do usuário
- **Componentes**:
  - Grid de cards com ideias
  - Filtros e busca
  - Ações: view, edit, delete, duplicate

---

## 🤖 AI Integration Schemas

### Expansion Schema
```typescript
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
    workflows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          trigger: { type: 'string' }
        },
        required: ['title', 'description', 'trigger']
      },
      description: 'Complex workflows using Mastra patterns'
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
```

### External Tools Schema
```typescript
const externalToolsSchema = {
  type: 'object',
  properties: {
    externalTools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            enum: ['Gmail', 'Discord', 'GitHub', 'WhatsApp', 'Slack', 'Notion', 'Google Sheets', 'Stripe', 'Twilio', 'SendGrid', 'Zapier', 'Airtable', 'Calendly', 'Zoom', 'Google Drive', 'Dropbox', 'Trello', 'Asana', 'Jira', 'Linear'],
            description: 'Available external service integrations'
          },
          toolName: {
            type: 'string',
            description: 'Specific tool/API endpoint name'
          },
          description: {
            type: 'string',
            description: 'What this tool does'
          },
          useCase: {
            type: 'string',
            description: 'How it would be used in this specific application'
          }
        },
        required: ['service', 'toolName', 'description', 'useCase']
      },
      description: 'External tools and integrations that would enhance this application'
    }
  },
  required: ['externalTools']
};
```

### Evaluation Schema
```typescript
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
    },
    overallScore: {
      type: 'number',
      minimum: 1,
      maximum: 10,
      description: 'Average of all criteria scores'
    }
  },
  required: ['ambiguityAvoidance', 'interestLevel', 'marketPotential2025', 'technicalFeasibility', 'innovationLevel', 'userValueProposition', 'overallScore']
};
```

---

## 🗃️ Database Schema

```typescript
// server/schema.ts
export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  originalPrompt: text('original_prompt').notNull(),
  expandedData: text('expanded_data', { mode: 'json' }).$type<ExpandedIdea>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const evaluations = sqliteTable('evaluations', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id),
  criteria: text('criteria', { mode: 'json' }).$type<EvaluationCriteria>().notNull(),
  overallScore: real('overall_score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const exports = sqliteTable('exports', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id),
  format: text('format', { enum: ['prompt', 'markdown'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

---

## 🎨 Component Specifications

### IdeaInput Component
```typescript
interface IdeaInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

// Features:
// - Auto-resize textarea
// - Character counter
// - Example suggestions
// - Loading state with spinner
// - Keyboard shortcuts (Ctrl+Enter to submit)
```

### ExpansionDisplay Component
```typescript
interface ExpansionDisplayProps {
  idea: Idea;
  onEditSection: (section: string) => void;
  onEvaluate: () => void;
  onExport: () => void;
}

// Features:
// - Collapsible sections
// - Edit buttons for each section
// - Progress indicator
// - Copy to clipboard functionality
```

### SectionEditor Component
```typescript
interface SectionEditorProps {
  section: string;
  currentData: any;
  onSave: (updatedData: any) => void;
  onCancel: () => void;
}

// Features:
// - Modal interface
// - AI-powered editing
// - Preview mode
// - Undo/redo functionality
```

### RouteCard Component
```typescript
interface RouteCardProps {
  view: View;
  onClick: () => void;
}

// Features:
// - SVG layout rendering
// - Hover effects
// - Responsive design
// - Accessibility support
```

### EvaluationPanel Component
```typescript
interface EvaluationPanelProps {
  evaluation: Evaluation;
  onReEvaluate: () => void;
}

// Features:
// - Radar chart visualization
// - Score breakdown
// - Feedback display
// - Export evaluation report
```

---

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (3-4 days)
- [ ] Setup Deco project structure
- [ ] Database schema and migrations
- [ ] Basic RPC client setup
- [ ] Core tools (create, get, list ideas)
- [ ] Simple expansion with AI_GENERATE_OBJECT

### Phase 2: Expansion Engine (4-5 days)
- [ ] Complete expansion schema design
- [ ] AI prompt engineering for expansion
- [ ] External tools suggestion system
- [ ] Workflow for complete expansion
- [ ] Error handling and validation

### Phase 3: Frontend Foundation (3-4 days)
- [ ] Home page with idea input
- [ ] Expansion result display
- [ ] Basic routing setup
- [ ] Component library foundation
- [ ] Loading states and error handling

### Phase 4: Editing Interface (5-6 days)
- [ ] Section-by-section editing
- [ ] AI-powered edit suggestions
- [ ] Modal editing interface
- [ ] Real-time preview
- [ ] Save/discard changes

### Phase 5: Evaluation System (3-4 days)
- [ ] Evaluation criteria definition
- [ ] AI evaluation implementation
- [ ] Evaluation display interface
- [ ] Score visualization
- [ ] Evaluation history

### Phase 6: Export & Polish (2-3 days)
- [ ] Prompt export functionality
- [ ] Markdown generation
- [ ] Copy to clipboard
- [ ] History management
- [ ] Performance optimization

### Phase 7: Advanced Features (3-4 days)
- [ ] SVG layout generation for routes
- [ ] Advanced filtering and search
- [ ] Idea templates
- [ ] Sharing functionality
- [ ] Analytics and usage tracking

---

## 📊 Success Metrics

### Functional Requirements
- [ ] Successfully expand 95% of valid input prompts
- [ ] Generate comprehensive plans with all required sections
- [ ] Enable editing of any section with AI assistance
- [ ] Provide meaningful evaluations across all criteria
- [ ] Export clean, usable prompts

### Technical Requirements
- [ ] Response time < 3s for expansion
- [ ] Response time < 1s for section editing
- [ ] 99.9% uptime
- [ ] Handle concurrent users efficiently
- [ ] Secure data storage and retrieval

### User Experience
- [ ] Intuitive interface requiring no tutorial
- [ ] Clear visual feedback for all actions
- [ ] Responsive design across devices
- [ ] Accessible to users with disabilities
- [ ] Fast, smooth interactions

### Business Metrics
- [ ] User retention > 60% after first use
- [ ] Average session duration > 10 minutes
- [ ] Ideas completed (expanded + evaluated) > 80%
- [ ] User satisfaction score > 4.5/5
- [ ] Organic sharing rate > 15%

---

## 🔧 Technical Considerations

### AI Prompt Engineering
- Use few-shot learning with high-quality examples
- Implement prompt versioning for A/B testing
- Add context about Deco platform patterns
- Include validation prompts for quality control

### Performance Optimization
- Cache common expansion patterns
- Implement progressive loading for large results
- Use optimistic updates for better UX
- Lazy load non-critical sections

### Error Handling
- Graceful degradation when AI fails
- Retry mechanisms with exponential backoff
- Clear error messages for users
- Fallback to template-based expansion

### Security & Privacy
- Sanitize all user inputs
- Encrypt sensitive data at rest
- Implement rate limiting
- GDPR compliance for data handling

---

## 🎯 Key Differentiators

1. **Deco-Specific**: Tailored for Deco MCP platform patterns
2. **Comprehensive**: Goes beyond simple idea to full implementation plan
3. **Interactive**: AI-powered editing for every section
4. **Visual**: SVG layout examples for routes
5. **Evaluative**: Multi-criteria assessment of ideas
6. **Exportable**: Clean prompt generation for further use

This planning document provides a comprehensive roadmap for building Pronto. The system leverages AI to transform simple ideas into detailed, actionable development plans while maintaining focus on the Deco platform's specific patterns and capabilities.
