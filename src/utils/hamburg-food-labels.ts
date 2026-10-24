/** Source-declared warning codes; missing allergen information remains unknown. */
export function mealWarningCodes(meal: {
	allergens?: readonly string[] | null
	additives?: readonly string[] | null
}): string[] {
	return [...new Set([...(meal.allergens ?? []), ...(meal.additives ?? [])])]
}
