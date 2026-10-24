import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
	SyncConflict,
	SyncOperation,
	SyncRecord
} from '@/types/account-sync'
import { encryptedSyncStorage } from '@/utils/account-encrypted-storage'

interface SyncState {
	records: SyncRecord[]
	pending: SyncOperation[]
	conflicts: SyncConflict[]
	lastSuccess: string | null
	error: string | null
	hasPulled: boolean
	guestImports: Record<string, string>
}
export const emptySyncState: SyncState = {
	records: [],
	pending: [],
	conflicts: [],
	lastSuccess: null,
	error: null,
	hasPulled: false,
	guestImports: {}
}
export const useAccountSyncStore = create<SyncState>()(
	persist(() => ({ ...emptySyncState }), {
		skipHydration: true,
		name: 'account-sync-storage',
		storage: createJSONStorage(() => encryptedSyncStorage)
	})
)
interface LifecycleState {
	readyProfile: string | null
	switchBlocked: boolean
	syncing: boolean
	error: string | null
}
export const useAccountLifecycleStore = create<LifecycleState>(() => ({
	readyProfile: null,
	switchBlocked: false,
	syncing: false,
	error: null
}))
