import { beforeAll, describe, expect, it } from 'bun:test'
import { reactNativePlatform } from './react-native-mock'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

let resolveAnnouncementPlatform: typeof import('../web-host').resolveAnnouncementPlatform
let getAnnouncementPlatform: typeof import('../web-host').getAnnouncementPlatform
let isDevHAWConnectHost: typeof import('../web-host').isDevHAWConnectHost
let resolveWebPlatform: typeof import('../web-host').resolveWebPlatform

beforeAll(async () => {
	const webHost = await import(`${SRC_ROOT}utils/web-host.ts`)
	resolveAnnouncementPlatform = webHost.resolveAnnouncementPlatform
	getAnnouncementPlatform = webHost.getAnnouncementPlatform
	isDevHAWConnectHost = webHost.isDevHAWConnectHost
	resolveWebPlatform = webHost.resolveWebPlatform
})

describe('web-host', () => {
	it('resolveWebPlatform - Should map dev.hawconnect.invalid to web-dev', () => {
		expect(resolveWebPlatform('dev.hawconnect.invalid')).toBe('web-dev')
	})

	it('resolveWebPlatform - Should map web.hawconnect.invalid to web', () => {
		expect(resolveWebPlatform('web.hawconnect.invalid')).toBe('web')
	})

	it('resolveWebPlatform - Should treat other hosts as web-local', () => {
		expect(resolveWebPlatform('localhost')).toBe('web-local')
		expect(resolveWebPlatform('127.0.0.1')).toBe('web-local')
	})

	it('isDevHAWConnectHost - Should only match dev.hawconnect.invalid', () => {
		expect(isDevHAWConnectHost('dev.hawconnect.invalid')).toBe(true)
		expect(isDevHAWConnectHost('web.hawconnect.invalid')).toBe(false)
	})

	it('resolveAnnouncementPlatform - Should map dev.hawconnect.invalid to WEB_DEV', () => {
		expect(resolveAnnouncementPlatform('dev.hawconnect.invalid')).toBe(
			'WEB_DEV'
		)
	})

	it('resolveAnnouncementPlatform - Should map web.hawconnect.invalid to WEB', () => {
		expect(resolveAnnouncementPlatform('web.hawconnect.invalid')).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should map localhost to WEB', () => {
		expect(resolveAnnouncementPlatform('localhost')).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should return IOS on iOS', () => {
		reactNativePlatform.OS = 'ios'
		expect(resolveAnnouncementPlatform()).toBe('IOS')
		reactNativePlatform.OS = 'web'
	})

	it('resolveAnnouncementPlatform - Should return ANDROID on Android', () => {
		reactNativePlatform.OS = 'android'
		expect(resolveAnnouncementPlatform()).toBe('ANDROID')
		reactNativePlatform.OS = 'web'
	})

	it('resolveAnnouncementPlatform - Should default to WEB when hostname is omitted', () => {
		expect(resolveAnnouncementPlatform()).toBe('WEB')
	})

	it('resolveAnnouncementPlatform - Should read window.location.hostname when omitted', () => {
		const originalWindow = globalThis.window
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: { location: { hostname: 'dev.hawconnect.invalid' } }
		})

		try {
			expect(resolveAnnouncementPlatform()).toBe('WEB_DEV')
		} finally {
			if (originalWindow === undefined) {
				Reflect.deleteProperty(globalThis, 'window')
			} else {
				Object.defineProperty(globalThis, 'window', {
					configurable: true,
					value: originalWindow
				})
			}
		}
	})

	it('getAnnouncementPlatform - Should delegate to resolveAnnouncementPlatform', () => {
		expect(getAnnouncementPlatform()).toBe(resolveAnnouncementPlatform())
	})
})
