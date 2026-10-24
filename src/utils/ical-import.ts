import ICAL from 'ical.js'
import type {
	CalendarPreview,
	CalendarSnapshot,
	ImportedOccurrence
} from '@/types/imported-calendar'

const MAX_BYTES = 2_000_000
const MAX_EVENTS = 5_000
const MAX_ITERATIONS = 10_000

function readComponents(raw: string) {
	if (new TextEncoder().encode(raw).length > MAX_BYTES)
		throw new Error('calendarTooLarge')
	let root: InstanceType<typeof ICAL.Component>
	try {
		root = new ICAL.Component(ICAL.parse(raw))
	} catch {
		throw new Error('invalidCalendar')
	}
	if (root.name !== 'vcalendar') throw new Error('invalidCalendar')
	const timezones = root.getAllSubcomponents('vtimezone')
	for (const component of timezones) {
		const id = String(component.getFirstPropertyValue('tzid') ?? '')
		if (id)
			ICAL.TimezoneService.register(
				new ICAL.Timezone({ component, tzid: id }),
				id
			)
	}
	const events = root.getAllSubcomponents('vevent')
	if (events.length > MAX_EVENTS || !events.length)
		throw new Error('invalidCalendar')
	const selected = new Map<string, InstanceType<typeof ICAL.Component>>()
	for (const component of events) {
		const uid = String(component.getFirstPropertyValue('uid') ?? '')
		if (!uid || !component.hasProperty('dtstart'))
			throw new Error('invalidCalendar')
		for (const name of [
			'dtstart',
			'dtend',
			'recurrence-id',
			'exdate',
			'rdate'
		]) {
			for (const prop of component.getAllProperties(name)) {
				const tz = prop.getParameter('tzid')
				if (
					typeof tz === 'string' &&
					!timezones.some((t) => t.getFirstPropertyValue('tzid') === tz)
				) {
					try {
						new Intl.DateTimeFormat('en', { timeZone: tz }).format()
					} catch {
						throw new Error('unsupportedTimezone')
					}
				}
			}
		}
		const key = `${uid}\u0000${component.getFirstPropertyValue('recurrence-id') ?? ''}`
		const previous = selected.get(key)
		const seq = Number(component.getFirstPropertyValue('sequence') ?? 0)
		const oldSeq = Number(previous?.getFirstPropertyValue('sequence') ?? 0)
		const stamp = String(component.getFirstPropertyValue('dtstamp') ?? '')
		const oldStamp = String(previous?.getFirstPropertyValue('dtstamp') ?? '')
		if (!previous || seq > oldSeq || (seq === oldSeq && stamp >= oldStamp))
			selected.set(key, component)
	}
	return [...selected.values()]
}

export function parseCalendar(
	input: string,
	defaultTimeZone = 'Europe/Berlin'
): CalendarPreview {
	try {
		new Intl.DateTimeFormat('en', { timeZone: defaultTimeZone }).format()
	} catch {
		throw new Error('unsupportedTimezone')
	}
	const components = readComponents(input)
	for (const component of components) {
		try {
			const e = new ICAL.Event(component)
			if (!e.startDate || !e.endDate || e.endDate.compare(e.startDate) < 0)
				throw new Error()
		} catch {
			throw new Error('invalidCalendar')
		}
	}
	return { raw: input, eventCount: components.length, defaultTimeZone }
}

function toInstant(time: InstanceType<typeof ICAL.Time>, zone: string): string {
	if (time.isDate) return time.toString().slice(0, 10)
	if (time.zone.tzid === 'UTC') return time.toJSDate().toISOString()
	if (time.zone.component) return time.toJSDate().toISOString()
	const desired = Date.UTC(
		time.year,
		time.month - 1,
		time.day,
		time.hour,
		time.minute,
		time.second
	)
	let candidate = desired
	const formatter = new Intl.DateTimeFormat('en-GB', {
		timeZone: zone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	})
	for (let i = 0; i < 4; i++) {
		const parts = Object.fromEntries(
			formatter.formatToParts(candidate).map((p) => [p.type, p.value])
		)
		const actual = Date.UTC(
			Number(parts.year),
			Number(parts.month) - 1,
			Number(parts.day),
			Number(parts.hour),
			Number(parts.minute),
			Number(parts.second)
		)
		const delta = desired - actual
		candidate += delta
		if (!delta) return new Date(candidate).toISOString()
	}
	throw new Error('unsupportedTimezone')
}

export function expandCalendar(
	snapshot: CalendarSnapshot,
	start: Date,
	end: Date
): ImportedOccurrence[] {
	const components = readComponents(snapshot.raw)
	const events = components.map(
		(c) => new ICAL.Event(c, { exceptions: [], strictExceptions: true })
	)
	const output: ImportedOccurrence[] = []
	let iterations = 0
	for (const master of events.filter((e) => !e.isRecurrenceException())) {
		if (master.component.getFirstPropertyValue('status') === 'CANCELLED')
			continue
		for (const exception of events.filter(
			(e) => e.uid === master.uid && e.isRecurrenceException()
		))
			master.relateException(exception)
		const iterator = master.iterator()
		let next = iterator.next()
		while (next) {
			if (++iterations > MAX_ITERATIONS) throw new Error('recurrenceLimit')
			const details = master.getOccurrenceDetails(next)
			const zone = String(
				details.item.component
					.getFirstProperty('dtstart')
					?.getParameter('tzid') ?? snapshot.defaultTimeZone
			)
			const from = toInstant(details.startDate, zone)
			const to = toInstant(details.endDate, zone)
			// Permit a moved exception near the range boundary; finite input work is still bounded.
			const recurrenceDate = toInstant(
				next,
				String(
					master.component.getFirstProperty('dtstart')?.getParameter('tzid') ??
						snapshot.defaultTimeZone
				)
			)
			if (new Date(recurrenceDate).getTime() > end.getTime() + 366 * 86400000)
				break
			if (
				details.item.component.getFirstPropertyValue('status') !==
					'CANCELLED' &&
				new Date(to).getTime() > start.getTime() &&
				new Date(from).getTime() < end.getTime()
			) {
				output.push({
					key: `${snapshot.id}:${master.uid}:${next.toString()}`,
					calendarId: snapshot.id,
					uid: master.uid,
					title: details.item.summary ?? '',
					description: details.item.description ?? '',
					location: details.item.location ?? '',
					start: from,
					end: to,
					allDay: details.startDate.isDate
				})
			}
			if (!master.isRecurring()) break
			next = iterator.next()
		}
	}
	return output.sort((a, b) => a.start.localeCompare(b.start))
}

export function replaceCalendar(
	calendars: CalendarSnapshot[],
	next: CalendarSnapshot
): CalendarSnapshot[] {
	return [...calendars.filter((c) => c.id !== next.id), next].sort((a, b) =>
		a.id.localeCompare(b.id)
	)
}
