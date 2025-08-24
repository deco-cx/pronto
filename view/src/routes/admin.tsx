import { createRoute, type RootRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Settings, Plus, Pencil, Save, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  useGetSchemaConfigs,
  useGetSchemaFields,
  useUpdateSchemaField,
  useCreateSchemaConfig,
  useCreateSchemaField,
  useInitializeDefaultSchemas
} from "../hooks/useAdmin";
import { toast } from "sonner";

function AdminPage() {
  const navigate = useNavigate();
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newConfigDialog, setNewConfigDialog] = useState(false);
  const [newFieldDialog, setNewFieldDialog] = useState(false);

  const { data: configsData, isLoading: configsLoading } = useGetSchemaConfigs();
  const { data: fieldsData, isLoading: fieldsLoading } = useGetSchemaFields(selectedConfig || '');
  
  const updateFieldMutation = useUpdateSchemaField();
  const createConfigMutation = useCreateSchemaConfig();
  const createFieldMutation = useCreateSchemaField();
  const initializeSchemasMutation = useInitializeDefaultSchemas();

  const handleUpdateField = async (fieldId: string, description: string) => {
    try {
      await updateFieldMutation.mutateAsync({ fieldId, description });
      setEditingField(null);
      toast.success('Field updated successfully');
    } catch (error) {
      toast.error('Failed to update field');
    }
  };

  const handleCreateConfig = async (name: string, description: string) => {
    try {
      await createConfigMutation.mutateAsync({ name, description });
      setNewConfigDialog(false);
      toast.success('Schema configuration created');
    } catch (error) {
      toast.error('Failed to create configuration');
    }
  };

  const handleCreateField = async (data: {
    key: string;
    type: 'string' | 'array' | 'object';
    description: string;
    required: boolean;
  }) => {
    if (!selectedConfig) return;
    
    try {
      await createFieldMutation.mutateAsync({
        configId: selectedConfig,
        ...data,
      });
      setNewFieldDialog(false);
      toast.success('Field created successfully');
    } catch (error) {
      toast.error('Failed to create field');
    }
  };

  const handleInitializeSchemas = async () => {
    try {
      await initializeSchemasMutation.mutateAsync();
      toast.success('Default schemas initialized');
    } catch (error) {
      toast.error('Failed to initialize schemas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Settings size={24} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schema Configurations */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Schema Configurations</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setNewConfigDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} />
                    New
                  </Button>
                </div>
                <CardDescription>
                  Manage AI prompt schema configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {configsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded p-3 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {!configsData?.configs?.length && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 mb-4">No configurations found</p>
                        <Button
                          onClick={handleInitializeSchemas}
                          disabled={initializeSchemasMutation.isPending}
                        >
                          Initialize Default Schemas
                        </Button>
                      </div>
                    )}
                    {configsData?.configs?.map((config) => (
                      <div
                        key={config.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConfig === config.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedConfig(config.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{config.name}</h3>
                          <Badge variant="outline">{config.fieldsCount} fields</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Schema Fields */}
          <div className="lg:col-span-2">
            {selectedConfig ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Schema Fields</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setNewFieldDialog(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add Field
                    </Button>
                  </div>
                  <CardDescription>
                    Edit the descriptions that guide AI responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fieldsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-16 bg-gray-300 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fieldsData?.fields?.map((field) => (
                        <FieldEditor
                          key={field.id}
                          field={field}
                          isEditing={editingField === field.id}
                          onEdit={() => setEditingField(field.id)}
                          onSave={(description) => handleUpdateField(field.id, description)}
                          onCancel={() => setEditingField(null)}
                          isUpdating={updateFieldMutation.isPending}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Select a schema configuration to view its fields</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Config Dialog */}
      {newConfigDialog && (
        <NewConfigDialog
          onSave={handleCreateConfig}
          onCancel={() => setNewConfigDialog(false)}
          isCreating={createConfigMutation.isPending}
        />
      )}

      {/* New Field Dialog */}
      {newFieldDialog && selectedConfig && (
        <NewFieldDialog
          onSave={handleCreateField}
          onCancel={() => setNewFieldDialog(false)}
          isCreating={createFieldMutation.isPending}
        />
      )}
    </div>
  );
}

interface FieldEditorProps {
  field: {
    id: string;
    key: string;
    type: string;
    description: string;
    required: boolean;
  };
  isEditing: boolean;
  onEdit: () => void;
  onSave: (description: string) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

function FieldEditor({ field, isEditing, onEdit, onSave, onCancel, isUpdating }: FieldEditorProps) {
  const [description, setDescription] = useState(field.description);

  const handleSave = () => {
    onSave(description);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{field.key}</h3>
          <Badge variant="secondary">{field.type}</Badge>
          {field.required && <Badge variant="destructive">Required</Badge>}
        </div>
        {!isEditing && (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil size={16} />
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter AI prompt description..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Save size={16} className="mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={isUpdating}
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{field.description}</p>
      )}
    </div>
  );
}

function NewConfigDialog({ 
  onSave, 
  onCancel, 
  isCreating 
}: { 
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  isCreating: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim() && description.trim()) {
      onSave(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Schema Configuration</CardTitle>
          <CardDescription>Create a new schema configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. expansion_schema"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this schema is for..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !description.trim() || isCreating}
            >
              Create
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NewFieldDialog({ 
  onSave, 
  onCancel, 
  isCreating 
}: { 
  onSave: (data: {
    key: string;
    type: 'string' | 'array' | 'object';
    description: string;
    required: boolean;
  }) => void;
  onCancel: () => void;
  isCreating: boolean;
}) {
  const [key, setKey] = useState('');
  const [type, setType] = useState<'string' | 'array' | 'object'>('string');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);

  const handleSave = () => {
    if (key.trim() && description.trim()) {
      onSave({
        key: key.trim(),
        type,
        description: description.trim(),
        required,
      });
      setKey('');
      setDescription('');
      setRequired(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Schema Field</CardTitle>
          <CardDescription>Add a new field to the schema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="key">Field Key</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. title, features"
            />
          </div>
          <div>
            <Label htmlFor="type">Field Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="string">String</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>
          <div>
            <Label htmlFor="description">AI Prompt Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the AI should generate for this field..."
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="required">Required field</Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!key.trim() || !description.trim() || isCreating}
            >
              Create
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function createAdminRoute(rootRoute: RootRoute) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminPage,
  });
}