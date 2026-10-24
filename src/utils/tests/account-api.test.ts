import { afterEach, expect, test } from 'bun:test'
import { accountAPI, setAccountIdentityProvider } from '@/api/account-api'
import { reactNativePlatform } from './react-native-mock'
import { resetSecureStores, secureStore } from './university-storage-mocks'

const originalFetch = globalThis.fetch
const tokenKey = 'hawconnect-account-session-v1'
afterEach(() => {
	globalThis.fetch = originalFetch
	reactNativePlatform.OS = 'web'
	setAccountIdentityProvider(() => null)
	resetSecureStores()
})
test('a delayed sign-out does not delete a newer native account credential', async () => {
	reactNativePlatform.OS = 'ios'
	resetSecureStores()
	secureStore.set(tokenKey, 'old-token')
	let owner = 'first'
	setAccountIdentityProvider(() => owner)
	let release: (response: Response) => void = () => {}
	let sent: () => void = () => {}
	const started = new Promise<void>((resolve) => {
		sent = resolve
	})
	globalThis.fetch = ((_input: unknown, init: RequestInit) => {
		expect(
			(init.headers as Record<string, string>)['X-HAWConnect-Account']
		).toBe('first')
		sent()
		return new Promise<Response>((resolve) => {
			release = resolve
		})
	}) as typeof fetch
	const request = accountAPI.signOut()
	await started
	owner = 'second'
	secureStore.set(tokenKey, 'new-token')
	release(Response.json({ status: 'ok' }))
	await request
	expect(secureStore.get(tokenKey)).toBe('new-token')
})
