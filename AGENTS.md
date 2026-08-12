<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Common Rules

- One Build / Single Core / Multi-Entrance
- All shared instructions for AI agents must be consolidated in the `AGENTS.md` file located in the project root directory.
- Do not create new files unless the user explicitly requests them.
- Before proposing a new file, first determine whether the change can be implemented in an existing shared file.
- If a new file is genuinely necessary and was not explicitly requested, explain why and obtain the user's approval before creating it.

## Naming Rules

- Use short, clear, single-word names for custom files whenever possible.
- Do not use hyphens in custom file names.
- Do not use compound file names separated by dots.
- Name shared UI component files by their role, such as `header.tsx` and `footer.tsx`.
- Do not use CSS Modules. Use a single-extension stylesheet name such as `main.css`.
- Use dots only for required file extensions, such as `.tsx` and `.css`.
- Do not create a separate stylesheet for every small component.
- Consolidate related page, header, and footer styles into one shared stylesheet for that entrance.

## Design Rules

- Keep the existing warm color palette for user-facing pages.
- Treat the user-facing header and footer as locked components.
- Do not modify the user-facing header, footer, or their related styles unless the user explicitly requests that specific change.
- Changes to other pages or shared functionality must preserve the current user-facing header and footer design, layout, dimensions, positioning, and behavior.
- Use white, black, and gray as the primary color palette for all pages intended for roles other than users, including admin and partner pages.
- On non-user pages, use additional colors only when they communicate status, warnings, errors, or required actions.
