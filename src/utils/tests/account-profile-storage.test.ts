import { expect, it } from 'bun:test'
import { createProfileStorage } from '../account-profile-storage'

function setup() {
	const data = new Map<string, string>()
	const storage = createProfileStorage({
		getString: (k) => data.get(k),
		set: (k, v) => {
			data.set(k, v)
		},
		remove: (k) => {
			data.delete(k)
		},
		keys: () => [...data.keys()]
	})
	return { data, storage }
}
it('migrates guest values once without uploading or exposing them to an account', () => {
	const { data, storage } = setup()
	data.set('app-storage', 'guest preferences')
	expect(storage.adapter.getItem('app-storage')).toBe('guest preferences')
	storage.setProfile('account.a')
	expect(storage.adapter.getItem('app-storage')).toBeNull()
	storage.adapter.setItem('app-storage', 'a preferences')
	storage.setProfile('account.b')
	expect(storage.adapter.getItem('app-storage')).toBeNull()
	storage.setProfile('guest')
	expect(storage.adapter.getItem('app-storage')).toBe('guest preferences')
})
it('does not resurrect a removed migrated guest record', () => {
	const { data, storage } = setup()
	data.set('hawconnect-imported-calendars-v1', 'old')
	storage.adapter.getItem('hawconnect-imported-calendars-v1')
	storage.adapter.removeItem('hawconnect-imported-calendars-v1')
	expect(storage.adapter.getItem('hawconnect-imported-calendars-v1')).toBeNull()
	expect(data.get('hawconnect-imported-calendars-v1')).toBe('old')
})
it('clears only one account cache, retaining guest and another account', () => {
	const { storage } = setup()
	for (const profile of ['guest', 'account.a', 'account.b']) {
		storage.setProfile(profile)
		storage.adapter.setItem('app-storage', profile)
	}
	storage.clearProfile('account.a')
	storage.setProfile('account.a')
	expect(storage.adapter.getItem('app-storage')).toBeNull()
	storage.setProfile('account.b')
	expect(storage.adapter.getItem('app-storage')).toBe('account.b')
	storage.setProfile('guest')
	expect(storage.adapter.getItem('app-storage')).toBe('guest')
})
it('does not clear a different profile whose name shares a prefix', () => {
	const { storage } = setup()
	storage.setProfile('account.a')
	storage.adapter.setItem('app-storage', 'a')
	storage.setProfile('account.a.b')
	storage.adapter.setItem('app-storage', 'b')
	storage.clearProfile('account.a')
	expect(storage.adapter.getItem('app-storage')).toBe('b')
})
