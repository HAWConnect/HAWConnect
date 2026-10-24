import type { FeatureCollection } from 'geojson'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import type { SelectMapElement } from '@/types/map'
import ResultRow from './search-result-row'
export default function CampusSuggestions({
	allRooms,
	selectMapElement
}: {
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
}): React.JSX.Element {
	const { t } = useTranslation('common')
	return (
		<View testID="map-campus-list" className="mb-2.5">
			<Text className="text-label-secondary text-base font-semibold mb-0.5 pt-2">
				{t('pages.map.haw.campuses')}
			</Text>
			{allRooms.features
				.filter((feature) => feature.geometry?.type === 'Point')
				.map((item) => (
					<ResultRow
						key={item.id}
						result={{
							title: String(item.properties?.Raum),
							subtitle: String(item.properties?.Funktion_en),
							item
						}}
						selectMapElement={selectMapElement}
						updateSearchHistory={() => {}}
					/>
				))}
		</View>
	)
}
