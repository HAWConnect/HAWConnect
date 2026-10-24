import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import Button from '@/components/Universal/button'
export default function UnavailableScreen(): React.JSX.Element {
	const { t } = useTranslation('timetable')
	return (
		<View className="flex-1 bg-background p-page gap-4">
			<View className="bg-card border-hairline border-border rounded-base p-4 gap-4">
				<Text className="text-text">{t('import.unavailable')}</Text>
				<Button
					variant="secondary"
					onPress={() => router.navigate('/calendar-import')}
				>
					{t('import.manage')}
				</Button>
			</View>
		</View>
	)
}
