# Prism Semantic Elements Audit for Skillet

Status: Draft  
Date: 2026-03-15  
Scope: Prism extraction aftermath + Skillet-oriented architecture alignment

## Why this audit exists

Prism currently ships multiple semantic elements (`irony`, `emotional`, `causal`, `evidence`, `serendipity`) in the default graph-link middleware chain.

Skillet's current role, based on ADRs, is an orchestrator for:

- Skill discovery (SkillRank)
- Content ingest/recall (Prism)
- Feedback loop (`priorWeight`, `hub-signals`)

The key question is whether semantic elements are core dependencies for Skillet, optional capabilities, or removable noise.

## Evidence snapshot

### Skillet side (consumer reality)

Skillet docs and ADRs describe Prism usage as:

- ingest
- recall/search
- bidirectional signal loop (`priorWeight`, `hub-signals`)

No explicit contract dependency on `irony`, `emotional`, `causal`, `evidence`, `serendipity` output keys is currently documented.

### Prism side (producer reality)

Default middleware registration includes all semantic atoms:

- `createEntityExtractionAtom`
- `createSerendipityAtom`
- `createIronyAtom`
- `createCausalAtom`
- `createEmotionalAtom`
- `createEvidenceAtom`

These are wired in `apps/server/src/lib/graph-link/index.ts`.

## Classification

### Core (required for Skillet MVP and near-term roadmap)

1. **Entity extraction + relation persistence**
   - Module: `entity-extraction` atom and extraction pipeline
   - Value: required for graph quality and downstream retrieval
   - Action: keep enabled by default

2. **Ingest/recall/search graph operations**
   - Module: `GraphWriter`, `GraphReader`, API endpoints around ingest/search/recall
   - Value: direct dependency of Skillet orchestrator
   - Action: keep enabled by default

3. **SkillRank contract plumbing**
   - `priorWeight/priorSource` intake
   - `/graph/hub-signals` output
   - Action: treat as core delivery target for subsystem refactor

### Extension (optional, default-off recommended)

1. **Irony**
   - Output key: `irony`
   - Current value: narrative/exploration enhancement, not a proven Skillet dependency
   - Action: move to optional extension group

2. **Emotional**
   - Output key: `emotional`
   - Current value: style/voice signal, not a proven contract dependency
   - Action: move to optional extension group

3. **Causal**
   - Output key: `causal`
   - Current value: potentially useful for reasoning UX, but not required for MVP flow
   - Action: move to optional extension group

4. **Evidence**
   - Output key: `evidence`
   - Current value: useful but currently not required by Skillet contract
   - Action: move to optional extension group

5. **Serendipity**
   - Output key: `novelty` and related surprise scoring
   - Current value: ranking/novelty enhancer, not required for baseline orchestrator flow
   - Action: move to optional extension group

### Archive candidate (not now)

No immediate archive recommendation.  
Rationale: these modules are implemented assets and can still support future creator-facing intelligence features.

Recommended policy:

- keep as extension for 1-2 iterations
- archive only if no real consumer and no roadmap commitment

## Recommended architecture direction

Use a two-tier runtime model:

1. **Prism Core Profile (default)**
   - Ingest
   - Extract
   - Recall/search
   - SkillRank contract endpoints

2. **Prism Semantic Extensions (opt-in)**
   - irony
   - emotional
   - causal
   - evidence
   - serendipity

## Extension control model

Use three control layers:

1. **Build-time**
   - include/exclude extension bundles in target artifact

2. **Startup-time**
   - register middleware chain by profile (`core` vs `core+semantic`)

3. **Request-time**
   - optional endpoint-level toggles if needed by specific workflows

## Refactor gate for subsystem work

Before starting `ScoutSystem` / `RippleSystem` / `PhysicsSystem` / `InstructionSystem` refactor:

- Core profile behavior is green in A-D verification
- Semantic extensions are isolated behind explicit registration
- Core contract tests do not depend on extension outputs

## Proposed rollout

### Phase 1 (now)

- keep behavior unchanged
- introduce profile-based registration boundary
- mark semantic modules as extensions in architecture docs

### Phase 2

- default runtime profile = core
- semantic profile enabled only in explicit scenarios

### Phase 3

- evaluate real usage telemetry from Skillet
- archive truly unused extensions if still no consumer
