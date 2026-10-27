import { afterEach, expect, test } from 'bun:test'
import { getLegalDocuments } from '@/api/legal-api'

const originalFetch = globalThis.fetch
afterEach(() => {
	globalThis.fetch = originalFetch
})

function documents(content: string) {
	return ['privacy', 'imprint'].map((key) => ({
		key,
		managed: true,
		publishedAt: null,
		published: {
			mode: 'internal',
			body: { de: content, en: content },
			bodyHtml: { de: content, en: content },
			url: { de: '', en: '' }
		}
	}))
}

test('legal transport accepts bounded publications with maximum escaped body and HTML sidecars', async () => {
	const content = '\u0000'.repeat(20_000)
	const payload = JSON.stringify(documents(content))
	expect(payload.length).toBeGreaterThan(960_000)
	expect(payload.length).toBeLessThan(1_048_576)
	globalThis.fetch = (async () =>
		new Response(payload)) as unknown as typeof fetch
	const result = await getLegalDocuments()
	expect(result[0].published?.body.en).toBe(content)
	expect(result[1].published?.bodyHtml?.de).toBe(content)
})

test('legal transport preserves maximum multibyte Unicode body and HTML publications', async () => {
	const content = '界'.repeat(20_000)
	const payload = JSON.stringify(documents(content))
	expect(new TextEncoder().encode(payload).byteLength).toBeGreaterThan(320_000)
	globalThis.fetch = (async () =>
		new Response(payload)) as unknown as typeof fetch
	const result = await getLegalDocuments()
	expect(result[1].published?.bodyHtml?.en).toBe(content)
})

test('legal transport rejects oversized response envelopes even with valid document fields', async () => {
	const payload = `${JSON.stringify(documents('Text'))}${' '.repeat(1_048_576)}`
	globalThis.fetch = (async () =>
		new Response(payload)) as unknown as typeof fetch
	await expect(getLegalDocuments()).rejects.toThrow('InvalidLegalDocuments')
})
