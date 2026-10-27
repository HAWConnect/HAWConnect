import type {
	HawClubsLegacyQuery,
	HawClubsQuery
} from '@/__generated__/gql/graphql'

/** Keep the public directory usable while a backend rolls out the additive fields. */
export async function loadCompatibleClubs(
	loadRich: () => Promise<HawClubsQuery['hawClubs']>,
	loadLegacy: () => Promise<HawClubsLegacyQuery['hawClubs']>
): Promise<HawClubsQuery['hawClubs']> {
	try {
		return await loadRich()
	} catch (error) {
		// executeGql serializes GraphQL errors as JSON, including escaped quotes.
		if (
			!(error instanceof Error) ||
			!/Cannot query field "(?:descriptionHtml|contentLanguage)" on type "HawClub"/.test(
				error.message.replaceAll('\\"', '"')
			)
		)
			throw error
		const legacy = await loadLegacy()
		return {
			...legacy,
			clubs: legacy.clubs.map((club) => ({
				...club,
				descriptionHtml: null,
				contentLanguage: null
			}))
		}
	}
}
