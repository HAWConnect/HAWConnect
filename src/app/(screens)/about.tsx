import { trackEvent } from '@aptabase/react-native'
import { alert } from 'burnt'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import LogoSVG from '@/components/Flow/svgs/logo'
import FormList from '@/components/Universal/form-list'
import { STATUS_URL } from '@/data/constants'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import type { FormListSections } from '@/types/components'
import { toColor } from '@/utils/uniwind-utils'

export default function About(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings', 'account'])
	const headerPadding = useTransparentHeaderPadding()
	const labelTertiaryColor = String(
		toColor(useCSSVariable('--color-label-tertiary')) ?? '#99999a'
	)

	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const addUnlockedAppIcon = usePreferencesStore(
		(state) => state.addUnlockedAppIcon
	)
	const shimmerOpacity = useSharedValue(0)
	const shimmerPosition = useSharedValue(-100)
	const shimmerScale = useSharedValue(1)
	const shimmerRotation = useSharedValue(0)

	useEffect(() => {
		const animate = () => {
			shimmerOpacity.value = 0
			shimmerPosition.value = -100
			shimmerScale.value = 1
			shimmerRotation.value = 0

			shimmerOpacity.value = withSequence(
				withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
				withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
			)

			shimmerPosition.value = withTiming(200, {
				duration: 2400,
				easing: Easing.inOut(Easing.ease)
			})

			shimmerScale.value = withSequence(
				withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
			)

			shimmerRotation.value = withTiming(25, {
				duration: 2400,
				easing: Easing.inOut(Easing.ease)
			})
		}

		animate()

		const interval = setInterval(animate, 8000)

		return () => {
			clearInterval(interval)
			cancelAnimation(shimmerOpacity)
			cancelAnimation(shimmerPosition)
			cancelAnimation(shimmerScale)
			cancelAnimation(shimmerRotation)
		}
	}, [])

	const shimmerStyle = useAnimatedStyle(() => {
		return {
			opacity: shimmerOpacity.value,
			transform: [
				{ translateX: shimmerPosition.value },
				{ scale: shimmerScale.value },
				{ rotate: `${shimmerRotation.value}deg` }
			]
		}
	})

	const appSection: FormListSections = {
		header: t('about.formlist.app.title'),
		items: [
			{
				testID: 'about-status-link',
				title: t('about.formlist.systemStatus'),
				icon: {
					ios: 'bubble.left.and.exclamationmark.bubble.right',
					android: 'troubleshoot',
					web: 'HeartPulse'
				},
				onPress: () => {
					if (STATUS_URL) void Linking.openURL(STATUS_URL)
				}
			}
		]
	}

	appSection.items = appSection.items?.filter(
		(item) => item.testID !== 'about-status-link' || !!STATUS_URL
	)

	const remainingSections: FormListSections[] = [
		{
			header: t('about.formlist.legal.title'),
			items: [
				{
					testID: 'about-legal-link',
					title: t('about.formlist.legal.button'),
					icon: {
						ios: 'hand.raised',
						android: 'privacy_tip',
						web: 'ShieldEllipsis'
					},
					onPress: () => {
						router.navigate('/legal')
					}
				}
			]
		}
	]

	const pressCountRef = useRef(0)

	const handlePress = useCallback((): void => {
		pressCountRef.current += 1

		if (pressCountRef.current === 7) {
			if (Platform.OS !== 'web') {
				Alert.alert(
					t('about.easterEgg.title'),
					Platform.OS === 'ios'
						? t('about.easterEgg.message')
						: t('about.easterEgg.messageAndroid'),
					[
						{
							text: t('about.easterEgg.confirm'),
							style: 'cancel'
						}
					],
					{ cancelable: false }
				)
			} else {
				alert({
					title: t('about.easterEgg.title'),
					message: t('about.easterEgg.messageAndroid'),
					preset: 'done'
				})
			}
			const isCollected = unlockedAppIcons.includes('cat')
			if (!isCollected) {
				trackEvent('EasterEgg', { easterEgg: 'aboutLogo' })
				if (Platform.OS === 'ios') addUnlockedAppIcon('cat')
			}

			pressCountRef.current = 0
		}
	}, [t, unlockedAppIcons, addUnlockedAppIcon])

	return (
		<ScrollView
			testID="about-screen"
			contentContainerClassName="pb-bottom-safe"
			style={{ paddingTop: headerPadding }}
		>
			<View className="pb-5 pt-[30px]">
				<View className="items-center flex-row justify-center gap-[30px] max-w-[600px] self-center w-full">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="HAWConnect"
						onPress={() => {
							if (Platform.OS !== 'web') {
								void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							}
							handlePress()
						}}
					>
						<View
							className="bg-card border-hairline border-border rounded-[18px] overflow-hidden"
							style={{ boxShadow: `4 4 10 0 ${labelTertiaryColor}` }}
						>
							<View className="h-[100px] w-[100px] items-center justify-center">
								<LogoSVG size={80} />
							</View>
							<Animated.View
								className="absolute inset-0 w-[45%] z-[1]"
								style={[
									{
										backgroundColor: 'rgba(255, 255, 255, 0.3)',
										transform: [{ skewX: '-20deg' }]
									},
									shimmerStyle
								]}
							/>
							<Animated.View
								className="absolute inset-0 w-[55%] z-[2]"
								style={[
									{
										backgroundColor: 'rgba(255, 255, 255, 0.15)',
										transform: [{ skewX: '-20deg' }]
									},
									shimmerStyle
								]}
							/>
						</View>
					</Pressable>

					<View className="flex-col">
						<View className="mb-2.5">
							<Text className="text-text text-[22px] font-bold">
								{'HAWConnect'}
							</Text>
						</View>
						<View>
							<Text className="text-text text-base font-bold">
								{t('about.header.developed')}
							</Text>
							<Text className="text-text text-base">
								{t('about.maintainers')}
							</Text>
						</View>
					</View>
				</View>
			</View>

			<View className="self-center gap-4 mt-2.5 px-page w-full">
				<FormList
					sections={[
						{
							header: t('about.projectTitle'),
							item: (
								<View className="gap-3">
									<Text className="text-text">{t('about.description')}</Text>
									<Text className="text-label text-sm">
										{t('about.independence')}
									</Text>
								</View>
							)
						}
					]}
				/>
				<FormList sections={[appSection]} />
				<FormList sections={remainingSections} />
				<Text className="text-label-secondary text-xs text-center my-4">
					{t('menu.copyright')}
				</Text>
			</View>
		</ScrollView>
	)
}
