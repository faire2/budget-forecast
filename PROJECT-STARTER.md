# Project Starter

Use this as the baseline for new app projects.

## Defaults

- Package manager: `yarn`
- Formatter: `Prettier`
- Linter: modern ESLint flat config, not Airbnb
- Frontend default: `Vite` + `React` + `TypeScript`
- Routing default: `TanStack Router` (type-safe, built-in data loading) for standalone React; App Router for Next.js
- Backend default: keep it thin; prefer platform-native/serverless unless the project truly needs more
- Database default: `Postgres`
- ORM default for typed Postgres apps: `Drizzle`
- If deploying on Vercel, use a marketplace Postgres integration; do not assume legacy `Vercel Postgres`

## State Management Defaults

**Server State** (API data, cache, mutations):
- **TanStack Query**: Default for ALL data fetching, caching, and mutations
- Never use useState or Zustand for server data

**Client State** (UI state, user preferences, app-level state):
- **useState**: Start here for local component state
- **Lift state**: Move to parent when multiple children need it
- **Zustand**: Only for shared client state across unrelated components or screens

**Rules**:
- Never mix client state and server state in the same store
- Server state always goes through TanStack Query
- Prefer collocated state over global state
- Only reach for Zustand when lifting to a common parent is insufficient

## UI Component System

**Component Library**: shadcn/ui
- Copy-paste components (not npm dependency)
- Full TypeScript support
- Radix UI primitives under the hood
- Fully customizable, lives in your repo

**Styling**: Tailwind CSS
- Use semantic design tokens (e.g., `text-primary` not `text-blue-600`)
- Define custom tokens in `tailwind.config.ts`
- Keep utility classes in components, extract to component variants for reuse

**Icons**: lucide-react
- Tree-shakeable
- Consistent 24px default size
- Use semantic names (e.g., `<ChevronRight />` not `<Arrow />`)

**Installation**:
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog form input
```

**Rules**:
- Check `docs/COMPONENT-CATALOG.md` BEFORE creating any new component
- Reuse existing shadcn components before creating custom ones
- Never create one-off primitives (Button, Input, Dialog) - use shadcn
- If creating a custom reusable component, update COMPONENT-CATALOG.md
- Semantic tokens only (`bg-primary` not `bg-blue-600`)
- Use component variants (cva) for style variations, not prop drilling

## Agent Skills

Install these skills after project creation:

```bash
# Core skills (always install these)
npx skills add vercel-labs/agent-skills/react-best-practices
npx skills add vercel-labs/agent-skills/web-design

# TypeScript best practices
npx skills add SpillwaveSolutions/mastering-typescript-skill

# Conditional: Only if using React Native
npx skills add vercel-labs/agent-skills/react-native-best-practices

# Conditional: Only if deploying to Vercel
npx skills add vercel-labs/agent-skills/deployment
```

List installed skills:
```bash
claude skills list
# or
npx skills list
```

Browse available skills at [skills.sh](https://skills.sh) or search the [Claude Skills Directory](https://claude-plugins.dev/skills).

Skills provide:
- 40+ React performance rules (bundle size, async waterfalls, rendering)
- 100+ web design rules (accessibility, UX, visual patterns)
- Enterprise TypeScript patterns and type safety
- Framework-specific conventions
- Automatically queried by Claude Code during development

Do not duplicate skill content in AGENTS.md - let skills be the source of truth for their domain.

## Agent Instruction Files

- Use root `AGENTS.md` as the shared source of truth for repo rules.
- Use root `CLAUDE.md` containing only `@AGENTS.md`.
- Keep root instruction files concise and durable.
- Put path-specific Claude guidance in `.claude/rules/` only when a subtree needs extra rules.
- Do not turn root instruction files into feature manuals or runbooks.

## Project Initialization Workflow

When starting a new project from a requirements prompt:

**Phase 1: Requirements Analysis**
- Read and acknowledge requirements
- Ask clarifying questions for ambiguous decisions
- Confirm key architectural choices before proceeding
- Document assumptions made

**Phase 2: Plan Creation**
- Enter plan mode (`/plan` or equivalent)
- Create ROADMAP.md with phases, tasks, and architectural decisions
- Present plan for approval
- Do NOT start implementation until plan is approved

**Phase 3: Execution**

Choose execution mode based on project size and supervision preference:

**Supervised Mode** (interactive, small projects):
- Execute one phase at a time
- Checkpoint between phases: "Phase N complete. Continue to Phase N+1?"
- Update ROADMAP.md as tasks complete
- Document architectural decisions immediately

**Autonomous Mode** (OMC workflows, larger projects):
- Execute all approved phases without interruption
- Update ROADMAP.md continuously
- Document architectural decisions as they're made
- Only stop for blockers or questions in ROADMAP.md
- Use OMC orchestration modes: `/ralph`, `/ultrapilot`, or `/ultraqa`

**Phase 4: Verification**
- Stop before full lint/test/build cycle
- Report what was done, what remains, and what verification is needed
- Wait for explicit approval to run verification

**Anti-patterns**:
- Starting implementation before plan approval
- Making architectural decisions without documentation
- Running full verification without approval
- Re-litigating documented architectural decisions

## OMC (oh-my-claudecode) Setup

For Claude Code users, OMC provides multi-agent orchestration for autonomous execution.

**Initial Setup** (one-time):
```bash
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/omc-setup
```

**Per-Project Setup**:
```bash
/omc-setup --local
```

**After OMC Updates**:
```bash
# CRITICAL: Re-run after plugin updates
/omc-setup
```

**Autonomous Execution Modes**:

**Ralph Mode** (self-referential loop until complete):
```bash
/ralph "Read ROADMAP.md and implement the MVP following the plan"
```
- Won't give up until verified complete
- Architect verification after each phase
- Auto-retry on failures
- Best for: End-to-end feature implementation

**Ultrapilot Mode** (3-5x faster parallel execution):
```bash
/ultrapilot "Implement all MVP features from ROADMAP.md"
```
- Partition work by file ownership
- Run 3-5 agents in parallel
- Automatic conflict resolution
- Best for: Large projects with independent components

**Ultraqa Mode** (test-fix-verify loop):
```bash
/ultraqa "Test and verify all MVP features"
```
- Test → verify → fix → repeat until goal met
- Auto-generate missing tests
- Best for: Quality verification before release

**Sandbox Mode** (safe autonomous execution):
```bash
/sandbox
```
- Enable before running autonomous modes
- Claude can execute commands without permission prompts
- Safe environment for unattended work

**Permission Configuration**:

For fully autonomous overnight runs, configure `.claude/settings.json`:
```json
{
  "permissionMode": "auto",
  "teamMode": {
    "enabled": true,
    "maxAgents": 3,
    "defaultModel": "sonnet"
  }
}
```

For maximum autonomy (use with caution):
```json
{
  "dangerouslySkipPermissions": true
}
```

**Prerequisites for Autonomous Work**:
- Clear ROADMAP.md with active/next/backlog sections
- Architectural decisions documented in ROADMAP.md
- AGENTS.md with strong guardrails
- Permission mode configured (auto or dangerously-skip)
- Environment configured (Node 18+, Git, API keys)
- OMC setup completed (`/omc-setup`)

## Project Planning File Structure

**ROADMAP.md** (required for new projects):

```markdown
# Project Roadmap

Last updated: YYYY-MM-DD

## Current Phase: [Phase Name]

### Active Sprint
- [ ] Task 1
- [ ] Task 2
- [x] Completed task (completed YYYY-MM-DD)

### Up Next (Approved)
- [ ] Next phase tasks

### Backlog (Needs Planning)
- Feature ideas not yet planned
- Technical debt items

### Deferred / Out of Scope (T0)
- Features explicitly out of scope for initial release

## Architecture Decisions

### Confirmed
- **Decision area**: Chosen approach and rationale

### Pending
- Open questions requiring answers

## Known Issues / Tech Debt
- Technical debt items

## Questions / Blockers
- Items blocking progress (autonomous agents stop here)

## Notes
- Important context or constraints
```

**Rules**:
- Update ROADMAP.md as tasks complete
- Document architectural decisions immediately when made
- Add blockers to Questions/Blockers section (autonomous agents will stop and ask)
- Never re-litigate documented decisions without explicit approval
- For autonomous work: clear blockers section = uninterrupted execution

## Recommended Claude Code Hooks

Configure hooks in `.claude/settings.json` or `.claude/settings.local.json`:

**Example: Auto-format on edit**
```json
{
  "hooks": {
    "PreToolUse:Edit": {
      "command": "$CLAUDE_PROJECT_DIR/scripts/pre-edit.sh",
      "timeout": 500
    }
  }
}
```

**Example: Type-check after edit**
```json
{
  "hooks": {
    "PostToolUse:Edit": {
      "command": "$CLAUDE_PROJECT_DIR/scripts/post-edit.sh",
      "blocking": false
    }
  }
}
```

Create project scripts (e.g., `scripts/pre-edit.sh`):
```bash
#!/bin/bash
# Auto-format before editing
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  prettier --write "$FILE_PATH" 2>/dev/null || true
fi
exit 0
```

**Hook guidelines**:
- Configure in `.claude/settings.json`, reference project scripts
- Use `$CLAUDE_PROJECT_DIR` for portable paths
- PreToolUse hooks MUST be fast (< 500ms)
- Default to non-blocking (`"blocking": false`) unless enforcing policy
- Exit 0 for informational hooks, non-zero to block operation

## Must-Have Agent Rules

- Never start implementation before creating and getting approval for a written plan in ROADMAP.md. Update ROADMAP.md as work progresses. In autonomous mode, only stop for items in the Questions/Blockers section.
- Never run `git commit` or `git push` unless explicitly asked in-thread.
- Never use destructive commands unless explicitly approved.
- Never revert user changes you did not make.
- Do not silently expand scope.
- Preserve existing behavior and architecture unless the task explicitly changes them.
- Do not add new production dependencies without approval.
- Do not remove tests without explicit approval.
- New external I/O must include explicit timeout and error handling.
- If full verification was not run, say so explicitly.
- Distinguish pre-existing failures from newly introduced failures.

## Verification Policy

- Full `lint`, `test`, and `build` run only after the implementation scope is finished and the user approves verification.
- Narrow, targeted checks are allowed during implementation when needed to de-risk or unblock the change.
- Always report what was run.

## TypeScript Rules

- Use ES modules.
- Prefer named imports over default imports.
- Prefer async/await over promise chains.
- Prefer arrow functions for callbacks.
- `any` is forbidden unless there is a strong, explicit justification at a narrow boundary.
- Prefer `unknown`, precise interfaces, generics, and type guards.
- Promise handling must be explicit:
  - `await` handled promises
  - use explicit `void` only for intentionally detached promises

## ESLint Standard

Do not start from Airbnb.

Use:

- `@eslint/js` with `recommended`
- `typescript-eslint` with `strictTypeChecked`
- `typescript-eslint` with `stylisticTypeChecked`
- `eslint-plugin-react` flat `recommended`
- `eslint-plugin-react` flat `jsx-runtime`
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-jsx-a11y` flat `recommended`
- `eslint-plugin-import` flat `recommended` plus `typescript`
- `eslint-config-prettier` last

Add these project rules:

- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-floating-promises: ["error", { ignoreVoid: true }]`
- `@typescript-eslint/no-misused-promises: error`
- `@typescript-eslint/await-thenable: error`
- `@typescript-eslint/consistent-type-imports: error`
- `@typescript-eslint/ban-ts-comment` with required descriptions
- `import/no-default-export: error` when the project wants strict named imports everywhere

## React And UI Rules

- Reuse existing components before creating new ones.
- Prefer consistency over novelty for product UI.
- Before creating a new UI primitive, check the component catalog first.
- If a new reusable component is added, update the component catalog and design system docs.
- Keep styling aligned with existing tokens, spacing, typography, and interaction patterns.
- Preserve the established visual language unless the task explicitly changes it.

## React Performance Rules

**React Compiler** (if enabled):
- Enable in Next.js 16+: `reactCompiler: true` in next.config.js
- Compiler handles automatic memoization
- Avoid manual useMemo/useCallback unless required by third-party libraries or compiler can't analyze code
- For new projects without compiler: follow standard memoization patterns

**useEffect Usage** (timeless principle):
- DO NOT use useEffect to derive state - calculate during render
- DO NOT use useEffect + useState for values computable from props/state
- ONLY use useEffect for actual side effects: subscriptions, DOM manipulation, external sync
- Example: `const fullName = firstName + ' ' + lastName` (not useEffect)

**Optimistic UI Updates**:
- Use `useOptimistic` for instant feedback (likes, comments, cart updates)
- Pair with `useTransition` for responsive UI
- Implement rollback for failed actions

**Code Splitting**:
- Lazy load route components and heavy libraries
- Use `<Suspense>` with meaningful loading states
- Keep initial bundles small (target < 200KB gzipped as a starting point)

**Data Fetching**:
- Fetch in parallel with TanStack Query
- Use route loaders, not useEffect
- Prefetch on hover for navigation

**Rendering**:
- Virtualize long lists (TanStack Virtual)
- Debounce expensive input handlers
- Defer non-critical UI with `useTransition`

## Documentation Rules

- Feature docs must be collocated with the feature.
- Use explicit names like `FEATURE-NAME.md`, not generic `README.md`, for feature docs.
- Target about 200 lines for a good doc.
- Hard max is 500 lines, reserved for the most important docs.
- Focus docs on purpose, architecture, contracts, configuration, key files, and limitations.
- Avoid long code examples in docs unless truly necessary.
- Use file references instead of copying large code blocks.

## Required Documentation Files

- `docs/DOC_CATALOG.md`
  - central index of important documentation
- `docs/DESIGN-SYSTEM.md`
  - visual language, tokens, spacing, interaction patterns, and UX rules
- `docs/COMPONENT-CATALOG.md`
  - reusable components, file paths, when to use them, variants, and when not to use them

When adding or materially changing docs, update `docs/DOC_CATALOG.md`.

## Testing Defaults

- Unit/integration: `Jest`
- Frontend agent verification: `Playwright`

## Playwright Rules For LLM Agents

- Use Playwright for changed user-visible flows, not implementation details.
- Keep the dev server and browser session running during iteration when practical.
- Prefer accessible locators first:
  - `getByRole`
  - `getByLabel`
  - `getByText`
- Use `data-testid` only when accessibility or user-facing locators are not enough.
- Prefer web-first assertions such as `await expect(...).toBeVisible()`.
- Avoid brittle selectors tied to DOM structure or styling.
- If reliable locators are hard to write, improve the markup instead of adding fragile selectors.
- Use targeted Playwright checks during implementation.
- Save traces or screenshots mainly for debugging failures or documenting important UI checks.

## Environment Variables

**File structure**:
```
.env.local          # Local dev secrets (gitignored)
.env.development    # Dev defaults (committed)
.env.production     # Prod defaults (committed, no secrets)
.env.example        # Template (committed)
```

**Naming convention**:
```
VITE_PUBLIC_*       # Client-side (Vite)
NEXT_PUBLIC_*       # Client-side (Next.js)
DATABASE_URL        # Server-only
API_SECRET_KEY      # Server-only
```

**Rules**:
- NEVER commit `.env.local` or files containing secrets
- Validate required env vars at build time with Zod
- Document all env vars in `.env.example`
- Fail fast if required vars are missing

**Deployment checklist**:
- All env vars set in deployment platform
- Build succeeds locally with production env
- No console.log or debugger statements
- Error tracking configured (Sentry, etc.)

## Shell And Docs Conventions

- All shell commands in docs should be single-line.
- Avoid multiline commands with backslash continuations.
- Keep examples copy-paste safe for `zsh`.

## Good Starting File Set

- `ROADMAP.md` (project plan and task tracking)
- `AGENTS.md` (project-specific rules)
- `CLAUDE.md` (containing only `@AGENTS.md`)
- `.claude/settings.json` (Claude Code configuration)
- `eslint.config.mjs`
- `prettier.config.*`
- `tsconfig.json`
- `docs/DOC_CATALOG.md`
- `docs/DESIGN-SYSTEM.md`
- `docs/COMPONENT-CATALOG.md`

## Starter AGENTS.md Checklist

- project initialization workflow (plan → approve → execute)
- working agreements
- verification policy
- TypeScript rules
- React/UI reuse rules
- documentation rules
- reliability rules
- reporting expectations
- roadmap update protocol

## Notes

- Keep instructions specific to things the agent cannot reliably infer from the codebase.
- Favor short, strong rules over long explanatory prose.
- Add path-specific rules only when they materially reduce mistakes.
