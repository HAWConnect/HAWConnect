import { expect, test } from 'bun:test'
import type { CalendarSnapshot } from '@/types/imported-calendar'
import { createCalendarAutoRefresh } from '../calendar-auto-refresh'

const calendar: CalendarSnapshot = {
	id: 'one',
	name: 'Personal',
	sourceType: 'link',
	raw: 'old',
	eventCount: 1,
	defaultTimeZone: 'Europe/Berlin',
	updatedAt: '2026-10-01T00:00:00Z'
}
function setup() {
	let calendars = [
		calendar,
		{ ...calendar, id: 'file', sourceType: 'file' as const }
	]
	let scope: string | null = 'guest:1'
	let attempts = 0
	let now = 1000000
	let download = async () => ({
		raw: 'new',
		eventCount: 0,
		defaultTimeZone: 'Europe/Berlin'
	})
	const refresh = createCalendarAutoRefresh({
		scope: () => scope,
		calendars: () => calendars,
		loadLink: async () => 'private',
		download: async () => {
			attempts++
			return download()
		},
		save: (c) => {
			calendars = calendars.map((old) => (old.id === c.id ? c : old))
		},
		now: () => now
	})
	return {
		refresh,
		get calendars() {
			return calendars
		},
		get attempts() {
			return attempts
		},
		set download(value: typeof download) {
			download = value
		},
		set scope(value: string | null) {
			scope = value
		},
		advance() {
			now += 300000
		},
		replace() {
			calendars = [{ ...calendar, raw: 'edited' }]
		},
		clone() {
			calendars = calendars.map((c) => ({ ...c }))
		},
		add() {
			calendars = [...calendars, { ...calendar, id: 'cloud' }]
		},
		remove() {
			calendars = []
		}
	}
}
test('refreshes only links, applies cancellations and throttles repeated foreground checks', async () => {
	const s = setup()
	await s.refresh()
	expect(s.calendars[0].raw).toBe('new')
	expect(s.calendars[0].eventCount).toBe(0)
	expect(s.calendars[1].raw).toBe('old')
	await s.refresh()
	expect(s.attempts).toBe(1)
	s.advance()
	await s.refresh()
	expect(s.attempts).toBe(2)
})
test('retains calendars and timestamps on failure', async () => {
	const s = setup()
	s.download = async () => {
		throw Error('offline')
	}
	await s.refresh()
	expect(s.calendars[0]).toBe(calendar)
})
test('does not overwrite edits, removal or a different profile after awaiting the network', async () => {
	for (const action of ['replace', 'remove', 'scope'] as const) {
		const s = setup()
		s.download = async () => {
			if (action === 'scope') s.scope = 'account.other:2'
			else s[action]()
			return { raw: 'new', eventCount: 0, defaultTimeZone: 'Europe/Berlin' }
		}
		await s.refresh()
		expect(s.calendars.some((c) => c.raw === 'new')).toBe(false)
	}
})
test('coalesces overlapping requests and skips unready profiles', async () => {
	const s = setup()
	let release: () => void = () => {}
	s.download = async () => {
		await new Promise<void>((r) => {
			release = r
		})
		return { raw: 'new', eventCount: 0, defaultTimeZone: 'Europe/Berlin' }
	}
	const pending = s.refresh()
	await new Promise((r) => setTimeout(r, 0))
	await s.refresh()
	expect(s.attempts).toBe(1)
	release()
	await pending
	s.scope = null
	s.advance()
	await s.refresh()
	expect(s.attempts).toBe(1)
})

test('accepts unchanged snapshots reconstructed by account sync', async () => {
	const s = setup()
	s.download = async () => {
		s.clone()
		return { raw: 'new', eventCount: 0, defaultTimeZone: 'Europe/Berlin' }
	}
	await s.refresh()
	expect(s.calendars[0].raw).toBe('new')
})
test('refreshes calendars arriving after initial profile hydration', async () => {
	const s = setup()
	s.remove()
	await s.refresh()
	expect(s.attempts).toBe(0)
	s.add()
	await s.refresh()
	expect(s.attempts).toBe(1)
	expect(s.calendars[0].raw).toBe('new')
})
