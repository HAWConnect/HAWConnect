/** Dashboard-managed events are published separately from scraped HAW events. */
export function campusLifeFeed<T extends { origin: string }>(data: {
	events: T[]
	managedAvailable: boolean
}) {
	return {
		available: data.managedAvailable,
		events: data.events.filter((event) => event.origin === 'CLUB')
	}
}
