# Pronto - AI-Powered Idea Expansion Platform

> **🧪 Concept Application** - This is a proof-of-concept showcasing advanced schema-driven AI architecture with real-time editing capabilities.

Transform simple software ideas into comprehensive development plans with AI. Built on the Deco MCP platform with a modern React + Tailwind CSS frontend.

<img width="1502" height="846" alt="Image" src="https://github.com/user-attachments/assets/e1ddac77-8b11-4db0-a3c3-88f8ee06ece3" />
Pronto takes your basic concept and generates detailed, actionable blueprints including architecture, data models, tools, workflows, and implementation phases - ready to paste into your AI development tool.

## 📝 Development History

This repository uses [Specstory](https://specstory.com/) to track the history of
prompts that were used to code this repo. You can inspect the complete
development history in the [`.specstory/`](.specstory/) folder.

## ✨ Features

### 🧪 **Concept Highlights**
This application demonstrates cutting-edge patterns for AI-driven development:
- **Schema-Driven Architecture**: Centralized, editable JSON schemas that guide AI generation
- **Real-Time Schema Editing**: Live preview and validation of AI prompts and structures
- **Developer Feedback Loop**: Copy improved schemas back to code for continuous improvement
- **Runtime Schema Injection**: Override default schemas without code changes

### 🧠 AI-Powered Expansion
- **Smart Idea Analysis**: Transform simple concepts into comprehensive development plans
- **Structured Generation**: JSON schemas ensure consistent, high-quality AI outputs
- **Deco Platform Integration**: Leverages enterprise-grade AI capabilities

### 🏗️ Complete Development Blueprints
- **Architecture Planning**: File structures following Deco MCP template patterns
- **Data Models**: Drizzle ORM schemas ready for implementation
- **Tools & Workflows**: MCP tools with Zod schemas and Mastra patterns
- **UI/UX Design**: React components with modern styling
- **Implementation Phases**: Realistic timelines and task breakdowns

### 🎯 Interactive Experience
- **Enhanced Schema Editor**: Form + JSON editing modes with real-time validation
- **Preview System**: Test schema changes before applying to database
- **Admin Mode**: Edit AI prompts and re-expand individual sections with custom schemas
- **Inline Evaluation**: Multi-criteria assessment (ambiguity, market potential, feasibility, innovation)
- **Export System**: Copy JSON data, schemas, or ready-to-use development prompts
- **Real-time Updates**: See changes immediately with optimistic UI updates

### 🛠️ Technical Stack
- **Backend**: Cloudflare Workers + Deco MCP runtime
- **Frontend**: React + TanStack Router + Tailwind CSS with custom color scheme
- **Database**: SQLite with Drizzle ORM and automatic migrations
- **Type Safety**: Full TypeScript with auto-generated RPC types
- **AI Integration**: Structured object generation with validation

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- [Deco CLI](https://deco.chat): `deno install -Ar -g -n deco jsr:@deco/cli`

### Setup
```bash
# Install dependencies
npm install

# Configure your app (set name and workspace)
npm run configure

# Start development server
npm run dev
```

The app will be available at `http://localhost:8787` with both MCP endpoints and React frontend.

### Usage
1. **Enter your idea** in the input field on the home page
2. **Wait for AI expansion** - comprehensive plan generation
3. **Toggle Admin Mode** to edit individual sections and AI prompts
4. **Run Evaluation** to assess your idea across multiple criteria
5. **Export** as JSON data or ready-to-use development prompt

## 📁 Project Structure

```
pronto/
├── server/                 # MCP Server (Cloudflare Workers + Deco)
│   ├── main.ts            # Entry point with tool/workflow registration
│   ├── schema.ts          # Database schema with Drizzle ORM
│   ├── db.ts              # Database configuration and migrations
│   ├── tools/             # Domain-organized tools
│   │   ├── index.ts       # Central export point
│   │   ├── ideas.ts       # Idea CRUD operations
│   │   ├── admin.ts       # Admin tools and section re-expansion
│   │   ├── evaluation.ts  # Multi-criteria idea evaluation
│   │   ├── export.ts      # Export functionality
│   │   └── ai.ts          # AI proxy tools
│   ├── workflows/         # Multi-step workflows
│   │   └── expansion.ts   # Complete expansion workflow
│   └── drizzle/          # Database migrations
└── view/                 # React Frontend (Vite + Tailwind)
    ├── src/
    │   ├── routes/       # Application routes
    │   │   ├── home.tsx  # Main page with idea input
    │   │   ├── expand.tsx # Expansion display with admin mode
    │   │   └── history.tsx # Idea management
    │   ├── components/   # UI components
    │   │   ├── expansion-display.tsx # Main expansion viewer
    │   │   ├── section-editor.tsx    # Inline section editing
    │   │   ├── export-modal.tsx      # Export functionality
    │   │   ├── inline-evaluation.tsx # Evaluation interface
    │   │   └── ui/                   # shadcn/ui components
    │   ├── hooks/        # TanStack Query hooks
    │   │   ├── useIdeas.ts     # Idea operations
    │   │   ├── useAdmin.ts     # Admin and section editing
    │   │   └── useEvaluation.ts # Evaluation operations
    │   └── lib/rpc.ts    # Typed RPC client
    └── package.json
```

## 🛠️ Development Workflow

### Core Commands
- **`npm run dev`** - Start development server with hot reload
- **`npm run gen`** - Generate types for external integrations  
- **`npm run gen:self`** - Generate types for your own tools/workflows
- **`npm run deploy`** - Deploy to production
- **`npm run db:generate`** - Generate database migration files

### Key Features
- **Admin Mode**: Toggle admin mode to edit AI prompts and re-expand sections
- **Section Editing**: Click edit on any section to customize AI generation
- **Evaluation**: Built-in multi-criteria evaluation with configurable criteria
- **Export**: Copy JSON data or development-ready prompts
- **Real-time Updates**: Changes reflect immediately with optimistic UI

## 💡 Usage Examples

### Basic Workflow
1. **Input**: "Create a workshop management system with WhatsApp integration"
2. **AI Expansion**: Generates comprehensive plan with architecture, data models, tools, workflows, and implementation phases
3. **Admin Mode**: Edit individual sections (e.g., modify "features" prompt to add specific requirements)
4. **Evaluation**: Run multi-criteria assessment (ambiguity, market potential, feasibility, innovation)
5. **Export**: Copy development prompt and paste into Cursor/Claude for implementation

### Development Integration
```bash
# After exporting from Pronto:
npm create deco
# Follow setup steps
# Open Cursor/Claude
# Paste the exported development prompt
# AI builds the complete application
```

## 🏗️ Architecture Highlights

### Clean Architecture
- **Domain-organized tools** with clear separation of concerns
- **Type-safe RPC communication** between frontend and backend
- **Automatic database migrations** with Drizzle ORM
- **Optimistic UI updates** for responsive user experience

### AI Integration
- **Structured generation** with JSON schema validation
- **Section-level re-expansion** for granular control
- **Configurable evaluation criteria** for idea assessment
- **Export-ready prompts** for seamless development workflow

## 🌟 Color Scheme

Pronto uses a modern, calming color palette:
- **Primary**: #86DEE8 (Light Blue) - Main elements and backgrounds
- **Secondary**: #A1C5F9 (Purple-Blue) - Accents and highlights  
- **Accent**: #FEE38B (Warm Yellow) - Admin mode and interactive elements

## 📖 Learn More

- **[Deco Platform](https://deco.chat)** - MCP server development platform
- **[Deco Documentation](https://docs.deco.page)** - Complete development guide
- **[MCP Specification](https://spec.modelcontextprotocol.io/)** - Model Context Protocol

---

**Transform your ideas into actionable development plans with AI-powered precision.**  
Ready to build the future? Start with Pronto! 🚀
