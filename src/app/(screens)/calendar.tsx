import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'
import CalendarEventsPage from '@/components/Calendar/calendar-events-page'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
export default function CalendarPage(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { event } = useLocalSearchParams<{ event?: string }>()
	const headerPadding = useTransparentHeaderPadding() + 12
	return (
		<View
			testID="calendar-screen"
			className="flex-1"
			style={{ paddingTop: headerPadding }}
		>
			<CalendarEventsPage
				selectedEventId={event}
				handleLinkPress={() =>
					void Linking.openURL(t('pages.calendar.calendar.link'))
				}
			/>
		</View>
	)
}
