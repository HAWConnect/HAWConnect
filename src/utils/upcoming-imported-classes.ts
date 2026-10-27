import type {
	CalendarSnapshot,
	ImportedOccurrence
} from '@/types/imported-calendar'
import { expandCalendar } from './ical-import'

/** Use the importer’s recurrence/cancellation rules, without fetching private links. */
export function upcomingImportedClasses(
	calendars: CalendarSnapshot[],
	now: Date
) {
	const events: ImportedOccurrence[] = []
	let unavailableCalendars = 0
	const from = new Date(now.getTime() - 7 * 86400000)
	const until = new Date(now.getTime() + 180 * 86400000)
	for (const calendar of calendars) {
		try {
			events.push(
				...expandCalendar(calendar, from, until).filter(
					(event) => !event.allDay && Date.parse(event.end) > now.getTime()
				)
			)
		} catch {
			unavailableCalendars++
		}
	}
	events.sort(
		(a, b) =>
			Date.parse(a.start) - Date.parse(b.start) || a.key.localeCompare(b.key)
	)
	return { events: events.slice(0, 2), unavailableCalendars }
}
