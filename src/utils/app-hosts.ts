function configuredHost(value: string | undefined, fallback: string): string {
	if (!value) return fallback
	try {
		const url = new URL(value)
		return ['https:', 'http:'].includes(url.protocol) && url.hostname
			? url.hostname
			: fallback
	} catch {
		return fallback
	}
}

// Reserved fallbacks are inert until club-owned public addresses are configured.
export const HAWCONNECT_DEV_HOST = configuredHost(
	process.env.EXPO_PUBLIC_DEV_WEBSITE_URL,
	'dev.hawconnect.invalid'
)
export const HAWCONNECT_WEB_HOST = configuredHost(
	process.env.EXPO_PUBLIC_WEBSITE_URL,
	'web.hawconnect.invalid'
)

export const HAWCONNECT_APP_HOSTS = [
	HAWCONNECT_DEV_HOST,
	HAWCONNECT_WEB_HOST
] as const

export function isHAWConnectAppHost(hostname: string): boolean {
	return hostname === HAWCONNECT_DEV_HOST || hostname === HAWCONNECT_WEB_HOST
}
