import { describe, expect, it } from 'bun:test'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
} from '@/types/campus-life'
import {
	campusLifeEventListScreen,
	campusLifeEventWebShareUrl,
	campusLifeOrganiserParams,
	parseApiOrganizerKind,
	parseCampusLifeOrganizerKindParam,
	resolveCampusLifeOrganizerKind,
	resolveEventOrganizerKind
} from '@/utils/campus-life-utils'

describe('campus-life-utils', () => {
	it('parseApiOrganizerKind - Should accept known organizer kinds', () => {
		expect(parseApiOrganizerKind('UNIVERSITY_DEPARTMENT')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
		)
		expect(parseApiOrganizerKind('STUDENT_ASSOCIATION')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
	})

	it('parseApiOrganizerKind - Should reject unknown values', () => {
		expect(parseApiOrganizerKind('UNKNOWN')).toBeUndefined()
		expect(parseApiOrganizerKind(null)).toBeUndefined()
	})

	it('parseCampusLifeOrganizerKindParam - Should default to student associations', () => {
		expect(parseCampusLifeOrganizerKindParam(undefined)).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
		expect(parseCampusLifeOrganizerKindParam('invalid')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
	})

	it('resolveEventOrganizerKind - Should prefer API organizer kind', () => {
		expect(
			resolveEventOrganizerKind(
				{
					organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
				},
				undefined
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT)

		expect(
			resolveEventOrganizerKind(
				{
					organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
				},
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION)
	})

	it('resolveEventOrganizerKind - Should fall back to route param', () => {
		expect(resolveEventOrganizerKind(null, 'UNIVERSITY_DEPARTMENT')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
		)
		expect(
			resolveEventOrganizerKind({ organizerKind: undefined }, undefined)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION)
	})

	it('resolveEventOrganizerKind - Should fall back to loaded organizer', () => {
		expect(
			resolveEventOrganizerKind(null, undefined, {
				organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
			})
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT)
	})

	it('resolveCampusLifeOrganizerKind - Should use fallback when param is missing', () => {
		expect(
			resolveCampusLifeOrganizerKind(
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT,
				undefined
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT)
		expect(
			resolveCampusLifeOrganizerKind(
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
				[]
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION)
	})

	it('resolveCampusLifeOrganizerKind - Should parse route param when present', () => {
		expect(
			resolveCampusLifeOrganizerKind(
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
				'UNIVERSITY_DEPARTMENT'
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT)
	})

	it('campusLifeEventListScreen - Should map organizer kind to screen', () => {
		expect(
			campusLifeEventListScreen(
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
			)
		).toBe('hawEvents')
		expect(
			campusLifeEventListScreen(
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
			)
		).toBe('clEvents')
	})

	it('shares safely when native window has no browser location', () => {
		const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: {}
		})
		try {
			expect(
				campusLifeEventWebShareUrl(
					'42',
					CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
				)
			).toBe('hawconnect://events/cl/42')
		} finally {
			if (previous) Object.defineProperty(globalThis, 'window', previous)
			else delete (globalThis as { window?: unknown }).window
		}
	})

	it('campusLifeEventWebShareUrl - Should include org for University events', () => {
		expect(
			campusLifeEventWebShareUrl(
				'42',
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
			)
		).toBe('hawconnect://events/cl/42?org=UNIVERSITY_DEPARTMENT')

		expect(
			campusLifeEventWebShareUrl(
				'42',
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
			)
		).toBe('hawconnect://events/cl/42')
	})

	it('campusLifeOrganiserParams - Should include org for University departments', () => {
		expect(
			campusLifeOrganiserParams(
				7,
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
			)
		).toEqual({
			id: '7',
			org: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_UNIVERSITY_DEPARTMENT
		})

		expect(
			campusLifeOrganiserParams(
				7,
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
			)
		).toEqual({ id: '7' })
	})
})
