import { expect, test } from 'bun:test'
import { legalTarget, parseLegalDocuments } from '../legal-documents'

test('unpublished managed documents never reactivate environment URLs', () => {
	expect(
		legalTarget(
			{ key: 'privacy', managed: true, published: null, publishedAt: null },
			'en',
			'https://example.org/old'
		)
	).toBeNull()
	expect(
		legalTarget(
			{ key: 'privacy', managed: false, published: null, publishedAt: null },
			'en',
			'https://example.org/privacy'
		)
	).toEqual({ mode: 'external', url: 'https://example.org/privacy' })
})
test('published language content is selected without using draft fields', () => {
	const document = {
		key: 'privacy' as const,
		managed: true,
		publishedAt: null,
		published: {
			mode: 'internal' as const,
			body: { de: 'Deutsch', en: '<script>untrusted</script>' },
			url: { de: '', en: '' }
		}
	}
	expect(legalTarget(document, 'en')).toEqual({
		mode: 'internal',
		body: '<script>untrusted</script>'
	})
	expect(legalTarget(document, 'de')).toEqual({
		mode: 'internal',
		body: 'Deutsch'
	})
})
test('unsafe public URLs and malformed publications are rejected', () => {
	expect(() =>
		parseLegalDocuments([
			{
				key: 'privacy',
				managed: true,
				published: {
					mode: 'external',
					url: { de: 'javascript:alert(1)', en: 'https://example.org' },
					body: { de: '', en: '' }
				}
			}
		])
	).toThrow()
	expect(() => parseLegalDocuments([])).toThrow()
})

const publishedLegal = (bodyHtml?: unknown) => ({
	key: 'privacy',
	managed: true,
	publishedAt: null,
	published: {
		mode: 'internal',
		body: { de: '<b>Wörtlich</b>', en: '<b>Literal</b>' },
		url: { de: '', en: '' },
		...(bodyHtml === undefined ? {} : { bodyHtml })
	}
})
const otherLegal = {
	key: 'imprint',
	managed: true,
	published: null,
	publishedAt: null
}

test('optional rich legal sidecars select the matching language and preserve plain fallback', () => {
	const [document] = parseLegalDocuments([
		publishedLegal({
			de: '<h2>Datenschutz</h2>',
			en: '<p><strong>Privacy</strong></p>'
		}),
		otherLegal
	])
	expect(legalTarget(document, 'de-DE')).toEqual({
		mode: 'internal',
		body: '<b>Wörtlich</b>',
		bodyHtml: '<h2>Datenschutz</h2>'
	})
	expect(legalTarget(document, 'en-GB')).toEqual({
		mode: 'internal',
		body: '<b>Literal</b>',
		bodyHtml: '<p><strong>Privacy</strong></p>'
	})
})

test('legacy and null-sidecar publications keep the exact plain result with literal angle brackets', () => {
	for (const html of [undefined, null]) {
		const [document] = parseLegalDocuments([publishedLegal(html), otherLegal])
		expect(legalTarget(document, 'en')).toEqual({
			mode: 'internal',
			body: '<b>Literal</b>'
		})
		expect(legalTarget(document, 'de')).toEqual({
			mode: 'internal',
			body: '<b>Wörtlich</b>'
		})
	}
})

test('malformed or oversized rich legal sidecars are rejected', () => {
	for (const html of [
		'',
		[],
		{ de: '<p>Deutsch</p>' },
		{ de: 1, en: '' },
		{ de: '', en: 'x'.repeat(20_001) }
	]) {
		expect(() =>
			parseLegalDocuments([publishedLegal(html), otherLegal])
		).toThrow('InvalidLegalDocuments')
	}
	const [document] = parseLegalDocuments([
		publishedLegal({ de: '', en: 'x'.repeat(20_000) }),
		otherLegal
	])
	expect(legalTarget(document, 'en')).toHaveProperty(
		'bodyHtml',
		'x'.repeat(20_000)
	)
})

test('external legal targets never expose inactive rich content', () => {
	const row = publishedLegal({ de: '<p>Hidden</p>', en: '<p>Hidden</p>' })
	row.published.mode = 'external'
	row.published.url = {
		de: 'https://example.org/datenschutz',
		en: 'https://example.org/privacy'
	}
	const [document] = parseLegalDocuments([row, otherLegal])
	expect(legalTarget(document, 'en')).toEqual({
		mode: 'external',
		url: 'https://example.org/privacy'
	})
})
