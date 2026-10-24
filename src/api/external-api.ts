import { Platform } from 'react-native'
import { appUserAgent } from '@/data/app-version'
import { guardedFetch } from '@/utils/integration-utils'

const USER_AGENT = appUserAgent

class ExternalAPIClient {
	async fetchLicenseText(url: string): Promise<string> {
		const headers: Record<string, string> = {}
		if (Platform.OS !== 'web') {
			headers['User-Agent'] = USER_AGENT
		}

		const response = await guardedFetch(url, { headers })

		if (!response.ok) {
			throw new Error(`Failed to fetch license text (${response.status})`)
		}

		const text = await response.text()

		// Some license URLs point at repo pages instead of raw text files.
		if (text.includes('<!DOCTYPE html>')) {
			return ''
		}

		return text
	}
}

export default new ExternalAPIClient()
