/**
 * Utility functions for schema validation and manipulation
 */

/**
 * Validate that a schema has the required structure for AI generation
 */
export function validateSchema(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema || typeof schema !== 'object') {
    errors.push('Schema must be an object');
    return { valid: false, errors };
  }

  if (!schema.type) {
    errors.push('Schema must have a "type" property');
  }

  if (!schema.description) {
    errors.push('Schema must have a "description" property for AI context');
  }

  // Validate array schemas
  if (schema.type === 'array') {
    if (!schema.items) {
      errors.push('Array schemas must have an "items" property');
    } else if (!schema.items.description && schema.items.properties) {
      // Check if nested properties have descriptions
      const missingDescriptions = Object.entries(schema.items.properties || {})
        .filter(([_, prop]: [string, any]) => !prop.description)
        .map(([key]) => key);
      
      if (missingDescriptions.length > 0) {
        errors.push(`Array item properties missing descriptions: ${missingDescriptions.join(', ')}`);
      }
    }
  }

  // Validate object schemas
  if (schema.type === 'object' && schema.properties) {
    const missingDescriptions = Object.entries(schema.properties)
      .filter(([_, prop]: [string, any]) => !prop.description)
      .map(([key]) => key);
    
    if (missingDescriptions.length > 0) {
      errors.push(`Object properties missing descriptions: ${missingDescriptions.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Wrap a section schema in the format expected by AI_GENERATE_OBJECT
 */
export function wrapSectionSchema(sectionKey: string, sectionSchema: any) {
  return {
    type: 'object',
    properties: {
      [sectionKey]: sectionSchema
    },
    required: [sectionKey]
  };
}

/**
 * Extract section data from AI response
 */
export function extractSectionData(response: any, sectionKey: string) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid AI response format');
  }

  const sectionData = response[sectionKey];
  if (sectionData === undefined) {
    throw new Error(`AI did not return data for section: ${sectionKey}`);
  }

  return sectionData;
}

/**
 * Create a comprehensive AI prompt for section generation
 */
export function createSectionPrompt(
  sectionKey: string,
  originalPrompt: string,
  currentData: any,
  promptDescription: string
): string {
  return `You are an expert software architect and product manager specializing in the Deco MCP platform.

Your task is to generate ONLY the "${sectionKey}" section for this software idea:

Original Idea: "${originalPrompt}"

Current Context: ${JSON.stringify(currentData, null, 2)}

Section Requirements: ${promptDescription}

Generate ONLY the ${sectionKey} data that matches this exact schema structure. Do not include any other sections or wrapper objects.

Important: Make sure your response follows the exact schema format and includes all required fields with meaningful, detailed content.`;
}
