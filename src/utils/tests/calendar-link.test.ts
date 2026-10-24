import { expect, it } from 'bun:test'
import {
	fetchCalendarText,
	normalizeCalendarUrl
} from '../../api/calendar-import-api'

it('normalizes private calendar links without permitting credentials', () => {
	expect(
		normalizeCalendarUrl('webcal://example.org/private?token=secret')
	).toBe('https://example.org/private?token=secret')
	for (const u of [
		'http://example.org/feed',
		'https://u:p@example.org/feed',
		'file:///calendar'
	])
		expect(() => normalizeCalendarUrl(u)).toThrow('invalidCalendarLink')
})
it('redacts transport failures', async () => {
	await expect(
		fetchCalendarText(
			'https://example.org/?token=secret',
			undefined,
			async () => {
				throw new Error('token=secret')
			}
		)
	).rejects.toThrow('calendarFetchFailed')
})
it('rejects oversized downloads', async () => {
	await expect(
		fetchCalendarText(
			'https://example.org',
			undefined,
			async () => new Response('x'.repeat(2_000_001))
		)
	).rejects.toThrow('calendarTooLarge')
})

it('uses the restricted backend endpoint for private myHAW links', async () => {
	const url =
		'https://myhaw.haw-hamburg.de/qisserver/pages/cm/exa/timetable/individualTimetableCalendarExport.faces?user=test&hash=secret&termgroup='
	await fetchCalendarText(url, undefined, async (target, init) => {
		expect(new URL(target).pathname).toBe('/api/calendar/myhaw')
		expect(target).not.toContain('secret')
		expect(init?.method).toBe('POST')
		expect(JSON.parse(String(init?.body)).url).toBe(url)
		expect(init?.cache).toBe('no-store')
		return new Response('BEGIN:VCALENDAR\r\nEND:VCALENDAR')
	})
})
