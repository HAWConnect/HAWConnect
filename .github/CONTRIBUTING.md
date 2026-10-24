# Contributing to HAWConnect

Students and other contributors are welcome. Start with [README](../README.md), setup (local maintainer documentation), status (local maintainer documentation) and [AGENTS.md](../AGENTS.md).

Keep the app and backend as sibling repositories and use Bun. Work on a focused branch; preserve unrelated changes. Describe the user-visible problem, solution, validation and remaining limits in your pull request. Use small PRs, include meaningful tests for behaviour changes, and update both DE/EN strings. Preserve the upstream UI and architecture.

Run type checks, applicable tests, localisation and lint before review. Do not include private data, `.env.local`, generated native projects, dependency folders or build exports. Generated GraphQL changes must come from `bun run codegen`.

Public data integrations must use verifiable sources and honest missing-data states. Do not collect myHAW credentials or claim official university endorsement. Retain upstream licence notices. A new maintainer should read the handover guide (local maintainer documentation).
