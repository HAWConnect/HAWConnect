import {
	getAppIconName,
	resetAppIcon,
	setAlternateAppIcon,
	supportsAlternateIcons
} from 'expo-alternate-app-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import SectionView from '@/components/Universal/sections-view'
import { Image } from '@/components/Universal/styled'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { capitalizeFirstLetter, lowercaseFirstLetter } from '@/utils/app-utils'

// biome-ignore lint/suspicious/noExplicitAny: iconImages is a valid key
let iconImages: Record<string, any> = {}

iconImages = {
	default: require('@/assets/appIcons/default.png'),
	retro: require('@/assets/appIcons/retro.png'),
	modernGreen: require('@/assets/appIcons/modernGreen.png'),
	modernPink: require('@/assets/appIcons/modernPurple.png'),
	rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
	rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
	cat: require('@/assets/appIcons/cat.png'),
	luxury: require('@/assets/appIcons/luxury.png'),
	hacker: require('@/assets/appIcons/hacker.png'),
	rainbowGlow: require('@/assets/appIcons/rainbowGlow.png')
}

export const appIcons = Object.keys(iconImages)

const appIconCategories: Record<string, string[]> = {
	exclusive: ['cat', 'retro'],
	community: ['luxury', 'rainbowGlow', 'hacker'],
	default: ['default', 'modernGreen', 'modernPink'],
	rainbow: ['rainbowNeon', 'rainbowMoonLight']
}

export default function AppIconPicker(): React.JSX.Element {
	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const { t } = useTranslation(['settings'])
	const [currentIcon, setCurrentIcon] = React.useState<string>(
		lowercaseFirstLetter(getAppIconName() ?? 'default')
	)
	const support = supportsAlternateIcons
	if (!support) {
		return (
			<ErrorView
				message={t('appIcon.error.message')}
				title={t('appIcon.error.title')}
				isCritical={false}
			/>
		)
	}
	return (
		<ScrollView
			testID="app-icon-screen"
			contentContainerClassName="self-center pb-[50px] w-full"
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
		>
			{/* Exclusive section */}
			<SectionView
				title={t('appIcon.categories.exclusive')}
				footer={t('appIcon.exclusive')}
			>
				<View className="content-center bg-card rounded-md justify-center">
					{appIconCategories.exclusive.map((icon, index) => {
						const unlocked = unlockedAppIcons.includes(icon)
						return (
							<React.Fragment key={icon}>
								<Pressable
									testID={`app-icon-${icon}`}
									accessibilityRole="radio"
									accessibilityState={{
										selected: unlocked && currentIcon === icon,
										disabled: !unlocked
									}}
									className="items-center flex-row justify-between pe-5 ps-3 py-3"
									onPress={
										unlocked
											? async () => {
													try {
														if (icon === 'default') {
															await resetAppIcon()
															setCurrentIcon('default')
														} else {
															await setAlternateAppIcon(
																capitalizeFirstLetter(icon)
															)
															setCurrentIcon(icon)
														}
													} catch (e) {
														console.error(e)
													}
												}
											: undefined
									}
									disabled={!unlocked}
								>
									<View className="flex-row gap-8">
										<Image
											source={iconImages[icon]}
											className={`border border-border rounded-[18px] h-20 w-20${!unlocked ? ' opacity-30' : ''}`}
										/>
										<View className="justify-center">
											<Text className="self-center text-text text-lg font-medium text-center">
												{t(
													// @ts-expect-error - icon is a valid key
													`appIcon.names.${icon}`
												)}
											</Text>
										</View>
									</View>
									{unlocked && currentIcon === icon && (
										<PlatformIcon
											ios={{ name: 'checkmark', size: 20 }}
											android={{ name: 'check', size: 24 }}
											web={{ name: 'Check', size: 20 }}
										/>
									)}
									{!unlocked && (
										<Text className="text-label-secondary text-[13px] text-center pt-1 px-3">
											{t('appIcon.status.locked')}
										</Text>
									)}
								</Pressable>
								{index !== appIconCategories.exclusive.length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						)
					})}
				</View>
			</SectionView>

			{/* Community section */}
			<SectionView title={t('appIcon.categories.community')}>
				<View className="content-center bg-card rounded-md justify-center">
					{appIconCategories.community.map((icon, index) => (
						<React.Fragment key={icon}>
							<Pressable
								testID={`app-icon-${icon}`}
								accessibilityRole="radio"
								accessibilityState={{ selected: currentIcon === icon }}
								className="items-center flex-row justify-between pe-5 ps-3 py-3"
								onPress={async () => {
									try {
										await setAlternateAppIcon(capitalizeFirstLetter(icon))
										setCurrentIcon(icon)
									} catch (e) {
										console.error(e)
									}
								}}
								disabled={false}
							>
								<View className="flex-row gap-8">
									<Image
										source={iconImages[icon]}
										className="border border-border rounded-[18px] h-20 w-20"
									/>
									<View className="justify-center">
										<Text className="self-center text-text text-lg font-medium text-center">
											{
												// @ts-expect-error - icon is a valid key
												t(`appIcon.names.${icon}`)
											}
										</Text>
									</View>
								</View>
								{currentIcon === icon && (
									<PlatformIcon
										ios={{ name: 'checkmark', size: 20 }}
										android={{ name: 'check', size: 24 }}
										web={{ name: 'Check', size: 20 }}
									/>
								)}
							</Pressable>
							{index !== appIconCategories.community.length - 1 && (
								<Divider paddingLeft={110} />
							)}
						</React.Fragment>
					))}
				</View>
			</SectionView>

			{/* Default and rainbow sections */}
			{(['default', 'rainbow'] as const).map((key) => (
				<SectionView title={t(`appIcon.categories.${key}`)} key={key}>
					<View className="content-center bg-card rounded-md justify-center">
						{appIconCategories[key].map((icon, index) => (
							<React.Fragment key={icon}>
								<Pressable
									testID={`app-icon-${icon}`}
									accessibilityRole="radio"
									accessibilityState={{ selected: currentIcon === icon }}
									className="items-center flex-row justify-between pe-5 ps-3 py-3"
									onPress={async () => {
										try {
											if (icon === 'default') {
												await resetAppIcon()
												setCurrentIcon('default')
											} else {
												await setAlternateAppIcon(capitalizeFirstLetter(icon))
												setCurrentIcon(icon)
											}
										} catch (e) {
											console.error(e)
										}
									}}
									disabled={false}
								>
									<View className="flex-row gap-8">
										<Image
											source={iconImages[icon]}
											className="border border-border rounded-[18px] h-20 w-20"
										/>
										<View className="justify-center">
											<Text className="self-center text-text text-lg font-medium text-center">
												{
													// @ts-expect-error - icon is a valid key
													t(`appIcon.names.${icon}`)
												}
											</Text>
										</View>
									</View>
									{currentIcon === icon && (
										<PlatformIcon
											ios={{ name: 'checkmark', size: 20 }}
											android={{ name: 'check', size: 24 }}
											web={{ name: 'Check', size: 20 }}
										/>
									)}
								</Pressable>
								{index !== appIconCategories[key].length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						))}
					</View>
				</SectionView>
			))}
		</ScrollView>
	)
}
