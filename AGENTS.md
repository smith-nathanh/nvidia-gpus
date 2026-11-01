# Working in this repository

- Read `docs/PROJECT_GOALS.md` for user-approved goals and coverage, then `HANDOFF.md` for implementation status and refinement notes.
- The current task is to refine the **GB300 NVL72 pilot**. Add other systems after the pilot experience has been reviewed; the coverage list is a roadmap, not a request to implement all systems immediately.
- The app runs locally. `dist/` is hand-authored source, not generated output; edit and track it directly. There are no dependencies to install or build step to run.
- Start with `npm start`; verify changes with `npm run check` and relevant browser interactions. Reload the browser after edits because there is no hot reload.
- Preserve evidence for hardware claims. Link primary sources, specify the reference configuration, and distinguish published peaks, direction, units, and aggregate versus per-component values.
- Keep the goals and handoff current as user decisions or implementation status change. Distinguish user decisions from implementation choices and suggestions.
