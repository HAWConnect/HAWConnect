const MAX_BYTES = 2_000_000
export function normalizeCalendarUrl(input: string): string {
	try {
		const url = new URL(input.trim().replace(/^webcal:/i, 'https:'))
		if (url.protocol !== 'https:' || url.username || url.password)
			throw new Error()
		return url.toString()
	} catch {
		throw new Error('invalidCalendarLink')
	}
}
export async function fetchCalendarText(
	input: string,
	signal?: AbortSignal,
	transport: (input: string, init?: RequestInit) => Promise<Response> = fetch
): Promise<string> {
	const url = normalizeCalendarUrl(input)
	const controller = new AbortController()
	const abort = () => controller.abort()
	signal?.addEventListener('abort', abort, { once: true })
	if (signal?.aborted) controller.abort()
	const timeout = setTimeout(abort, 15_000)
	try {
		const source = new URL(url)
		const useImporter = source.hostname === 'myhaw.haw-hamburg.de'
		const endpoint = new URL(
			'/api/calendar/myhaw',
			process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT ??
				'http://localhost:4000/graphql'
		).toString()
		const response = await transport(useImporter ? endpoint : url, {
			signal: controller.signal,
			credentials: 'omit',
			redirect: 'error',
			cache: 'no-store',
			headers: useImporter
				? { Accept: 'text/calendar', 'Content-Type': 'application/json' }
				: { Accept: '*/*' },
			...(useImporter ? { method: 'POST', body: JSON.stringify({ url }) } : {})
		})
		if (!response.ok) throw new Error('calendarFetchFailed')
		if (Number(response.headers.get('content-length')) > MAX_BYTES)
			throw new Error('calendarTooLarge')
		if (!response.body) {
			const text = await response.text()
			if (new TextEncoder().encode(text).length > MAX_BYTES)
				throw new Error('calendarTooLarge')
			return text
		}
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let text = ''
		let bytes = 0
		while (true) {
			const chunk = await reader.read()
			if (chunk.done) break
			bytes += chunk.value.byteLength
			if (bytes > MAX_BYTES) {
				await reader.cancel()
				throw new Error('calendarTooLarge')
			}
			text += decoder.decode(chunk.value, { stream: true })
		}
		return text + decoder.decode()
	} catch (error) {
		if (error instanceof Error && error.message === 'calendarTooLarge')
			throw error
		throw new Error('calendarFetchFailed')
	} finally {
		clearTimeout(timeout)
		signal?.removeEventListener('abort', abort)
	}
}
