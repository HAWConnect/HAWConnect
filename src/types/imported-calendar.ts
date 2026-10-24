export interface CalendarPreview {
	raw: string
	eventCount: number
	defaultTimeZone: string
}
export interface CalendarSnapshot extends CalendarPreview {
	id: string
	name: string
	sourceType: 'file' | 'link' | 'demo'
	updatedAt: string
}
export interface ImportedOccurrence {
	key: string
	calendarId: string
	uid: string
	title: string
	description: string
	location: string
	start: string
	end: string
	allDay: boolean
}
