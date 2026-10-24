import { expect, it } from 'bun:test'
import { getPublishedFoodDays, getUpcomingFoodDays } from '../food-source-utils'

it('preserves actual dates including historical menus', () => {
	expect(
		getPublishedFoodDays([{ timestamp: '2026-10-01', meals: [] }], true)
	).toEqual([{ timestamp: '2026-10-01', meals: [] }])
})
it('does not invent empty weekdays when unavailable', () => {
	expect(() => getPublishedFoodDays([], false)).toThrow('foodUnavailable')
	expect(getPublishedFoodDays([], true)).toEqual([])
})

it('shows today and upcoming published menus across week boundaries, with Berlin date handling', () => {
	const days = [
		'2026-10-19',
		'2026-10-23',
		'2026-10-26',
		'2026-10-27',
		'2026-10-28',
		'2026-10-29',
		'2026-10-30'
	].map((timestamp) => ({ timestamp, meals: [] }))
	expect(
		getUpcomingFoodDays(days, new Date('2026-10-22T22:30:00Z')).map(
			(d) => d.timestamp
		)
	).toEqual([
		'2026-10-23',
		'2026-10-26',
		'2026-10-27',
		'2026-10-28',
		'2026-10-29'
	])
	expect(
		getUpcomingFoodDays(days, new Date('2026-10-24T12:00:00Z'))[0].timestamp
	).toBe('2026-10-26')
	expect(
		getUpcomingFoodDays(days, new Date('2026-11-01T12:00:00Z'))
	).toHaveLength(5)
})
