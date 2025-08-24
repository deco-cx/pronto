import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, Lightbulb, ArrowRight, Clock } from "lucide-react";
import { IdeaInput } from "../components/idea-input";
import { useListIdeas } from "../hooks/useIdeas";
import { Button } from "../components/ui/button";

function RecentIdeas() {
  const { data: ideasData, isLoading } = useListIdeas(1, 5);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Recent Ideas</h3>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!ideasData?.ideas || ideasData.ideas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Recent Ideas</h3>
      <div className="space-y-2">
        {ideasData.ideas.map((idea) => (
          <button
            key={idea.id}
            onClick={() => navigate({ to: `/expand/${idea.id}` })}
            className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-[#86DEE8] hover:bg-[#86DEE8]/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-gray-800 text-sm line-clamp-2 mb-1">
                  {idea.originalPrompt}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(idea.createdAt).toLocaleDateString()}
                  {idea.hasExpandedData && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Expanded
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const handleIdeaSuccess = (ideaId: string) => {
    navigate({ to: `/expand/${ideaId}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#86DEE8]/20 via-white to-[#A1C5F9]/20">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div /> {/* Spacer */}
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] bg-clip-text text-transparent">
                Pronto
              </h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/history" })}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              History
            </Button>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Prompts with Purpose
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your simple software ideas into comprehensive, structured development plans. 
            Get detailed architectures, data models, tools, and implementation roadmaps powered by AI.
          </p>
        </div>

        {/* Main Input Section */}
        <div className="mb-16">
          <IdeaInput onSuccess={handleIdeaSuccess} />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Expansion</h3>
            <p className="text-gray-600 text-sm">
              AI analyzes your idea and creates comprehensive plans with architecture, 
              data models, tools, and implementation phases.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Editing</h3>
            <p className="text-gray-600 text-sm">
              Edit any section with AI assistance. Refine features, architecture, 
              or implementation details with natural language prompts.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Build</h3>
            <p className="text-gray-600 text-sm">
              Export your expanded ideas as structured prompts or markdown documentation 
              ready for development teams.
            </p>
          </div>
        </div>

        {/* Recent Ideas Section */}
        <div className="max-w-2xl mx-auto">
          <RecentIdeas />
        </div>
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/",
    component: HomePage,
    getParentRoute: () => parentRoute,
  });
