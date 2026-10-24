# HAWConnect contributor and agent guide

Read this file before changing the app. HAWConnect is an independent student-maintained HAW Hamburg project. Preserve the attribution in `NOTICE.md` and applicable licence notices. This file describes current project conventions; local historical archives are not publication inputs.

## Structure and stack

The app and `../hawconnect-backend` are separate sibling repositories. Preserve Expo Router, React Native, Uniwind, React Query, Zustand, existing storage helpers, i18next and MapLibre. Use Bun and each repo's lockfile. Do not introduce replacement UI/backend frameworks or split out speculative packages. Shared GraphQL types are generated from the sibling backend schema using `bun run codegen`.

- Routes: `src/app`; reusable UI: `src/components`.
- Queries/state: `src/hooks`; networking: `src/api`.
- HAW adapters: existing `src/utils`, `src/data` and backend scraping boundaries.
- Localisation: both `src/localization/de` and `en`.
- Pure unit tests: `src/utils/tests`, using `bun:test`.
- Published project docs: `docs/students`; historical upstream/design archives are kept locally and excluded from publication.

## Rules

1. Preserve user changes; never reset unrelated work or delete earlier prototypes. Treat `outputs` and `work` outside this repository as local reference material.
2. Keep the existing component/navigation conventions. Use theme tokens, existing platform icons and accessible controls. Include iOS/Android/web icon variants.
3. Put fetches in API clients and use React Query; persist preferences with existing Zustand/storage patterns. Never store private calendar links or auth secrets in plain preferences, logs or analytics.
4. English food is the official English source, not machine-translated German. Never infer allergens or nutrition from a name.
5. Imported calendars are personal; public HAW academic dates are a separate service. Keep original date meanings, time zones and recurrence identities.
6. No university credentials, authenticated scraping, invented HAW APIs or endorsement claims. Disabled upstream types/helpers do not represent working HAW features.
7. Never hand-edit `src/__generated__`, licence bundles or generated native projects. Do not commit `.env.local`, caches, signing material, dependencies or build exports.
8. Use Biome: tabs, single quotes, no semicolons or trailing commas. Match existing file/component conventions. Do not disable lint globally.
9. Do not invoke store submission or restore archived publishing workflows without an explicit release task and configured club ownership.
10. Describe web verification separately from Android/iOS device verification. No production-ready claims based on unit tests alone.

## Checks

```bash
bun run codegen
bunx tsc --noEmit
bun run lint
bun test
bun run i18n:check
bunx expo export --platform web --output-dir dist-hawconnect
```

Run checks appropriate to the edit. No tests that merely mirror reversible text changes. Screens with native variants require both implementations to be considered. The app requires a development build, not Expo Go. See local verification reports for current blockers.
