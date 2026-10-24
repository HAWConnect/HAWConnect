import {
	accountProfileStorage,
	deleteSecure,
	loadSecureAsync,
	saveSecureAsync
} from '@/utils/storage'

const memory = new Map<string, string>()
const operations = new Map<string, Promise<unknown>>()
const key = (profile: string, id: string) =>
	`hawconnect-calendar-${profile.length}-${profile}-${id.length}-${id}`
function checkProfile(profile: string, generation: number) {
	if (
		accountProfileStorage.getProfile() !== profile ||
		accountProfileStorage.getGeneration() !== generation
	)
		throw new Error('calendarStorageFailed')
}
async function serial<T>(target: string, work: () => Promise<T>): Promise<T> {
	const task = (operations.get(target) ?? Promise.resolve())
		.catch(() => {})
		.then(work)
	operations.set(target, task)
	try {
		return await task
	} finally {
		if (operations.get(target) === task) operations.delete(target)
	}
}
export async function saveCalendarLink(id: string, url: string): Promise<void> {
	const profile = accountProfileStorage.getProfile()
	const generation = accountProfileStorage.getGeneration()
	const target = key(profile, id)
	return serial(target, async () => {
		checkProfile(profile, generation)
		await saveSecureAsync(target, url)
		checkProfile(profile, generation)
		if ((await loadSecureAsync(target)) !== url)
			throw new Error('calendarStorageFailed')
		checkProfile(profile, generation)
		memory.set(target, url)
	})
}
export async function loadCalendarLink(id: string): Promise<string | null> {
	const profile = accountProfileStorage.getProfile()
	const generation = accountProfileStorage.getGeneration()
	const target = key(profile, id)
	return serial(target, async () => {
		checkProfile(profile, generation)
		const scoped = await loadSecureAsync(target)
		checkProfile(profile, generation)
		if (scoped) {
			memory.set(target, scoped)
			return scoped
		}
		if (profile !== 'guest') return null
		const original = await loadSecureAsync(`hawconnect-calendar-${id}`)
		checkProfile(profile, generation)
		if (original) await saveSecureAsync(target, original)
		checkProfile(profile, generation)
		if (original) memory.set(target, original)
		return original
	})
}
export async function deleteCalendarLink(id: string): Promise<void> {
	const profile = accountProfileStorage.getProfile()
	const generation = accountProfileStorage.getGeneration()
	const target = key(profile, id)
	return serial(target, async () => {
		checkProfile(profile, generation)
		await deleteSecure(target)
		memory.delete(target)
		if (profile === 'guest') await deleteSecure(`hawconnect-calendar-${id}`)
		checkProfile(profile, generation)
	})
}
/** Explicit guest-import action only; never changes the active profile. */
export async function readGuestCalendarLink(
	id: string
): Promise<string | null> {
	return serial(
		key('guest', id),
		async () =>
			(await loadSecureAsync(key('guest', id))) ??
			(await loadSecureAsync(`hawconnect-calendar-${id}`))
	)
}
export async function clearCalendarLinksForProfile(
	profile: string,
	ids: string[]
): Promise<void> {
	for (const id of ids) {
		const target = key(profile, id)
		await serial(target, async () => {
			await deleteSecure(target)
			memory.delete(target)
		})
	}
}
export const peekCalendarLink = (profile: string, id: string) =>
	memory.get(key(profile, id)) ?? null
