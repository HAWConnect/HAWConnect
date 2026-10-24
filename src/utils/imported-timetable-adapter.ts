import type { ImportedOccurrence } from '@/types/imported-calendar'
import type { FriendlyTimetableEntry } from '@/types/utils'
export interface ImportedTimetableEntry extends FriendlyTimetableEntry {
	importedKey: string
}
export function toFriendlyTimetable(
	events: ImportedOccurrence[]
): ImportedTimetableEntry[] {
	return events
		.filter((e) => !e.allDay)
		.map((e) => ({
			importedKey: e.key,
			date: new Date(e.start),
			startDate: new Date(e.start),
			endDate: new Date(e.end),
			name: e.title,
			shortName: e.title,
			rooms: e.location ? [e.location] : [],
			lecturer: null,
			lecturerIds: [],
			course: '',
			studyGroup: '',
			sws: '',
			ects: '',
			goal: null,
			contents: e.description,
			literature: null
		}))
}
