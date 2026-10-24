import { Platform } from 'react-native'
import type { Platform as AnnouncementPlatform } from '@/__generated__/gql/graphql'
import { HAWCONNECT_DEV_HOST, HAWCONNECT_WEB_HOST } from '@/utils/app-hosts'

export type WebPlatform = 'web-dev' | 'web' | 'web-local'

export {
	HAWCONNECT_APP_HOSTS,
	HAWCONNECT_DEV_HOST,
	HAWCONNECT_WEB_HOST,
	isHAWConnectAppHost
} from '@/utils/app-hosts'

export function resolveAnnouncementPlatform(
	hostname?: string
): AnnouncementPlatform {
	if (Platform.OS === 'ios') {
		return 'IOS'
	}

	if (Platform.OS === 'android') {
		return 'ANDROID'
	}

	const host =
		hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')

	if (isDevHAWConnectHost(host)) {
		return 'WEB_DEV'
	}

	return 'WEB'
}

/** Resolves the GraphQL announcement platform at call time (not module load). */
export function getAnnouncementPlatform(): AnnouncementPlatform {
	return resolveAnnouncementPlatform()
}

export function resolveWebPlatform(hostname: string): WebPlatform {
	if (hostname === HAWCONNECT_DEV_HOST) {
		return 'web-dev'
	}

	if (hostname === HAWCONNECT_WEB_HOST) {
		return 'web'
	}

	return 'web-local'
}

export function isDevHAWConnectHost(hostname: string): boolean {
	return hostname === HAWCONNECT_DEV_HOST
}
