import { describe, expect, test } from 'bun:test'
import { campusLifeFeed } from '../campus-life-feed'

describe('campus life event publication', () => {
	test('shows dashboard events and excludes official scraped events', () => {
		const club = { id: 'club:1', origin: 'CLUB', title: 'Club event' }
		expect(
			campusLifeFeed({
				managedAvailable: true,
				events: [{ id: 'haw:1', origin: 'HAW', title: 'Official event' }, club]
			})
		).toEqual({ available: true, events: [club] })
	})
	test('distinguishes an empty managed feed from a failed database read', () => {
		expect(campusLifeFeed({ managedAvailable: true, events: [] })).toEqual({
			available: true,
			events: []
		})
		expect(
			campusLifeFeed({ managedAvailable: false, events: [{ origin: 'HAW' }] })
		).toEqual({ available: false, events: [] })
	})
})
