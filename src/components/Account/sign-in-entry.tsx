import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import AvatarCircle from '@/components/Settings/avatar-circle'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

/** Upstream profile-row pattern, shared by guest Settings and dashboard controls. */
export default function SignInEntry(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings', 'account'])
	const primary = toColor(useCSSVariable('--color-primary'))
	const background = toColor(useCSSVariable('--color-primary-background'))
	return (
		<Pressable
			testID="account-sign-in-entry"
			accessibilityRole="button"
			onPress={() => router.navigate('/login')}
			className="self-center bg-card border-hairline border-border ios:rounded-ios android:rounded-md web:rounded-md w-full mt-3 active:opacity-90"
		>
			<View className="flex-row items-center px-4 py-[30px] w-full gap-4">
				<AvatarCircle background={background}>
					<PlatformIcon
						ios={{ name: 'person', variant: 'fill', size: 26 }}
						android={{ name: 'account_circle', size: 32 }}
						web={{ name: 'User', size: 32 }}
						style={{ color: primary }}
					/>
				</AvatarCircle>
				<View className="flex-1 gap-1">
					<Text className="text-text text-lg font-bold">
						{t('menu.guest.title')}
					</Text>
					<Text className="text-label text-xs leading-[16px]">
						{t('account:guestLocal')}
					</Text>
				</View>
				<PlatformIcon
					ios={{ name: 'chevron.forward', size: 14 }}
					android={{ name: 'chevron_right', size: 28 }}
					web={{ name: 'ChevronRight', size: 24 }}
				/>
			</View>
		</Pressable>
	)
}
