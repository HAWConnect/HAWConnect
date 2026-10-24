import type { StoreApi } from 'zustand'
import { useDashboardOrderStore } from '@/hooks/useDashboardOrderStore'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { useImportedCalendarStore } from '@/hooks/useImportedCalendarStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import i18n from '@/localization/i18n'
import type { SyncRecord } from '@/types/account-sync'
import type { CalendarSnapshot } from '@/types/imported-calendar'
import {
	deleteCalendarLink,
	loadCalendarLink,
	peekCalendarLink,
	saveCalendarLink
} from './calendar-link-storage'
import { parseCalendar } from './ical-import'
import {
	accountProfileStorage,
	appStorage,
	readLegacyDashboardOrder
} from './storage'

export const preferenceKeys = [
	'theme',
	'themeColor',
	'language',
	'autoShowNextDay',
	'autoShowNextDayTimeMinutes',
	'recentQuicklinks'
] as const
export const foodKeys = [
	'selectedRestaurants',
	'preferencesSelection',
	'allergenSelection',
	'showStatic',
	'foodLanguage'
] as const
const deviceKeys = ['appIcon', 'unlockedAppIcons', 'showSplashScreen'] as const
export let applyingAccountSnapshot = false
export function readProfileState(
	profile: string,
	name: string
): Record<string, unknown> {
	const raw = accountProfileStorage.readProfileItem(profile, name)
	if (!raw) return {}
	try {
		const state = JSON.parse(raw).state
		if (!state || typeof state !== 'object' || Array.isArray(state))
			throw new Error()
		return state
	} catch {
		throw new Error('InvalidLocalProfile')
	}
}
function restore<S extends object>(
	store: StoreApi<S>,
	state: Record<string, unknown>,
	overrides: Partial<S> = {}
) {
	const initial = store.getInitialState()
	const data: Record<string, unknown> = Object.fromEntries(
		Object.entries(initial)
	)
	for (const [key, value] of Object.entries(initial))
		if (typeof value !== 'function' && Object.hasOwn(state, key))
			data[key] = state[key]
	store.setState({ ...data, ...overrides } as S, true)
}
export function hydrateAppProfile(profile: string) {
	const values = {
		preferences: readProfileState(profile, 'app-storage'),
		food: readProfileState(profile, 'food-filter-storage'),
		calendar: readProfileState(profile, 'hawconnect-imported-calendars-v1'),
		timetable: readProfileState(profile, 'timetable-storage'),
		dashboard: readProfileState(profile, 'dashboard-order-storage')
	}
	if (profile === 'guest' && values.dashboard.shown === undefined)
		values.dashboard.shown = readLegacyDashboardOrder()
	let device: Record<string, unknown> = {}
	try {
		device = JSON.parse(
			appStorage.getString('hawconnect-device-preferences') ?? '{}'
		)
	} catch {
		device = {}
	}
	for (const key of deviceKeys)
		if (!Object.hasOwn(device, key))
			device[key] = usePreferencesStore.getState()[key]
	accountProfileStorage.setProfile(profile)
	applyingAccountSnapshot = true
	try {
		restore(usePreferencesStore, values.preferences, device)
		restore(useFoodFilterStore, values.food)
		restore(useImportedCalendarStore, values.calendar)
		restore(useDashboardOrderStore, values.dashboard)
		const selected = new Date(
			String(values.timetable.selectedDate ?? new Date().toISOString())
		)
		restore(useTimetableStore, values.timetable, {
			selectedDate: Number.isFinite(selected.getTime()) ? selected : new Date()
		})
		const language = usePreferencesStore.getState().language
		if (language) void i18n.changeLanguage(language)
	} finally {
		applyingAccountSnapshot = false
	}
}
export function saveDevicePreferences() {
	const state = usePreferencesStore.getState()
	appStorage.set(
		'hawconnect-device-preferences',
		JSON.stringify(
			Object.fromEntries(deviceKeys.map((key) => [key, state[key]]))
		)
	)
}
export async function collectAppRecords(
	profile: string
): Promise<Omit<SyncRecord, 'revision' | 'deleted'>[]> {
	for (const calendar of useImportedCalendarStore.getState().calendars)
		if (calendar.sourceType === 'link') await loadCalendarLink(calendar.id)
	if (accountProfileStorage.getProfile() !== profile)
		throw new Error('ProfileChanged')
	return collectAppRecordsSync(profile)
}
export function collectAppRecordsSync(
	profile: string
): Omit<SyncRecord, 'revision' | 'deleted'>[] {
	const records: Omit<SyncRecord, 'revision' | 'deleted'>[] = []
	for (const calendar of useImportedCalendarStore.getState().calendars) {
		const { id, ...payload } = calendar
		const privateLink =
			calendar.sourceType === 'link' ? peekCalendarLink(profile, id) : undefined
		if (accountProfileStorage.getProfile() !== profile)
			throw new Error('ProfileChanged')
		if (calendar.sourceType === 'link' && !privateLink)
			throw new Error('CalendarLinkUnavailable')
		records.push({
			kind: 'calendar',
			entityId: id,
			payload: { ...payload, ...(privateLink ? { privateLink } : {}) }
		})
	}
	const preferences = usePreferencesStore.getState()
	for (const key of preferenceKeys)
		if (preferences[key] !== undefined)
			records.push({
				kind: 'preference',
				entityId: key,
				payload: preferences[key]
			})
	const food = useFoodFilterStore.getState()
	for (const key of foodKeys)
		if (food[key] !== undefined)
			records.push({
				kind: 'preference',
				entityId: `food.${key}`,
				payload: food[key]
			})
	const shown = useDashboardOrderStore.getState().shown
	if (shown)
		records.push({
			kind: 'dashboard',
			entityId: 'order',
			payload: { shown, unavailable: [] }
		})
	return records
}
export async function applyAppRecords(
	profile: string,
	records: SyncRecord[],
	guard: () => boolean = () => true
) {
	const calendars: CalendarSnapshot[] = []
	const links = new Map<string, string>()
	const preferences: Record<string, unknown> = {}
	const food: Record<string, unknown> = {}
	let dashboard: string[] | undefined
	for (const record of records) {
		if (!record.entityId || !Number.isSafeInteger(record.revision))
			throw new Error('InvalidSyncSnapshot')
		if (record.deleted) {
			if (record.kind === 'preference') {
				if ((preferenceKeys as readonly string[]).includes(record.entityId))
					preferences[record.entityId] = Object.fromEntries(
						Object.entries(usePreferencesStore.getInitialState())
					)[record.entityId]
				else if (record.entityId.startsWith('food.'))
					food[record.entityId.slice(5)] = Object.fromEntries(
						Object.entries(useFoodFilterStore.getInitialState())
					)[record.entityId.slice(5)]
			}
			continue
		}
		if (record.kind === 'calendar') {
			const payload = record.payload as CalendarSnapshot & {
				privateLink?: string
			}
			if (
				!payload ||
				typeof payload.name !== 'string' ||
				!['file', 'link', 'demo'].includes(payload.sourceType)
			)
				throw new Error('InvalidSyncSnapshot')
			const parsed = parseCalendar(payload.raw, payload.defaultTimeZone)
			calendars.push({
				...parsed,
				id: record.entityId,
				name: payload.name,
				sourceType: payload.sourceType,
				updatedAt: payload.updatedAt
			})
			if (payload.sourceType === 'link') {
				const url = new URL(payload.privateLink ?? '')
				if (url.protocol !== 'https:' || url.username || url.password)
					throw new Error('InvalidSyncSnapshot')
				links.set(record.entityId, url.toString())
			}
		} else if (record.kind === 'preference') {
			const key = record.entityId
			if ((preferenceKeys as readonly string[]).includes(key))
				preferences[key] = record.payload
			else if (
				key.startsWith('food.') &&
				(foodKeys as readonly string[]).includes(key.slice(5))
			)
				food[key.slice(5)] = record.payload
			else throw new Error('InvalidSyncSnapshot')
		} else if (record.kind === 'dashboard') {
			const value = record.payload as { shown: unknown }
			if (
				!value ||
				!Array.isArray(value.shown) ||
				!value.shown.every((v) => typeof v === 'string')
			)
				throw new Error('InvalidSyncSnapshot')
			dashboard = value.shown
		} else if (record.kind !== 'bookmark')
			throw new Error('InvalidSyncSnapshot')
	}
	if (accountProfileStorage.getProfile() !== profile || !guard())
		throw new Error('ProfileChanged')
	for (const [id, url] of links) {
		if (!guard()) throw new Error('LocalStateChanged')
		await saveCalendarLink(id, url)
	}
	for (const calendar of useImportedCalendarStore.getState().calendars)
		if (calendar.sourceType === 'link' && !links.has(calendar.id)) {
			if (!guard()) throw new Error('LocalStateChanged')
			await deleteCalendarLink(calendar.id)
		}
	if (accountProfileStorage.getProfile() !== profile || !guard())
		throw new Error('LocalStateChanged')
	applyingAccountSnapshot = true
	try {
		useImportedCalendarStore.setState({ calendars })
		usePreferencesStore.setState(preferences)
		useFoodFilterStore.setState(food)
		if (dashboard) useDashboardOrderStore.setState({ shown: dashboard })
		const language = usePreferencesStore.getState().language
		if (language) void i18n.changeLanguage(language)
	} finally {
		applyingAccountSnapshot = false
	}
}
