# EventEmitter-based AppStore as core schedule state

The primary schedule state (`AppStore` + `Schedules` class) uses a custom EventEmitter pattern rather than Zustand, despite the rest of the app using Zustand for other stores. This predates the Zustand adoption and carries the entire undo/redo stack, calendar event derivation, and autosave wiring.

This is recorded because it is surprising — a developer seeing Zustand everywhere else will wonder why the most important store is different. The reason is historical: `AppStore` was written during the 2019 rewrite when the project used a custom flux-like pattern. Migrating it to Zustand was considered too risky given its size (~450 lines), the circular dependency with `ActionTypesStore`, and the number of components subscribing via `useEffect` + `EventEmitter.on`.

This ADR does not endorse the current shape — deepening opportunity #1 in `docs/architecture/deepening-opportunities.md` proposes collapsing this into a Zustand store. This records *why* it exists as-is today.
