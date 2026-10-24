import { useFocusEffect } from 'expo-router'
import Head from 'expo-router/head'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import {
	type Edges,
	SafeAreaProvider,
	SafeAreaView
} from 'react-native-safe-area-context'
import MapScreen from '@/components/Map/map-screen'
import { MapContext } from '@/contexts/map'
import type { ClickedMapElement, SearchResult } from '@/types/map'
import type { AvailableRoom, FriendlyTimetableEntry } from '@/types/utils'
import { hawMapFeatures } from '@/utils/haw-campus-map'
import type { RoomOpenings } from '@/utils/map-room-utils'
import { storage } from '@/utils/storage'

export default function MapRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'common'])
	const [hasOpened, setHasOpened] = useState(false)
	useFocusEffect(
		useCallback(() => {
			setHasOpened(true)
		}, [])
	)
	const [clickedElement, setClickedElement] =
		useState<ClickedMapElement | null>(null)
	const [availableRooms, setAvailableRooms] = useState<AvailableRoom[] | null>(
		null
	)
	const [roomOpenings, setRoomOpenings] = useState<RoomOpenings | null>(null)
	const [currentFloor, setCurrentFloor] = useState({
		floor: 'EG',
		manual: false
	})
	const [nextLecture, setNextLecture] = useState<
		FriendlyTimetableEntry[] | null
	>(null)

	const [searchHistory, setSearchHistory] = useState<SearchResult[]>([])
	const updateSearchHistory = (newHistory: SearchResult[]): void => {
		setSearchHistory(newHistory)

		const jsonValue = JSON.stringify(newHistory)
		storage.set('hawCampusSearchHistory-v1', jsonValue)
	}

	const loadSearchHistory = (): void => {
		const jsonValue = storage.getString('hawCampusSearchHistory-v1')
		if (jsonValue != null) {
			try {
				const parsedValue: unknown = JSON.parse(jsonValue)
				const features = hawMapFeatures().features
				const history = Array.isArray(parsedValue)
					? parsedValue.slice(0, 5).flatMap((item) => {
							const feature = features.find(
								(feature) =>
									typeof item?.title === 'string' &&
									feature.properties?.Raum === item.title
							)
							return feature
								? [
										{
											title: String(feature.properties?.Raum),
											subtitle: String(feature.properties?.Funktion_en),
											item: feature
										}
									]
								: []
						})
					: []
				setSearchHistory(history)
			} catch (error) {
				console.info('Failed to parse search history:', error)
			}
		} else {
			setSearchHistory([])
		}
	}
	useEffect(() => {
		void loadSearchHistory()
	}, [])

	const contextValue = {
		clickedElement,
		setClickedElement,
		availableRooms,
		setAvailableRooms,
		roomOpenings,
		setRoomOpenings,
		currentFloor,
		setCurrentFloor,
		nextLecture,
		setNextLecture,
		searchHistory,
		setSearchHistory,
		updateSearchHistory
	}

	const edges =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
			? []
			: ['bottom']
	return (
		<>
			<Head>
				<title>{t('navigation.map')}</title>
				<meta
					name="Campus Map"
					content={t('meta.mapDescription', { ns: 'common' })}
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<View className="bg-background flex-1">
				{hasOpened ? (
					<MapContext.Provider value={contextValue}>
						<SafeAreaProvider>
							<SafeAreaView style={{ flex: 1 }} edges={edges as Edges}>
								<MapScreen />
							</SafeAreaView>
						</SafeAreaProvider>
					</MapContext.Provider>
				) : undefined}
			</View>
		</>
	)
}
