import { useState } from "react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, Edit, FileText, Settings } from "lucide-react";
import { SectionEditor } from "./section-editor";
import { ExportModal } from "./export-modal";
import { InlineEvaluation } from "./inline-evaluation";

interface ExpandedIdea {
  title: string;
  description: string;
  features: Array<{ title: string; description: string }>;
  architecture: { files: Array<{ path: string; description: string }> };
  dataModels: Array<{ title: string; schema: string }>;
  tools: Array<{ title: string; description: string; inputSchema: string; outputSchema: string }>;
  toolsFromOtherApps?: Array<{ service: string; toolName: string; description: string; useCase: string }>;
  workflows: Array<{ title: string; description: string; trigger: string }>;
  views: Array<{ title: string; pathTemplate: string; description: string; layoutExample: string }>;
  implementationPhases: Array<{ title: string; description: string; duration: string; tasks: string[] }>;
  successMetrics: string[];
}

interface Idea {
  id: string;
  originalPrompt: string;
  expandedData: ExpandedIdea;
  createdAt: string;
  updatedAt: string;
}

interface ExpansionDisplayProps {
  idea: Idea;
  adminMode?: boolean;
}

export function ExpansionDisplay({ idea, adminMode = false }: ExpansionDisplayProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["description", "features"]));
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const expanded = idea.expandedData;

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) {
      newOpen.delete(section);
    } else {
      newOpen.add(section);
    }
    setOpenSections(newOpen);
  };

  const sections = [
    {
      key: "description",
      title: "Description",
      content: <p className="text-gray-700 leading-relaxed">{expanded.description}</p>
    },
    {
      key: "features",
      title: `Features (${expanded.features?.length || 0})`,
      content: (
        <div className="space-y-3">
          {expanded.features?.map((feature, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <h4 className="font-semibold text-gray-800">{feature.title}</h4>
              <p className="text-gray-600 mt-1">{feature.description}</p>
            </div>
          )) || <p className="text-gray-500">No features defined</p>}
        </div>
      )
    },
    {
      key: "architecture",
      title: `Architecture (${expanded.architecture?.files?.length || 0} files)`,
      content: (
        <div className="space-y-2">
          {expanded.architecture?.files?.map((file, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {file.path}
              </code>
              <p className="text-gray-600 text-sm flex-1">{file.description}</p>
            </div>
          )) || <p className="text-gray-500">No architecture defined</p>}
        </div>
      )
    },
    {
      key: "dataModels",
      title: `Data Models (${expanded.dataModels?.length || 0})`,
      content: (
        <div className="space-y-4">
          {expanded.dataModels?.map((model, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold text-gray-800">{model.title}</h4>
              <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                {model.schema}
              </pre>
            </div>
          )) || <p className="text-gray-500">No data models defined</p>}
        </div>
      )
    },
    {
      key: "tools",
      title: `Tools (${expanded.tools?.length || 0})`,
      content: (
        <div className="space-y-4">
          {expanded.tools?.map((tool, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{tool.title}</h4>
              <p className="text-gray-600 mb-3">{tool.description}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Input Schema</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{tool.inputSchema}</pre>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Output Schema</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{tool.outputSchema}</pre>
                </div>
              </div>
            </div>
          )) || <p className="text-gray-500">No tools defined</p>}
        </div>
      )
    },
    {
      key: "externalTools",
      title: `External Integrations (${expanded.toolsFromOtherApps?.length || 0})`,
      content: (
        <div className="space-y-3">
          {expanded.toolsFromOtherApps?.map((tool, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{tool.service.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{tool.service}</h4>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{tool.toolName}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
                <p className="text-blue-600 text-sm"><strong>Use case:</strong> {tool.useCase}</p>
              </div>
            </div>
          )) || <p className="text-gray-500">No external tools suggested</p>}
        </div>
      )
    },
    {
      key: "workflows",
      title: `Workflows (${expanded.workflows?.length || 0})`,
      content: (
        <div className="space-y-3">
          {expanded.workflows?.map((workflow, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{workflow.title}</h4>
              <p className="text-gray-600 mb-2">{workflow.description}</p>
              <p className="text-sm text-blue-600"><strong>Trigger:</strong> {workflow.trigger}</p>
            </div>
          )) || <p className="text-gray-500">No workflows defined</p>}
        </div>
      )
    },
    {
      key: "views",
      title: `Views (${expanded.views?.length || 0})`,
      content: (
        <div className="space-y-4">
          {expanded.views?.map((view, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-800">{view.title}</h4>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{view.pathTemplate}</code>
              </div>
              <p className="text-gray-600 mb-3">{view.description}</p>
              {view.layoutExample && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Layout Example</h5>
                  <div dangerouslySetInnerHTML={{ __html: view.layoutExample }} />
                </div>
              )}
            </div>
          )) || <p className="text-gray-500">No views defined</p>}
        </div>
      )
    },
    {
      key: "phases",
      title: `Implementation Phases (${expanded.implementationPhases?.length || 0})`,
      content: (
        <div className="space-y-4">
          {expanded.implementationPhases?.map((phase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <h4 className="font-semibold text-gray-800">{phase.title}</h4>
                <span className="text-sm text-gray-500">({phase.duration})</span>
              </div>
              <p className="text-gray-600 mb-3 ml-11">{phase.description}</p>
              {phase.tasks && phase.tasks.length > 0 && (
                <div className="ml-11">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks:</h5>
                  <ul className="space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )) || <p className="text-gray-500">No phases defined</p>}
        </div>
      )
    },
    {
      key: "metrics",
      title: `Success Metrics (${expanded.successMetrics?.length || 0})`,
      content: (
        <ul className="space-y-2">
          {expanded.successMetrics?.map((metric, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700">{metric}</span>
            </li>
          )) || <p className="text-gray-500">No success metrics defined</p>}
        </ul>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 pb-6 border-b">
        <h1 className="text-4xl font-bold text-gray-900">{expanded.title}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>Original: {idea.originalPrompt}</span>
          <span>•</span>
          <span>Created: {new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => setShowExportModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Admin Mode Info Panel */}
      {adminMode && (
        <div className="bg-[#FEE38B]/20 border border-[#FEE38B]/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-gray-800">Admin Mode Enabled</h3>
          </div>
          <p className="text-sm text-gray-700">
            You can now edit individual sections by clicking the "Edit" button on each section header. 
            This will allow you to modify the AI prompts and re-generate specific parts of the idea.
          </p>
        </div>
      )}

      {/* Expandable sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Collapsible
            key={section.key}
            open={openSections.has(section.key)}
            onOpenChange={() => toggleSection(section.key)}
          >
            <div className="flex w-full items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.has(section.key) ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <div className="flex items-center gap-2">
                {adminMode && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(section.key);
                    }}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-[#FEE38B]/20 border border-[#FEE38B]/30 hover:border-[#FEE38B]/50"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <CollapsibleContent className="p-4 bg-white border border-gray-200 rounded-b-lg">
              {section.content}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Inline Evaluation */}
      <InlineEvaluation 
        ideaId={idea.id}
        expandedData={expanded}
        adminMode={adminMode}
      />

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          ideaId={idea.id}
          sectionKey={editingSection}
          currentData={expanded[editingSection as keyof ExpandedIdea]}
          originalPrompt={idea.originalPrompt}
          onClose={() => setEditingSection(null)}
          onUpdate={() => {
            // The hook will automatically invalidate and refetch the idea data
            // No additional action needed here
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          idea={idea}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}