import { router, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Linking, Pressable, Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import RowEntry from '@/components/Universal/row-entry'
import { useHawClubs } from '@/hooks/useHawClubs'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { safeClubUrl } from '@/utils/club-rich-text'
export default function ClubsScreen(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useHawClubs()
	useFocusEffect(
		useCallback(() => {
			if (Date.now() - dataUpdatedAt > 60_000) void refetch()
		}, [dataUpdatedAt, refetch])
	)
	const paddingTop = useTransparentHeaderPadding() + 12
	if (isLoading)
		return (
			<View className="flex-1 items-center justify-center">
				<LoadingIndicator />
			</View>
		)
	if (!data?.available)
		return (
			<ErrorView
				title={t('pages.clubs.unavailable')}
				onRefresh={() => void refetch()}
				refreshing={isFetching}
			/>
		)
	return (
		<View testID="clubs-screen" className="flex-1" style={{ paddingTop }}>
			<FlatList
				data={data.clubs}
				keyExtractor={(item) => item.id}
				contentContainerClassName="px-page pb-bottom-safe gap-2"
				refreshing={isFetching}
				onRefresh={() => void refetch()}
				ListHeaderComponent={
					<View className="py-2">
						<Text className="text-label">{t('pages.clubs.subtitle')}</Text>
						{data.stale && (
							<Text className="text-label text-xs">
								{t('pages.clubs.cached')}
							</Text>
						)}
					</View>
				}
				ListEmptyComponent={
					<Text className="text-label py-4">{t('pages.clubs.empty')}</Text>
				}
				renderItem={({ item }) => (
					<RowEntry
						rightChildren={<Text className="text-primary">›</Text>}
						title={item.title}
						onPress={() =>
							router.push({ pathname: '/clubs/[id]', params: { id: item.id } })
						}
						leftChildren={
							<View className="w-full">
								<Text numberOfLines={5} className="text-label text-sm">
									{item.description}
								</Text>
								{item.links.map((link) => (
									<Pressable
										key={link.url}
										accessibilityRole="link"
										onPress={(event) => {
											event.stopPropagation()
											const url = safeClubUrl(link.url)
											if (url) void Linking.openURL(url).catch(() => {})
										}}
										className="py-2"
									>
										<Text className="text-primary">{link.title} ↗</Text>
									</Pressable>
								))}
							</View>
						}
					/>
				)}
			/>
		</View>
	)
}
