import { createRoute, type RootRoute } from "@tanstack/react-router";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader, Sparkles, Clock, Home, History, Star, Zap, Settings } from "lucide-react";
import { ExpansionDisplay } from "../components/expansion-display";
import { useGetIdeaWithPolling } from "../hooks/useIdeas";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

function ExpandPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: ideaResponse, isLoading, error, isFetching } = useGetIdeaWithPolling(id as string);
  const [adminMode, setAdminMode] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState([
    "🧠 Analyzing your idea...",
    "✨ Generating comprehensive features...", 
    "🏗️ Designing the architecture...",
    "🛠️ Creating tools and workflows...",
    "📊 Building implementation roadmap...",
    "🎯 Almost there..."
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Cycle through loading messages every 6 seconds
  useEffect(() => {
    if (!ideaResponse?.idea?.expandedData) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 6000);
      
      return () => clearInterval(interval);
    }
  }, [ideaResponse?.idea?.expandedData, loadingMessages.length]);

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleHistory = () => {
    navigate({ to: "/history" });
  };

  const handleNewIdea = () => {
    navigate({ to: "/" });
  };

  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading your expanded idea...</p>
        </div>
      </div>
    );
  }

  if (error || !ideaResponse?.idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">😞</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Idea Not Found</h2>
            <p className="text-gray-600 mb-4">
              The idea you're looking for doesn't exist or hasn't been expanded yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleBack} className="bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] hover:from-[#86DEE8]/80 hover:to-[#A1C5F9]/80 text-white rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              <Button onClick={handleHistory} variant="outline" className="rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
                <History className="w-4 h-4" />
                View History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const idea = ideaResponse.idea;

  if (!idea.expandedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#86DEE8]/20 via-[#A1C5F9]/20 to-[#FEE38B]/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] rounded-full mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Expanding Your Idea
              </h1>
              <p className="text-gray-600 text-lg">
                Our AI is working hard to transform your concept into a comprehensive development plan
              </p>
            </div>

            {/* Original Prompt Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your Original Idea</h3>
              <p className="text-gray-800 text-lg leading-relaxed">{idea.originalPrompt}</p>
            </div>

            {/* Loading Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#86DEE8]/30 to-[#A1C5F9]/30 rounded-full mb-4">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <p className="text-xl font-medium text-gray-800 mb-2 min-h-[28px] transition-all duration-500">
                  {loadingMessages[currentMessageIndex]}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex justify-center items-center space-x-2 mb-3">
                  {loadingMessages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentMessageIndex
                          ? 'bg-blue-500 scale-125'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Step {Math.min(currentMessageIndex + 1, loadingMessages.length)} of {loadingMessages.length}
                </p>
              </div>

              {/* Polling indicator */}
              {isFetching && (
                <div className="flex items-center justify-center text-blue-600 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Checking for updates...</span>
                </div>
              )}

              <p className="text-gray-500 text-sm mb-6">
                This usually takes 1-2 minutes. We're polling every 4 seconds for updates.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button onClick={handleBack} className="bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] hover:from-[#86DEE8]/80 hover:to-[#A1C5F9]/80 text-white rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                <Button onClick={handleHistory} variant="outline" className="rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
                  <History className="w-4 h-4" />
                  View History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#86DEE8]/20 via-[#A1C5F9]/20 to-[#FEE38B]/20">
      {/* Enhanced Navigation */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button with Fun Style */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                className="bg-gradient-to-r from-[#86DEE8] to-[#A1C5F9] hover:from-[#86DEE8]/80 hover:to-[#A1C5F9]/80 text-white rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
              
              {/* Breadcrumb Style Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-gray-500">
                <Home className="w-4 h-4" />
                <span>/</span>
                <div className="flex items-center gap-1 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Expanded Idea</span>
                </div>
              </div>
            </div>

            {/* Center: Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#86DEE8]/30 to-[#A1C5F9]/30 text-gray-700 px-4 py-2 rounded-full border border-[#86DEE8]/50">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">✨ Idea Expanded</span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleAdminMode}
                variant={adminMode ? "default" : "outline"}
                className={`hidden sm:flex items-center gap-2 rounded-xl transition-colors ${
                  adminMode 
                    ? "bg-[#FEE38B] hover:bg-[#FEE38B]/80 text-gray-800" 
                    : "hover:bg-[#FEE38B]/20 border-[#FEE38B] text-gray-700"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
              
              <Button
                onClick={handleHistory}
                variant="outline"
                className="hidden sm:flex items-center gap-2 rounded-xl hover:bg-[#86DEE8]/20 transition-colors"
              >
                <History className="w-4 h-4" />
                History
              </Button>
              
              <Button
                onClick={handleNewIdea}
                className="bg-gradient-to-r from-[#A1C5F9] to-[#FEE38B] hover:from-[#A1C5F9]/80 hover:to-[#FEE38B]/80 text-gray-800 rounded-xl flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">New Idea</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </div>

          {/* Mobile Breadcrumb */}
          <div className="sm:hidden flex items-center gap-2 text-gray-500 mt-3">
            <Home className="w-4 h-4" />
            <span>/</span>
            <div className="flex items-center gap-1 text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Expanded Idea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-6">
        <ExpansionDisplay
          idea={idea}
          adminMode={adminMode}
        />
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/expand/$id",
    component: ExpandPage,
    getParentRoute: () => parentRoute,
  });