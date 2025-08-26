import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Copy, Check, FileText, Code, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useValidateSchema } from "../hooks/useAdmin";

interface SchemaEditorProps {
  schema: any;
  onSchemaChange: (newSchema: any) => void;
  className?: string;
}

export function SchemaEditor({ schema, onSchemaChange, className = "" }: SchemaEditorProps) {
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [jsonValue, setJsonValue] = useState(JSON.stringify(schema, null, 2));
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateSchemaMutation = useValidateSchema();

  const handleCopySchema = async () => {
    try {
      const schemaString = JSON.stringify(schema, null, 2);
      await navigator.clipboard.writeText(schemaString);
      setCopied(true);
      toast.success("Schema JSON copied! Paste into server/defaultSchemas.ts to make it permanent.");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleFormChange = (field: string, value: any) => {
    const newSchema = { ...schema, [field]: value };
    onSchemaChange(newSchema);
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      onSchemaChange(parsed);
    } catch (error) {
      // Invalid JSON, don't update schema yet
    }
  };

  const handleJsonBlur = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      onSchemaChange(parsed);
    } catch (error) {
      toast.error("Invalid JSON format");
      // Reset to valid schema
      setJsonValue(JSON.stringify(schema, null, 2));
    }
  };

  const handleValidateSchema = async () => {
    try {
      const result = await validateSchemaMutation.mutateAsync({ schema });
      setValidationResult(result);
      
      if (result.valid) {
        toast.success("Schema is valid!");
      } else {
        toast.error(`Schema validation failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error("Failed to validate schema");
    }
  };

  // Update JSON value when schema changes externally
  React.useEffect(() => {
    setJsonValue(JSON.stringify(schema, null, 2));
  }, [schema]);

  const renderFormView = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description/Prompt</Label>
        <Textarea
          id="description"
          value={schema.description || ''}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Describe what this section should contain and how AI should generate it..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={schema.type || 'string'}
            onChange={(e) => handleFormChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="string">String</option>
            <option value="array">Array</option>
            <option value="object">Object</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Properties</Label>
          <div className="text-sm text-gray-600">
            {schema.type === 'array' && schema.items?.properties && (
              <div className="space-y-1">
                {Object.entries(schema.items.properties).map(([key, prop]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {key} ({prop.type})
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {schema.type === 'object' && schema.properties && (
              <div className="space-y-1">
                {Object.entries(schema.properties).map(([key, prop]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {key} ({prop.type})
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {schema.type === 'string' && (
              <Badge variant="outline" className="text-xs">
                Simple string value
              </Badge>
            )}
          </div>
        </div>
      </div>

      {(schema.type === 'array' || schema.type === 'object') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Complex Structure:</strong> Switch to JSON view to edit the detailed structure of this {schema.type}.
          </p>
        </div>
      )}
    </div>
  );

  const renderJsonView = () => (
    <div className="space-y-2">
      <Label htmlFor="schema-json">Schema JSON</Label>
      <textarea
        id="schema-json"
        value={jsonValue}
        onChange={(e) => handleJsonChange(e.target.value)}
        onBlur={handleJsonBlur}
        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        placeholder="Enter valid JSON schema..."
      />
      <p className="text-xs text-gray-500">
        Edit the JSON directly. Make sure to include proper "description" fields for AI context.
      </p>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Schema Configuration</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'form' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('form')}
                className="h-7 px-3 text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Form
              </Button>
              <Button
                variant={viewMode === 'json' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('json')}
                className="h-7 px-3 text-xs"
              >
                <Code className="w-3 h-3 mr-1" />
                JSON
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleValidateSchema}
              disabled={validateSchemaMutation.isPending}
              className="h-8 px-3 text-xs"
            >
              {validateSchemaMutation.isPending ? (
                "Validating..."
              ) : validationResult?.valid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : validationResult && !validationResult.valid ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                "Validate"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySchema}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'form' ? renderFormView() : renderJsonView()}
        
        {/* Temporary Workaround Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Code className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Developer Workflow (Temporary)</p>
              <p className="text-blue-700">
                Schema changes are not automatically saved. To make improvements permanent:
              </p>
              <ol className="text-blue-700 mt-1 ml-4 list-decimal text-xs space-y-0.5">
                <li>Click "Copy" to copy the improved schema JSON</li>
                <li>Open <code className="bg-blue-100 px-1 rounded">server/defaultSchemas.ts</code></li>
                <li>Replace the schema for this section</li>
                <li>Deploy changes to make it the new default</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Validation Results */}
        {validationResult && (
          <div className={`mt-4 p-3 rounded-lg border ${
            validationResult.valid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.valid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                validationResult.valid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.valid ? 'Schema Valid' : 'Schema Invalid'}
              </span>
            </div>
            
            {validationResult.errors && validationResult.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-red-700 font-medium">Errors:</p>
                {validationResult.errors.map((error: string, index: number) => (
                  <p key={index} className="text-xs text-red-600">• {error}</p>
                ))}
              </div>
            )}
            
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs text-yellow-700 font-medium">Warnings:</p>
                {validationResult.warnings.map((warning: string, index: number) => (
                  <p key={index} className="text-xs text-yellow-600">• {warning}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
