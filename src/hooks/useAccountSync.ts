import NetInfo from '@react-native-community/netinfo'
import {
	CryptoDigestAlgorithm,
	digestStringAsync,
	randomUUID
} from 'expo-crypto'
import { useEffect } from 'react'
import { AppState } from 'react-native'
import { AccountAPIError, accountAPI } from '@/api/account-api'
import type { SyncRecord } from '@/types/account-sync'
import type { CalendarSnapshot } from '@/types/imported-calendar'
import {
	clearEncryptedProfile,
	flushEncryptedProfile,
	prepareEncryptedProfile,
	readEncryptedProfile
} from '@/utils/account-encrypted-storage'
import {
	accountMutationBusy,
	localAccountVersion,
	markAccountEdit,
	watchAccountEdits
} from '@/utils/account-mutation'
import { accountProfileErrorCode } from '@/utils/account-profile-error'
import {
	applyAppRecords,
	applyingAccountSnapshot,
	collectAppRecords,
	collectAppRecordsSync,
	foodKeys,
	hydrateAppProfile,
	preferenceKeys,
	readProfileState,
	saveDevicePreferences
} from '@/utils/account-store-bindings'
import { parseSyncResponse } from '@/utils/account-sync-response'
import {
	discardSyncConflict,
	enqueueSync,
	projectSyncRecords,
	reconcileSync,
	syncEntityKey
} from '@/utils/account-sync-state'
import {
	clearCalendarLinksForProfile,
	readGuestCalendarLink
} from '@/utils/calendar-link-storage'
import { accountProfileStorage, appStorage } from '@/utils/storage'
import { useAccountStore } from './useAccountStore'
import {
	emptySyncState,
	useAccountLifecycleStore,
	useAccountSyncStore
} from './useAccountSyncStore'
import { useDashboardOrderStore } from './useDashboardOrderStore'
import { useFoodFilterStore } from './useFoodFilterStore'
import { useImportedCalendarStore } from './useImportedCalendarStore'
import { usePreferencesStore } from './usePreferencesStore'

const snapshotQuery =
	'query AccountSnapshot { accountSnapshot { records { kind entityId revision deleted payloadJson } } }'
const syncMutation =
	'mutation AccountSync($operations:[AccountSyncOperationInput!]!){accountSync(operations:$operations){records{kind entityId revision deleted payloadJson}conflicts{kind entityId revision}}}'
let epoch = 0
let observed = new Map<string, unknown>()
const submissions = new Map<string, string[]>()
let activeRequest: {
	id: symbol
	profile: string
	promise: Promise<void>
} | null = null
let displayedRevisions = new Map<string, number>()
let _dirty = false
const json = (value: unknown) => JSON.stringify(value)
const currentProfile = () => {
	const state = useAccountStore.getState()
	return state.status === 'authenticated' && state.user
		? `account.${state.user.id}`
		: null
}
const valid = (profile: string, generation: number) =>
	currentProfile() === profile &&
	accountProfileStorage.getProfile() === profile &&
	epoch === generation
function observe(records: Omit<SyncRecord, 'revision' | 'deleted'>[]) {
	const projected = projectSyncRecords(
		useAccountSyncStore.getState().records,
		useAccountSyncStore.getState().pending
	)
	observed = new Map(
		records.map((r) => {
			const payload = r.payload as Record<string, unknown>
			const source = projected.find(
				(p) => syncEntityKey(p) === syncEntityKey(r)
			)?.payload as Record<string, unknown> | undefined
			return [
				syncEntityKey(r),
				r.kind === 'calendar' && source?.guestImport
					? { ...payload, guestImport: source.guestImport }
					: payload
			]
		})
	)
	displayedRevisions = new Map(
		projected.map((r) => [syncEntityKey(r), r.revision])
	)
}
function captureLocal(profile: string, generation: number) {
	if (!valid(profile, generation)) return
	const values = collectAppRecordsSync(profile)
	const state = useAccountSyncStore.getState()
	const next = new Map(values.map((r) => [syncEntityKey(r), r]))
	let pending = state.pending
	for (const record of values) {
		const key = syncEntityKey(record)
		const old = observed.get(key)
		if (record.kind === 'calendar' && old && typeof old === 'object') {
			if ('guestImport' in old)
				(record.payload as Record<string, unknown>).guestImport = (
					old as Record<string, unknown>
				).guestImport
			const { privateLink: _old, ...oldMetadata } = old as Record<
				string,
				unknown
			>
			const { privateLink: _new, ...newMetadata } = record.payload as Record<
				string,
				unknown
			>
			if (json(oldMetadata) === json(newMetadata)) record.payload = old
		}
		if (json(old) === json(record.payload)) continue
		const revision = displayedRevisions.get(key) ?? 0
		pending = enqueueSync(
			pending,
			{
				operationId: randomUUID(),
				...record,
				baseRevision: revision,
				deleted: false
			},
			submissions.get(profile) ?? []
		)
	}
	for (const [key] of observed)
		if (!next.has(key)) {
			const base =
				state.records.find((r) => syncEntityKey(r) === key) ??
				projectSyncRecords([], state.pending).find(
					(r) => syncEntityKey(r) === key
				)
			if (base)
				pending = enqueueSync(
					pending,
					{
						operationId: randomUUID(),
						kind: base.kind,
						entityId: base.entityId,
						baseRevision: displayedRevisions.get(key) ?? 0,
						deleted: true,
						payload: null
					},
					submissions.get(profile) ?? []
				)
		}
	if (pending !== state.pending) useAccountSyncStore.setState({ pending })
	observed = new Map(values.map((r) => [syncEntityKey(r), r.payload]))
}
async function collectLocal(profile: string, generation: number) {
	captureLocal(profile, generation)
	await flushEncryptedProfile(profile)
}
async function applyProjection(profile: string, generation: number) {
	for (let attempt = 0; attempt < 3; attempt++) {
		if (!valid(profile, generation) || accountMutationBusy()) return
		await collectLocal(profile, generation)
		const version = localAccountVersion()
		const state = useAccountSyncStore.getState()
		const projected = projectSyncRecords(state.records, state.pending)
		try {
			await applyAppRecords(
				profile,
				projected,
				() =>
					valid(profile, generation) &&
					!accountMutationBusy() &&
					localAccountVersion() === version
			)
			if (!valid(profile, generation)) return
			// Map reflects exactly the snapshot applied above; local subscriptions capture later edits.
			observed = new Map(
				projected
					.filter((r) => !r.deleted)
					.map((r) => [syncEntityKey(r), r.payload])
			)
			displayedRevisions = new Map(
				projected.map((r) => [syncEntityKey(r), r.revision])
			)
			return
		} catch (error) {
			if (error instanceof Error && error.message === 'LocalStateChanged')
				continue
			throw error
		}
	}
}
export async function syncAccountNow(): Promise<void> {
	const profile = currentProfile()
	const generation = epoch
	if (
		!profile ||
		useAccountLifecycleStore.getState().readyProfile !== profile ||
		accountMutationBusy()
	)
		return
	if (activeRequest?.profile === profile) return activeRequest.promise
	const requestId = Symbol('sync-request')
	let submitted: string[] = []
	const task = (async () => {
		useAccountLifecycleStore.setState({ syncing: true })
		try {
			await collectLocal(profile, generation)
			if (!valid(profile, generation)) return
			await flushEncryptedProfile(profile)
			const state = useAccountSyncStore.getState()
			const conflicts = new Set(state.conflicts.map(syncEntityKey))
			const batch = state.pending
				.filter((op) => !conflicts.has(syncEntityKey(op)))
				.slice(0, 20)
			submitted = batch.map((op) => op.operationId)
			submissions.set(profile, submitted)
			const result = batch.length
				? (
						await accountAPI.graphQL<{ accountSync: unknown }>(
							syncMutation,
							{
								operations: batch.map(({ payload, ...op }) => ({
									...op,
									payloadJson: JSON.stringify(payload)
								}))
							},
							profile.slice(8)
						)
					).accountSync
				: {
						...(
							await accountAPI.graphQL<{
								accountSnapshot: { records: unknown[] }
							}>(snapshotQuery, {}, profile.slice(8))
						).accountSnapshot,
						conflicts: []
					}
			if (!valid(profile, generation)) return
			const response = parseSyncResponse(result)
			const firstEmpty =
				!state.hasPulled &&
				response.records.length === 0 &&
				state.pending.length === 0
			await collectLocal(profile, generation)
			if (!valid(profile, generation)) return
			const current = useAccountSyncStore.getState()
			const reconciled = reconcileSync(
				current.pending,
				response,
				submissions.get(profile) ?? []
			)
			const stillConflicts = current.conflicts.filter((c) =>
				reconciled.pending.some((p) => syncEntityKey(p) === syncEntityKey(c))
			)
			const combined = [...stillConflicts, ...reconciled.conflicts].filter(
				(c, i, all) =>
					all.findIndex((v) => syncEntityKey(v) === syncEntityKey(c)) === i
			)
			useAccountSyncStore.setState({
				...reconciled,
				conflicts: combined,
				hasPulled: true,
				lastSuccess: new Date().toISOString(),
				error: null
			})
			await flushEncryptedProfile(profile)
			await applyProjection(profile, generation)
			if (firstEmpty && valid(profile, generation)) {
				const guestPreferences = readProfileState('guest', 'app-storage')
				const guestFood = readProfileState('guest', 'food-filter-storage')
				const preferences = Object.fromEntries(
					preferenceKeys
						.filter((k) => guestPreferences[k] !== undefined)
						.map((k) => [k, guestPreferences[k]])
				)
				const food = Object.fromEntries(
					foodKeys
						.filter((k) => guestFood[k] !== undefined)
						.map((k) => [k, guestFood[k]])
				)
				usePreferencesStore.setState(preferences)
				useFoodFilterStore.setState(food)
				markAccountEdit()
			}
		} catch (error) {
			if (valid(profile, generation)) {
				useAccountSyncStore.setState({
					error:
						error instanceof AccountAPIError
							? error.code
							: error instanceof Error
								? error.message
								: 'AccountSyncUnavailable'
				})
				if (error instanceof AccountAPIError && error.status === 401)
					useAccountStore.getState().lock()
			}
		} finally {
			if (valid(profile, generation))
				useAccountLifecycleStore.setState({ syncing: false })
			if (activeRequest?.id === requestId) activeRequest = null
			if (submissions.get(profile) === submitted) submissions.delete(profile)
		}
	})()
	activeRequest = { id: requestId, profile, promise: task }
	return task
}
async function switchProfile(profile: string) {
	const generation = ++epoch
	useAccountLifecycleStore.setState({
		readyProfile: null,
		syncing: false,
		error: null
	})
	const previous = appStorage.getString('hawconnect-last-account')
	if (profile.startsWith('account.') && previous && previous !== profile) {
		const raw = await readEncryptedProfile(previous)
		if (generation !== epoch) return
		if (raw && JSON.parse(raw).state?.pending?.length) {
			useAccountLifecycleStore.setState({ switchBlocked: true })
			return
		}
	}
	const raw = profile === 'guest' ? null : await readEncryptedProfile(profile)
	if (generation !== epoch) return
	const cached = raw ? JSON.parse(raw).state : emptySyncState
	if (profile !== 'guest') await prepareEncryptedProfile(profile)
	if (generation !== epoch) return
	hydrateAppProfile(profile)
	useAccountSyncStore.setState({ ...emptySyncState, ...cached })
	if (profile !== 'guest') {
		appStorage.set('hawconnect-last-account', profile)
		await applyAppRecords(
			profile,
			projectSyncRecords(cached.records ?? [], cached.pending ?? []),
			() => generation === epoch
		)
		if (generation !== epoch) return
	}
	observe(await collectAppRecords(profile))
	if (generation !== epoch) return
	useAccountLifecycleStore.setState({
		readyProfile: profile,
		switchBlocked: false,
		syncing: false
	})
	if (profile !== 'guest') void syncAccountNow()
}
export async function discardPreviousAccount() {
	const previous = appStorage.getString('hawconnect-last-account')
	if (previous) {
		const cached = await readEncryptedProfile(previous)
		const state = cached ? JSON.parse(cached).state : {}
		const calendars = [...(state.records ?? []), ...(state.pending ?? [])]
			.filter((record: SyncRecord) => record.kind === 'calendar')
			.map((record: SyncRecord) => record.entityId)
		await clearCalendarLinksForProfile(previous, [
			...new Set<string>(calendars)
		])
		await clearEncryptedProfile(previous)
		accountProfileStorage.clearProfile(previous)
		appStorage.remove('hawconnect-last-account')
	}
	const profile = currentProfile()
	if (profile) await switchProfile(profile)
}
export function useAccountSync() {
	const status = useAccountStore((s) => s.status)
	const owner = useAccountStore((s) => s.user?.id)
	useEffect(() => {
		const profile =
			status === 'authenticated' && owner
				? `account.${owner}`
				: status === 'guest'
					? 'guest'
					: null
		if (profile)
			void switchProfile(profile).catch((error) =>
				useAccountLifecycleStore.setState({
					readyProfile: null,
					error: accountProfileErrorCode(error)
				})
			)
	}, [status, owner])
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined
		const schedule = () => {
			if (applyingAccountSnapshot) return
			_dirty = true
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => void syncAccountNow(), 600)
		}
		const changed = () => {
			if (applyingAccountSnapshot) return
			markAccountEdit()
			saveDevicePreferences()
			const profile = currentProfile()
			if (
				profile &&
				useAccountLifecycleStore.getState().readyProfile === profile
			) {
				try {
					captureLocal(profile, epoch)
				} catch {
					useAccountSyncStore.setState({ error: 'EncryptedCacheLocked' })
				}
			}
			schedule()
		}
		const subscriptions = [
			useImportedCalendarStore.subscribe(changed),
			usePreferencesStore.subscribe(changed),
			useFoodFilterStore.subscribe(changed),
			useDashboardOrderStore.subscribe(changed)
		]
		const edits = watchAccountEdits(schedule)
		const foreground = AppState.addEventListener('change', (state) => {
			if (state === 'active') void syncAccountNow()
		})
		const network = NetInfo.addEventListener((state) => {
			if (state.isConnected) void syncAccountNow()
		})
		const interval = setInterval(() => {
			if (useAccountStore.getState().status === 'authenticated')
				void syncAccountNow()
		}, 60000)
		return () => {
			if (timer) clearTimeout(timer)
			for (const unsubscribe of subscriptions) unsubscribe()
			edits()
			foreground.remove()
			network()
			clearInterval(interval)
		}
	}, [])
}

export async function retryAccountProfile() {
	const profile = currentProfile() ?? 'guest'
	await switchProfile(profile).catch((error) =>
		useAccountLifecycleStore.setState({ error: accountProfileErrorCode(error) })
	)
}
export async function clearCurrentAccountCache(expectedOwner?: string) {
	const profile = currentProfile()
	if (!profile || (expectedOwner && profile !== `account.${expectedOwner}`))
		return
	++epoch
	accountProfileStorage.lockWrites()
	useAccountLifecycleStore.setState({ readyProfile: null, syncing: false })
	const state = useAccountSyncStore.getState()
	const ids = [
		...new Set(
			[...state.records, ...state.pending]
				.filter((r) => r.kind === 'calendar')
				.map((r) => r.entityId)
		)
	]
	await clearCalendarLinksForProfile(profile, ids)
	await clearEncryptedProfile(profile)
	accountProfileStorage.clearProfile(profile)
	if (currentProfile() !== profile) return
	appStorage.remove('hawconnect-last-account')
	useAccountLifecycleStore.setState({
		readyProfile: null,
		syncing: false,
		error: null
	})
}
export async function importGuestCalendars() {
	const profile = currentProfile()
	const generation = epoch
	if (!profile || useAccountLifecycleStore.getState().readyProfile !== profile)
		return
	const guest = readProfileState('guest', 'hawconnect-imported-calendars-v1')
	const calendars = Array.isArray(guest.calendars)
		? (guest.calendars as CalendarSnapshot[])
		: []
	let installation = appStorage.getString('hawconnect-installation-id')
	if (!installation) {
		installation = randomUUID()
		appStorage.set('hawconnect-installation-id', installation)
	}
	let pending = useAccountSyncStore.getState().pending
	for (const calendar of calendars) {
		const { id, ...data } = calendar
		const privateLink =
			calendar.sourceType === 'link'
				? await readGuestCalendarLink(id)
				: undefined
		if (!valid(profile, generation)) return
		if (calendar.sourceType === 'link' && !privateLink)
			throw new Error('CalendarLinkUnavailable')
		const source = { ...data, ...(privateLink ? { privateLink } : {}) }
		const signature = await digestStringAsync(
			CryptoDigestAlgorithm.SHA256,
			JSON.stringify(source)
		)
		if (!valid(profile, generation)) return
		const entityId = `g-${installation}-${id}`
		if (entityId.length > 128) throw new Error('InvalidSyncPayload')
		const record = useAccountSyncStore
			.getState()
			.records.find((r) => r.kind === 'calendar' && r.entityId === entityId)
		const old = record?.payload as {
			guestImport?: { guestRevision: string; importedRevision: number }
		} | null
		if (old?.guestImport?.guestRevision === signature) continue
		const baseRevision = old?.guestImport?.importedRevision ?? 0
		const payload = {
			...source,
			guestImport: {
				installationId: installation,
				guestEntityId: id,
				guestRevision: signature,
				importedRevision: baseRevision + 1
			}
		}
		pending = enqueueSync(
			pending,
			{
				operationId: randomUUID(),
				kind: 'calendar',
				entityId,
				baseRevision,
				deleted: false,
				payload
			},
			submissions.get(profile) ?? []
		)
	}
	if (!valid(profile, generation)) return
	useAccountSyncStore.setState({ pending })
	await flushEncryptedProfile(profile)
	await applyProjection(profile, generation)
	await syncAccountNow()
}

export async function cancelAccountSwitch() {
	await accountAPI.signOut()
	useAccountStore.getState().signedOut()
}

export async function useCloudCalendarCopies() {
	const profile = currentProfile()
	const generation = epoch
	if (!profile || !valid(profile, generation) || activeRequest)
		throw new Error('SyncBusy')
	const state = useAccountSyncStore.getState()
	let next = { pending: state.pending, conflicts: state.conflicts }
	for (const conflict of state.conflicts)
		next = discardSyncConflict(next.pending, next.conflicts, conflict)
	useAccountSyncStore.setState(next)
	await flushEncryptedProfile(profile)
	if (!valid(profile, generation)) return
	await applyProjection(profile, generation)
	await syncAccountNow()
}
