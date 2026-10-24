import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import { CalendarRow } from '@/components/Rows/calendar-row'
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar'
import BaseCard from './base-card'
export default function CalendarCard(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { events, available, isLoading } = useAcademicCalendar()
	return (
		<BaseCard title="calendar" onPressRoute="/calendar">
			{events.slice(0, 2).map((event) => (
				<CalendarRow key={event.id} event={event} />
			))}
			{!events.length && (
				<Text className="text-label text-sm">
					{isLoading
						? t('pages.calendar.academic.loading')
						: !available
							? t('pages.calendar.academic.unavailable')
							: t('pages.calendar.academic.empty')}
				</Text>
			)}
		</BaseCard>
	)
}
