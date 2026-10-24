export type IntegrationMode = 'live' | 'demo' | 'unavailable'

export function assertIntegrationAvailable(
	capability: string,
	mode: IntegrationMode
): void {
	if (mode !== 'live') throw new Error(`Integration unavailable: ${capability}`)
}

export function assertRequestAllowed(input: string): void {
	let url: URL
	try {
		url = new URL(input)
	} catch {
		throw new Error('Invalid service URL')
	}
	if (
		!['https:', 'http:'].includes(url.protocol) ||
		url.username ||
		url.password
	) {
		throw new Error('Invalid service URL')
	}
	if (
		url.protocol === 'http:' &&
		!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
	) {
		throw new Error('HTTPS is required')
	}
}

export async function guardedFetch(
	input: string | URL | Request,
	init?: RequestInit,
	transport: (
		input: string | URL | Request,
		init?: RequestInit
	) => Promise<Response> = fetch
): Promise<Response> {
	assertRequestAllowed(input instanceof Request ? input.url : String(input))
	return transport(input, init)
}
