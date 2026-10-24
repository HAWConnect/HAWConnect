import { expect, test } from 'bun:test'
import {
	getFoodPriceKind,
	getMealRouteId,
	getMealSourceId
} from '../food-display'

test('defaults guest and signed-in student views to student prices, retaining staff prices', () => {
	for (const kind of ['guest', 'student', undefined, null])
		expect(getFoodPriceKind(kind)).toBe('student')
	expect(getFoodPriceKind('employee')).toBe('employee')
})
test('uses clean meal links without changing persisted source identity or old links', () => {
	const id = 'hamburg:170:2026-10-26:572'
	expect(getMealRouteId(id)).toBe('2026-10-26-170-572')
	expect(getMealSourceId(getMealRouteId(id))).toBe(id)
	expect(getMealSourceId(id)).toBe(id)
	expect(getMealRouteId('upstream-id')).toBe('upstream-id')
	expect(getMealSourceId('upstream-id')).toBe('upstream-id')
})
