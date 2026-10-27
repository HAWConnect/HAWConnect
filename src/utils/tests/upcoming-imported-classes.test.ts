import { expect, test } from 'bun:test'
import type { CalendarSnapshot } from '@/types/imported-calendar'
import { upcomingImportedClasses } from '../upcoming-imported-classes'

const snapshot = (events: string, id = 'calendar'): CalendarSnapshot => ({
	id,
	name: 'My timetable',
	sourceType: 'file',
	updatedAt: '',
	eventCount: 1,
	defaultTimeZone: 'Europe/Berlin',
	raw: `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}\r\nEND:VCALENDAR`
})
const event = (uid: string, start: string, end: string, extra = '') =>
	`BEGIN:VEVENT\r\nUID:${uid}\r\nSUMMARY:${uid}\r\nDTSTART:${start}\r\nDTEND:${end}\r\n${extra}END:VEVENT`
const now = new Date('2026-10-27T10:00:00Z')
test('selects ongoing and future classes across calendars in chronological order', () => {
	const a = snapshot(
		event('past', '20261027T080000Z', '20261027T090000Z') +
			'\r\n' +
			event('tomorrow', '20261028T100000Z', '20261028T110000Z')
	)
	const b = snapshot(
		event('ongoing', '20261027T093000Z', '20261027T103000Z') +
			'\r\n' +
			event('next', '20261027T110000Z', '20261027T120000Z'),
		'other'
	)
	expect(upcomingImportedClasses([a, b], now).events.map((e) => e.uid)).toEqual(
		['ongoing', 'next']
	)
	expect(upcomingImportedClasses([a], now).events[0].uid).toBe('tomorrow')
})
test('excludes cancelled and all-day entries; treats a class ending now as finished', () => {
	const c = snapshot(
		event(
			'cancelled',
			'20261028T080000Z',
			'20261028T090000Z',
			'STATUS:CANCELLED\r\n'
		) +
			'\r\n' +
			event('ended', '20261027T090000Z', '20261027T100000Z') +
			'\r\nBEGIN:VEVENT\r\nUID:holiday\r\nDTSTART;VALUE=DATE:20261028\r\nDTEND;VALUE=DATE:20261029\r\nSUMMARY:Holiday\r\nEND:VEVENT'
	)
	expect(upcomingImportedClasses([c], now).events).toEqual([])
})
test('expands weekly recurring classes and skips removed calendars', () => {
	const c = snapshot(
		event(
			'weekly',
			'20261020T110000Z',
			'20261020T120000Z',
			'RRULE:FREQ=WEEKLY;COUNT=3\r\n'
		)
	)
	expect(upcomingImportedClasses([c], now).events).toHaveLength(2)
	expect(upcomingImportedClasses([], now).events).toEqual([])
})
test('one invalid calendar does not hide valid upcoming classes', () => {
	const bad = snapshot('invalid')
	bad.raw = 'invalid'
	const result = upcomingImportedClasses(
		[bad, snapshot(event('valid', '20261028T080000Z', '20261028T090000Z'))],
		now
	)
	expect(result.events[0].uid).toBe('valid')
	expect(result.unavailableCalendars).toBe(1)
})
