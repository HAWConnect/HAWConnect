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
