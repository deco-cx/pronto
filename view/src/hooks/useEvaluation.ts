import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook for evaluating an idea
export const useEvaluateIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { ideaId: string; expandedData: any }) => 
      client.EVALUATE_IDEA(input),
    onSuccess: (_, variables) => {
      // Invalidate evaluation query for this idea
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.ideaId] });
    },
  });
};

// Hook for getting an evaluation
export const useGetEvaluation = (ideaId: string) => {
  return useQuery({
    queryKey: ["evaluation", ideaId],
    queryFn: () => client.GET_EVALUATION({ ideaId }),
    enabled: !!ideaId,
  });
};

// Hook for deleting an evaluation
export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { ideaId: string }) => 
      client.DELETE_EVALUATION(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.ideaId] });
    },
  });
};