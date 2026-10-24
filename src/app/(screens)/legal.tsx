import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, View } from 'react-native'
import FormList from '@/components/Universal/form-list'
import { projectLinks } from '@/data/project-links'
import { useLegalDocuments } from '@/hooks/useLegalDocuments'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import type { FormListSections } from '@/types/components'
import { legalTarget } from '@/utils/legal-documents'

export default function Legal(): React.JSX.Element {
	const router = useRouter()
	const { t, i18n } = useTranslation(['settings', 'account'])
	const { data: documents, isError } = useLegalDocuments()
	const headerPadding = useTransparentHeaderPadding()
	const sections: FormListSections[] = [
		{
			header: t('about.formlist.legal.title'),
			items: [
				...[
					{
						key: 'privacy' as const,
						url: projectLinks.privacy,
						title: t('legal.formlist.legal.privacy')
					},
					{
						key: 'imprint' as const,
						url: projectLinks.imprint,
						title: t('legal.formlist.legal.imprint')
					}
				].map((item) => ({
					testID: `legal-${item.key}-link`,
					title: item.title,
					icon:
						item.key === 'privacy'
							? {
									ios: 'lock.shield' as const,
									android: 'shield_lock' as const,
									web: 'ShieldCheck' as const
								}
							: {
									ios: 'doc.text' as const,
									android: 'description' as const,
									web: 'FileText' as const
								},
					onPress: async () => {
						const document = documents?.find((row) => row.key === item.key)
						const target = isError
							? null
							: legalTarget(document, i18n.language, item.url)
						if (target?.mode === 'external') await Linking.openURL(target.url)
						else
							router.navigate(item.key === 'privacy' ? '/privacy' : '/imprint')
					}
				})),
				{
					testID: 'legal-licenses-link',
					title: t('navigation.licenses.title', { ns: 'navigation' }),
					icon: { ios: 'shield', android: 'shield', web: 'Shield' },
					onPress: () => router.navigate('/licenses')
				}
			]
		}
	]
	return (
		<ScrollView
			testID="legal-screen"
			contentContainerClassName="pb-bottom-safe"
			style={{ paddingTop: headerPadding }}
		>
			<View className="self-center mt-2.5 px-page w-full gap-3">
				<FormList sections={sections} />
			</View>
		</ScrollView>
	)
}
