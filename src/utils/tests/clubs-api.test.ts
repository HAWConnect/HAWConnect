import { expect, test } from 'bun:test'
import { loadCompatibleClubs } from '@/api/clubs-compatibility'

const directory = {
	available: true,
	stale: false,
	updatedAt: null,
	sourceUrl: 'https://haw.example/clubs',
	clubs: [
		{
			id: 'de-club',
			title: 'Club',
			description: 'Plain text',
			sourceUrl: 'https://haw.example/club',
			links: []
		}
	]
}
const richDirectory = {
	...directory,
	clubs: [
		{
			...directory.clubs[0],
			descriptionHtml: '<p>Formatted</p>',
			contentLanguage: 'de'
		}
	]
}

test('older servers retry the plain query only for the additive club fields, with serialized GraphQL errors', async () => {
	for (const field of ['descriptionHtml', 'contentLanguage']) {
		let requests = 0
		const result = await loadCompatibleClubs(
			async () => {
				requests++
				throw new Error(
					`GraphQL error: ${JSON.stringify([{ message: `Cannot query field "${field}" on type "HawClub".` }])}`
				)
			},
			async () => {
				requests++
				return directory
			}
		)
		expect(requests).toBe(2)
		expect(result.clubs[0]).toMatchObject({
			description: 'Plain text',
			descriptionHtml: null,
			contentLanguage: null
		})
	}
})

test('other failures propagate without a legacy retry', async () => {
	for (const message of [
		'Database unavailable',
		'Cannot query field "unrelated" on type "HawClub".',
		'Cannot query field "descriptionHtml" on type "OtherType".'
	]) {
		let legacyRequests = 0
		await expect(
			loadCompatibleClubs(
				async () => {
					throw new Error(message)
				},
				async () => {
					legacyRequests++
					return directory
				}
			)
		).rejects.toThrow(message)
		expect(legacyRequests).toBe(0)
	}
})

test('rich responses preserve the manual content locale and HTML without a legacy request', async () => {
	let legacyRequests = 0
	const result = await loadCompatibleClubs(
		async () => richDirectory,
		async () => {
			legacyRequests++
			return directory
		}
	)
	expect(result.clubs[0]).toMatchObject({
		descriptionHtml: '<p>Formatted</p>',
		contentLanguage: 'de'
	})
	expect(legacyRequests).toBe(0)
})
