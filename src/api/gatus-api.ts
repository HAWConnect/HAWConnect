import { Platform } from 'react-native'
import { appUserAgent } from '@/data/app-version'
import { guardedFetch } from '@/utils/integration-utils'

const USER_AGENT = appUserAgent
const GATUS_STATUSES_PATH = '/api/v1/endpoints/statuses'

export interface GatusConditionResult {
	condition: string
	success: boolean
}

export interface GatusProbeResult {
	status: number
	success: boolean
	timestamp: string
	conditionResults?: GatusConditionResult[]
}

export interface GatusEndpointStatus {
	name: string
	group: string
	key: string
	results: GatusProbeResult[]
}

function buildStatusesUrl(pageSize = 2): string {
	const base = (process.env.EXPO_PUBLIC_STATUS_ENDPOINT ?? '').replace(
		/\/$/,
		''
	)
	return `${base}${GATUS_STATUSES_PATH}?page=1&pageSize=${String(pageSize)}`
}

class GatusAPIClient {
	/**
	 * Latest probe results for all Gatus endpoints (one request).
	 */
	async getEndpointStatuses(pageSize = 2): Promise<GatusEndpointStatus[]> {
		if (!process.env.EXPO_PUBLIC_STATUS_ENDPOINT) return []
		const headers: Record<string, string> = {
			Accept: 'application/json'
		}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const response = await guardedFetch(buildStatusesUrl(pageSize), {
			headers
		})
		if (!response.ok) {
			throw new Error(`Gatus returned ${String(response.status)}`)
		}

		return (await response.json()) as GatusEndpointStatus[]
	}
}

export default new GatusAPIClient()
