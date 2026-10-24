import { expect, test } from 'bun:test'
import { calendarUpdate } from '../calendar-update'

const calendar = {
	id: 'one',
	name: 'Classes',
	sourceType: 'link' as const,
	raw: 'BEGIN:VCALENDAR\r\nEND:VCALENDAR',
	eventCount: 0,
	defaultTimeZone: 'Europe/Berlin',
	updatedAt: '2026-10-24T01:00:00Z'
}
test('keeps Last Update for unchanged content, including newline differences', () => {
	expect(
		calendarUpdate(
			calendar,
			{ ...calendar, raw: calendar.raw.replaceAll('\r\n', '\n') },
			'2026-10-24T02:00:00Z'
		).updatedAt
	).toBe(calendar.updatedAt)
})
test('changes Last Update when calendar content changes', () => {
	expect(
		calendarUpdate(
			calendar,
			{ ...calendar, raw: 'changed' },
			'2026-10-24T02:00:00Z'
		).updatedAt
	).toBe('2026-10-24T02:00:00Z')
})
