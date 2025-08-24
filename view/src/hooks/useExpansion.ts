import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook for expanding an idea
export const useExpandIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { originalPrompt: string; ideaId: string }) => 
      client.EXPAND_IDEA(input),
    onSuccess: (_, variables) => {
      // Invalidate the specific idea to refetch with expanded data
      queryClient.invalidateQueries({ queryKey: ["idea", variables.ideaId] });
    },
  });
};

// Hook for complete expansion workflow
export const useCompleteExpansion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { originalPrompt: string; ideaId: string }) => 
      client.DECO_CHAT_WORKFLOWS_START_COMPLETE_EXPANSION_WORKFLOW(input),
    onSuccess: (_, variables) => {
      // Invalidate the specific idea and ideas list
      queryClient.invalidateQueries({ queryKey: ["idea", variables.ideaId] });
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
};

// Hook for editing a specific section
export const useEditSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: {
      ideaId: string;
      section: string;
      editPrompt: string;
      currentData: any;
    }) => client.EDIT_SECTION(input),
    onSuccess: (_, variables) => {
      // Invalidate the specific idea to refetch
      queryClient.invalidateQueries({ queryKey: ["idea", variables.ideaId] });
    },
  });
};

// Hook for suggesting external tools
export const useSuggestExternalTools = () => {
  return useMutation({
    mutationFn: (input: { expandedIdea: any }) => 
      client.SUGGEST_EXTERNAL_TOOLS(input),
  });
};