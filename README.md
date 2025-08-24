# Pronto - AI-Powered Idea Expansion Platform

Transform simple software ideas into comprehensive development plans with AI. Built on the Deco MCP platform with a modern React + Tailwind CSS frontend.

Pronto takes your basic concept and generates detailed, actionable blueprints including architecture, data models, tools, workflows, and implementation phases - ready to paste into your AI development tool.

## 📝 Development History

This repository uses [Specstory](https://specstory.com/) to track the history of
prompts that were used to code this repo. You can inspect the complete
development history in the [`.specstory/`](.specstory/) folder.

## ✨ Features

### 🧠 AI-Powered Expansion
- **Smart Idea Analysis**: AI understands your concept and generates comprehensive development plans
- **Comprehensive Schemas**: Detailed JSON schemas for AI generation with structured validation
- **Deco Platform Integration**: Leverages the Deco platform's AI capabilities for consistent, high-quality expansions

### 🏗️ Complete Development Blueprints
- **Architecture Planning**: File structures following Deco MCP template patterns
- **Data Models**: Drizzle ORM schemas for SQLite databases
- **Tools & Workflows**: MCP tools with Zod schemas and Mastra workflow patterns  
- **UI/UX Design**: React components with TanStack Router and Tailwind CSS
- **Implementation Phases**: Realistic timelines and task breakdowns
- **External Integrations**: Suggestions for Gmail, Discord, GitHub, and 20+ other services

### 🎯 Interactive Experience
- **Section-by-Section Editing**: AI-powered editing for any part of your plan
- **Multi-Criteria Evaluation**: Assess ideas across ambiguity, market potential, feasibility, and innovation
- **Export Capabilities**: Generate clean prompts or markdown documentation
- **Visual Layouts**: SVG examples for frontend routes and components

### 🛠️ Technical Stack
- **MCP Server**: Cloudflare Workers + Deco runtime with comprehensive tools
- **React Frontend**: Modern React with TanStack Router, Query, and Tailwind CSS  
- **Database**: SQLite with Drizzle ORM for ideas, evaluations, and exports
- **Type Safety**: Full TypeScript with auto-generated RPC client types
- **AI Integration**: Structured object generation with validation and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js ≥22.0.0
- [Deco CLI](https://deco.chat): `npm i -g deco-cli`

### Setup

```bash
# Install dependencies
npm install

# Configure your app
npm run configure

# Start development server
npm run dev
```

The server will start on `http://localhost:8787` serving both your MCP endpoints
and the React frontend.

## 📁 Project Structure

```
pronto/
├── server/                 # MCP Server (Cloudflare Workers + Deco)
│   ├── main.ts            # Entry point with tool/workflow registration
│   ├── schema.ts          # Database schema with Drizzle ORM
│   ├── db.ts              # Database configuration and migrations
│   ├── tools/             # Domain-organized tools (max 300 lines per file)
│   │   ├── index.ts       # Central export point for all tools
│   │   ├── ideas.ts       # Idea management (create, get, list, delete)
│   │   ├── expansion.ts   # AI-powered idea expansion and editing
│   │   ├── evaluation.ts  # Multi-criteria idea evaluation
│   │   ├── export.ts      # Prompt and markdown generation
│   │   └── ai.ts          # AI proxy tools for platform integration
│   ├── workflows/         # Complex multi-step workflows
│   │   ├── index.ts       # Central export point for workflows
│   │   └── expansion.ts   # Complete expansion workflow
│   └── drizzle/          # Database migrations
└── view/                 # React Frontend (Vite + Tailwind)
    ├── src/
    │   ├── routes/       # Application routes
    │   │   ├── home.tsx  # Main page with idea input
    │   │   ├── expand.tsx # Expansion result display
    │   │   └── history.tsx # Idea management and history
    │   ├── components/   # Reusable UI components
    │   │   ├── idea-input.tsx      # ChatGPT-style textarea with examples
    │   │   ├── expansion-display.tsx # Comprehensive expansion viewer
    │   │   └── ui/                 # shadcn/ui component library
    │   ├── hooks/        # TanStack Query hooks for RPC calls
    │   │   ├── useIdeas.ts     # Idea CRUD operations
    │   │   ├── useExpansion.ts # AI expansion and editing
    │   │   ├── useEvaluation.ts # Idea evaluation
    │   │   └── useExport.ts    # Export functionality
    │   └── lib/rpc.ts    # Typed RPC client for server communication
    └── package.json
```

## 🛠️ Development Workflow

### Core Commands
- **`npm run dev`** - Start development server with hot reload
- **`npm run gen`** - Generate types for external integrations  
- **`npm run gen:self`** - Generate types for your own tools/workflows
- **`npm run deploy`** - Deploy to production
- **`npm run db:generate`** - Generate database migration files

### Adding New Features
1. **Tools**: Add domain-specific tools in `server/tools/[domain].ts`
2. **Workflows**: Create multi-step workflows in `server/workflows/`
3. **Database Changes**: Modify `server/schema.ts` then run `npm run db:generate`
4. **Frontend**: Create hooks in `view/src/hooks/` and use TanStack Query patterns
5. **Routes**: Add new routes in `view/src/routes/` using TanStack Router

## 💡 Usage Examples

### Basic Idea Expansion
```typescript
// User inputs: "I want to create an app that analyzes my emails"
// AI generates comprehensive plan with:
// - Architecture (file structure following Deco patterns)
// - Data models (Drizzle schemas for emails, analysis results)
// - Tools (email fetching, AI analysis, filtering)
// - Workflows (complete email processing pipeline)
// - UI components (inbox view, analysis dashboard)
// - Implementation phases (3-month roadmap with specific tasks)
```

### Interactive Editing
```typescript
// Edit any section with natural language
const editResult = await client.EDIT_SECTION({
  ideaId: "123",
  section: "features", 
  editPrompt: "Add real-time notifications and mobile app support",
  currentData: currentFeatures
});
```

### Multi-Criteria Evaluation
```typescript
// AI evaluates ideas across 6 criteria (1-10 scale)
const evaluation = await client.EVALUATE_IDEA({
  ideaId: "123",
  expandedData: expandedIdea
});
// Returns scores for: ambiguity avoidance, interest level, 
// market potential, technical feasibility, innovation, user value
```

## 🔗 Frontend ↔ Server Communication

Fully-typed RPC communication using TanStack Query patterns:

```typescript
// Custom hooks wrap RPC calls for optimal UX
const { data: idea, isLoading } = useGetIdea("123");
const expandMutation = useCompleteExpansion();

// Expand idea with loading states and error handling
expandMutation.mutate({ 
  originalPrompt: "My idea...", 
  ideaId: "123" 
});
```

## 🏗️ Architecture Highlights

### Domain-Driven Design
- **Tools organized by domain** (ideas, expansion, evaluation, export)
- **Maximum 300 lines per file** for maintainability
- **Central export points** for clean imports

### AI Integration Patterns
- **Proxy tools** for Deco platform AI capabilities
- **Comprehensive JSON schemas** for structured generation
- **Error handling and validation** at every layer
- **Prompt engineering** with few-shot learning examples

### Database Design
- **SQLite with Drizzle ORM** for simplicity and type safety
- **JSON columns** for flexible expanded data storage
- **Automatic migrations** applied lazily at runtime
- **Proper relationships** between ideas, evaluations, and exports

## 📖 Learn More

Built on the [Deco platform](https://deco.chat) for MCP server development:
- [Deco Documentation](https://docs.deco.page)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Cursor Rules](.cursor/rules/) - Comprehensive development guidelines

---

**Transform your ideas into actionable development plans with AI-powered precision.** 
Ready to build the future? Start with Pronto!
