import { usePathname } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { AccountAPIError, accountAPI } from '@/api/account-api'
import Button from '@/components/Universal/button'
import PlatformIcon from '@/components/Universal/icon'
import { useAccountStore } from '@/hooks/useAccountStore'
import { toColor } from '@/utils/uniwind-utils'

export default function AccountSignInForm({
	navigateHome
}: {
	navigateHome: () => void
}): React.JSX.Element {
	const path = usePathname()
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	useEffect(
		() => () => {
			if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
		},
		[]
	)
	const { t } = useTranslation('account')
	const [email, setEmail] = useState('')
	const [busy, setBusy] = useState(false)
	const [sent, setSent] = useState(false)
	const [error, setError] = useState('')
	const [cooldown, setCooldown] = useState(false)
	async function send() {
		setError('')
		setBusy(true)
		try {
			await accountAPI.requestLink(email.trim())
			setSent(true)
			setCooldown(true)
			cooldownTimer.current = setTimeout(() => setCooldown(false), 60000)
		} catch (e) {
			setError(
				e instanceof AccountAPIError && e.code === 'InvalidAccountEmail'
					? t('invalidEmail')
					: e instanceof AccountAPIError && e.code === 'TooManyRequests'
						? t('rateLimit')
						: e instanceof AccountAPIError && e.code === 'MailUnavailable'
							? t('mailUnavailable')
							: t('unavailable')
			)
		} finally {
			setBusy(false)
		}
	}
	return (
		<View className="items-center justify-center w-full">
			<View
				testID="account-login-form"
				className="w-full max-w-[400px] self-center pb-[30px] px-[25px] pt-[30px] bg-card rounded-[24px] border-hairline border-border"
			>
				<Text className="w-full text-text text-[28px] font-bold text-center mb-2">
					{t('getStarted')}
				</Text>
				<Text className="w-full text-label text-base text-center mb-[30px]">
					{t('emailSubtitle')}
				</Text>
				<View className="flex-row items-center bg-input-background rounded-sm border-hairline border-border px-3">
					<PlatformIcon
						style={{ color: labelColor }}
						ios={{ name: 'envelope', size: 20 }}
						android={{ name: 'mail', size: 24 }}
						web={{ name: 'Mail', size: 20 }}
					/>
					<TextInput
						testID="login-email"
						accessibilityLabel={t('email')}
						placeholder="name@haw-hamburg.de"
						placeholderTextColor={labelColor}
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="email-address"
						autoComplete="email"
						textContentType="emailAddress"
						returnKeyType="send"
						editable={!busy}
						onSubmitEditing={() => {
							if (email && !busy && !cooldown) void send()
						}}
						className="flex-1 text-text text-base ml-2 h-11"
					/>
				</View>
				<Text className="text-label text-sm mt-4">{t('syncDisclosure')}</Text>
				<Button
					testID="login-submit"
					onPress={() => void send()}
					disabled={busy || cooldown || !email.trim()}
					loading={busy}
					style={{ marginTop: 24, width: '100%' }}
				>
					{sent ? t('resend') : t('send')}
				</Button>
				{sent && (
					<Text className="text-label mt-4" accessibilityRole="alert">
						{t('sent')}
					</Text>
				)}
				{!!error && (
					<Text className="text-notification mt-4" accessibilityRole="alert">
						{error}
					</Text>
				)}
				<View className="w-full flex-row items-center mt-[26px]">
					<View className="flex-1 h-hairline bg-border" />
					<Text className="text-label mx-2.5 text-[13px]">{t('or')}</Text>
					<View className="flex-1 h-hairline bg-border" />
				</View>
				<Pressable
					testID="login-guest"
					accessibilityRole="button"
					disabled={busy}
					className="w-full items-center pt-1.5 mt-3.5"
					onPress={() => {
						useAccountStore.getState().continueAsGuest()
						if (path === '/login') navigateHome()
					}}
				>
					<Text className="text-label text-sm font-normal">{t('guest')}</Text>
				</Pressable>
			</View>
		</View>
	)
}
