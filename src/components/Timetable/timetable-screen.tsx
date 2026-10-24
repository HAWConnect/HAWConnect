import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TimetableList from '@/components/Timetable/timetable-list'
import TimetableWeek from '@/components/Timetable/timetable-week'
import Button from '@/components/Universal/button'
import { useImportedCalendarStore } from '@/hooks/useImportedCalendarStore'
import { TimetableMode, useTimetableStore } from '@/hooks/useTimetableStore'
import { expandCalendar } from '@/utils/ical-import'
import { toFriendlyTimetable } from '@/utils/imported-timetable-adapter'

export const loadTimetable = async () => {
	const now = Date.now()
	return toFriendlyTimetable(
		useImportedCalendarStore
			.getState()
			.calendars.flatMap((c) =>
				expandCalendar(
					c,
					new Date(now - 180 * 86400000),
					new Date(now + 365 * 86400000)
				)
			)
	)
}

export default function TimetableScreen(): React.JSX.Element {
	const { t } = useTranslation(['timetable', 'navigation'])
	const calendars = useImportedCalendarStore((s) => s.calendars)
	const mode = useTimetableStore((s) => s.timetableMode)
	const selectedDate = useTimetableStore((s) => s.selectedDate)
	const [showAllDay, setShowAllDay] = useState(false)
	const { events, error } = useMemo(() => {
		try {
			const date = new Date(selectedDate).getTime()
			return {
				events: calendars.flatMap((c) =>
					expandCalendar(
						c,
						new Date(date - 31 * 86400000),
						new Date(date + 62 * 86400000)
					)
				),
				error: false
			}
		} catch {
			return { events: [], error: true }
		}
	}, [calendars, selectedDate])
	const timetable = useMemo(() => toFriendlyTimetable(events), [events])
	const allDay = events.filter((e) => e.allDay)
	return (
		<SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
			<View className="px-page py-2 gap-2">
				{error && (
					<Text className="text-notification">{t('import.failed')}</Text>
				)}
				{allDay.length > 0 && (
					<Button
						variant="secondary"
						onPress={() => setShowAllDay(!showAllDay)}
					>{`${t('import.allDay')} (${allDay.length})`}</Button>
				)}
				{showAllDay &&
					allDay.slice(0, 20).map((e) => (
						<Text key={e.key} className="text-text">
							{e.title} · {e.start} → {e.end} ({t('import.allDay')})
						</Text>
					))}
			</View>
			{calendars.length === 0 ? (
				<View className="p-page">
					<Text className="text-label">{t('import.empty')}</Text>
					<Button
						variant="secondary"
						onPress={() => router.navigate('/timetable-settings')}
					>
						{t('navigation:navigation.timetableSettings')}
					</Button>
				</View>
			) : mode === TimetableMode.List ? (
				<TimetableList timetable={timetable} exams={[]} />
			) : (
				<TimetableWeek timetable={timetable} exams={[]} />
			)}
		</SafeAreaView>
	)
}
