# Mobilex 2.0 — Phase 2 Design System

Phase 2 builds the visual engine on top of Phase 1 Hardened.

## Included
- Design tokens for light/dark themes
- Global CSS engine with responsive layout primitives
- Glass, gradient, glow and elevation surfaces
- Motion + reduced-motion system
- Buttons, IconButton, Badge, Card, GlassPanel
- Form controls: Input, Select
- Skeletons, Modal, Drawer, Tooltip, SectionHeading, StatusPill
- Storefront App Chrome: announcement, header, footer, mobile bottom nav
- UI Laboratory at `/ui-lab`
- Reworked Home Page as the design-system showcase

## Validation
Run after dependency installation:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

## Next phase
Phase 3 should consume these components instead of adding one-off UI patterns.

- Advanced surfaces: SpotlightCard, Avatar, Progress, Accordion, EmptyState
- UI component barrel export for cleaner feature imports
