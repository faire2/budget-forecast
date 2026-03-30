# Documentation Catalog

**Last updated:** 2026-03-26

Central index of all project documentation. Update this file when creating new docs.

## Core Documentation

### Project Management
- **[AGENTS.md](../AGENTS.md)** - Agent instructions and working agreements (source of truth)
- **[ROADMAP.md](../ROADMAP.md)** - Project progress, active sprint, architecture decisions
- **[CLAUDE.md](../CLAUDE.md)** - References AGENTS.md for context loading
- **[PROJECT-STARTER.md](../PROJECT-STARTER.md)** - Original project starter template

### Technical Documentation
- **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** - Design tokens, color system, typography, spacing
- **[COMPONENT-CATALOG.md](./COMPONENT-CATALOG.md)** - UI component inventory and usage guidelines

## Architecture Reference

**Approved implementation plan:** `/Users/faire/.claude/plans/foamy-twirling-matsumoto.md`

Key architectural decisions documented in ROADMAP.md:
- Hybrid data model (single entries table)
- Backend forecast calculation
- Monorepo with Yarn workspaces
- No authentication in T0

## Critical Files (Quick Reference)

### Backend
- `/server/src/db/schema.ts` - Database schema
- `/server/src/services/forecastCalculator.ts` - Core forecast logic
- `/server/src/routes/forecasts.ts` - Main API endpoint

### Frontend
- `/client/src/hooks/useForecasts.ts` - Server state management
- `/client/src/components/DayList.tsx` - Main UI view

## How to Use This Catalog

1. **Before creating documentation:** Check if similar docs already exist here
2. **After creating documentation:** Add an entry to the appropriate section above
3. **When updating docs:** Update the "Last updated" date in the doc and here if needed
4. **For component docs:** Update COMPONENT-CATALOG.md instead of creating separate files

## Documentation Standards

- Keep docs collocated with code when possible (e.g., `components/README.md`)
- Use Markdown format
- Include "Last updated" date at the top
- Keep content concise and actionable
- Link to related docs using relative paths
