# Project Memory

## Overview

This is the **default Krisspy template project**. It comes pre-configured with React + TypeScript + Tailwind CSS and a design system foundation.

## Planning Instructions

When planning a new project from this template, the agent MUST follow this order:

### Step 1 — Define the Theme
Before generating any page or component, update `/src/style/theme.css` to define the project's visual identity:
- Color palette (primary, secondary, accent, neutrals, semantic colors)
- Typography scale (font families, sizes, weights)
- Spacing, border radius, shadows
- Dark/light mode tokens if applicable

Also create custom presets in `/src/style/theme-presets.ts` — add at least 3 project-specific presets that reflect the brand (colors, radius, font size). These will appear in the Theme Editor so the user can switch between them.

### Step 2 — Update the Design System
Once the theme is defined, update `/src/pages/DesignSystemTest.tsx` to reflect the new style:
- Showcase all colors, typography, and spacing from the new theme
- Update all UI components (buttons, cards, inputs, badges, etc.) to use the new tokens
- The design system page acts as a living style guide — it must always be up to date with the current theme

### Step 3 — Build the Project
Only after the theme and design system are established, generate the actual pages and features of the project. All new components must use the theme tokens — no hardcoded colors or arbitrary values.

## Key Files

- `/src/pages/DesignSystemTest.tsx` — Design system showcase page (always update when theme changes)
- `/src/pages/NotFound.tsx` — 404 fallback page for unmatched routes
- `/src/App.tsx` — Router and layout wiring (auto-managed by Krisspy)
- `/.krisspy.md` — Project rules and constraints for the agent
