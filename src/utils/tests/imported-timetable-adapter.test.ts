import { expect, it } from 'bun:test'
import { toFriendlyTimetable } from '../imported-timetable-adapter'

it('preserves imported event identity without inventing lecturers or credits', () => {
	const [row] = toFriendlyTimetable([
		{
			key: 'a:uid:date',
			calendarId: 'a',
			uid: 'uid',
			title: 'Math',
			description: 'Notes',
			location: 'BT 7',
			start: '2026-10-19T09:00:00Z',
			end: '2026-10-19T10:00:00Z',
			allDay: false
		}
	])
	expect(row.name).toBe('Math')
	expect(row.rooms).toEqual(['BT 7'])
	expect(row.lecturer).toBeNull()
	expect(row.contents).toBe('Notes')
	expect(row.importedKey).toBe('a:uid:date')
})
it('keeps all-day exclusive dates separate from timed lecture data', () => {
	expect(
		toFriendlyTimetable([
			{
				key: 'a:day',
				calendarId: 'a',
				uid: 'day',
				title: 'Holiday',
				description: '',
				location: '',
				start: '2026-10-24',
				end: '2026-10-27',
				allDay: true
			}
		])
	).toEqual([])
})
