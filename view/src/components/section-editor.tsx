import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { X, Wand2, Eye, Check, AlertCircle, Copy } from "lucide-react";
import { 
  useGetEditableSection, 
  usePreviewSectionWithSchema, 
  useApplySectionChanges 
} from "../hooks/useAdmin";
import { RawJsonViewer } from "./raw-json-viewer";
import { SchemaEditor } from "./schema-editor";
import { toast } from "sonner";

interface SectionEditorProps {
  ideaId: string;
  sectionKey: string;
  currentData: any;
  originalPrompt: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function SectionEditor({ 
  ideaId, 
  sectionKey, 
  currentData, 
  originalPrompt, 
  onClose, 
  onUpdate 
}: SectionEditorProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentSchema, setCurrentSchema] = useState<any>(null);
  const [schemaUsed, setSchemaUsed] = useState<any>(null);

  const { data: editableData, isLoading } = useGetEditableSection(ideaId, sectionKey);
  const previewMutation = usePreviewSectionWithSchema();
  const applyChangesMutation = useApplySectionChanges();

  // Initialize schema when data loads
  React.useEffect(() => {
    if (editableData?.currentSchema) {
      setCurrentSchema(editableData.currentSchema);
    }
  }, [editableData]);

  const handleGeneratePreview = async () => {
    if (!currentSchema) return;
    
    try {
      const result = await previewMutation.mutateAsync({
        ideaId,
        sectionKey,
        schemaOverride: currentSchema,
        customPrompt: customPrompt.trim() || undefined,
        originalPrompt,
      });
      
      setPreviewData(result.previewData);
      setSchemaUsed(result.schemaUsed);
      setShowPreview(true);
      toast.success("Preview generated successfully!");
    } catch (error) {
      toast.error("Failed to generate preview");
    }
  };

  const handleApplyChanges = async () => {
    if (!previewData) return;
    
    try {
      await applyChangesMutation.mutateAsync({
        ideaId,
        sectionKey,
        newData: previewData,
      });
      
      toast.success("Section updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to update section");
    }
  };

  const handleSchemaChange = (newSchema: any) => {
    setCurrentSchema(newSchema);
    // Reset preview when schema changes
    setShowPreview(false);
    setPreviewData(null);
  };

  const renderDataPreview = (data: any) => {
    if (typeof data === 'string') {
      return <p className="text-gray-700 whitespace-pre-wrap">{data}</p>;
    }
    
    if (Array.isArray(data)) {
      return (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              {typeof item === 'object' && item.title ? (
                <>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                  {item.inputSchema && (
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                      Input: {item.inputSchema}
                    </code>
                  )}
                  {item.outputSchema && (
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                      Output: {item.outputSchema}
                    </code>
                  )}
                </>
              ) : (
                <p className="text-gray-700">{JSON.stringify(item, null, 2)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading section data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!editableData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p>Failed to load section data</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Edit Section: {sectionKey}
                <Badge variant="outline">
                  {editableData.currentSchema?.type || 'unknown'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Edit the schema and preview AI-generated changes before applying
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Data Display */}
          <RawJsonViewer 
            data={editableData.currentData} 
            title="Current Raw Data"
            className="bg-orange-50 border-orange-200"
          />

          {/* Schema Configuration */}
          {currentSchema && (
            <SchemaEditor 
              schema={currentSchema}
              onSchemaChange={handleSchemaChange}
            />
          )}

          {/* Custom Prompt Override */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Custom Prompt Override</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">
                  Custom Instructions (optional - overrides schema description)
                </Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom instructions for how this section should be generated..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePreview}
              disabled={previewMutation.isPending || !currentSchema}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {previewMutation.isPending ? "Generating..." : "Generate Preview"}
            </Button>
            
            {showPreview && previewData && (
              <Button
                onClick={handleApplyChanges}
                disabled={applyChangesMutation.isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                {applyChangesMutation.isPending ? "Applying..." : "Apply Changes"}
              </Button>
            )}
          </div>

          {/* Preview Section */}
          {showPreview && previewData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Preview Changes</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Data */}
                <RawJsonViewer 
                  data={editableData.currentData} 
                  title="Current Data"
                  className="bg-orange-50 border-orange-200"
                />
                
                {/* New Data */}
                <RawJsonViewer 
                  data={previewData} 
                  title="New Data (Preview)"
                  className="bg-green-50 border-green-200"
                />
              </div>

              {/* Schema Used */}
              {schemaUsed && (
                <RawJsonViewer 
                  data={schemaUsed} 
                  title="Schema Used for Generation"
                  className="bg-blue-50 border-blue-200"
                />
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Confirm Changes</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Review the changes above. Once you apply them, the current data will be replaced with the new data. 
                  This action cannot be undone. You can copy the schema JSON to use in your code.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
