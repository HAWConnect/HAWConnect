export type SyncKind = 'calendar' | 'preference' | 'bookmark' | 'dashboard'
export interface SyncOperation {
	operationId: string
	kind: SyncKind
	entityId: string
	baseRevision: number
	deleted: boolean
	payload: unknown
}
export interface SyncRecord {
	kind: SyncKind
	entityId: string
	revision: number
	deleted: boolean
	payload: unknown
}
export interface SyncConflict {
	kind: string
	entityId: string
	revision: number
}
export interface SyncResponse {
	records: SyncRecord[]
	conflicts: SyncConflict[]
}
