import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, View } from 'react-native'
import Button from '@/components/Universal/button'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { projectLinks } from '@/data/project-links'
import { useLegalDocuments } from '@/hooks/useLegalDocuments'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { type LegalKey, legalTarget } from '@/utils/legal-documents'
export default function LegalDocumentScreen({
	documentKey
}: {
	documentKey: LegalKey
}): React.JSX.Element {
	const { t, i18n } = useTranslation(['settings', 'account'])
	const query = useLegalDocuments()
	const paddingTop = useTransparentHeaderPadding()
	const document = query.data?.find((row) => row.key === documentKey)
	const target = legalTarget(document, i18n.language, projectLinks[documentKey])
	return (
		<ScrollView
			testID={`legal-document-${documentKey}`}
			style={{ paddingTop }}
			contentContainerClassName="px-page pb-bottom-safe pt-4"
		>
			{query.isLoading ? (
				<LoadingIndicator />
			) : query.isError ? (
				<View className="gap-3">
					<Text className="text-text">{t('legal.loadFailed')}</Text>
					<Button onPress={() => void query.refetch()}>
						{t('account:retry')}
					</Button>
				</View>
			) : !target ? (
				<Text className="text-label">{t('legal.notPublished')}</Text>
			) : target.mode === 'external' ? (
				<Button onPress={() => void Linking.openURL(target.url)}>
					{t('legal.openDocument')}
				</Button>
			) : (
				<Text
					testID="legal-document-body"
					className="text-text text-base leading-6"
					selectable
				>
					{target.body}
				</Text>
			)}
		</ScrollView>
	)
}
