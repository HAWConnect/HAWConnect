import { guardedFetch } from '@/utils/integration-utils'
import { parseLegalDocuments } from '@/utils/legal-documents'
export async function getLegalDocuments() {
	const endpoint = new URL(
		'/api/legal',
		process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT ??
			'http://localhost:4000/graphql'
	)
	const response = await guardedFetch(endpoint, {
		credentials: 'omit',
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(15000)
	})
	if (!response.ok) throw Error('LegalUnavailable')
	const text = await response.text()
	if (text.length > 160000) throw Error('InvalidLegalDocuments')
	return parseLegalDocuments(JSON.parse(text))
}
