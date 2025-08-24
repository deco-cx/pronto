# Admin Integration Plan

## Current Issues to Fix

### 1. Database Schema Missing
**Problem**: The `schema_configs` and `schema_fields` tables don't exist in the database.
**Root Cause**: The schema was defined but migrations weren't generated/applied.

**Solution**:
- Generate migration for the new schema tables
- Initialize default schema configurations
- Test database operations

### 2. Debug Tool Auto-Expansion
**Problem**: Debug tool automatically triggers idea expansion which is unwanted.
**Solution**: Remove or disable the auto-expansion feature in debug tools.

## New Features to Implement

### 1. Integrated Admin Interface
**Current State**: Admin is a separate page (`/admin`)
**New Requirement**: Integrate admin functionality into the idea detail view

**Implementation Plan**:
- Remove standalone admin page
- Add admin controls to each section in idea detail view
- Show schema/prompt information for each field
- Allow inline editing of prompts
- Enable re-running specific sections

### 2. Section-Level Re-expansion
**Requirement**: Re-run expansion for individual sections of an idea
**Features Needed**:
- Identify which schema fields map to which idea sections
- Create tools to re-expand specific sections
- Update only the targeted section in the database
- Maintain history of changes

### 3. History Management
**Requirement**: Store and display history of schema changes and re-expansions
**Features Needed**:
- Track changes to schema field descriptions
- Store previous versions of expanded sections
- Show diff/comparison between versions
- Require user confirmation before applying changes

### 4. Home Page Admin Link
**Requirement**: Add link to admin functionality from home page
**Implementation**: Add admin access button/link in home page header

## Detailed Implementation Plan

### Phase 1: Fix Database Issues (Priority: Critical)

#### 1.1 Generate Database Migration
```bash
npm run db:generate
```

#### 1.2 Initialize Default Schemas
- Create tool to populate default schema configurations
- Map current expansion schema to database structure
- Test schema initialization

#### 1.3 Fix Admin Tools
- Ensure all admin tools work with proper database connection
- Test CRUD operations for schema configs and fields

### Phase 2: Remove Debug Auto-Expansion (Priority: High)

#### 2.1 Identify Auto-Expansion Code
- Find where debug tools trigger automatic expansion
- Remove or add flag to disable this behavior

#### 2.2 Update Debug Tools
- Keep useful debugging functionality
- Remove unwanted side effects

### Phase 3: Redesign Admin Interface (Priority: High)

#### 3.1 Remove Standalone Admin Page
- Delete `/admin` route
- Remove admin page component
- Clean up navigation

#### 3.2 Create Integrated Admin Components
```typescript
// New components needed:
- SectionAdminPanel: Shows schema info for a section
- PromptEditor: Inline editor for schema descriptions
- HistoryViewer: Shows change history
- ReExpansionButton: Triggers section re-expansion
```

#### 3.3 Update Idea Detail View
- Add admin controls to each expandable section
- Show current schema/prompt for each field
- Enable editing mode for admins
- Add re-expansion buttons

### Phase 4: Section-Level Re-expansion (Priority: High)

#### 4.1 Create Section Mapping
```typescript
// Map schema fields to idea sections
const SECTION_MAPPINGS = {
  'title': 'title',
  'description': 'description', 
  'features': 'features',
  'architecture': 'architecture',
  'dataModels': 'dataModels',
  'tools': 'tools',
  'workflows': 'workflows',
  'views': 'views',
  'implementationPhases': 'implementationPhases',
  'successMetrics': 'successMetrics'
};
```

#### 4.2 Create Re-expansion Tools
```typescript
// New tools needed:
- RE_EXPAND_SECTION: Re-expand a specific section
- GET_SECTION_SCHEMA: Get schema info for a section
- UPDATE_SECTION_DATA: Update specific section data
```

#### 4.3 Create Re-expansion Workflow
```typescript
// Workflow steps:
1. Get current section data
2. Get current schema/prompt for section
3. Call AI with updated prompt
4. Show preview of changes
5. Require user confirmation
6. Update database with new data
7. Store change in history
```

### Phase 5: History Management (Priority: Medium)

#### 5.1 Create History Schema
```sql
-- New tables needed:
CREATE TABLE section_history (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL,
  section_key TEXT NOT NULL, -- 'features', 'tools', etc.
  old_data TEXT NOT NULL, -- JSON of previous data
  new_data TEXT NOT NULL, -- JSON of new data
  schema_description TEXT NOT NULL, -- Prompt used
  created_at INTEGER NOT NULL,
  created_by TEXT -- Future: user tracking
);

CREATE TABLE schema_field_history (
  id TEXT PRIMARY KEY,
  field_id TEXT NOT NULL,
  old_description TEXT NOT NULL,
  new_description TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  created_by TEXT -- Future: user tracking
);
```

#### 5.2 Create History Tools
```typescript
// New tools:
- GET_SECTION_HISTORY: Get history for a section
- GET_SCHEMA_HISTORY: Get history for schema changes
- REVERT_SECTION: Revert to previous version
```

#### 5.3 Create History UI Components
```typescript
// New components:
- HistoryTimeline: Shows chronological changes
- VersionComparison: Side-by-side diff view
- RevertConfirmation: Confirmation dialog for reverts
```

### Phase 6: Home Page Integration (Priority: Low)

#### 6.1 Add Admin Access
- Add admin button/link in home page header
- Check for admin permissions (future enhancement)
- Navigate to idea detail with admin mode enabled

#### 6.2 Admin Mode State
- Create global admin mode state
- Show/hide admin controls based on mode
- Persist admin mode in localStorage

## Database Schema Updates

### New Tables Needed

```sql
-- Already defined in schema.ts but need migration:
CREATE TABLE schema_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE schema_fields (
  id TEXT PRIMARY KEY,
  config_id TEXT NOT NULL,
  key TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  parent_field TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- New tables for history:
CREATE TABLE section_history (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  old_data TEXT NOT NULL,
  new_data TEXT NOT NULL,
  schema_description TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  created_by TEXT
);

CREATE TABLE schema_field_history (
  id TEXT PRIMARY KEY,
  field_id TEXT NOT NULL,
  old_description TEXT NOT NULL,
  new_description TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  created_by TEXT
);
```

## New Tools Required

### Admin Tools (Enhanced)
```typescript
// Existing tools (fix database issues):
- GET_SCHEMA_CONFIGS ✓ (fix database)
- GET_SCHEMA_FIELDS ✓ (fix database)
- UPDATE_SCHEMA_FIELD ✓ (fix database)
- CREATE_SCHEMA_CONFIG ✓ (fix database)
- CREATE_SCHEMA_FIELD ✓ (fix database)
- INITIALIZE_DEFAULT_SCHEMAS ✓ (fix database)

// New tools needed:
- GET_SECTION_SCHEMA: Get schema info for specific section
- RE_EXPAND_SECTION: Re-expand a specific section with new prompt
- GET_SECTION_HISTORY: Get change history for a section
- REVERT_SECTION: Revert section to previous version
- GET_SCHEMA_HISTORY: Get history of schema field changes
```

### Section Management Tools
```typescript
- UPDATE_SECTION_DATA: Update specific section of an idea
- PREVIEW_SECTION_CHANGES: Show preview before applying changes
- CONFIRM_SECTION_UPDATE: Apply confirmed changes
```

## UI/UX Design

### Integrated Admin Interface

#### Idea Detail View with Admin Mode
```
┌─────────────────────────────────────────┐
│ [Idea Title]                    [Admin] │
├─────────────────────────────────────────┤
│ Description                             │
│ [Current description text...]           │
│ ┌─ Admin Controls (when enabled) ──────┐│
│ │ Schema: "Detailed description..."     ││
│ │ [Edit Prompt] [Re-expand] [History]   ││
│ └───────────────────────────────────────┘│
├─────────────────────────────────────────┤
│ Features                                │
│ [Current features list...]              │
│ ┌─ Admin Controls ─────────────────────┐│
│ │ Schema: "Main features..."           ││
│ │ [Edit Prompt] [Re-expand] [History]   ││
│ └───────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Re-expansion Flow
```
1. User clicks [Re-expand] on a section
2. Show current prompt in editable form
3. User modifies prompt (optional)
4. Click "Generate Preview"
5. Show side-by-side comparison:
   - Current data | Proposed changes
6. User confirms or cancels
7. If confirmed, update database and add to history
```

#### History View
```
┌─ Section History: Features ─────────────┐
│ ┌─ 2024-01-15 14:30 ─────────────────┐ │
│ │ Prompt: "Main features of app..."   │ │
│ │ Changes: Added 3 features           │ │
│ │ [View Details] [Revert]             │ │
│ └─────────────────────────────────────┘ │
│ ┌─ 2024-01-14 09:15 ─────────────────┐ │
│ │ Prompt: "Core functionality..."     │ │
│ │ Changes: Initial expansion          │ │
│ │ [View Details]                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Implementation Priority

### Critical (Fix immediately)
1. ✅ Generate database migration for schema tables
2. ✅ Fix admin tools database connection issues
3. ✅ Initialize default schema configurations
4. ✅ Remove debug auto-expansion

### High Priority (Next sprint)
1. Create section re-expansion tools
2. Build integrated admin interface components
3. Update idea detail view with admin controls
4. Implement section-level re-expansion workflow

### Medium Priority (Following sprint)
1. Add history tracking for sections and schema changes
2. Build history viewing and comparison UI
3. Implement revert functionality
4. Add confirmation dialogs for destructive actions

### Low Priority (Future enhancement)
1. Add admin mode toggle to home page
2. Implement user permissions for admin features
3. Add bulk operations for schema management
4. Create admin dashboard with analytics

## Success Criteria

### Phase 1 Success
- [ ] Admin tools work without database errors
- [ ] Default schema configurations are created
- [ ] Debug tools don't auto-expand ideas

### Phase 2 Success
- [ ] Users can edit schema prompts inline in idea detail view
- [ ] Individual sections can be re-expanded with custom prompts
- [ ] Changes require user confirmation before applying

### Phase 3 Success
- [ ] All changes are tracked in history
- [ ] Users can view change history for any section
- [ ] Users can revert sections to previous versions
- [ ] Side-by-side comparison shows before/after changes

### Final Success
- [ ] Admin functionality is seamlessly integrated into idea detail view
- [ ] No separate admin page needed
- [ ] All schema management happens in context
- [ ] Full audit trail of all changes
- [ ] Intuitive UX for non-technical users

## Technical Considerations

### Database Performance
- Index section_history by idea_id and section_key
- Limit history retention (e.g., last 50 changes per section)
- Consider pagination for large history lists

### AI Integration
- Reuse existing expansion workflow patterns
- Ensure section-level expansion uses same AI models/settings
- Handle partial failures gracefully

### State Management
- Use TanStack Query for caching section data
- Invalidate relevant queries after re-expansion
- Optimistic updates for better UX

### Error Handling
- Graceful degradation if AI expansion fails
- Clear error messages for users
- Rollback capability for failed updates

This plan provides a comprehensive roadmap for transforming the admin functionality from a separate page into an integrated, powerful tool for managing AI-generated content with full history tracking and granular control.
