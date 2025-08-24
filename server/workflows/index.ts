/**
 * Central export point for all workflows organized by domain.
 *
 * This file aggregates all workflows from different domains into a single
 * export, making it easy to import all workflows in main.ts while keeping
 * the domain separation.
 */

// Import workflow arrays from domain files
import { expansionWorkflows } from "./expansion.ts";

// Export all workflows from all domains
export const workflows = [
  ...expansionWorkflows,
];

// Re-export domain-specific workflows for direct access if needed
export { expansionWorkflows } from "./expansion.ts";
