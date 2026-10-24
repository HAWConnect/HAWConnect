import { expect, it } from 'bun:test'
import { createLocalSyncCipher } from '../account-local-crypto'

it('encrypts queued private links and binds them to their account profile', () => {
	const key = '07'.repeat(32)
	const nonce = new Uint8Array(12).fill(3)
	const a = createLocalSyncCipher(key, 'account.a')
	const b = createLocalSyncCipher(key, 'account.b')
	const ciphertext = a.seal(
		'private subscription https://example.test/token',
		nonce
	)
	expect(ciphertext).not.toContain('private')
	expect(a.open(ciphertext)).toBe(
		'private subscription https://example.test/token'
	)
	expect(() => b.open(ciphertext)).toThrow()
	expect(() => a.open(`${ciphertext}f`)).toThrow()
})
