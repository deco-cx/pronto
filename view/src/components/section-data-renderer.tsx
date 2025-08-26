/**
 * Renders section data using the same layout as the expansion display
 */

interface SectionDataRendererProps {
  sectionKey: string;
  data: any;
  className?: string;
}

export function SectionDataRenderer({ sectionKey, data, className = "" }: SectionDataRendererProps) {
  if (!data) {
    return <p className="text-gray-500">No data available</p>;
  }

  const renderContent = () => {
    switch (sectionKey) {
      case 'title':
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800">{data}</h2>
          </div>
        );

      case 'description':
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{data}</p>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-3">
            {Array.isArray(data) ? data.map((feature, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                <p className="text-gray-600 mt-1">{feature.description}</p>
              </div>
            )) : <p className="text-gray-500">Invalid features data</p>}
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-2">
            {data?.files?.map((file: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {file.path}
                </code>
                <p className="text-gray-600 text-sm flex-1">{file.description}</p>
              </div>
            )) || <p className="text-gray-500">No architecture files defined</p>}
          </div>
        );

      case 'dataModels':
        return (
          <div className="space-y-4">
            {Array.isArray(data) ? data.map((model, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-gray-800">{model.title}</h4>
                <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  {model.schema}
                </pre>
              </div>
            )) : <p className="text-gray-500">Invalid data models</p>}
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-4">
            {Array.isArray(data) ? data.map((tool, index) => (
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
            )) : <p className="text-gray-500">Invalid tools data</p>}
          </div>
        );

      case 'toolsFromOtherApps':
        return (
          <div className="space-y-3">
            {Array.isArray(data) ? data.map((tool, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">{tool.service?.slice(0, 2) || 'EX'}</span>
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
            )) : <p className="text-gray-500">Invalid external tools data</p>}
          </div>
        );

      case 'workflows':
        return (
          <div className="space-y-3">
            {Array.isArray(data) ? data.map((workflow, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{workflow.title}</h4>
                <p className="text-gray-600 mb-2">{workflow.description}</p>
                <div className="bg-blue-50 px-3 py-2 rounded">
                  <span className="text-sm text-blue-700"><strong>Trigger:</strong> {workflow.trigger}</span>
                </div>
              </div>
            )) : <p className="text-gray-500">Invalid workflows data</p>}
          </div>
        );

      case 'views':
        return (
          <div className="space-y-4">
            {Array.isArray(data) ? data.map((view, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-800">{view.title}</h4>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{view.pathTemplate}</code>
                </div>
                <p className="text-gray-600 mb-3">{view.description}</p>
                {view.layoutExample && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Layout Example</h5>
                    <div className="bg-white p-2 rounded border" dangerouslySetInnerHTML={{ __html: view.layoutExample }} />
                  </div>
                )}
              </div>
            )) : <p className="text-gray-500">Invalid views data</p>}
          </div>
        );

      case 'implementationPhases':
        return (
          <div className="space-y-4">
            {Array.isArray(data) ? data.map((phase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-800">{phase.title}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{phase.duration}</span>
                </div>
                <p className="text-gray-600 mb-3 ml-11">{phase.description}</p>
                {phase.tasks && phase.tasks.length > 0 && (
                  <div className="ml-11">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks:</h5>
                    <ul className="space-y-1">
                      {phase.tasks.map((task: string, taskIndex: number) => (
                        <li key={taskIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )) : <p className="text-gray-500">Invalid implementation phases data</p>}
          </div>
        );

      case 'successMetrics':
        return (
          <div className="space-y-2">
            {Array.isArray(data) ? data.map((metric, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ✓
                </div>
                <p className="text-gray-700 text-sm">{metric}</p>
              </div>
            )) : <p className="text-gray-500">Invalid success metrics data</p>}
          </div>
        );

      default:
        // Fallback for unknown section types - render as JSON but with better formatting
        return (
          <div className="space-y-2">
            {typeof data === 'string' ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{data}</p>
              </div>
            ) : Array.isArray(data) ? (
              <div className="space-y-3">
                {data.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    {typeof item === 'object' ? (
                      Object.entries(item).map(([key, value]) => (
                        <div key={key} className="mb-2 last:mb-0">
                          <span className="text-sm font-medium text-gray-700">{key}:</span>
                          <span className="ml-2 text-gray-600">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-700">{String(item)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}

