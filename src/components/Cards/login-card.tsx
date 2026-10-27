import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useImportedCalendarStore } from '@/hooks/useImportedCalendarStore'
import BaseCard from './base-card'
import ImportedClassesCard from './imported-classes-card'

const LoginCard = (): React.JSX.Element => {
	const { t } = useTranslation('navigation')
	const hasCalendar = useImportedCalendarStore(
		(state) => state.calendars.length > 0
	)
	if (hasCalendar) return <ImportedClassesCard />
	return (
		<BaseCard title="login" onPressRoute="/calendar-import">
			<View className="gap-3 pt-2.5">
				<View>
					<Text className="text-text text-base font-medium">
						{t('cards.login.title')}
					</Text>
					<Text className="text-label text-[15px]">
						{t('cards.login.message')}
					</Text>
				</View>
			</View>
		</BaseCard>
	)
}

export default LoginCard
