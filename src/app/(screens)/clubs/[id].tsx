import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import RichClubDescription from '@/components/Clubs/rich-club-description'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useHawClubs } from '@/hooks/useHawClubs'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { safeClubUrl } from '@/utils/club-rich-text'

export default function ClubDetailScreen(): React.JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { t } = useTranslation('common')
	const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useHawClubs()
	const paddingTop = useTransparentHeaderPadding() + 12
	useFocusEffect(
		useCallback(() => {
			if (Date.now() - dataUpdatedAt > 60_000) void refetch()
		}, [dataUpdatedAt, refetch])
	)
	const club = data?.clubs.find((item) => item.id === id)
	if (isLoading)
		return (
			<View className="flex-1 items-center justify-center">
				<LoadingIndicator />
			</View>
		)
	if (!data?.available || !club)
		return (
			<ErrorView
				title={t(
					data?.available ? 'pages.clubs.notFound' : 'pages.clubs.unavailable'
				)}
				onRefresh={() => void refetch()}
				refreshing={isFetching}
			/>
		)

	const source = safeClubUrl(club.sourceUrl)
	return (
		<>
			<Stack.Screen options={{ title: club.title }} />
			<ScrollView
				testID="club-detail-screen"
				className="flex-1"
				contentContainerClassName="px-page pb-bottom-safe gap-4"
				contentContainerStyle={{ paddingTop }}
				refreshControl={
					<RefreshControl
						refreshing={isFetching}
						onRefresh={() => void refetch()}
					/>
				}
			>
				<Text
					accessibilityRole="header"
					className="text-text text-2xl font-bold"
				>
					{club.title}
				</Text>
				{data.stale && (
					<Text className="text-label text-sm">{t('pages.clubs.cached')}</Text>
				)}
				<RichClubDescription
					html={club.descriptionHtml}
					fallback={club.description}
				/>
				{club.links.map((link) => {
					const url = safeClubUrl(link.url)
					return url ? (
						<Pressable
							key={url}
							accessibilityRole="link"
							onPress={() => void Linking.openURL(url).catch(() => {})}
							className="py-3"
						>
							<Text className="text-primary">{link.title} ↗</Text>
						</Pressable>
					) : null
				})}
				{source && (
					<Pressable
						accessibilityRole="link"
						onPress={() => void Linking.openURL(source).catch(() => {})}
						className="py-3"
					>
						<Text className="text-primary">{t('pages.clubs.open')} ↗</Text>
					</Pressable>
				)}
			</ScrollView>
		</>
	)
}
