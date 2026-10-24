export type AccountStatus = 'loading' | 'guest' | 'authenticated' | 'locked'
export function accountAccess(
	_platform: string,
	status: AccountStatus,
	path: string
): 'allow' | 'loading' | 'sign-in' {
	if (
		[
			'/login',
			'/auth-confirm',
			'/legal',
			'/privacy',
			'/imprint',
			'/licenses',
			'/license',
			'/about'
		].includes(path)
	)
		return 'allow'
	if (status === 'loading') return 'loading'
	if (status === 'authenticated') return 'allow'
	if (status === 'guest') return 'allow'
	return 'sign-in'
}
