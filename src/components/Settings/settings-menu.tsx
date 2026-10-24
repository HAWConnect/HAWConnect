import { trackEvent } from '@aptabase/react-native'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Platform, Share } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import FormList from '@/components/Universal/form-list'
import type { LucideIcon } from '@/components/Universal/icon'
import { projectLinks } from '@/data/project-links'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { copyToClipboard } from '@/utils/ui-utils'

export default function SettingsMenu(): React.JSX.Element {
	const router = useRouter()
	const { t, i18n } = useTranslation(['settings'])
	const setLanguage = usePreferencesStore((state) => state.setLanguage)

	const languageAlert = (): void => {
		const newLocale = i18n.language === 'en' ? 'de' : 'en'
		if (Platform.OS === 'web') {
			if (!window.confirm(t('menu.formlist.language.message'))) {
				/* empty */
			} else {
				setLanguage(newLocale)
				void i18n.changeLanguage(newLocale)
			}
		} else {
			Alert.alert(
				t('menu.formlist.language.title'),
				t('menu.formlist.language.message'),
				[
					{
						text: t('profile.logout.alert.cancel'),
						style: 'default'
					},
					{
						text: t('menu.formlist.language.confirm'),
						style: 'destructive',
						onPress: () => {
							setLanguage(newLocale)
							void i18n.changeLanguage(newLocale)
						}
					}
				]
			)
		}
	}

	const sections: FormListSections[] = [
		{
			header: t('menu.formlist.preferences.title'),
			items: [
				{
					testID: 'settings-dashboard-link',
					title: t('menu.formlist.preferences.dashboard'),
					icon: {
						ios: 'rectangle.stack',
						android: 'dashboard_customize',
						web: 'LayoutDashboard'
					},
					onPress: () => {
						router.navigate('/dashboard')
					}
				},
				{
					testID: 'settings-food-preferences-link',
					title: t('menu.formlist.preferences.food'),
					icon: {
						android: 'restaurant',
						ios: 'fork.knife',
						web: 'Utensils'
					},
					onPress: () => {
						router.navigate('/food-preferences')
					}
				},
				{
					title: t('menu.formlist.preferences.timetable'),
					icon: { ios: 'calendar', android: 'event', web: 'Calendar' },
					onPress: () => router.navigate('/timetable-settings')
				},
				{
					title: t('menu.formlist.preferences.language'),
					icon: {
						ios: 'globe',
						android: 'language',
						web: 'Globe'
					},
					onPress: async () => {
						if (
							Platform.OS === 'ios' ||
							(Platform.OS === 'android' && Platform.Version >= 33)
						) {
							await Linking.openSettings()
						} else {
							languageAlert()
						}
					}
				}
			]
		},
		{
			header: t('menu.formlist.appearance.title'),
			items: [
				{
					testID: 'settings-theme-link',
					title: t('menu.formlist.appearance.theme'),
					icon: {
						ios: 'moon.stars',
						android: 'routine',
						web: 'MoonStar'
					},
					onPress: () => {
						router.navigate('/theme')
					}
				},
				...(Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop'
					? [
							{
								testID: 'settings-app-icon-link',
								title: t('menu.formlist.appearance.appIcon'),
								icon: {
									ios: 'star.square.on.square',
									android: '' as MaterialIcon,
									web: 'StarSquare' as LucideIcon
								},
								onPress: () => {
									router.navigate('/app-icon')
								}
							}
						]
					: [])
			]
		},
		{
			header: t('menu.formlist.legal.title'),
			items: [
				{
					testID: 'settings-about-link',
					title: t('menu.formlist.legal.about'),
					icon: {
						ios: 'info.circle',
						android: 'info',
						web: 'Info'
					},
					onPress: () => {
						router.navigate('/about')
					}
				},
				{
					testID: 'settings-share-link',
					title: t('menu.formlist.legal.share'),
					icon: {
						ios: 'square.and.arrow.up',
						android: 'share',
						web: 'Share'
					},
					onPress: () => {
						trackEvent('Share', { type: 'app' })

						const message =
							Platform.OS === 'ios'
								? `${t('menu.formlist.legal.shareMessage')} ${projectLinks.website}`
								: `${t('menu.formlist.legal.shareMessageAndroid')} ${projectLinks.website}`

						if (Platform.OS === 'web') {
							void copyToClipboard(message)
							return
						}

						void Share.share({
							url: projectLinks.website || undefined,
							message
						})
					}
				},
				...(Platform.OS === 'web' && projectLinks.download
					? [
							{
								title: t('menu.formlist.legal.download'),
								icon: {
									ios: 'square.and.arrow.up',
									android: 'share' as MaterialIcon,
									web: 'Download' as LucideIcon
								},
								onPress: () => {
									void Linking.openURL(projectLinks.download)
								}
							}
						]
					: [])
			]
		}
	]

	return <FormList sections={sections} />
}
