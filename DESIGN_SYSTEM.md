# Mobilex 2.0 Design System

## Visual direction

Mobilex 2.0 uses a premium dark/light commerce language: cool neutral surfaces, blue-to-violet accents, layered elevation, glass surfaces, soft ambient glows and restrained motion.

## Tokens

All visual primitives begin in `src/styles/tokens.css`. Do not add arbitrary colors or shadows to feature pages unless a new token is truly required.

## CSS architecture

- `tokens.css`: color, radius, shadow, type, motion and shell variables.
- `motion.css`: reusable transitions, shine, magnetic, glow and ambient effects.
- `utilities.css`: layout and utility primitives.
- `globals.css`: application surfaces, components, responsive rules and page-level system styles.

## UI primitives

`src/components/ui` contains Button, IconButton, Badge, Card, GlassPanel, Input, Select, Skeleton, Modal, Drawer, Tooltip, SectionHeading, StatusPill, SpotlightCard, Progress, Avatar, EmptyState and Accordion.

## Rules

1. New storefront/admin UI must consume existing primitives before creating one-off patterns.
2. Use semantic states: primary, info, success, warning, danger.
3. Preserve focus-visible behavior.
4. Preserve `prefers-reduced-motion`.
5. Every responsive interaction must remain usable at 320px width.
6. Never couple business data fetching to visual primitives.
