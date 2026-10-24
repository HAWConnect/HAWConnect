import { expect, it } from 'bun:test'
import { accountAccess } from '../account-access'

it('allows an explicitly chosen web guest while keeping locked sessions gated', () => {
	for (const path of [
		'/',
		'/calendar-import',
		'/timetable',
		'/food',
		'/settings',
		'/lecture'
	]) {
		expect(accountAccess('web', 'guest', path)).toBe('allow')
		expect(accountAccess('web', 'locked', path)).toBe('sign-in')
	}
	expect(accountAccess('web', 'authenticated', '/calendar-import')).toBe(
		'allow'
	)
})
it('allows mobile guest access, but locks an expired account session', () => {
	expect(accountAccess('ios', 'guest', '/timetable')).toBe('allow')
	expect(accountAccess('android', 'guest', '/food')).toBe('allow')
	expect(accountAccess('ios', 'locked', '/timetable')).toBe('sign-in')
})
it('allows confirmation and legal routes without exposing application screens', () => {
	for (const path of [
		'/auth-confirm',
		'/login',
		'/legal',
		'/licenses',
		'/license'
	])
		expect(accountAccess('web', 'guest', path)).toBe('allow')
	expect(accountAccess('web', 'loading', '/settings')).toBe('loading')
})

it('allows public legal documents while signed out or loading', () => {
	for (const path of ['/privacy', '/imprint'])
		for (const status of ['locked', 'loading'] as const)
			expect(accountAccess('web', status, path)).toBe('allow')
})
