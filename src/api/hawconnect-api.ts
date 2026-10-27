import type { FeatureCollection } from 'geojson'
import { Platform } from 'react-native'
import type {
	AppAnnouncementsQuery,
	CreateRoomReportMutation,
	FoodPlanQuery,
	HawClubsQuery,
	RoomReportInput,
	TypedDocumentString
} from '@/__generated__/gql/graphql'
import { appUserAgent } from '@/data/app-version'
import type { SpoWeights } from '@/types/asset-api'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	type CampusLifePublicOrganizerKind,
	type PublicEventResponse,
	type PublicOrganizerResponse
} from '@/types/campus-life'
import { guardedFetch } from '@/utils/integration-utils'
import { loadCompatibleClubs } from './clubs-compatibility'
import {
	ACADEMIC_CALENDAR_QUERY,
	ANNOUNCEMENT_QUERY,
	CAMPUS_LIFE_QUERY,
	CREATE_ROOM_REPORT,
	FOOD_QUERY,
	HAW_CLUBS_LEGACY_QUERY,
	HAW_CLUBS_QUERY,
	HAW_EVENTS_QUERY
} from './gql-documents'

const GRAPHQL_ENDPOINT: string =
	process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT ??
	'http://localhost:4000/graphql'
const USER_AGENT = appUserAgent

/**
 * HAWConnect API client
 */
class HAWConnectAPIClient {
	/**
	 * Performs a request against the configured backend
	 * @param {string} url The URL to perform the request against
	 * @returns {Promise<any>} A promise that resolves with the response data
	 * @throws {Error} If the API returns an error
	 */
	async performRequest(url: string): Promise<unknown> {
		const headers: Record<string, string> = {}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const resp = await guardedFetch(`${url}`, {
			headers
		})

		if (resp.status === 200) {
			return (await resp.json()) as unknown
		}
		throw new Error(`API returned an error: ${await resp.text()}`)
	}

	/**
	 * Executes a GraphQL query against an endpoint
	 * @param query     The query to execute
	 * @param variables The variables to pass to the query
	 * @returns       The query result as a promise
	 */
	async executeGql<TResult, TVariables>(
		query: TypedDocumentString<TResult, TVariables>,
		_forceProd = false,
		...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
	): Promise<TResult> {
		const resp = await guardedFetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/graphql-response+json',
				'User-Agent': USER_AGENT
			},
			body: JSON.stringify({
				query,
				variables
			})
		})

		const json = (await resp.json()) as { data?: TResult; errors?: unknown }

		if (resp.ok && json.errors == null) {
			return json.data as TResult
		}
		const errorMessage =
			json.errors != null ? JSON.stringify(json.errors) : resp.statusText
		throw new Error(`GraphQL error: ${errorMessage}`)
	}

	/**
	 * Get the announcement ndata from the GraphQL API
	 * @returns {Promise<AppAnnouncementsQuery>} A promise that resolves with the announcement data
	 */
	async getAnnouncements(): Promise<AppAnnouncementsQuery> {
		return this.executeGql(ANNOUNCEMENT_QUERY)
	}

	async getHawEvents(language = 'de') {
		return (await this.executeGql(HAW_EVENTS_QUERY, false, { language }))
			.hawEvents
	}

	async getAcademicCalendar() {
		return (await this.executeGql(ACADEMIC_CALENDAR_QUERY)).academicCalendar
	}

	async getFoodStatus(locations: string[]): Promise<{
		updatedAt: string | null
		stale: boolean
		available: boolean
		translationFallback: boolean
	}> {
		const response = await guardedFetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query:
					'query FoodStatus($locations: [LocationInput!]!) { food(locations: $locations) { updatedAt stale available translationFallback } }',
				variables: { locations }
			})
		})
		if (!response.ok) throw new Error('Food source unavailable')
		const json = (await response.json()) as {
			data?: {
				food: {
					updatedAt: string | null
					stale: boolean
					available: boolean
					translationFallback: boolean
				}
			}
		}
		if (!json.data?.food) throw new Error('Food source unavailable')
		return json.data.food
	}

	async getFoodPlan(
		locations: string[],
		language = 'de'
	): Promise<FoodPlanQuery> {
		const status = await this.getFoodStatus(locations)
		if (!status.available) throw new Error('foodUnavailable')
		return await this.executeGql(FOOD_QUERY, false, { locations, language })
	}

	/**
	 * Gets the campus life events
	 * @returns {Promise<any>} A promise that resolves with the campus life events data
	 */

	private async getManagedCampusLife() {
		const feed = (await this.executeGql(CAMPUS_LIFE_QUERY)).campusLifeEvents
		if (!feed.available) throw new Error('Campus life events unavailable')
		return {
			events: feed.events.map(
				(event): PublicEventResponse => ({
					id: event.id,
					organizer_id: event.organizerId,
					organizer_name: event.organizerName,
					organizer_kind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
					title_de: event.title.de ?? '',
					title_en: event.title.en ?? '',
					description_de: event.description.de,
					description_en: event.description.en,
					start_date_time: event.startDateTime,
					end_date_time: event.endDateTime ?? event.startDateTime,
					location: event.location,
					event_url: event.eventUrl
				})
			),
			organizers: feed.organizers.map(
				(organizer): PublicOrganizerResponse => ({
					id: organizer.id,
					name: organizer.name,
					description_de: organizer.description.de,
					description_en: organizer.description.en,
					location: organizer.location,
					website_url: organizer.website,
					instagram_url: organizer.instagram,
					linkedin_url: organizer.linkedin,
					non_profit: organizer.nonProfit,
					registration_number: organizer.registrationNumber,
					organizer_kind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
				})
			)
		}
	}
	async getPublicCampusLifeEvents(options?: {
		organizerId?: number
		upcomingOnly?: boolean
		limit?: number
		offset?: number
		organizerKind?: CampusLifePublicOrganizerKind | string | null
	}): Promise<PublicEventResponse[]> {
		if (
			options?.organizerKind &&
			options.organizerKind !==
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
			return []
		let events = (await this.getManagedCampusLife()).events
		if (options?.organizerId != null)
			events = events.filter(
				(event) => event.organizer_id === options.organizerId
			)
		if (options?.upcomingOnly !== false)
			events = events.filter(
				(event) => Date.parse(event.end_date_time) >= Date.now()
			)
		events.sort(
			(a, b) => Date.parse(a.start_date_time) - Date.parse(b.start_date_time)
		)
		const offset = options?.offset ?? 0
		return events.slice(
			offset,
			options?.limit == null ? undefined : offset + options.limit
		)
	}
	async getPublicCampusLifeEvent(id: number): Promise<PublicEventResponse> {
		const event = (await this.getManagedCampusLife()).events.find(
			(event) => event.id === id
		)
		if (!event) throw Error('Event not found')
		return event
	}
	async getPublicOrganizers(options?: {
		organizerKind?: CampusLifePublicOrganizerKind | string | null
	}): Promise<PublicOrganizerResponse[]> {
		if (
			options?.organizerKind &&
			options.organizerKind !==
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
			return []
		return (await this.getManagedCampusLife()).organizers
	}
	async getPublicOrganizer(id: number): Promise<PublicOrganizerResponse> {
		const organizer = (await this.getManagedCampusLife()).organizers.find(
			(organizer) => organizer.id === id
		)
		if (!organizer) throw Error('Organizer not found')
		return organizer
	}

	async getHawClubs(language: string): Promise<HawClubsQuery['hawClubs']> {
		return loadCompatibleClubs(
			async () =>
				(await this.executeGql(HAW_CLUBS_QUERY, false, { language })).hawClubs,
			async () =>
				(await this.executeGql(HAW_CLUBS_LEGACY_QUERY, false, { language }))
					.hawClubs
		)
	}

	/**
	 * Gets the map overlay
	 * @returns {Promise<any>} A promise that resolves with the map overlay data
	 */
	async getMapOverlay(): Promise<FeatureCollection> {
		throw new Error('Integration unavailable')
	}

	/**
	 * Gets the course spo data (grade weights)
	 * @returns {Promise<SpoWeights>} A promise that resolves with the course spo data
	 */
	async getSpoWeights(): Promise<SpoWeights> {
		throw new Error('Integration unavailable')
	}

	/**
	 * Create a new room report
	 * @returns {Promise<CreateRoomReportMutation>} A promise that resolves with the created report id
	 */
	async createRoomReport(
		input: RoomReportInput
	): Promise<CreateRoomReportMutation> {
		return await this.executeGql(CREATE_ROOM_REPORT, false, { input })
	}
}

export default new HAWConnectAPIClient()
