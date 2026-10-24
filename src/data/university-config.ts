import type { IntegrationMode } from '@/utils/integration-utils'

export const universityConfig = {
	name: 'HAWConnect',
	university: 'HAW Hamburg',
	partnershipEstablished: false,
	modes: {
		authentication: 'unavailable',
		calendar: 'live',
		food: process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT
			? 'live'
			: 'unavailable',
		roomStatus: 'unavailable'
	} satisfies Record<string, IntegrationMode>,
	links: {
		myhaw: 'https://myhaw.haw-hamburg.de/',
		moodle: 'https://moodle.haw-hamburg.de/',
		services: 'https://www.haw-hamburg.de/online-services/',
		library: 'https://www.haw-hamburg.de/hibs/',
		food: {
			de: 'https://www.stwhh.de/speiseplan',
			en: 'https://www.stwhh.de/en/menu'
		}
	}
} as const
