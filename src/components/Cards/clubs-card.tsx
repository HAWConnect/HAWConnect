import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import BaseCard from './base-card'
export default function ClubsCard(): React.JSX.Element {
	const { t } = useTranslation('common')
	return (
		<BaseCard title="clubs" onPressRoute="/clubs">
			<Text className="text-label text-sm">{t('pages.clubs.subtitle')}</Text>
		</BaseCard>
	)
}
