import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import BaseCard from './base-card'
export default function UnavailableCard(): React.JSX.Element {
	const { t } = useTranslation('timetable')
	return (
		<BaseCard title="news" onPressRoute="/news">
			<Text className="text-label text-sm">{t('import.unavailable')}</Text>
		</BaseCard>
	)
}
