import type {
	SyncOperation,
	SyncRecord,
	SyncResponse
} from '@/types/account-sync'
export const syncEntityKey = (value: { kind: string; entityId: string }) =>
	JSON.stringify([value.kind, value.entityId])
export function enqueueSync(
	pending: SyncOperation[],
	operation: SyncOperation,
	inFlight: string[]
): SyncOperation[] {
	return [
		...pending.filter(
			(p) =>
				syncEntityKey(p) !== syncEntityKey(operation) ||
				inFlight.includes(p.operationId)
		),
		operation
	]
}
export function reconcileSync(
	pending: SyncOperation[],
	response: SyncResponse,
	submitted: string[]
) {
	const conflicts = new Set(response.conflicts.map(syncEntityKey))
	const acknowledged = new Set(
		pending
			.filter(
				(p) =>
					submitted.includes(p.operationId) && !conflicts.has(syncEntityKey(p))
			)
			.map(syncEntityKey)
	)
	const remaining = pending
		.filter(
			(p) =>
				!submitted.includes(p.operationId) || conflicts.has(syncEntityKey(p))
		)
		.map((p) => {
			if (
				submitted.includes(p.operationId) ||
				!acknowledged.has(syncEntityKey(p)) ||
				conflicts.has(syncEntityKey(p))
			)
				return p
			const record = response.records.find(
				(r) => syncEntityKey(r) === syncEntityKey(p)
			)
			return record ? { ...p, baseRevision: record.revision } : p
		})
	return {
		records: response.records,
		pending: remaining,
		conflicts: response.conflicts
	}
}
export function projectSyncRecords(
	records: SyncRecord[],
	pending: SyncOperation[]
): SyncRecord[] {
	const result = new Map(records.map((r) => [syncEntityKey(r), r]))
	for (const op of pending)
		result.set(syncEntityKey(op), {
			kind: op.kind,
			entityId: op.entityId,
			revision: op.baseRevision,
			deleted: op.deleted,
			payload: op.payload
		})
	return [...result.values()]
}
// Explicitly choose the server copy; never overwrite a newer calendar silently.
export function discardSyncConflict(
	pending: SyncOperation[],
	conflicts: SyncResponse['conflicts'],
	entity: { kind: string; entityId: string }
) {
	const key = syncEntityKey(entity)
	return {
		pending: pending.filter((op) => syncEntityKey(op) !== key),
		conflicts: conflicts.filter((conflict) => syncEntityKey(conflict) !== key)
	}
}
