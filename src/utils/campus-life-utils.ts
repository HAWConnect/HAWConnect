import type { RelativePathString } from 'expo-router'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT,
	type CampusLifeEvent,
	type CampusLifeOrganizer,
	type CampusLifePublicOrganizerKind
} from '@/types/campus-life'

export const CAMPUS_LIFE_EVENT_DETAIL_PATH = '/events/cl/[id]' as const
export const CAMPUS_LIFE_ORGANISER_PATH = '/events/organizer/[id]' as const
const webAppOrigin = () =>
	typeof window !== 'undefined' &&
	/^https?:\/\//.test(window.location?.origin ?? '')
		? window.location.origin
		: 'hawconnect:/'

export type CampusLifeEventListScreen = 'clEvents' | 'hawEvents'

export function isUniversityDepartmentOrganizerKind(
	kind: CampusLifePublicOrganizerKind
): boolean {
	return kind === CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
}

export function parseApiOrganizerKind(
	value: string | null | undefined
): CampusLifePublicOrganizerKind | undefined {
	if (value === CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT) {
		return CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
	}

	if (value === CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION) {
		return CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
	}

	return undefined
}

export function parseCampusLifeOrganizerKindParam(
	value: string | string[] | undefined
): CampusLifePublicOrganizerKind {
	const raw = Array.isArray(value) ? value[0] : value

	return (
		parseApiOrganizerKind(raw) ??
		CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
	)
}

export function resolveEventOrganizerKind(
	event: Pick<CampusLifeEvent, 'organizerKind'> | null | undefined,
	orgParam: string | string[] | undefined,
	organizer?: Pick<CampusLifeOrganizer, 'organizerKind'> | null
): CampusLifePublicOrganizerKind {
	if (event?.organizerKind != null) {
		return event.organizerKind
	}

	if (organizer?.organizerKind != null) {
		return organizer.organizerKind
	}

	return parseCampusLifeOrganizerKindParam(orgParam)
}

export function resolveCampusLifeOrganizerKind(
	fallback: CampusLifePublicOrganizerKind,
	orgParam: string | string[] | undefined
): CampusLifePublicOrganizerKind {
	if (orgParam == null || (Array.isArray(orgParam) && orgParam.length === 0)) {
		return fallback
	}

	return parseCampusLifeOrganizerKindParam(orgParam)
}

export function campusLifeEventListScreen(
	organizerKind: CampusLifePublicOrganizerKind
): CampusLifeEventListScreen {
	return isUniversityDepartmentOrganizerKind(organizerKind)
		? 'hawEvents'
		: 'clEvents'
}

export function campusLifeEventDetailParams(
	eventId: string,
	organizerKind: CampusLifePublicOrganizerKind
): { id: string; org?: CampusLifePublicOrganizerKind } {
	return {
		id: eventId,
		...(isUniversityDepartmentOrganizerKind(organizerKind)
			? { org: organizerKind }
			: {})
	}
}

export function campusLifeEventDetailHref(
	eventId: string,
	organizerKind: CampusLifePublicOrganizerKind
): RelativePathString {
	const { org } = campusLifeEventDetailParams(eventId, organizerKind)

	if (org == null) {
		return `/events/cl/${eventId}` as RelativePathString
	}

	return `/events/cl/${eventId}?org=${encodeURIComponent(org)}` as RelativePathString
}

export function campusLifeEventWebShareUrl(
	eventId: string,
	organizerKind: CampusLifePublicOrganizerKind
): string {
	return `${webAppOrigin()}${campusLifeEventDetailHref(eventId, organizerKind)}`
}

export function campusLifeOrganiserParams(
	organizerId: number | string,
	organizerKind: CampusLifePublicOrganizerKind
): { id: string; org?: CampusLifePublicOrganizerKind } {
	return {
		id: organizerId.toString(),
		...(isUniversityDepartmentOrganizerKind(organizerKind)
			? { org: organizerKind }
			: {})
	}
}
