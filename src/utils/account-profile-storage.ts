interface KeyValueStorage {
	getString: (key: string) => string | undefined
	set: (key: string, value: string) => void
	remove: (key: string) => void
	keys: () => string[]
}
const privateKeys = new Set([
	'app-storage',
	'food-filter-storage',
	'timetable-storage',
	'hawconnect-imported-calendars-v1',
	'dashboard-order-storage',
	'account-sync-storage'
])
export function createProfileStorage(base: KeyValueStorage) {
	let profile = 'guest'
	let generation = 0
	const key = (scope: string, name: string) =>
		privateKeys.has(name) ? `profile.${scope.length}-${scope}.${name}` : name
	function read(scope: string, name: string) {
		const target = key(scope, name)
		if (
			scope === 'guest' &&
			privateKeys.has(name) &&
			!base.getString(`migrated.${name}`)
		) {
			const original = base.getString(name)
			if (base.getString(target) === undefined && original !== undefined)
				base.set(target, original)
			base.set(`migrated.${name}`, 'true')
		}
		return base.getString(target) ?? null
	}
	return {
		getProfile: () => profile,
		getGeneration: () => generation,
		lockWrites: () => {
			generation++
		},
		setProfile(next: string) {
			if (!/^[a-zA-Z0-9._-]{1,128}$/.test(next))
				throw new Error('InvalidStorageProfile')
			profile = next
			generation++
		},
		readProfileItem: read,
		clearProfile(target: string) {
			if (!/^account\.[a-zA-Z0-9._-]+$/.test(target))
				throw new Error('InvalidStorageProfile')
			for (const key of base.keys())
				if (key.startsWith(`profile.${target.length}-${target}.`))
					base.remove(key)
		},
		adapter: {
			setItem(name: string, value: string) {
				base.set(key(profile, name), value)
			},
			getItem(name: string) {
				return read(profile, name)
			},
			removeItem(name: string) {
				base.remove(key(profile, name))
			}
		}
	}
}
