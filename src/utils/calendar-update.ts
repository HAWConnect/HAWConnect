import type {
	CalendarPreview,
	CalendarSnapshot
} from '@/types/imported-calendar'

/** Last Update records a content change, rather than a successful unchanged fetch. */
export function calendarUpdate(
	calendar: CalendarSnapshot,
	preview: CalendarPreview,
	now: string
): CalendarSnapshot {
	const unchanged =
		calendar.raw.replaceAll('\r\n', '\n') ===
			preview.raw.replaceAll('\r\n', '\n') &&
		calendar.defaultTimeZone === preview.defaultTimeZone &&
		calendar.eventCount === preview.eventCount
	return {
		...calendar,
		...preview,
		updatedAt: unchanged ? calendar.updatedAt : now
	}
}
