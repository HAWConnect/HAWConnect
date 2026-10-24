import { normalizeCalendarUrl } from '@/api/calendar-import-api'
import type { SyncKind, SyncRecord, SyncResponse } from '@/types/account-sync'
import { parseCalendar } from './ical-import'

const object = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === 'object' && !Array.isArray(v)
const strings = (v: unknown, max = 64) =>
	Array.isArray(v) &&
	v.length <= max &&
	v.every((s) => typeof s === 'string' && s.length <= 128)
export function validSyncedPreference(key: string, value: unknown): boolean {
	switch (key) {
		case 'language':
			return value === 'de' || value === 'en'
		case 'theme':
			return value === 'auto' || value === 'light' || value === 'dark'
		case 'themeColor':
			return value === 'blue' || value === 'green' || value === 'purple'
		case 'autoShowNextDay':
		case 'food.showStatic':
			return typeof value === 'boolean'
		case 'autoShowNextDayTimeMinutes':
			return (
				Number.isInteger(value) && Number(value) >= 0 && Number(value) < 1440
			)
		case 'recentQuicklinks':
			return strings(value, 3)
		case 'food.selectedRestaurants':
			return (
				strings(value, 3) &&
				(value as string[]).every((v) =>
					['BerlinerTorMensa', 'BergedorfMensa', 'FinkenauMensa'].includes(v)
				)
			)
		case 'food.preferencesSelection':
		case 'food.allergenSelection':
			return strings(value)
		case 'food.foodLanguage':
			return value === 'default' || value === 'de' || value === 'en'
		default:
			return false
	}
}
export function parseSyncResponse(input: unknown): SyncResponse {
	try {
		if (
			!object(input) ||
			!Array.isArray(input.records) ||
			input.records.length > 512 ||
			!Array.isArray(input.conflicts)
		)
			throw new Error()
		const records: SyncRecord[] = input.records.map((row) => {
			if (
				!object(row) ||
				!['calendar', 'preference', 'bookmark', 'dashboard'].includes(
					String(row.kind)
				) ||
				typeof row.entityId !== 'string' ||
				!/^[a-zA-Z0-9._:-]{1,128}$/.test(row.entityId) ||
				!Number.isSafeInteger(row.revision) ||
				Number(row.revision) < 1 ||
				typeof row.deleted !== 'boolean' ||
				typeof row.payloadJson !== 'string'
			)
				throw new Error()
			const payload = JSON.parse(row.payloadJson)
			if (row.deleted) {
				if (payload !== null) throw new Error()
			} else if (row.kind === 'calendar') {
				if (
					!object(payload) ||
					typeof payload.raw !== 'string' ||
					typeof payload.defaultTimeZone !== 'string' ||
					typeof payload.name !== 'string' ||
					payload.name.length > 256 ||
					!['file', 'link', 'demo'].includes(String(payload.sourceType)) ||
					typeof payload.updatedAt !== 'string' ||
					!Number.isFinite(Date.parse(payload.updatedAt))
				)
					throw new Error()
				parseCalendar(payload.raw, payload.defaultTimeZone)
				if (payload.sourceType === 'link') {
					if (typeof payload.privateLink !== 'string') throw new Error()
					normalizeCalendarUrl(payload.privateLink)
				}
			} else if (row.kind === 'preference') {
				if (!validSyncedPreference(row.entityId, payload)) throw new Error()
			} else if (row.kind === 'dashboard') {
				if (
					!object(payload) ||
					!strings(payload.shown, 32) ||
					!strings(payload.unavailable, 32)
				)
					throw new Error()
			} else if (!object(payload) || typeof payload.key !== 'string')
				throw new Error()
			return {
				kind: row.kind as SyncKind,
				entityId: row.entityId,
				revision: Number(row.revision),
				deleted: row.deleted,
				payload
			}
		})
		const conflicts = input.conflicts.map((c) => {
			if (
				!object(c) ||
				typeof c.kind !== 'string' ||
				typeof c.entityId !== 'string' ||
				!Number.isSafeInteger(c.revision)
			)
				throw new Error()
			return {
				kind: c.kind,
				entityId: c.entityId,
				revision: Number(c.revision)
			}
		})
		return { records, conflicts }
	} catch {
		throw new Error('InvalidSyncSnapshot')
	}
}
