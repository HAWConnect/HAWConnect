import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Linking, Pressable, Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import RowEntry from '@/components/Universal/row-entry'
import { useHawEvents } from '@/hooks/useHawEvents'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { campusLifeFeed } from '@/utils/campus-life-feed'

export default function PublicEventsScreen({
	campusLife = false
}: {
	campusLife?: boolean
}): React.JSX.Element {
	const { t } = useTranslation('common')
	const {
		data: source,
		isLoading,
		isError,
		isFetching,
		refetch
	} = useHawEvents()
	const prefix = campusLife ? 'pages.campusLifeEvents' : 'pages.hawEvents'
	const data =
		source && campusLife ? { ...source, ...campusLifeFeed(source) } : source
	useFocusEffect(
		useCallback(() => {
			if (campusLife) void refetch()
		}, [campusLife, refetch])
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
				title={t(`${prefix}.unavailable`)}
				onRefresh={() => void refetch()}
				refreshing={isFetching}
			/>
		)
	return (
		<View
			testID={campusLife ? 'campus-life-events-screen' : 'haw-events-screen'}
			className="flex-1"
			style={{ paddingTop }}
		>
			<FlatList
				data={data.events}
				keyExtractor={(item) => item.id}
				contentContainerClassName="px-page pb-bottom-safe gap-2"
				refreshing={isFetching}
				onRefresh={() => void refetch()}
				ListHeaderComponent={
					(!campusLife && data.stale) || isError ? (
						<Text className="text-label text-xs py-2">
							{t(`${prefix}.cached`)}
						</Text>
					) : null
				}
				ListEmptyComponent={
					<Text className="text-label py-4">{t(`${prefix}.empty`)}</Text>
				}
				renderItem={({ item }) => (
					<RowEntry
						testID="haw-event-row"
						title={item.title}
						onPress={() => void Linking.openURL(item.sourceUrl)}
						leftChildren={
							<View className="w-full">
								{item.origin === 'CLUB' && (
									<Text className="text-primary text-xs mb-1">
										{t('pages.hawEvents.club')}
									</Text>
								)}
								<Text className="text-label text-sm">
									{item.dateLabel}
									{item.timeLabel ? ` · ${item.timeLabel}` : ''}
								</Text>
								{item.location && (
									<Text className="text-label text-sm mt-1">
										{item.location}
									</Text>
								)}
							</View>
						}
						rightChildren={
							<Text
								accessibilityLabel={t('pages.hawEvents.open')}
								className="text-primary text-lg"
							>
								↗
							</Text>
						}
					/>
				)}
				ListFooterComponent={
					campusLife ? null : (
						<Pressable
							testID="haw-events-source"
							accessibilityRole="link"
							onPress={() => void Linking.openURL(data.sourceUrl)}
							className="py-4"
						>
							<Text className="text-primary text-sm">
								{t(
									data.truncated
										? 'pages.hawEvents.more'
										: 'pages.hawEvents.source'
								)}
							</Text>
						</Pressable>
					)
				}
			/>
		</View>
	)
}
