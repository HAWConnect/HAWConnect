# HAWConnect

<img src="src/assets/hawconnect/mark.svg" alt="HAWConnect" width="96" />

An open-source campus platform for HAW Hamburg, maintained by students for students. HAWConnect is an independent project, not an official university service. Distributed under [AGPL-3.0](LICENSE); required upstream copyright and attribution must be retained.

## Applications and services

The project uses three separate repositories and one backend-managed PostgreSQL database:

```text
HAWConnect/
├── hawconnect/          # Android, iOS and web app — this repository
├── hawconnect-backend/  # API, accounts, synchronisation and public-source ingestion
└── hawconnect-dash/     # Administration interface
```

The app retains Expo Router, React Native, React Query, Zustand and the existing component/theme conventions. The backend owns database access; neither the mobile application nor the dashboard receives database credentials.

## Features

- Guest access on web, Android and iOS, with calendars and preferences saved on the device.
- Optional passwordless accounts using `@haw-hamburg.de` addresses, with automatic account synchronisation.
- Timetable import from an ICS file or supported myHAW export URL, preview, replacement, removal and manual refresh. Linked calendars refresh on startup/foreground, subject to a five-minute throttle.
- Studierendenwerk Hamburg menus with official German/English source text, upcoming dates and student prices by default. Source-declared allergens, additives and food symbols are mapped to preferences; preferences highlight matching badges and warnings rather than hiding dishes.
- HAW campus/building maps, building codes, quick links, clubs, official public events and separately managed Campus Life events/organizer profiles.
- Semester dates, light/dark themes and persistent German/English interface preferences.
- Privacy Policy and Imprint content or external links published through the dashboard.

Direct authenticated HAW APIs, grades, printer balance, library accounts and live room availability are not implemented. The assistant/chatbot remains future work (local maintainer documentation). Academic-date source scope needs care: the backend scraper currently uses international-office calendars; it must not be presented as verified coverage of every department's dates.

## Local development

Use the Bun version in [.bun-version](.bun-version). The current app and EAS build profiles use **Bun 1.4.1**; older EAS defaults cannot read this project's lockfile.

```bash
bun install --frozen-lockfile
cp .env.local.example .env.local
```

Set the public development endpoints:

```dotenv
EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
EXPO_PUBLIC_HAWCONNECT_AUTH_URL=http://localhost:4000/api/accounts
EXPO_PUBLIC_WEBSITE_URL=http://localhost:3000
EXPO_PUBLIC_SOURCE_REPOSITORY_URL=https://github.com/HAWConnect/HAWConnect
```

Start the sibling backend, then run:

```bash
bun start
```

Open `http://localhost:3000`. If using the separate local static preview on port 3001, configure `EXPO_PUBLIC_WEBSITE_URL` and the backend's web origin for that port instead. Physical devices require a reachable LAN or public HTTPS backend; their `localhost` refers to the device itself.

All `EXPO_PUBLIC_*` values are embedded in the application. Never put database passwords, SMTP credentials, session secrets or private calendar URLs there. Local ICS file import works without university credentials. See setup (local maintainer documentation) and accounts (local maintainer documentation).

## Android and iOS builds

The app requires its own native build and does not run in Expo Go. Local native development needs Android tooling or Xcode:

```bash
bun android
bun ios
```

For cloud builds, log into the authorised Expo account and verify the linked project:

```bash
npx eas-cli login
npx eas-cli project:info
npx eas-cli build --platform android --profile preview
```

The preview Android profile produces an installable APK. Configure the EAS **preview** environment with reachable HTTPS GraphQL/authentication/website URLs before building. The linked project is `@hawconnect/hawconnect`; `extra.eas.projectId` in `app.config.ts` supports an environment override.

For iOS TestFlight, Apple Developer membership, signing and an App Store Connect app are required:

```bash
npx eas-cli build --platform ios --profile testflight
npx eas-cli submit --platform ios --profile testflight --latest
```

Submission is a separate publishing action, not part of development verification. See TestFlight preparation (local maintainer documentation). iOS internal preview builds also require registered test devices. No simulator-only profile is currently defined.

## Deployment target

The planned Cloudflare/Coolify addresses are:

| Service | Target address | Container port |
| --- | --- | --- |
| Web app | `https://hawconnect.de` | 3000 |
| Backend | `https://api.hawconnect.de` | 4000 |
| Dashboard | `https://dash.hawconnect.de` | 3000 |

These are configuration targets, not a claim that deployments are live. Use the app Dockerfile at `config/Dockerfile`, with repository root as build context. Public endpoint variables are **build-time** values; rebuild the web/mobile app after changing them. First-level subdomains avoid the standard wildcard-certificate limitation of nested hostnames. Backend and dashboard runtime configuration is documented in their READMEs.

Set these public variables at **build time** in Coolify and in the EAS environment used for each native build:

```dotenv
EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT=https://api.hawconnect.de/graphql
EXPO_PUBLIC_HAWCONNECT_AUTH_URL=https://api.hawconnect.de/api/accounts
EXPO_PUBLIC_WEBSITE_URL=https://hawconnect.de
```

Changing the website address does not transfer browser-local guest calendars or preferences. Export or retain the original ICS files before moving, or sync an account on the old site before the cutover and sign in again on the new site. Keep the old API hostname serving the backend while installed native builds still use it; do not redirect API requests as a migration substitute.

## Verification

```bash
bun run codegen          # reads ../hawconnect-backend/src/schema
bunx tsc --noEmit
bun run lint
bun test
bun run i18n:check
bunx expo export --platform all --output-dir dist-hawconnect
```

Generated GraphQL files must be regenerated, not hand-edited. The recent cleanup passed 518 app tests, type/localisation checks and web/iOS/Android bundle export. Guest browser routes were smoke-tested. These checks do not establish signed APK/IPA success, physical-device behaviour or production deployment.

The first Android EAS attempt failed during dependency installation because the builder used Bun 1.3.14. Build profiles now pin Bun 1.4.1 and frozen installation passes locally; a successful signed cloud build is still unverified. iCloud SMTP authentication passed locally, but actual sign-in email delivery and real cross-device synchronisation remain unverified.

## Contributing and maintenance

Read [AGENTS.md](AGENTS.md), [contribution guidance](.github/CONTRIBUTING.md), [security policy](.github/SECURITY.md) and maintainer handover (local maintainer documentation). Each project has its own lockfile and environment. The previous Git metadata was removed at the maintainer’s request; initialise a fresh repository before configuring the intended app origin `https://github.com/HAWConnect/HAWConnect.git`. No source changes are automatically pushed by the setup commands above.

Keep private environments, credentials, build exports, caches, installed dependencies and local prototypes out of commits. Preserve existing encryption keys when moving an account database; changing keys without migration can make stored data unreadable.

Useful documentation:

- Feature/platform status (local maintainer documentation) and device verification (local maintainer documentation)
- Architecture (local maintainer documentation), admin dashboard (local maintainer documentation) and legal-page management (local maintainer documentation)
- Food pipeline (local maintainer documentation), Hamburg labels (local maintainer documentation), events (local maintainer documentation) and maps (local maintainer documentation)
- Pre-publication security audit (local maintainer documentation)
- Branding (local maintainer documentation) and branding-cleanup scope/evidence (local maintainer documentation)

## Licence

AGPL-3.0; retain required upstream copyright and licence notices. Campus geometry includes OpenStreetMap data with separate ODbL/attribution obligations, documented beside the data. Historical licence, migration, security-blocklist and compatibility records intentionally retain original identifiers. They are not HAWConnect branding. An inherited package version is not evidence of a published store release.
