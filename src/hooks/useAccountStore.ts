import { Platform } from 'react-native'
import { create } from 'zustand'
import {
	AccountAPIError,
	type AccountIdentity,
	type AccountSession,
	accountAPI,
	setAccountIdentityProvider
} from '@/api/account-api'
import type { AccountStatus } from '@/utils/account-access'
import { appStorage } from '@/utils/storage'

interface AccountState {
	status: AccountStatus
	user: AccountIdentity | null
	expiresAt: string | null
	error: string | null
	refresh: () => Promise<void>
	confirm: (token: string) => Promise<void>
	continueAsGuest: () => void
	signedOut: () => void
	lock: () => void
}
let generation = 0
let refreshGeneration = 0
export const useAccountStore = create<AccountState>((set, get) => ({
	status: 'loading',
	user: null,
	expiresAt: null,
	error: null,
	async refresh() {
		if (
			appStorage.getBoolean('hawconnect-guest-mode') === true &&
			!get().user
		) {
			set({ status: 'guest' })
			return
		}
		const current = generation
		const refresh = ++refreshGeneration
		try {
			const session = await accountAPI.session()
			if (current !== generation || refresh !== refreshGeneration) return
			apply(session)
		} catch (error) {
			if (current !== generation || refresh !== refreshGeneration) return
			const previous = get()
			if (
				!(error instanceof AccountAPIError && error.status === 401) &&
				previous.status === 'authenticated' &&
				Date.parse(previous.expiresAt ?? '') > Date.now()
			)
				return
			const guest =
				Platform.OS !== 'web' &&
				appStorage.getBoolean('hawconnect-guest-mode') === true &&
				!previous.user
			set({
				status: guest ? 'guest' : 'locked',
				error:
					error instanceof AccountAPIError ? error.code : 'AccountUnavailable'
			})
		}
	},
	async confirm(token) {
		const current = ++generation
		++refreshGeneration
		const session = await accountAPI.confirm(
			token,
			() => current === generation
		)
		if (current === generation) apply(session)
	},
	continueAsGuest() {
		++generation
		appStorage.set('hawconnect-guest-mode', true)
		set({ status: 'guest', user: null, expiresAt: null, error: null })
		void accountAPI.clearLocalCredential()
	},
	signedOut() {
		++generation
		set({
			status: Platform.OS === 'web' ? 'locked' : 'guest',
			user: null,
			expiresAt: null,
			error: null
		})
		if (Platform.OS !== 'web') appStorage.set('hawconnect-guest-mode', true)
	},
	lock() {
		++generation
		set({ status: 'locked' })
	}
}))
function apply(session: AccountSession) {
	appStorage.set('hawconnect-guest-mode', false)
	useAccountStore.setState({
		status: 'authenticated',
		user: session.user,
		expiresAt: session.expiresAt,
		error: null
	})
}

setAccountIdentityProvider(() => useAccountStore.getState().user?.id ?? null)
