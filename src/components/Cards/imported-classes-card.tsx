import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import EventItem from '@/components/Universal/event-item'
import { useImportedCalendarStore } from '@/hooks/useImportedCalendarStore'
import { useNow } from '@/hooks/useNow'
import { upcomingImportedClasses } from '@/utils/upcoming-imported-classes'
import BaseCard from './base-card'

export default function ImportedClassesCard(): React.JSX.Element {
	const { t, i18n } = useTranslation('navigation')
	const calendars = useImportedCalendarStore((state) => state.calendars)
	const now = useNow(true)
	const result = useMemo(
		() => upcomingImportedClasses(calendars, now),
		[calendars, now]
	)
	const locale = i18n.language.startsWith('de') ? 'de-DE' : 'en-GB'
	const date = new Intl.DateTimeFormat(locale, {
		weekday: 'short',
		day: '2-digit',
		month: '2-digit',
		timeZone: 'Europe/Berlin'
	})
	const time = new Intl.DateTimeFormat(locale, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'Europe/Berlin'
	})
	return (
		<BaseCard
			title="timetable"
			testID="dashboard-card-imported-timetable"
			onPressRoute="/timetable"
		>
			<View className="mt-2.5 gap-3">
				{result.events.map((event) => {
					const start = new Date(event.start)
					const end = new Date(event.end)
					const differentDay = date.format(start) !== date.format(end)
					return (
						<EventItem
							key={event.key}
							title={event.title}
							subtitle={
								start <= now ? t('cards.importedClasses.ongoing') : undefined
							}
							timeLabel={`${date.format(start)} · ${time.format(start)}–${differentDay ? `${date.format(end)} ` : ''}${time.format(end)}`}
							location={event.location || undefined}
						/>
					)
				})}
				{result.events.length === 0 && (
					<Text className="text-label text-sm">
						{t(
							result.unavailableCalendars
								? 'cards.importedClasses.unavailable'
								: 'cards.importedClasses.empty'
						)}
					</Text>
				)}
			</View>
		</BaseCard>
	)
}
