export type LegalKey = 'privacy' | 'imprint'
export interface PublicLegalDocument {
	key: LegalKey
	managed: boolean
	published: {
		mode: 'internal' | 'external'
		body: { de: string; en: string }
		url: { de: string; en: string }
	} | null
	publishedAt: string | null
}
function safeURL(raw: string): boolean {
	try {
		const url = new URL(raw)
		return url.protocol === 'https:' && !url.username && !url.password
	} catch {
		return false
	}
}
export function parseLegalDocuments(value: unknown): PublicLegalDocument[] {
	if (!Array.isArray(value) || value.length !== 2)
		throw Error('InvalidLegalDocuments')
	const documents = value.map((row) => {
		if (
			!row ||
			!['privacy', 'imprint'].includes(row.key) ||
			typeof row.managed !== 'boolean'
		)
			throw Error('InvalidLegalDocuments')
		const p = row.published
		if (p !== null) {
			if (!p || !['internal', 'external'].includes(p.mode))
				throw Error('InvalidLegalDocuments')
			for (const language of ['de', 'en']) {
				if (
					typeof p.body?.[language] !== 'string' ||
					p.body[language].length > 20000 ||
					typeof p.url?.[language] !== 'string' ||
					p.url[language].length > 2048
				)
					throw Error('InvalidLegalDocuments')
				if (p.mode === 'external' && !safeURL(p.url[language]))
					throw Error('InvalidLegalDocuments')
			}
		}
		return {
			key: row.key,
			managed: row.managed,
			published: p,
			publishedAt: typeof row.publishedAt === 'string' ? row.publishedAt : null
		} as PublicLegalDocument
	})
	if (new Set(documents.map((d) => d.key)).size !== 2)
		throw Error('InvalidLegalDocuments')
	return documents
}
export function legalTarget(
	document: PublicLegalDocument | undefined,
	language: string,
	fallback = ''
):
	| { mode: 'internal'; body: string }
	| { mode: 'external'; url: string }
	| null {
	if (!document) return null
	if (!document.published)
		return !document.managed && safeURL(fallback)
			? { mode: 'external', url: fallback }
			: null
	const lang = language.startsWith('de') ? 'de' : 'en'
	return document.published.mode === 'internal'
		? { mode: 'internal', body: document.published.body[lang] }
		: { mode: 'external', url: document.published.url[lang] }
}
