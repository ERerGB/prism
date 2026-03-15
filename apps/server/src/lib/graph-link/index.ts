
import { GraphReader } from './reader.js';
import { GraphWriter } from './writer.js';

import { createIronyAtom } from './atoms/irony.js';
import { createEvidenceAtom } from './atoms/evidence.js';
import { createEmotionalAtom } from './atoms/emotional.js';
import { createCausalAtom } from './atoms/causal.js';
import { createEntityExtractionAtom } from './atoms/entity-extraction.js';
import { createSerendipityAtom } from './atoms/serendipity.js';
import type { IronyAtomDeps } from './atoms/irony.js';

export interface GraphLinkDeps {
  irony?: IronyAtomDeps;
}

/**
 * Register the default atom chain for a GraphWriter instance.
 * Keeping this in an explicit function makes test-time dependency injection possible.
 */
export function registerDefaultAtoms(writer: GraphWriter, deps?: GraphLinkDeps): void {
  writer.use(createEntityExtractionAtom(writer)); // Entity + Relation Extraction
  writer.use(createSerendipityAtom());            // Serendipity (Graph-based surprise)
  writer.use(createIronyAtom(writer, deps?.irony)); // Level 4 (Irony)
  writer.use(createCausalAtom(writer));           // Level 3 (Logic)
  writer.use(createEmotionalAtom(writer));        // Level 2 (Humanity)
  writer.use(createEvidenceAtom(writer));         // Level 1 (Facts)
}

/**
 * Create an isolated graph link pair (reader + writer).
 * Useful for tests that need deterministic middleware dependencies.
 */
export function createGraphLink(deps?: GraphLinkDeps): { graphReader: GraphReader; graphWriter: GraphWriter } {
  const graphReader = new GraphReader();
  const graphWriter = new GraphWriter();
  registerDefaultAtoms(graphWriter, deps);
  return { graphReader, graphWriter };
}

// Backward-compatible global singleton instances for app runtime.
const defaultGraphLink = createGraphLink();
export const graphReader = defaultGraphLink.graphReader;
export const graphWriter = defaultGraphLink.graphWriter;

export * from './types.js';
export * from './equivalence.js';
export { GraphReader, GraphWriter };
