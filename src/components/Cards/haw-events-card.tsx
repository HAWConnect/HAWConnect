import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import EventItem from '@/components/Universal/event-item'
import { useHawEvents } from '@/hooks/useHawEvents'
import BaseCard from './base-card'
export default function HawEventsCard(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { data, isLoading } = useHawEvents()
	return (
		<BaseCard
			title="hawEvents"
			onPressRoute="/haw-events"
			hasInteractiveContent
		>
			{data?.available && data.events.length > 0 ? (
				<View className="mt-2.5 gap-3">
					{data.events.slice(0, 2).map((event) => (
						<Pressable
							key={event.id}
							onPress={() => void Linking.openURL(event.sourceUrl)}
						>
							{event.origin === 'CLUB' && (
								<Text className="text-primary text-xs">
									{t('pages.hawEvents.club')}
								</Text>
							)}
							<EventItem
								title={event.title}
								location={event.location ?? undefined}
								timeLabel={`${event.dateLabel}${event.timeLabel ? ` · ${event.timeLabel}` : ''}`}
							/>
						</Pressable>
					))}
				</View>
			) : (
				<Text className="text-label text-sm">
					{t(
						isLoading
							? 'pages.hawEvents.loading'
							: !data?.available
								? 'pages.hawEvents.unavailable'
								: 'pages.hawEvents.empty'
					)}
				</Text>
			)}
		</BaseCard>
	)
}
