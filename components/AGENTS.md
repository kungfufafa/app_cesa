# Components

## Overview

Strict separation between UI primitives and Feature components.

## Structure

- `ui/`: Generic, styled primitives. **NO** business logic.
  - Examples: `components/ui/button.tsx`, `components/ui/card.tsx`.
- `features/`: Domain-specific components. Contains business logic.
  - Examples: `components/features/attendance/StatusCard.tsx`.

## Conventions

### UI Primitives (`ui/`)

- Use `cva()` for variants.
- Use `cn()` for class merging.
- **DO NOT** import stores or services. Pass props instead.

### Feature Components (`features/`)

- Compose `ui/` components.
- Handle state, stores, and API interactions.

## JIT Index

- Find UI: `ls components/ui`
- Find Features: `ls components/features`
- Search variants: `grep -r "cva(" components/ui`

## Anti-Patterns

- Importing `store/` or `services/` into `ui/`.
- Creating one-off generic components in `features/` (move to `ui/`).
- Hardcoding domain logic inside generic `ui/` primitives.

## Pre-PR Checks

- `npx tsc --noEmit`
