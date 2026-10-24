import { bytesToHex } from '@noble/ciphers/utils.js'
import { getRandomBytes } from 'expo-crypto'
import type { StateStorage } from 'zustand/middleware'
import { createLocalSyncCipher } from './account-local-crypto'
import {
	accountProfileStorage,
	appStorage,
	deleteSecure,
	loadSecureAsync,
	saveSecureAsync
} from './storage'

const keys = new Map<string, Promise<string>>()
const readyKeys = new Map<string, string>()
const generations = new Map<string, number>()
const writes = new Map<string, Promise<void>>()
const errors = new Map<string, unknown>()
const cacheKey = (profile: string) =>
	`encrypted-sync.${profile.length}-${profile}`
const secureKey = (profile: string) =>
	`hawconnect-sync-key-${profile.length}-${profile}`
async function encryptionKey(
	profile: string,
	create: boolean
): Promise<string> {
	const current = keys.get(profile)
	if (current) return current
	const promise = (async () => {
		let key = await loadSecureAsync(secureKey(profile))
		if (!key) {
			if (!create) throw new Error('EncryptedCacheLocked')
			key = bytesToHex(getRandomBytes(32))
			await saveSecureAsync(secureKey(profile), key)
			if ((await loadSecureAsync(secureKey(profile))) !== key)
				throw new Error('EncryptedCacheLocked')
		}
		readyKeys.set(profile, key)
		return key
	})()
	keys.set(profile, promise)
	try {
		return await promise
	} catch (error) {
		keys.delete(profile)
		throw error
	}
}
export async function readEncryptedProfile(
	profile: string
): Promise<string | null> {
	const value = appStorage.getString(cacheKey(profile))
	if (value === undefined) return null
	return createLocalSyncCipher(
		await encryptionKey(profile, false),
		profile
	).open(value)
}
export async function clearEncryptedProfile(profile: string): Promise<void> {
	generations.set(profile, (generations.get(profile) ?? 0) + 1)
	const pending = keys.get(profile)
	if (pending) await pending.catch(() => {})
	appStorage.remove(cacheKey(profile))
	keys.delete(profile)
	readyKeys.delete(profile)
	errors.delete(profile)
	await deleteSecure(secureKey(profile))
}
export async function prepareEncryptedProfile(profile: string) {
	await encryptionKey(profile, true)
}
export async function flushEncryptedProfile(profile: string): Promise<void> {
	await writes.get(profile)
	if (errors.has(profile)) throw new Error('EncryptedCacheLocked')
}
export const encryptedSyncStorage: StateStorage = {
	getItem() {
		return readEncryptedProfile(accountProfileStorage.getProfile())
	},
	setItem(_name, value) {
		const profile = accountProfileStorage.getProfile()
		const generation = generations.get(profile) ?? 0
		if (profile === 'guest') return
		const ready = readyKeys.get(profile)
		if (ready) {
			try {
				appStorage.set(
					cacheKey(profile),
					createLocalSyncCipher(ready, profile).seal(value, getRandomBytes(12))
				)
				errors.delete(profile)
			} catch (error) {
				errors.set(profile, error)
			}
			return
		}
		const write = (writes.get(profile) ?? Promise.resolve())
			.then(async () => {
				const key = await encryptionKey(profile, true)
				if (generation !== (generations.get(profile) ?? 0)) return
				appStorage.set(
					cacheKey(profile),
					createLocalSyncCipher(key, profile).seal(value, getRandomBytes(12))
				)
				errors.delete(profile)
			})
			.catch((error) => {
				errors.set(profile, error)
			})
		writes.set(profile, write)
	},
	removeItem() {
		return clearEncryptedProfile(accountProfileStorage.getProfile())
	}
}
