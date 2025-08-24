import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Wand2, Eye, Check, AlertCircle } from "lucide-react";
import { useGetSectionSchema, useReExpandSection, useUpdateSectionData } from "../hooks/useAdmin";
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

  const { data: schemaData } = useGetSectionSchema(sectionKey);
  const reExpandMutation = useReExpandSection();
  const updateSectionMutation = useUpdateSectionData();

  const handleGeneratePreview = async () => {
    try {
      const result = await reExpandMutation.mutateAsync({
        ideaId,
        sectionKey,
        customPrompt: customPrompt.trim() || undefined,
        originalPrompt,
      });
      
      setPreviewData(result.newData);
      setShowPreview(true);
      toast.success("Preview generated successfully!");
    } catch (error) {
      toast.error("Failed to generate preview");
    }
  };

  const handleApplyChanges = async () => {
    if (!previewData) return;
    
    try {
      await updateSectionMutation.mutateAsync({
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Edit Section: {sectionKey}
                <Badge variant="outline">{typeof currentData === 'string' ? 'string' : Array.isArray(currentData) ? 'array' : 'object'}</Badge>
              </CardTitle>
              <CardDescription>
                Modify the AI prompt to regenerate this section with different requirements
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Schema Info */}
          {schemaData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Current AI Prompt</h3>
              <p className="text-sm text-blue-700">{schemaData.description}</p>
            </div>
          )}

          {/* Custom Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Prompt (optional - leave empty to use default)
            </label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter custom instructions for how this section should be generated..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGeneratePreview}
              disabled={reExpandMutation.isPending}
              className="flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              {reExpandMutation.isPending ? "Generating..." : "Generate Preview"}
            </Button>
            
            {showPreview && previewData && (
              <Button
                onClick={handleApplyChanges}
                disabled={updateSectionMutation.isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                {updateSectionMutation.isPending ? "Applying..." : "Apply Changes"}
              </Button>
            )}
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">Preview Changes</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Data */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Current Data
                  </h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {renderDataPreview(currentData)}
                  </div>
                </div>
                
                {/* New Data */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    New Data
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {renderDataPreview(previewData)}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Confirm Changes</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Review the changes above. Once you apply them, the current data will be replaced with the new data. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
