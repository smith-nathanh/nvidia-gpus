# Working in this repository

- Read `README.md` for the app's scope and run instructions. The old planning, review and handoff documents were retired after the ten-system redesign; their history remains in Git.
- Preserve the ten selected reference configurations and their different topologies. Eight-GPU DGX servers, NVL72 racks, single-superchip systems and Spark's shared-memory system must not inherit each other's boundaries or memory models.
- The app runs locally. `dist/` is hand-authored source, not generated output; edit and track it directly. There are no dependencies to install or build step to run.
- Start with `npm start`; verify changes with `npm run check` and relevant browser interactions. Reload the browser after edits because there is no hot reload.
- Preserve evidence for hardware claims. Link primary sources, specify the reference configuration, and distinguish published peaks, direction, units, and aggregate versus per-component values.
- Source records live in `docs/research/`; NVIDIA figure provenance is in `dist/assets/nvidia/README.md`. Keep configuration caveats and source disagreements visible when changing hardware content.
- Workload examples illustrate placement and memory locality; they do not simulate scheduling or predict achieved performance. Keep the app local unless deployment is explicitly requested.
- Keep documentation concise. Update the README and relevant source notes when behavior or coverage changes; do not recreate agent progress logs or handoff files.
