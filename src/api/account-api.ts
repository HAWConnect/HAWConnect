import { Platform } from 'react-native'
import { guardedFetch } from '@/utils/integration-utils'
import { deleteSecure, loadSecureAsync, saveSecureAsync } from '@/utils/storage'

export interface AccountIdentity {
	id: string
	email: string
}
export interface AccountSession {
	user: AccountIdentity
	expiresAt: string
}
export class AccountAPIError extends Error {
	constructor(
		public code: string,
		public status = 0
	) {
		super(code)
	}
}
const graphqlURL =
	process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT ??
	'http://localhost:4000/graphql'
const endpoint =
	process.env.EXPO_PUBLIC_HAWCONNECT_AUTH_URL ??
	new URL('/api/accounts', graphqlURL).toString()
const tokenKey = 'hawconnect-account-session-v1'
let identity: () => string | null = () => null
export const setAccountIdentityProvider = (provider: () => string | null) => {
	identity = provider
}
async function headers(): Promise<Record<string, string>> {
	const result: Record<string, string> = { 'Content-Type': 'application/json' }
	const account = identity()
	if (account) result['X-HAWConnect-Account'] = account
	if (Platform.OS !== 'web') {
		result.Origin = 'hawconnect://'
		result['X-HAWConnect-Client'] = 'native'
		const token = await loadSecureAsync(tokenKey)
		if (token) result.Authorization = `Bearer ${token}`
	}
	return result
}
async function request<T>(path: string, body?: unknown): Promise<T> {
	try {
		const response = await guardedFetch(`${endpoint}/${path}`, {
			method: body === undefined ? 'GET' : 'POST',
			headers: await headers(),
			credentials: 'include',
			redirect: 'error',
			signal: AbortSignal.timeout(15000),
			...(body === undefined ? {} : { body: JSON.stringify(body) })
		})
		const value = await response.json()
		if (!response.ok)
			throw new AccountAPIError(
				typeof value.error === 'string' ? value.error : 'AccountUnavailable',
				response.status
			)
		return value as T
	} catch (error) {
		if (error instanceof AccountAPIError) throw error
		throw new AccountAPIError('AccountUnavailable')
	}
}
async function endSession(path: string) {
	const owner = identity()
	const token = Platform.OS !== 'web' ? await loadSecureAsync(tokenKey) : null
	if (identity() !== owner) throw new AccountAPIError('AuthCancelled')
	await request(path, {})
	if (
		identity() === owner &&
		Platform.OS !== 'web' &&
		(await loadSecureAsync(tokenKey)) === token
	)
		await deleteSecure(tokenKey)
}
export const accountAPI = {
	clearLocalCredential: () => deleteSecure(tokenKey),
	requestLink: (email: string) =>
		request<{ status: string }>('request-link', { email }),
	session: () => request<AccountSession>('session'),
	async confirm(token: string, isCurrent: () => boolean = () => true) {
		const value = await request<{ user: AccountIdentity; token?: string }>(
			'confirm',
			{ token }
		)
		if (!isCurrent()) throw new AccountAPIError('AuthCancelled')
		if (Platform.OS !== 'web') {
			if (!value.token) throw new AccountAPIError('SessionStorageFailed')
			await saveSecureAsync(tokenKey, value.token)
			if ((await loadSecureAsync(tokenKey)) !== value.token)
				throw new AccountAPIError('SessionStorageFailed')
		}
		if (!isCurrent()) throw new AccountAPIError('AuthCancelled')
		return this.session()
	},
	signOut: () => endSession('sign-out'),
	revokeAll: () => endSession('revoke-all'),
	deleteAccount: () => endSession('delete-account'),
	async graphQL<T>(
		query: string,
		variables: unknown,
		expectedAccount: string
	): Promise<T> {
		try {
			const response = await guardedFetch(graphqlURL, {
				method: 'POST',
				headers: {
					...(await headers()),
					'X-HAWConnect-Account': expectedAccount
				},
				credentials: 'include',
				signal: AbortSignal.timeout(20000),
				body: JSON.stringify({ query, variables })
			})
			const result = await response.json()
			if (result.errors?.length)
				throw new AccountAPIError(
					result.errors[0].message ?? 'AccountSyncUnavailable',
					result.errors[0].extensions?.code === 'UNAUTHENTICATED'
						? 401
						: response.status
				)
			if (!response.ok || !result.data)
				throw new AccountAPIError('AccountSyncUnavailable', response.status)
			return result.data as T
		} catch (error) {
			if (error instanceof AccountAPIError) throw error
			throw new AccountAPIError('AccountSyncUnavailable')
		}
	}
}
