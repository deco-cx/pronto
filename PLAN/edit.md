# Admin/Edit Features - Issues and Redesign Plan

## Current Issues Identified

### 1. **Critical Bug: Missing Import**
- **Location**: `server/tools/admin.ts` line 476
- **Error**: `ReferenceError: ideas is not defined`
- **Cause**: The `ideas` table is used in `createReExpandSectionTool` but not imported
- **Fix**: Add `ideas` to the import from `../schema.ts`

### 2. **Current Edit Flow Problems**

#### A. Limited Editing Capabilities
- **Current**: Only allows custom prompt modification
- **Problem**: No direct schema editing - users can't modify the structure/requirements for each section
- **Missing**: Ability to edit the actual JSON schema that defines what the AI should generate

#### B. No Raw Data Visibility
- **Current**: Shows formatted preview only
- **Problem**: Users can't see the actual JSON structure being generated
- **Missing**: Raw JSON view of current data and schema

#### C. Inefficient Workflow
- **Current**: Re-generates entire section even for small changes
- **Problem**: Wasteful AI calls and slow feedback loop
- **Missing**: Granular editing capabilities

#### D. Poor UX for Schema Management
- **Current**: Schema is hardcoded in `createGetSectionSchemaTool`
- **Problem**: No way to persist schema changes or see what schema is being used
- **Missing**: Visual schema editor with form fields

#### E. **CRITICAL: Hardcoded Prompts in Multiple Places**
- **Location 1**: `server/workflows/expansion.ts` lines 188-198 - `toolsFromOtherApps` generation
- **Location 2**: `server/tools/admin.ts` lines 615-652 - Evaluation criteria
- **Location 3**: `server/workflows/expansion.ts` lines 20-124 - Main expansion schema
- **Problem**: Prompts are scattered and hardcoded, making them impossible to edit dynamically
- **Missing**: Schema-driven approach where prompts come from configurable JSON schemas

#### F. **Schema Structure Issues**
- **Problem**: Schemas lack proper `description` properties that AI uses for context
- **Problem**: No top-level schema descriptions
- **Problem**: Sub-schemas (like `toolsFromOtherApps`) are defined inline without editability
- **Missing**: Consistent schema structure with rich descriptions for AI guidance

## Proposed Solution: Schema-Driven Architecture + Enhanced Edit Modal

### Core Philosophy: Schema-First Approach

**Problem**: Currently prompts and schemas are hardcoded in multiple files, making them impossible to edit dynamically.

**Solution**: Move to a `defaultSchemas` constant that can be:
1. **Defined inline** as JSON in code for version control
2. **Injected dynamically** at runtime for editing
3. **Overridden** in the edit experience
4. **Copied back** to code when developer reviews and approves changes

### Schema Structure Requirements

Every schema must have:
```typescript
const defaultSchemas = {
  // Top-level description for the entire schema
  description: "Complete expansion schema for transforming ideas into development plans",
  
  // Individual section schemas
  sections: {
    features: {
      description: "Main features of the application with clear titles and detailed descriptions",
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { 
            type: "string",
            description: "Feature name that clearly identifies what this feature does"
          },
          description: { 
            type: "string",
            description: "Detailed explanation of the feature's functionality and user benefit"
          }
        },
        required: ["title", "description"]
      }
    },
    
    toolsFromOtherApps: {
      description: "External tools and integrations that would enhance this specific application",
      type: "array", 
      items: {
        type: "object",
        properties: {
          service: { 
            type: "string",
            description: "The service name (e.g., 'GitHub', 'Slack', 'Stripe')"
          },
          toolName: { 
            type: "string", 
            description: "The specific API or tool name within the service"
          },
          description: { 
            type: "string",
            description: "What the tool does and its main capabilities"
          },
          useCase: { 
            type: "string",
            description: "How it would be used specifically in this application context"
          }
        },
        required: ["service", "toolName", "description", "useCase"]
      }
    }
    // ... other sections
  }
};
```

### Enhanced Edit Modal Concept
Create a comprehensive edit modal that allows users to:
1. **View raw JSON** of current section data (pretty formatted)
2. **Edit the schema JSON** directly with syntax highlighting
3. **Edit individual schema properties** via form fields
4. **Preview changes** before applying them
5. **Accept/reject** the generated changes
6. **Copy final schema** back to code for persistence

### New Edit Modal Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Section: features                                      │
├─────────────────────────────────────────────────────────────┤
│ Current Raw Data                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {                                                       │ │
│ │   "features": [                                         │ │
│ │     {                                                   │ │
│ │       "title": "Gestão de Veículos",                   │ │
│ │       "description": "Sistema para..."                 │ │
│ │     }                                                   │ │
│ │   ]                                                     │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Schema Configuration                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Form View] [JSON View] ← Toggle                        │ │
│ │                                                         │ │
│ │ Form View:                                              │ │
│ │ Description/Prompt:                                     │ │
│ │ [Main features of the application with clear titles    │ │
│ │  and detailed descriptions]                             │ │
│ │                                                         │ │
│ │ Type: array ▼  Required: ☑                            │ │
│ │                                                         │ │
│ │ Properties:                                             │ │
│ │ • title (string): "Feature name that clearly..."       │ │
│ │ • description (string): "Detailed explanation..."      │ │
│ │                                                         │ │
│ │ JSON View:                                              │ │
│ │ {                                                       │ │
│ │   "description": "Main features of the application...", │ │
│ │   "type": "array",                                      │ │
│ │   "items": {                                            │ │
│ │     "type": "object",                                   │ │
│ │     "properties": {                                     │ │
│ │       "title": {                                        │ │
│ │         "type": "string",                               │ │
│ │         "description": "Feature name that clearly..."   │ │
│ │       },                                                │ │
│ │       "description": {                                  │ │
│ │         "type": "string",                               │ │
│ │         "description": "Detailed explanation..."        │ │
│ │       }                                                 │ │
│ │     },                                                  │ │
│ │     "required": ["title", "description"]               │ │
│ │   }                                                     │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Generate Preview] [Copy Schema JSON]                      │
├─────────────────────────────────────────────────────────────┤
│ Preview (when generated)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ New Raw Data:                                           │ │
│ │ {                                                       │ │
│ │   "features": [                                         │ │
│ │     {                                                   │ │
│ │       "title": "Menos Features",                       │ │
│ │       "description": "Simplified..."                   │ │
│ │     }                                                   │ │
│ │   ]                                                     │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Accept] [Reject] [Copy to Clipboard]                      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Fix Critical Bug ✅
- [x] Fix missing `ideas` import in `server/tools/admin.ts`
- [ ] Test current edit functionality works

### Phase 2: Schema-Driven Architecture Refactor
- [ ] **Create `defaultSchemas.ts`** - Centralized schema definitions
  - Extract hardcoded schemas from `expansion.ts` 
  - Extract hardcoded schemas from `admin.ts`
  - Add rich `description` properties to all schema fields
  - Add top-level schema descriptions
- [ ] **Refactor expansion workflow** to use `defaultSchemas`
  - Modify `createInlineExpandIdeaTool` to use schema from `defaultSchemas`
  - Modify `createInlineSuggestExternalToolsTool` to use schema from `defaultSchemas`
  - Remove hardcoded prompts and schemas
- [ ] **Create schema injection system**
  - Allow runtime schema overrides
  - Maintain backward compatibility

### Phase 3: Enhanced Schema Management Tools
- [ ] Create `GET_EDITABLE_SECTION_SCHEMA` tool that returns:
  - Current section data (raw JSON)
  - Current schema with descriptions
  - Default schema for comparison
- [ ] Create `UPDATE_SECTION_SCHEMA` tool to persist schema changes
- [ ] Create `PREVIEW_SECTION_WITH_SCHEMA` tool (doesn't save to DB)
- [ ] Create `APPLY_SECTION_CHANGES` tool (saves to DB)

### Phase 4: New Edit Modal Components
- [ ] Create `RawJsonViewer` component for pretty JSON display
- [ ] Create `SchemaEditor` component with:
  - **Form View**: Description, type, required, properties
  - **JSON View**: Direct JSON editing with syntax highlighting
  - Toggle between form and JSON views
- [ ] Create `PreviewComparison` component showing before/after
- [ ] Add "Copy Schema JSON" functionality for developer workflow

### Phase 5: Enhanced Backend Integration
- [ ] Modify `RE_EXPAND_SECTION` to accept schema overrides
- [ ] Update all AI generation calls to use schema descriptions properly
- [ ] Add schema validation before AI calls
- [ ] Add error handling for malformed schemas

### Phase 6: Developer Experience
- [ ] Add "Copy to Clipboard" for final schemas
- [ ] Create documentation for schema structure
- [ ] Add schema validation in development
- [ ] Create migration guide for existing hardcoded schemas

## Technical Details

### Schema Injection Architecture

**Core Principle**: Schemas should be defined once, injected dynamically, and editable at runtime.

```typescript
// server/defaultSchemas.ts
export const defaultSchemas = {
  description: "Complete expansion schema for transforming ideas into development plans",
  sections: {
    features: {
      description: "Main features of the application with clear titles and detailed descriptions that explain user value",
      type: "array",
      items: {
        type: "object", 
        properties: {
          title: {
            type: "string",
            description: "Feature name that clearly identifies what this feature does for users"
          },
          description: {
            type: "string", 
            description: "Detailed explanation of the feature's functionality, user benefit, and how it works"
          }
        },
        required: ["title", "description"]
      }
    },
    toolsFromOtherApps: {
      description: "External tools and integrations that would enhance this specific application, focusing on genuine value-add",
      type: "array",
      items: {
        type: "object",
        properties: {
          service: {
            type: "string",
            description: "The service name (e.g., 'GitHub', 'Slack', 'Stripe')"
          },
          toolName: {
            type: "string", 
            description: "The specific API or tool name within the service"
          },
          description: {
            type: "string",
            description: "What the tool does and its main capabilities"
          },
          useCase: {
            type: "string",
            description: "How it would be used specifically in this application context to solve user problems"
          }
        },
        required: ["service", "toolName", "description", "useCase"]
      }
    }
    // ... all other sections
  }
};

// Schema injection function
export function getSchemaForSection(sectionKey: string, overrides?: any) {
  const baseSchema = defaultSchemas.sections[sectionKey];
  if (!baseSchema) {
    throw new Error(`Unknown section: ${sectionKey}`);
  }
  
  // Allow runtime overrides for editing
  return overrides ? { ...baseSchema, ...overrides } : baseSchema;
}
```

### New Tools Needed

```typescript
// Get section data + schema for editing
createGetEditableSectionTool(env: Env) => {
  // Input: { ideaId, sectionKey }
  // Returns: { 
  //   currentData: any, 
  //   currentSchema: JSONSchema, 
  //   defaultSchema: JSONSchema,
  //   sectionKey: string 
  // }
}

// Preview changes without saving
createPreviewSectionWithSchemaTool(env: Env) => {
  // Input: { 
  //   ideaId, 
  //   sectionKey, 
  //   schemaOverride?: JSONSchema, 
  //   entireIdeaContext: ExpandedIdea 
  // }
  // Returns: { previewData, success }
}

// Apply previewed changes
createApplySectionChangesTool(env: Env) => {
  // Input: { ideaId, sectionKey, newData }
  // Returns: { success, updatedIdea }
}

// Update section schema (for persistence - optional)
createUpdateSectionSchemaTool(env: Env) => {
  // Input: { sectionKey, newSchema }
  // Returns: { success }
}
```

### Database Changes (Optional)
Consider adding a table for custom section schemas:

```sql
CREATE TABLE custom_section_schemas (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL,
  custom_schema TEXT NOT NULL, -- JSON
  description TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Frontend Hook Changes

```typescript
// New hooks needed
useGetEditableSection(ideaId: string, sectionKey: string)
usePreviewSectionChanges()
useApplySectionChanges()
useUpdateSectionSchema()
```

## Benefits of This Approach

### User Benefits
1. **Full Visibility**: Users can see exactly what data is being generated
2. **Schema Control**: Users can modify how AI generates each section
3. **Efficient Workflow**: Preview before applying reduces waste
4. **Better UX**: Clear before/after comparison with form and JSON views
5. **Extensible**: Easy to add more section types or schema modifications
6. **Debugging**: Raw JSON makes it easy to understand what's happening

### Developer Benefits
7. **Schema-Driven**: No more scattered hardcoded prompts
8. **Version Control**: Schemas are in code, changes are tracked
9. **Copy-Paste Workflow**: Easy to copy improved schemas back to code
10. **Centralized**: All schema definitions in one place
11. **Rich Descriptions**: AI gets better context from detailed schema descriptions
12. **Runtime Flexibility**: Can override schemas without code changes

## Developer Workflow

### Current Problem
```typescript
// Scattered across multiple files:
// server/workflows/expansion.ts - line 188
const prompt = `Based on this expanded software idea, suggest 3-5 relevant...`;

// server/tools/admin.ts - line 334
const sectionSchemas: Record<string, any> = {
  title: {
    type: 'string',
    description: 'A clear, compelling title...'
  }
};
```

### New Approach
```typescript
// server/defaultSchemas.ts - Single source of truth
export const defaultSchemas = {
  description: "Complete expansion schema...",
  sections: {
    toolsFromOtherApps: {
      description: "External tools and integrations that would enhance this specific application, focusing on genuine value-add",
      // ... full schema with rich descriptions
    }
  }
};

// Usage everywhere:
import { getSchemaForSection } from './defaultSchemas.ts';
const schema = getSchemaForSection('toolsFromOtherApps', userOverrides);
```

### Schema Improvement Cycle
1. **User edits schema** in the UI (form or JSON view)
2. **AI generates** with new schema
3. **User reviews** results and refines schema
4. **User copies** final schema JSON to clipboard
5. **Developer pastes** improved schema back into `defaultSchemas.ts`
6. **Schema becomes** the new default for all users

This creates a feedback loop where real usage improves the default schemas over time.

## Migration Strategy

1. **Backward Compatibility**: Keep existing tools working
2. **Gradual Rollout**: Add new features alongside existing ones
3. **User Testing**: Test with real users before removing old features
4. **Documentation**: Update docs with new editing capabilities

## Success Metrics

- [ ] Edit modal loads without errors
- [ ] Users can see raw JSON of current data
- [ ] Users can modify schema and see preview
- [ ] Accept/reject workflow works smoothly
- [ ] Changes are persisted correctly
- [ ] Performance is acceptable (< 3s for preview generation)

---

**Next Steps**: 
1. Fix the critical bug first
2. Review this plan with stakeholders
3. Start implementation in phases
4. Test each phase thoroughly before moving to the next
