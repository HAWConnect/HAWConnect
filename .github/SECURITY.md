# Security policy

HAWConnect is currently a development project; there is no established production support schedule.

Report vulnerabilities privately to the club's configured maintainers. Once the club repository is created, enable GitHub private vulnerability reporting and publish the actual security contact here. Until that channel exists, avoid putting exploit details, personal data, tokens or credentials in public issues; use an existing private maintainer contact.

Guest calendars/preferences live on the device. Optional accounts and encrypted sync do store data on the configured backend; a blanket “no personal data on servers” claim would be inaccurate. Calendar URLs can contain private tokens and must stay out of logs, telemetry and issue reports. Server SMTP/database credentials and the sync encryption key must never be placed in public app variables.

Do not test systems or send authentication email without authorisation. Maintainers should document rotation, backups and recovery before enabling a production service. See maintainer guidance (local maintainer documentation) and the known status (local maintainer documentation).
