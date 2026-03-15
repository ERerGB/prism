# Prism — Session Handoff

> Status: 2026-02-17
> For: New session to continue Prism stabilization + Phase 4

## 1. Current State

### Repo
- **Location**: `/Users/j.z/code/prism` / `github.com/ERerGB/prism`
- **Branch**: `main` (single commit: `e327cda`)
- **Origin**: Extracted from `fulmail/apps/prism-server` + `packages/prism-contract` + `packages/prism-client`

### Monorepo Structure
```
prism/
├── apps/server/          # @prism/server — Fastify HTTP + SQLite + MCP stdio
├── packages/contract/    # @prism/contract — Shared types and schemas
├── packages/client/      # @prism/client — HTTP/local client abstraction
├── doc/adr/              # Architecture Decision Records (empty, need backfill)
├── doc/pitfall/          # Known issues (empty, need backfill)
└── scripts/              # generate-doc-index.ts
```

### Test Results (at extraction time)
- **159/164 passing**
- 5 failures: all due to missing `OPENAI_API_KEY` (LLM-dependent tests)
- No code bugs introduced by extraction

### Package Rename
- `@fulmail/prism-server` → `@prism/server`
- `@fulmail/prism-contract` → `@prism/contract`
- `@fulmail/prism-client` → `@prism/client`
- All relative imports (`../../../packages/prism-contract/src/...`) → `@prism/contract`

## 2. What Needs to Be Done

### Priority 1: Stabilize (Before any new features)

- [ ] **Environment setup**: Create `.env.example` with all required env vars (OPENAI_API_KEY, DB path, etc.)
- [ ] **Verify tests pass**: `cd apps/server && pnpm test` — confirm 159+ pass, document which need API keys
- [ ] **CI setup**: GitHub Actions for test + typecheck on push
- [ ] **Remaining import audit**: Grep for any lingering `@fulmail/` references
- [ ] **Database migrations**: 48 migrations exist (`v1_initial` → `v52_data_gap_detection`) — verify they run cleanly on fresh DB

### Priority 2: Phase 4 — Agent Subsystem Prompt Redirection

The four agent subsystems in `apps/server/src/systems/`:

| System | Current Role | Target Role |
|--------|-------------|-------------|
| `ScoutSystem.ts` | General web content discovery | **Skill Hub discovery** — find and index AI agent skills |
| `RippleSystem.ts` | Propagate entity updates | Propagate **skill quality signals** across graph |
| `PhysicsSystem.ts` | Entity gravity/relevance scoring | Score **skill/hub relevance** with SkillRank signals |
| `InstructionSystem.ts` | User instruction processing | Process **creator content instructions** |

Key changes needed:
- Scout prompts should search for Skills, SkillHubs, agent capabilities (not generic web content)
- Physics should incorporate `priorWeight` from SkillRank (see Skillet ADR-002 bidirectional contract)
- New `/graph/hub-signals` endpoint for SkillRank to query aggregated signals

### Priority 3: Architecture Cleanup (Optional)

- [ ] Consider squashing 48 migrations into a single baseline for fresh installs
- [ ] Audit MCP tools in `apps/server/src/mcp/tools/` — which are still relevant?
- [ ] Remove Fulmail-specific scripts (seed, snapshot, etc.) if no longer applicable

## 3. Cross-Repo Contracts

### SkillRank → Prism
- Prism exposes `POST /ingest` accepting `priorWeight` + `priorSource` fields
- Prism exposes `GET /graph/hub-signals` returning aggregated quality signals

### Prism → SkillRank
- SkillRank exposes `POST /signal` accepting semantic signals from Prism
- Signal types: `citation_density`, `contributor_reputation`, `content_quality`, `skill_freshness`, `cross_hub_reference`

### Contract spec
- Full spec: `github.com/ERerGB/skillet/doc/adr/002-bidirectional-feedback-contract.md`
- Also documented in: `github.com/ERerGB/fulmail/docs/adr/001-prism-extraction-to-independent-repo.md`

## 4. Related Repos

| Repo | Role | Status |
|------|------|--------|
| `fulmail` | Magpie Mobile + api-proxy + landing | Active, Prism archived in `.archive/` |
| `skillet` | Creator content terminal (orchestrator) | Scaffolded, depends on Prism + SkillRank |
| `skillrank` | Hub-as-Domain PageRank engine | Handoff materials ready, awaiting colleague |

## 5. Key Commands

```bash
cd /Users/j.z/code/prism

# Install dependencies
pnpm install

# Run tests
cd apps/server && pnpm test

# Run server
cd apps/server && pnpm dev

# Type check
cd apps/server && pnpm build

# Generate doc indexes
pnpm --filter @prism/server exec tsx ../../scripts/generate-doc-index.ts
```

## 6. TDD Methodology

Per AGENTS.md, all changes follow TDD:
1. Write failing test
2. Implement minimum code to pass
3. Refactor

Test location: `apps/server/tests/`
