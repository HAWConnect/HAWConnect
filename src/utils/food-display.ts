/** Authentication guest mode does not determine a student's cafeteria tariff. */
export function getFoodPriceKind(
	userKind?: string | null
): 'student' | 'employee' {
	return userKind === 'employee' ? 'employee' : 'student'
}

export function getMealRouteId(id: string): string {
	const match = /^hamburg:(\d+):(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(id)
	return match ? `${match[2]}-${match[1]}-${match[3]}` : id
}

export function getMealSourceId(id: string): string {
	const match = /^(\d{4}-\d{2}-\d{2})-(\d+)-(\d+)$/.exec(id)
	return match ? `hamburg:${match[2]}:${match[1]}:${match[3]}` : id
}
