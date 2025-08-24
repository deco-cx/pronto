import { useQuery, useMutation } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook for exporting as prompt
export const useExportPrompt = () => {
  return useMutation({
    mutationFn: (input: { ideaId: string }) => 
      client.EXPORT_PROMPT(input),
  });
};

// Hook for generating markdown
export const useGenerateMarkdown = () => {
  return useMutation({
    mutationFn: (input: { ideaId: string }) => 
      client.GENERATE_MARKDOWN(input),
  });
};

// Hook for getting all exports for an idea
export const useGetExports = (ideaId: string) => {
  return useQuery({
    queryKey: ["exports", ideaId],
    queryFn: () => client.GET_EXPORTS({ ideaId }),
    enabled: !!ideaId,
  });
};