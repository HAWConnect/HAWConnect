import { usePathname } from 'expo-router'
import { type ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, AppState, Platform, Text, View } from 'react-native'
import Button from '@/components/Universal/button'
import { useAccountStore } from '@/hooks/useAccountStore'
import {
	cancelAccountSwitch,
	discardPreviousAccount,
	retryAccountProfile,
	useAccountSync
} from '@/hooks/useAccountSync'
import { useAccountLifecycleStore } from '@/hooks/useAccountSyncStore'
import { useCalendarAutoRefresh } from '@/hooks/useCalendarAutoRefresh'
import { accountAccess } from '@/utils/account-access'
import SignInScreen from './sign-in-screen'

export default function AccountGate({
	children
}: {
	children: ReactNode
}): React.JSX.Element {
	useAccountSync()
	useCalendarAutoRefresh()
	const { t } = useTranslation('account')
	const path = usePathname()
	const status = useAccountStore((s) => s.status)
	const owner = useAccountStore((s) => s.user?.id)
	const ready = useAccountLifecycleStore((s) => s.readyProfile)
	const blocked = useAccountLifecycleStore((s) => s.switchBlocked)
	const profileError = useAccountLifecycleStore((s) => s.error)
	useEffect(() => {
		void useAccountStore.getState().refresh()
		const sub = AppState.addEventListener('change', (state) => {
			if (state === 'active') void useAccountStore.getState().refresh()
		})
		const timer = setInterval(() => {
			const state = useAccountStore.getState()
			if (
				state.status === 'authenticated' &&
				Date.parse(state.expiresAt ?? '') <= Date.now()
			)
				state.lock()
		}, 15000)
		return () => {
			sub.remove()
			clearInterval(timer)
		}
	}, [])
	const access = accountAccess(Platform.OS, status, path)
	if (access === 'loading')
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator />
			</View>
		)
	if (access === 'sign-in') return <SignInScreen />
	const desired =
		status === 'authenticated' && owner ? `account.${owner}` : 'guest'
	const publicRoute = [
		'/auth-confirm',
		'/login',
		'/legal',
		'/privacy',
		'/imprint',
		'/licenses',
		'/license',
		'/about'
	].includes(path)
	if (!publicRoute && profileError)
		return (
			<View className="flex-1 bg-background p-page gap-4">
				<Text className="text-text">{t('profileLoadFailed')}</Text>
				<Text className="text-label" selectable>
					{t('profileDiagnostic', { code: profileError })}
				</Text>
				<Button onPress={() => void retryAccountProfile()}>{t('retry')}</Button>
			</View>
		)
	if (!publicRoute && blocked)
		return (
			<View className="flex-1 bg-background p-page gap-4">
				<Text className="text-text">{t('switchBlocked')}</Text>
				<Button onPress={() => void discardPreviousAccount()}>
					{t('discardPrevious')}
				</Button>
				<Button variant="secondary" onPress={() => void cancelAccountSwitch()}>
					{t('backToSignIn')}
				</Button>
			</View>
		)
	if (!publicRoute && ready !== desired)
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator />
			</View>
		)
	return <>{children}</>
}
