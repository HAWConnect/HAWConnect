import { expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { validateTestFlightEnvironment } from '../testflight-config'

test('rejects missing and local TestFlight services', () => {
	for (const endpoint of [
		undefined,
		'http://localhost:4000/graphql',
		'https://localhost/graphql',
		'https://127.0.0.1/graphql',
		'https://192.168.1.20/graphql'
	])
		expect(() =>
			validateTestFlightEnvironment({
				EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT: endpoint
			})
		).toThrow('TestFlight requires a public HTTPS')
})
test('accepts public HTTPS services and checks an explicit auth override', () => {
	expect(() =>
		validateTestFlightEnvironment({
			EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT: 'https://api.example.org/graphql'
		})
	).not.toThrow()
	expect(() =>
		validateTestFlightEnvironment({
			EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT:
				'https://api.example.org/graphql',
			EXPO_PUBLIC_HAWCONNECT_AUTH_URL: 'http://localhost:4000/api/accounts'
		})
	).toThrow('TestFlight requires a public HTTPS')
})

test('loads the shared build validator in Node, as Expo config evaluation does', () => {
	const result = spawnSync(
		'node',
		[
			'-e',
			"const {validateTestFlightEnvironment}=require('./config/testflight-config');validateTestFlightEnvironment({EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT:'https://api.example.org/graphql'})"
		],
		{
			cwd: new URL('../../../', import.meta.url),
			encoding: 'utf8',
			timeout: 10000
		}
	)
	expect(result.status).toBe(0)
})
