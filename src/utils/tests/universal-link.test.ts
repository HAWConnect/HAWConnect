import { describe, expect, it } from 'bun:test'
import { isHAWConnectAppHost } from '@/utils/app-hosts'
import {
	normalizeRoutePath,
	parseUniversalLinkPath
} from '@/utils/universal-link'

describe('parseUniversalLinkPath', () => {
	it('parses dev host paths', () => {
		expect(
			parseUniversalLinkPath(
				'https://dev.hawconnect.invalid/timetable-settings'
			)
		).toBe('timetable-settings')
	})

	it('parses web host paths with query params', () => {
		expect(
			parseUniversalLinkPath('https://web.hawconnect.invalid/food/123?ref=qr')
		).toBe('food/123?ref=qr')
	})

	it('returns null for unrelated hosts', () => {
		expect(parseUniversalLinkPath('https://example.com/settings')).toBeNull()
	})

	it('returns null for host root paths', () => {
		expect(parseUniversalLinkPath('https://dev.hawconnect.invalid/')).toBeNull()
	})

	it('returns null for invalid urls', () => {
		expect(parseUniversalLinkPath('not-a-url')).toBeNull()
	})

	it('ignores hash fragments', () => {
		expect(
			parseUniversalLinkPath('https://web.hawconnect.invalid/settings#section')
		).toBe('settings')
	})
})

describe('normalizeRoutePath', () => {
	it('strips leading and trailing slashes', () => {
		expect(normalizeRoutePath('/timetable-settings/')).toBe(
			'timetable-settings'
		)
	})
})

describe('isHAWConnectAppHost', () => {
	it('matches dev and web hosts only', () => {
		expect(isHAWConnectAppHost('dev.hawconnect.invalid')).toBe(true)
		expect(isHAWConnectAppHost('web.hawconnect.invalid')).toBe(true)
		expect(isHAWConnectAppHost('localhost')).toBe(false)
	})
})
