import { useState } from "react";
import { Button } from "./ui/button";
import { useCreateIdea } from "../hooks/useIdeas";
import { useCompleteExpansion } from "../hooks/useExpansion";

interface IdeaInputProps {
  onSuccess?: (ideaId: string) => void;
  placeholder?: string;
}

const EXAMPLE_IDEAS = [
  "I want to create an app that analyzes my emails and finds the most important ones",
  "Build a tool that helps me manage my personal budget using AI insights",
  "Create a platform for organizing team meetings with automated scheduling",
  "Design an app that tracks my fitness goals and suggests personalized workouts",
  "Build a knowledge management system for my company's documentation",
];

export function IdeaInput({ onSuccess, placeholder }: IdeaInputProps) {
  const [prompt, setPrompt] = useState("");
  const createIdea = useCreateIdea();
  const completeExpansion = useCompleteExpansion();

  const isLoading = createIdea.isPending || completeExpansion.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading) return;

    try {
      // First create the idea
      const ideaResult = await createIdea.mutateAsync({
        originalPrompt: prompt.trim(),
      });

      if (ideaResult.success) {
        console.log('🚀 About to call workflow with:', {
          originalPrompt: prompt.trim(),
          ideaId: ideaResult.id,
          ideaIdType: typeof ideaResult.id
        });
        
        // Then expand it using the workflow
        await completeExpansion.mutateAsync({
          originalPrompt: prompt.trim(),
          ideaId: ideaResult.id,
        });

        // Call success callback
        onSuccess?.(ideaResult.id);
        
        // Clear the input
        setPrompt("");
      }
    } catch (error) {
      console.error("Failed to create and expand idea:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Describe your software idea... (e.g., I want to create an app that analyzes my emails and finds the most important ones)"}
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-lg"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {prompt.length}/1000 • Ctrl+Enter to submit
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="px-8 py-3 text-lg font-semibold"
          >
            {isLoading ? "Expanding your idea..." : "Expand Idea"}
          </Button>
        </div>
      </form>

      {/* Example ideas */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Try these examples:</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {EXAMPLE_IDEAS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {(createIdea.error || completeExpansion.error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            Failed to expand idea. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}