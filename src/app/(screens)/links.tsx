import { trackEvent } from '@aptabase/react-native'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'
import FormList from '@/components/Universal/form-list'
import { quicklinkUrl } from '@/data/constants'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useQuickLinks } from '@/hooks/useQuickLinks'
import { useFormSheetHeaderPadding } from '@/hooks/useTransparentHeader'
import type { FormListSections } from '@/types/components'
import type { AppQuickLink } from '@/utils/managed-quick-links'

const LinkScreen = (): React.JSX.Element => {
	const { t, i18n } = useTranslation('common')
	const addRecentQuicklink = usePreferencesStore(
		(state) => state.addRecentQuicklink
	)
	const typedQuicklinks = useQuickLinks()
	const formSheetHeaderPadding = useFormSheetHeaderPadding()

	const linkPress = async (key: string, url: string): Promise<void> => {
		addRecentQuicklink(key)
		router.back()
		trackEvent('Quicklink', { link: key })
		await Linking.openURL(url)
	}
	function generateSections(links: AppQuickLink[]): FormListSections[] {
		return [
			{
				items: links.map((link) => ({
					title:
						link.title?.[i18n.language.startsWith('en') ? 'en' : 'de'] ??
						// @ts-expect-error Type cannot be verified
						t([`pages.quicklinks.links.${link.key}`, link.key]),
					icon: { ...link.icon, androidVariant: 'outlined' },

					onPress: async () => {
						await linkPress(link.key, quicklinkUrl(link, i18n.language))
					}
				})),
				footer: t('pages.quicklinks.footer')
			}
		]
	}

	const sections = generateSections(typedQuicklinks)

	return (
		<View
			testID="quick-links-screen"
			className="ios:mt-0 android:mt-3.5 web:mt-3 px-page"
			style={{ paddingTop: formSheetHeaderPadding }}
		>
			<FormList sections={sections} sheet />
		</View>
	)
}

export default LinkScreen
