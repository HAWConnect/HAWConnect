import { expect, it } from 'bun:test'
import { mealWarningCodes } from '../hamburg-food-labels'

it('matches declared additives as well as allergens without inventing labels', () => {
	expect(
		mealWarningCodes({ allergens: ['Mi', 'Sl'], additives: ['2', 'Mi'] })
	).toEqual(['Mi', 'Sl', '2'])
	expect(mealWarningCodes({ allergens: null, additives: ['9'] })).toEqual(['9'])
	expect(mealWarningCodes({ allergens: null, additives: null })).toEqual([])
})
