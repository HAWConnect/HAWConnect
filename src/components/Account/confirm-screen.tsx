import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Text, View } from 'react-native'
import Button from '@/components/Universal/button'
import { useAccountStore } from '@/hooks/useAccountStore'

export default function ConfirmScreen(): React.JSX.Element {
	const { t } = useTranslation('account')
	const router = useRouter()
	const [token, setToken] = useState('')
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	useEffect(() => {
		const read = (url: string) => {
			try {
				const value = new URLSearchParams(new URL(url).hash.slice(1)).get(
					'token'
				)
				if (value) setToken(value)
			} catch {
				setError(t('invalidLink'))
			}
		}
		if (Platform.OS === 'web') {
			read(window.location.href)
			window.history.replaceState(null, '', window.location.pathname)
		} else {
			void Linking.getInitialURL().then((url) => {
				if (url) read(url)
			})
			const sub = Linking.addEventListener('url', (event) => read(event.url))
			return () => sub.remove()
		}
	}, [t])
	async function confirm() {
		setBusy(true)
		setError('')
		try {
			await useAccountStore.getState().confirm(token)
			setToken('')
			router.replace('/(tabs)')
		} catch {
			setError(t('invalidLink'))
		} finally {
			setBusy(false)
		}
	}
	return (
		<View className="flex-1 bg-background p-page gap-4">
			<View className="bg-card border-hairline border-border rounded-md p-card gap-4 max-w-[600px] w-full self-center">
				<Text className="text-text text-xl font-bold">{t('confirmTitle')}</Text>
				<Text className="text-label">{t('confirmInstructions')}</Text>
				<Button
					disabled={!token || busy}
					loading={busy}
					onPress={() => void confirm()}
				>
					{t('continue')}
				</Button>
				{Platform.OS === 'web' && !!token && (
					<Button
						variant="secondary"
						onPress={() =>
							void Linking.openURL(
								`hawconnect://auth-confirm#${new URLSearchParams({ token })}`
							)
						}
					>
						{t('openApp')}
					</Button>
				)}
				{!!error && (
					<Text accessibilityRole="alert" className="text-notification">
						{error}
					</Text>
				)}
			</View>
		</View>
	)
}
