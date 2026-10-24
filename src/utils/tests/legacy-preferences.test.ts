import { expect, it } from 'bun:test'
import keys from '@/data/legacy-preference-keys.json'
import { normalizePreferenceKey } from '../legacy-preferences'

it('preserves existing dashboard and quick-link selections when identifiers change', () => {
	for (const [previous, current] of Object.entries(keys))
		expect(normalizePreferenceKey(previous)).toBe(current)
	expect(normalizePreferenceKey('food')).toBe('food')
	expect(normalizePreferenceKey('future-card')).toBe('future-card')
})
