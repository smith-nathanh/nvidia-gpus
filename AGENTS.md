# Working in this repository

- Read `docs/PROJECT_GOALS.md` for user-approved goals and coverage, then `HANDOFF.md` for implementation status and refinement notes.
- The user reviewed the **GB300 NVL72 pilot** and explicitly authorized fixing the review findings and adding the other agreed architecture families. The app now has ten selected reference configurations; preserve their different topologies rather than applying the NVL72 model to every system. See the goals and handoff for scope and verification limits.
- The app runs locally. `dist/` is hand-authored source, not generated output; edit and track it directly. There are no dependencies to install or build step to run.
- Start with `npm start`; verify changes with `npm run check` and relevant browser interactions. Reload the browser after edits because there is no hot reload.
- Preserve evidence for hardware claims. Link primary sources, specify the reference configuration, and distinguish published peaks, direction, units, and aggregate versus per-component values.
- Keep the goals and handoff current as user decisions or implementation status change. Distinguish user decisions from implementation choices and suggestions.
