import { expect, it } from 'bun:test'
import type { SyncOperation, SyncRecord } from '@/types/account-sync'
import {
	discardSyncConflict,
	enqueueSync,
	projectSyncRecords,
	reconcileSync
} from '../account-sync-state'

const op = (id: string, value: string, baseRevision = 0): SyncOperation => ({
	operationId: id,
	kind: 'calendar',
	entityId: 'one',
	baseRevision,
	deleted: false,
	payload: { name: value }
})
const record = (revision: number): SyncRecord => ({
	kind: 'calendar',
	entityId: 'one',
	revision,
	deleted: false,
	payload: { name: 'cloud' }
})
it('coalesces unsent edits but never mutates a submitted operation', () => {
	const a = op('a', 'first')
	const b = op('b', 'second')
	expect(enqueueSync([a], b, [])).toEqual([b])
	expect(enqueueSync([a], b, ['a'])).toEqual([a, b])
})
it('rebases a newer local edit only after its own predecessor succeeds', () => {
	const result = reconcileSync(
		[op('a', 'first'), op('b', 'later')],
		{ records: [record(1)], conflicts: [] },
		['a']
	)
	expect(result.pending).toEqual([op('b', 'later', 1)])
})
it('retains conflicting offline edits and projects them without overwriting cloud revisions', () => {
	const operation = op('a', 'local', 1)
	const result = reconcileSync(
		[operation],
		{
			records: [record(2)],
			conflicts: [{ kind: 'calendar', entityId: 'one', revision: 2 }]
		},
		['a']
	)
	expect(result.pending).toEqual([operation])
	expect(projectSyncRecords(result.records, result.pending)[0].payload).toEqual(
		{ name: 'local' }
	)
	expect(result.records[0].revision).toBe(2)
})
it('can discard a conflicting local edit without removing unrelated pending changes', () => {
	const conflict = op('a', 'local', 1)
	const other = { ...op('b', 'other'), entityId: 'two' }
	const result = discardSyncConflict(
		[conflict, other],
		[{ kind: 'calendar', entityId: 'one', revision: 2 }],
		{ kind: 'calendar', entityId: 'one' }
	)
	expect(result.pending).toEqual([other])
	expect(result.conflicts).toEqual([])
})
