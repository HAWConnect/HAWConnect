import { describe, expect, it } from 'bun:test'
import {
	assertIntegrationAvailable,
	assertRequestAllowed
} from '../integration-utils'

describe('HAWConnect integration boundaries', () => {
	it('rejects unavailable integrations without exposing sensitive input', () => {
		expect(() =>
			assertIntegrationAvailable('university', 'unavailable')
		).toThrow('Integration unavailable: university')
	})
	it('rejects demo integrations as network sources', () => {
		expect(() => assertIntegrationAvailable('food', 'demo')).toThrow()
	})
	it('permits explicitly enabled live integrations', () => {
		expect(() => assertIntegrationAvailable('food', 'live')).not.toThrow()
	})
	it('rejects embedded credentials and non-http schemes', () => {
		expect(() =>
			assertRequestAllowed('https://user:secret@example.org')
		).toThrow()
		expect(() => assertRequestAllowed('file:///tmp/menu')).toThrow()
	})
	it('allows a club-configured endpoint and local development', () => {
		expect(() =>
			assertRequestAllowed('https://example.org/graphql')
		).not.toThrow()
		expect(() =>
			assertRequestAllowed('http://localhost:4000/graphql')
		).not.toThrow()
	})
})

it('rejects insecure requests before the transport can send data', async () => {
	const { guardedFetch } = await import('../integration-utils')
	let sent = false
	await expect(
		guardedFetch('http://example.org/private', {}, async () => {
			sent = true
			return new Response('{}')
		})
	).rejects.toThrow('HTTPS is required')
	expect(sent).toBe(false)
})
