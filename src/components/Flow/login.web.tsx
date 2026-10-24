import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import LoginForm from '@/components/Account/sign-in-form'
import WhatsNewBox from '@/components/Flow/whats-new-box'
import { FAQ_URL } from '@/data/constants'
import type { OnboardingCardData } from '@/types/data'
import LoginAnimatedText from './login-animated-text'
import LogoSVG from './svgs/logo'

export default function Login(): React.JSX.Element {
	const { t } = useTranslation('flow')
	const navigateHome = (): void => {
		router.replace('/(tabs)')
	}

	const data: OnboardingCardData[] = [
		{
			title: t('onboarding.cards.title1'),
			description: t('onboarding.cards.description1'),
			icon: {
				ios: 'square.stack.3d.up',
				android: 'hub',
				web: 'Layers'
			}
		},
		{
			title: t('onboarding.cards.title2'),
			description: t('onboarding.cards.description2'),
			icon: {
				ios: 'person.2.gobackward',
				android: 'volunteer_activism',
				web: 'Users'
			}
		},
		{
			title: t('onboarding.cards.title4'),
			description: t('onboarding.cards.description4'),
			icon: {
				ios: 'person.3.fill',
				android: 'smartphone',
				web: 'Download'
			}
		},
		{
			title: t('onboarding.cards.title3'),
			description: t('onboarding.cards.description3'),
			icon: {
				ios: 'lock.app.dashed',
				android: 'encrypted',
				web: 'GlobeLock'
			}
		}
	]

	return (
		<>
			<View className="items-start w-full absolute top-0 left-0 right-0 z-[1] bg-card px-[4%] py-2.5 border-b-hairline border-border">
				<View className="flex-row items-center gap-3">
					<LogoSVG size={32} />
					<View className="flex-col">
						<Text className="text-text text-xl font-semibold tracking-tight">
							HAWConnect
						</Text>
						<Text className="text-label text-sm font-normal tracking-tight">
							{t('login.title1Sub')}
						</Text>
					</View>
				</View>
			</View>
			<ScrollView
				className="flex-1 bg-background"
				contentContainerClassName="self-center grow pt-5 w-[92%] mt-[100px]"
			>
				<LoginAnimatedText />
				<View className="flex-col gap-10 pt-[50px]">
					<LoginForm navigateHome={navigateHome} />
					<View className="items-center self-center gap-2 max-w-[600px]">
						<Text className="text-label text-sm text-center">
							{t('onboarding.cards.description2')}
						</Text>
						<Text
							className="text-text text-sm text-center font-extrabold"
							onPress={() => router.navigate('/privacy')}
						>
							{t('onboarding.links.privacy')}
						</Text>
					</View>
					<View className="items-center self-center bg-card rounded-3xl gap-4 max-w-[1000px] p-6 mt-10 w-full border-hairline border-border">
						{data.map((item) => (
							<WhatsNewBox
								key={item.title}
								title={item.title}
								description={item.description}
								icon={item.icon}
							/>
						))}
					</View>

					<View className="items-center self-center gap-3.5 pb-bottom-safe">
						<Text
							className="text-label text-sm text-center"
							onPress={() => {
								if (FAQ_URL) void Linking.openURL(FAQ_URL)
								else router.navigate('/legal')
							}}
						>
							{t('onboarding.links.faq')}
						</Text>
						<Text
							className="text-label text-sm text-center"
							onPress={() => {
								router.navigate('/imprint')
							}}
						>
							{t('onboarding.links.imprint')}
						</Text>
					</View>
				</View>
			</ScrollView>
		</>
	)
}
