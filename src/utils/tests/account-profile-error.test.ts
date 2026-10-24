import { expect, it } from 'bun:test'
import { accountProfileErrorCode } from '../account-profile-error'

it('distinguishes unavailable keys, damaged cache and browser storage failures', () => {
	for (const code of [
		'EncryptedCacheLocked',
		'InvalidEncryptedCache',
		'InvalidLocalProfile'
	])
		expect(accountProfileErrorCode(new Error(code))).toBe(code)
	expect(
		accountProfileErrorCode(
			new DOMException('private storage details', 'QuotaExceededError')
		)
	).toBe('QuotaExceededError')
	expect(
		accountProfileErrorCode(new SyntaxError('private calendar content'))
	).toBe('InvalidLocalProfile')
})

it('never exposes arbitrary error messages or account contents', () => {
	expect(
		accountProfileErrorCode(
			new Error('https://private.example/calendar?token=secret')
		)
	).toBe('ProfileLoadFailed')
	expect(accountProfileErrorCode('private calendar')).toBe('ProfileLoadFailed')
})
