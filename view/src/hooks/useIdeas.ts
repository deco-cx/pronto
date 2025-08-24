import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

// Hook for creating a new idea
export const useCreateIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { originalPrompt: string }) => 
      client.CREATE_IDEA(input),
    onSuccess: () => {
      // Invalidate ideas list to refetch
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
};

// Hook for getting a single idea
export const useGetIdea = (id: string) => {
  return useQuery({
    queryKey: ["idea", id],
    queryFn: () => client.GET_IDEA({ id }),
    enabled: !!id,
  });
};

// Hook for getting a single idea with polling (for expansion status)
export const useGetIdeaWithPolling = (id: string) => {
  return useQuery({
    queryKey: ["idea", id],
    queryFn: () => client.GET_IDEA({ id }),
    enabled: !!id,
    refetchInterval: (data) => {
      // Stop polling once we have expanded data
      if (data?.data?.idea?.expandedData) {
        return false;
      }
      // Poll every 4 seconds if no expanded data yet
      return 4000;
    },
    refetchIntervalInBackground: true,
  });
};

// Hook for listing ideas with pagination
export const useListIdeas = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["ideas", { page, limit }],
    queryFn: () => client.LIST_IDEAS({ page, limit }),
  });
};

// Hook for deleting an idea
export const useDeleteIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { id: string }) => 
      client.DELETE_IDEA(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
};

// Hook for updating idea data
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { id: string; expandedData: any }) => 
      client.UPDATE_IDEA(input),
    onSuccess: (_, variables) => {
      // Invalidate the specific idea and ideas list
      queryClient.invalidateQueries({ queryKey: ["idea", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
};