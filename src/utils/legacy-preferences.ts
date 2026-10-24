import keys from '@/data/legacy-preference-keys.json'

/** Translate historical identifiers without resetting user preferences. */
export function normalizePreferenceKey(key: string): string {
	return keys[key as keyof typeof keys] ?? key
}
