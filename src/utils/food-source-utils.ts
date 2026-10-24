import type { Food } from '@/types/hawconnect-api'
export function getPublishedFoodDays(days: Food[], available: boolean): Food[] {
	if (!available) throw new Error('foodUnavailable')
	return [...days].sort((a, b) =>
		String(a.timestamp).localeCompare(String(b.timestamp))
	)
}

/** Keep source dates intact; retain historical cache dates when no upcoming data exists. */
export function getUpcomingFoodDays(days: Food[], now = new Date()): Food[] {
	const today = new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now)
	const sorted = getPublishedFoodDays(days, true)
	const hasMeals = sorted.some((day) => day.meals.length > 0)
	const upcoming = sorted
		.filter(
			(day) =>
				!hasMeals ||
				day.meals.length > 0 ||
				String(day.timestamp).slice(0, 10) === today
		)
		.filter(
			(day) =>
				(typeof day.timestamp === 'string'
					? day.timestamp.slice(0, 10)
					: new Intl.DateTimeFormat('sv-SE', {
							timeZone: 'Europe/Berlin'
						}).format(day.timestamp)) >= today
		)
	return upcoming.length ? upcoming.slice(0, 5) : sorted.slice(-5)
}
