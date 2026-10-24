import type {
	CalendarPreview,
	CalendarSnapshot
} from '@/types/imported-calendar'
import { calendarUpdate } from './calendar-update'

function sameCalendar(a: CalendarSnapshot | undefined, b: CalendarSnapshot) {
	return (
		a !== undefined &&
		a.id === b.id &&
		a.raw === b.raw &&
		a.updatedAt === b.updatedAt &&
		a.name === b.name &&
		a.sourceType === b.sourceType &&
		a.defaultTimeZone === b.defaultTimeZone &&
		a.eventCount === b.eventCount
	)
}

/** Runtime-only cooldowns contain identifiers, never subscription URLs. */
export function createCalendarAutoRefresh(deps: {
	scope: () => string | null
	calendars: () => CalendarSnapshot[]
	loadLink: (id: string) => Promise<string | null>
	download: (
		url: string,
		calendar: CalendarSnapshot
	) => Promise<CalendarPreview>
	save: (calendar: CalendarSnapshot) => void
	now: () => number
}) {
	const attempts = new Map<string, number>()
	const pending = new Set<string>()
	return async () => {
		const scope = deps.scope()
		if (!scope) return
		for (const [key, time] of attempts)
			if (deps.now() - time >= 300000) attempts.delete(key)
		for (const calendar of deps.calendars()) {
			if (deps.scope() !== scope) return
			if (calendar.sourceType !== 'link') continue
			const key = JSON.stringify([scope, calendar.id])
			if (pending.has(key) || attempts.has(key)) continue
			pending.add(key)
			attempts.set(key, deps.now())
			try {
				const url = await deps.loadLink(calendar.id)
				if (!url || deps.scope() !== scope) continue
				const preview = await deps.download(url, calendar)
				if (
					deps.scope() !== scope ||
					!sameCalendar(
						deps.calendars().find((c) => c.id === calendar.id),
						calendar
					)
				) {
					attempts.delete(key)
					continue
				}
				deps.save(
					calendarUpdate(calendar, preview, new Date(deps.now()).toISOString())
				)
			} catch {
				// Keep the previous calendar and last-success timestamp; never log personal data.
			} finally {
				pending.delete(key)
			}
		}
	}
}
