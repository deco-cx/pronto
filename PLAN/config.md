# Admin Configuration System Analysis & Plan

## 🔍 Current State Analysis

### How Admin Logic Currently Works

The admin system has **TWO SEPARATE** schema sources that are **NOT CONNECTED**:

#### 1. **Database-Driven Schema** (Unused)
- **Location**: `schema_configs` and `schema_fields` tables
- **Purpose**: Designed to store configurable AI prompts
- **Initialization**: `INITIALIZE_DEFAULT_SCHEMAS` tool creates default values
- **Management**: Full CRUD operations via admin tools
- **Status**: ❌ **NOT USED** by actual AI expansion

#### 2. **Hardcoded Schema** (Currently Used)
- **Location**: `server/workflows/expansion.ts` (lines 23-127)
- **Location**: `server/tools/admin.ts` (lines 334-434) - **DUPLICATE**
- **Purpose**: Actually used by AI expansion workflow
- **Status**: ✅ **ACTIVELY USED** but hardcoded

### 🚨 **Critical Problem**

**The admin interface edits database schemas that are NEVER used by the AI expansion!**

The actual expansion uses the hardcoded schema in `expansion.ts`, while the admin interface edits database records that are completely ignored.

## 📊 Data Flow Diagram

```
Current (Broken) Flow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │───▶│   Database       │    │  AI Expansion   │
│   (Edit Schema) │    │   (schema_*)     │    │  (Hardcoded)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              ▲                         ▲
                              │                         │
                         ❌ NOT USED              ✅ ACTUALLY USED
```

```
Desired Flow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │───▶│   Database       │───▶│  AI Expansion   │
│   (Edit Schema) │    │   (schema_*)     │    │  (Dynamic)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                         │
                              └─────────────────────────┘
                                   ✅ CONNECTED
```

## 🎯 Your Goal: Configuration Workflow

You want to:
1. **Tune settings** using the admin interface
2. **Test changes** by re-running expansions
3. **Export final JSON** with optimized prompts
4. **Copy/paste** into code as new defaults

## 🛠️ Implementation Plan

### Phase 1: Connect Database to AI Expansion ⚡ **CRITICAL**

#### 1.1 Create Dynamic Schema Loader
```typescript
// server/lib/schema-loader.ts
export async function loadActiveSchema(env: Env): Promise<any> {
  const db = await getDb(env);
  
  // Get active expansion schema config
  const config = await db.select()
    .from(schemaConfigs)
    .where(and(
      eq(schemaConfigs.name, 'expansion_schema'),
      eq(schemaConfigs.isActive, true)
    ))
    .limit(1);
    
  if (config.length === 0) {
    // Fallback to hardcoded schema
    return getHardcodedSchema();
  }
  
  // Get all fields for this config
  const fields = await db.select()
    .from(schemaFields)
    .where(eq(schemaFields.configId, config[0].id))
    .orderBy(schemaFields.order);
    
  // Build dynamic schema from database
  return buildSchemaFromFields(fields);
}
```

#### 1.2 Update Expansion Workflow
```typescript
// server/workflows/expansion.ts
const createInlineExpandIdeaTool = (env: Env) =>
  createTool({
    // ...
    execute: async ({ context }) => {
      // 🔥 REPLACE HARDCODED SCHEMA
      const expansionSchema = await loadActiveSchema(env);
      
      // Use dynamic schema for AI call
      const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
        messages: [{ role: 'user', content: prompt }],
        schema: expansionSchema,
        // ...
      });
    }
  });
```

#### 1.3 Update Section Re-expansion
```typescript
// server/tools/admin.ts - GET_SECTION_SCHEMA
execute: async ({ context }) => {
  // 🔥 REPLACE HARDCODED LOOKUP
  const schema = await getSectionSchemaFromDatabase(env, context.sectionKey);
  return schema;
}
```

### Phase 2: Schema Export & Import System

#### 2.1 Create Schema Export Tool
```typescript
export const createExportSchemaTool = (env: Env) =>
  createTool({
    id: "EXPORT_SCHEMA_CONFIG",
    description: "Export current schema configuration as JSON",
    inputSchema: z.object({
      configName: z.string().default('expansion_schema'),
    }),
    outputSchema: z.object({
      schemaJson: z.string(),
      configData: z.object({
        name: z.string(),
        description: z.string(),
        fields: z.array(z.any()),
      }),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      
      // Get config and all fields
      const config = await getConfigByName(db, context.configName);
      const fields = await getFieldsByConfigId(db, config.id);
      
      // Build exportable JSON
      const exportData = {
        name: config.name,
        description: config.description,
        fields: fields.map(field => ({
          key: field.key,
          type: field.type,
          description: field.description,
          required: field.required,
          order: field.order,
        })),
      };
      
      return {
        schemaJson: JSON.stringify(exportData, null, 2),
        configData: exportData,
      };
    },
  });
```

#### 2.2 Create Schema Import Tool
```typescript
export const createImportSchemaTool = (env: Env) =>
  createTool({
    id: "IMPORT_SCHEMA_CONFIG",
    description: "Import schema configuration from JSON",
    inputSchema: z.object({
      schemaJson: z.string(),
      overwrite: z.boolean().default(false),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      configId: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      const importData = JSON.parse(context.schemaJson);
      
      // Create or update config
      const configId = await createOrUpdateConfig(db, importData, context.overwrite);
      
      return { success: true, configId };
    },
  });
```

#### 2.3 Add Export to Admin UI
```typescript
// view/src/components/schema-export.tsx
export function SchemaExport({ configId }: { configId: string }) {
  const exportMutation = useExportSchema();
  
  const handleExport = async () => {
    const result = await exportMutation.mutateAsync({ configName: 'expansion_schema' });
    
    // Copy to clipboard
    await navigator.clipboard.writeText(result.schemaJson);
    toast.success('Schema JSON copied to clipboard!');
  };
  
  return (
    <Button onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export Schema JSON
    </Button>
  );
}
```

### Phase 3: Code Generation System

#### 3.1 Create Code Generator Tool
```typescript
export const createGenerateSchemaCodeTool = (env: Env) =>
  createTool({
    id: "GENERATE_SCHEMA_CODE",
    description: "Generate TypeScript code for schema to paste into expansion.ts",
    inputSchema: z.object({
      configName: z.string().default('expansion_schema'),
    }),
    outputSchema: z.object({
      typescriptCode: z.string(),
      instructions: z.string(),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      const schema = await loadActiveSchema(env);
      
      // Generate TypeScript code
      const code = `// Generated schema - replace in server/workflows/expansion.ts
const expansionSchema = ${JSON.stringify(schema, null, 2)};`;
      
      const instructions = `
## How to Update Default Schema:

1. Copy the generated code below
2. Open server/workflows/expansion.ts
3. Replace the hardcoded expansionSchema (lines 23-127)
4. Save the file
5. Restart the server

This will make your tuned schema the new default.
      `;
      
      return {
        typescriptCode: code,
        instructions,
      };
    },
  });
```

#### 3.2 Add Code Generation to Export Modal
```typescript
// Update view/src/components/export-modal.tsx
const tabs = [
  { id: 'json', label: 'JSON Data' },
  { id: 'prompt', label: 'Development Prompt' },
  { id: 'schema', label: 'Schema Code' }, // NEW TAB
];

// Add schema code generation
const { data: schemaCode } = useGenerateSchemaCode();
```

### Phase 4: Testing & Validation System

#### 4.1 Create Schema Validation Tool
```typescript
export const createValidateSchemaTool = (env: Env) =>
  createTool({
    id: "VALIDATE_SCHEMA",
    description: "Validate schema configuration before applying",
    inputSchema: z.object({
      configId: z.string(),
    }),
    outputSchema: z.object({
      isValid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
    execute: async ({ context }) => {
      const db = await getDb(env);
      const fields = await getFieldsByConfigId(db, context.configId);
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Validate required fields exist
      const requiredSections = ['title', 'description', 'features'];
      for (const section of requiredSections) {
        if (!fields.find(f => f.key === section)) {
          errors.push(`Missing required section: ${section}`);
        }
      }
      
      // Validate descriptions are not empty
      fields.forEach(field => {
        if (!field.description.trim()) {
          warnings.push(`Empty description for field: ${field.key}`);
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  });
```

#### 4.2 Add Test Expansion Feature
```typescript
export const createTestExpansionTool = (env: Env) =>
  createTool({
    id: "TEST_EXPANSION",
    description: "Test expansion with current schema configuration",
    inputSchema: z.object({
      testPrompt: z.string().default("Create a simple todo app"),
      configId: z.string().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      expandedData: z.any(),
      usedSchema: z.any(),
    }),
    execute: async ({ context }) => {
      // Use current database schema for test
      const schema = await loadActiveSchema(env);
      
      // Run test expansion
      const result = await env.DECO_CHAT_WORKSPACE_API.AI_GENERATE_OBJECT({
        messages: [{
          role: 'user',
          content: `Expand this idea: ${context.testPrompt}`
        }],
        schema,
      });
      
      return {
        success: true,
        expandedData: result.object,
        usedSchema: schema,
      };
    },
  });
```

## 🚀 Implementation Steps

### Step 1: Fix the Disconnect (Critical)
1. Create `server/lib/schema-loader.ts`
2. Update `server/workflows/expansion.ts` to use dynamic schema
3. Update `server/tools/admin.ts` GET_SECTION_SCHEMA to use database
4. Test that admin changes affect actual expansions

### Step 2: Add Export/Import
1. Add export/import tools to `server/tools/admin.ts`
2. Add export button to admin UI
3. Create schema export modal with copy functionality

### Step 3: Add Code Generation
1. Add code generation tool
2. Update export modal with "Schema Code" tab
3. Add instructions for updating defaults

### Step 4: Add Testing
1. Add validation and test tools
2. Add "Test Schema" button to admin UI
3. Show validation results before applying changes

## 📋 File Changes Required

### New Files
- `server/lib/schema-loader.ts` - Dynamic schema loading
- `view/src/components/schema-export.tsx` - Export UI component
- `view/src/hooks/useSchemaExport.ts` - Export hooks

### Modified Files
- `server/workflows/expansion.ts` - Use dynamic schema
- `server/tools/admin.ts` - Add export/import/test tools
- `view/src/components/expansion-display.tsx` - Add test button
- `view/src/hooks/useAdmin.ts` - Add new hooks

## 🎯 End-to-End Workflow

After implementation, your workflow will be:

1. **Edit Schema**: Use admin UI to modify prompts
2. **Test Changes**: Click "Test Schema" to see results
3. **Validate**: Check for errors/warnings
4. **Export JSON**: Copy optimized schema configuration
5. **Generate Code**: Get TypeScript code to paste
6. **Update Defaults**: Replace hardcoded schema in code
7. **Deploy**: New defaults are now permanent

## 🔧 Quick Fix Priority

**CRITICAL**: The most important fix is connecting the database to the actual expansion workflow. Without this, the admin interface is completely useless.

**Recommended approach**: Start with Step 1 only - fix the disconnect. Once that works, you can iterate on the export/import features.

This will immediately make your admin interface functional and allow you to start tuning the AI prompts effectively.
