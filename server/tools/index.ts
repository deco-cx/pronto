/**
 * Central export point for all tools organized by domain.
 *
 * This file aggregates all tools from different domains into a single
 * export, making it easy to import all tools in main.ts while keeping
 * the domain separation.
 */
import { ideaTools } from "./ideas.ts";
import { expansionTools } from "../workflows/expansion.ts";
import { evaluationTools } from "./evaluation.ts";
import { exportTools } from "./export.ts";
import { aiTools } from "./ai.ts";
import { debugTools } from "./debug.ts";
import { adminTools } from "./admin.ts";

// Export all tools from all domains
export const tools = [
  ...ideaTools,
  ...expansionTools,
  ...evaluationTools,
  ...exportTools,
  ...aiTools,
  ...debugTools,
  ...adminTools,
];

// Re-export domain-specific tools for direct access if needed
export { ideaTools } from "./ideas.ts";
export { expansionTools } from "../workflows/expansion.ts";
export { evaluationTools } from "./evaluation.ts";
export { exportTools } from "./export.ts";
export { aiTools } from "./ai.ts";
export { debugTools } from "./debug.ts";
export { adminTools } from "./admin.ts";
