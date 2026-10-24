/** Allowlisted diagnostics only: never include private payloads or storage keys. */
export function accountProfileErrorCode(error: unknown): string {
	if (!(error instanceof Error)) return 'ProfileLoadFailed'
	const known = [
		'EncryptedCacheLocked',
		'InvalidEncryptedCache',
		'InvalidLocalProfile',
		'ProfileChanged',
		'calendarStorageFailed',
		'LocalEncryptionKeyRequired'
	]
	if (known.includes(error.message)) return error.message
	if (error.name === 'SyntaxError') return 'InvalidLocalProfile'
	if (
		[
			'QuotaExceededError',
			'SecurityError',
			'InvalidAccessError',
			'OperationError',
			'NotSupportedError',
			'TypeError'
		].includes(error.name)
	)
		return error.name
	return 'ProfileLoadFailed'
}
