import HAWConnectAPI from '@/api/hawconnect-api'
import type {
	CampusLifeEvent,
	CampusLifeOrganizer,
	CampusLifePublicOrganizerKind,
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'
import { parseApiOrganizerKind } from '@/utils/campus-life-utils'

const FALLBACK_ORGANIZER_NAME = 'Campus Life'

function mapOrganizerResponse(
	organizer: PublicOrganizerResponse | null | undefined,
	defaults: { id: number; name?: string }
): CampusLifeOrganizer {
	const organizerKind = parseApiOrganizerKind(organizer?.organizer_kind)

	return {
		id: organizer?.id ?? defaults.id,
		...(organizerKind != null ? { organizerKind } : {}),
		name: organizer?.name ?? defaults.name ?? FALLBACK_ORGANIZER_NAME,
		descriptions: {
			de: organizer?.description_de ?? null,
			en: organizer?.description_en ?? null
		},
		location: organizer?.location ?? null,
		instagram: organizer?.instagram_url ?? null,
		website: organizer?.website_url ?? null,
		linkedin: organizer?.linkedin_url ?? null,
		nonProfit: organizer?.non_profit ?? null,
		registrationNumber: organizer?.registration_number ?? null
	}
}

function mapEventResponse(
	event: PublicEventResponse,
	organizer: CampusLifeOrganizer
): CampusLifeEvent {
	const organizerKind =
		parseApiOrganizerKind(event.organizer_kind) ?? organizer.organizerKind

	return {
		id: event.id.toString(),
		numericId: event.id,
		...(organizerKind != null ? { organizerKind } : {}),
		titles: {
			de: event.title_de,
			en: event.title_en
		},
		descriptions: {
			de: event.description_de ?? null,
			en: event.description_en ?? null
		},
		startDateTime: event.start_date_time,
		endDateTime: event.end_date_time,
		location: event.location ?? null,
		eventUrl: event.event_url ?? null,
		host: organizer
	}
}

export interface LoadCampusLifeEventsOptions {
	organizerId?: number
	upcomingOnly?: boolean
	limit?: number
	offset?: number
	/** Defaults to student associations; pass `null` to omit the filter. */
	organizerKind?: CampusLifePublicOrganizerKind | string | null
}

/**
 * Fetches and parses the campus life events
 */
export async function loadCampusLifeEvents(
	options: LoadCampusLifeEventsOptions = {}
): Promise<CampusLifeEvent[]> {
	const {
		organizerId,
		upcomingOnly = true,
		limit,
		offset,
		organizerKind
	} = options

	const events = await HAWConnectAPI.getPublicCampusLifeEvents({
		organizerId,
		upcomingOnly,
		limit,
		offset,
		...(organizerKind !== undefined ? { organizerKind } : {})
	})

	const now = Date.now()

	return events
		.map((event) => {
			const organizer = mapOrganizerResponse(null, {
				id: event.organizer_id,
				name: event.organizer_name ?? undefined
			})
			return mapEventResponse(event, organizer)
		})
		.filter((event) => {
			const endTime = Date.parse(event.endDateTime)
			return Number.isNaN(endTime) || endTime > now
		})
		.filter(
			(event) => event.titles.de.trim() !== '' || event.titles.en.trim() !== ''
		)
		.sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime))
}

export async function loadCampusLifeEvent(
	id: number
): Promise<CampusLifeEvent> {
	const event = await HAWConnectAPI.getPublicCampusLifeEvent(id)
	const organizer = mapOrganizerResponse(null, {
		id: event.organizer_id,
		name: event.organizer_name ?? undefined
	})
	return mapEventResponse(event, organizer)
}

export async function loadCampusLifeOrganizer(
	id: number
): Promise<CampusLifeOrganizer> {
	const organizer = await HAWConnectAPI.getPublicOrganizer(id)
	return mapOrganizerResponse(organizer, { id })
}

export async function loadCampusLifeOrganizers(
	organizerKind?: CampusLifePublicOrganizerKind | string | null
): Promise<CampusLifeOrganizer[]> {
	const organizers = await HAWConnectAPI.getPublicOrganizers({ organizerKind })
	return organizers.map((organizer) =>
		mapOrganizerResponse(organizer, { id: organizer.id })
	)
}

export const QUERY_KEYS = {
	CAMPUS_LIFE_EVENTS: 'hawCampusLifeEventsV1',
	CAMPUS_LIFE_ORGANIZER: 'hawCampusLifeOrganizerV2',
	CAMPUS_LIFE_ORGANIZERS: 'hawCampusLifeOrganizersV2'
} as const
