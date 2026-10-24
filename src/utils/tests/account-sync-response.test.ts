import { expect, it } from 'bun:test'
import { parseSyncResponse } from '../account-sync-response'

it('rejects an invalid remote preference before any local application', () => {
	expect(() =>
		parseSyncResponse({
			records: [
				{
					kind: 'preference',
					entityId: 'language',
					revision: 1,
					deleted: false,
					payloadJson: '{"bad":"value"}'
				}
			],
			conflicts: []
		})
	).toThrow('InvalidSyncSnapshot')
})
it('decodes deleted records and valid locale values', () => {
	const result = parseSyncResponse({
		records: [
			{
				kind: 'preference',
				entityId: 'language',
				revision: 2,
				deleted: false,
				payloadJson: '"de"'
			},
			{
				kind: 'calendar',
				entityId: 'old',
				revision: 3,
				deleted: true,
				payloadJson: 'null'
			}
		],
		conflicts: []
	})
	expect(result.records[0].payload).toBe('de')
	expect(result.records[1].deleted).toBe(true)
})
