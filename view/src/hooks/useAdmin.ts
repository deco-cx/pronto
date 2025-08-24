import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../lib/rpc";

export function useGetSchemaConfigs() {
  return useQuery({
    queryKey: ['schema-configs'],
    queryFn: () => client.GET_SCHEMA_CONFIGS({}),
  });
}

export function useGetSchemaFields(configId: string) {
  return useQuery({
    queryKey: ['schema-fields', configId],
    queryFn: () => client.GET_SCHEMA_FIELDS({ configId }),
    enabled: !!configId,
  });
}

export function useCreateSchemaConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { name: string; description: string }) =>
      client.CREATE_SCHEMA_CONFIG(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema-configs'] });
    },
  });
}

export function useUpdateSchemaField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: {
      fieldId: string;
      key?: string;
      type?: 'string' | 'array' | 'object';
      description?: string;
      required?: boolean;
      parentField?: string | null;
      order?: number;
    }) => client.UPDATE_SCHEMA_FIELD(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema-fields'] });
    },
  });
}

export function useCreateSchemaField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: {
      configId: string;
      key: string;
      type: 'string' | 'array' | 'object';
      description: string;
      required?: boolean;
      parentField?: string | null;
      order?: number;
    }) => client.CREATE_SCHEMA_FIELD(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema-fields'] });
    },
  });
}

export function useInitializeDefaultSchemas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => client.INITIALIZE_DEFAULT_SCHEMAS({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schema-configs'] });
    },
  });
}

// New hooks for section re-expansion
export function useGetSectionSchema(sectionKey: string) {
  return useQuery({
    queryKey: ['section-schema', sectionKey],
    queryFn: () => client.GET_SECTION_SCHEMA({ sectionKey }),
    enabled: !!sectionKey,
  });
}

export function useReExpandSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: {
      ideaId: string;
      sectionKey: string;
      customPrompt?: string;
      originalPrompt: string;
    }) => client.RE_EXPAND_SECTION(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific idea query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['idea', variables.ideaId] });
    },
  });
}

export function useUpdateSectionData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: {
      ideaId: string;
      sectionKey: string;
      newData: any;
    }) => client.UPDATE_SECTION_DATA(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific idea query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['idea', variables.ideaId] });
    },
  });
}

// Hook for getting evaluation criteria configuration
export function useGetEvaluationCriteria() {
  return useQuery({
    queryKey: ['evaluationCriteria'],
    queryFn: () => client.GET_EVALUATION_CRITERIA({}),
  });
}

// Hook for updating evaluation criteria
export function useUpdateEvaluationCriteria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: { criteria: Array<{ key: string; title: string; description: string; prompt: string }> }) => 
      client.UPDATE_EVALUATION_CRITERIA(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluationCriteria'] });
    },
  });
}