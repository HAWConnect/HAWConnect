import { LocationManager } from '@maplibre/maplibre-react-native'
import { toast } from 'burnt'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import NativeMapCanvas from '@/components/Map/map-canvas.native'
import { OsmCopyright } from '@/components/Map/osm-copyright'
import { DETAIL_HIDDEN } from '@/components/Map/sheet-detents'
import { useMapScreenChrome } from '@/hooks/useMapScreenChrome'
import { LoadingState } from '@/utils/ui-utils'
import MapLoadNotice from './map-load-notice'
import { SheetActionButton } from './sheet-action-button'

const MapScreen = (): React.JSX.Element => {
	const [mapKey, setMapKey] = useState(0)
	const [disableFollowUser, setDisableFollowUser] = useState(false)
	const [locationPermissionGranted, setLocationPermissionGranted] =
		useState(false)
	const [locationRequestId, setLocationRequestId] = useState(0)

	const handleTabPress = useCallback(() => {
		setDisableFollowUser(true)
	}, [])

	const {
		t,
		mapLoadState,
		setMapLoadState,
		mapMode,
		primaryColor,
		selectionColor,
		labelColor,
		backgroundColor,
		searchDetents,
		detailDetents,
		searchIndex,
		setSearchIndex,
		currentPosition,
		currentPositionModal,
		showAllFloors,
		toggleShowAllFloors,
		onRegionChange,
		animatedStyles,
		mapCenter,
		overlayError,
		allRooms,
		buildingGeoJSON,
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		clickedElement,
		currentFloor,
		selectMapElement,
		roomData,
		allSections,
		detailIndex,
		handleDetailIndexChange,
		cameraResetRequestId,
		focusPaddingBottom
	} = useMapScreenChrome({ onTabPress: handleTabPress })

	useEffect(() => {
		if (clickedElement !== null) {
			setDisableFollowUser(true)
		}
	}, [clickedElement])

	const handleLocate = useCallback(async () => {
		const granted =
			locationPermissionGranted ||
			(await LocationManager.requestPermissions().catch(() => false))
		setLocationPermissionGranted(granted)
		if (!granted) {
			toast({ title: t('pages.map.haw.locationDenied'), preset: 'error' })
			return
		}
		setDisableFollowUser(false)
		setLocationRequestId((previous) => previous + 1)
		handleDetailIndexChange(DETAIL_HIDDEN)
	}, [handleDetailIndexChange, locationPermissionGranted, t])

	const handleRefresh = useCallback(() => {
		setMapLoadState(LoadingState.LOADING)
		setMapKey((prev) => prev + 1)
	}, [setMapLoadState])

	return (
		<View testID="map-screen" className="flex-1">
			<MapLoadNotice state={mapLoadState} onRetry={handleRefresh} />

			<View testID="map-canvas" className="flex-1">
				<NativeMapCanvas
					mapKey={mapKey}
					cameraResetRequestId={cameraResetRequestId}
					mapLoadState={mapLoadState}
					setMapLoadState={setMapLoadState}
					mapCenter={mapCenter}
					filteredGeoJSON={filteredGeoJSON}
					availableFilteredGeoJSON={availableFilteredGeoJSON}
					buildingGeoJSON={buildingGeoJSON}
					clickedElement={clickedElement}
					selectMapElement={selectMapElement}
					mapMode={mapMode}
					primaryColor={primaryColor}
					selectionColor={selectionColor}
					labelColor={labelColor}
					backgroundColor={backgroundColor}
					locationPermissionGranted={locationPermissionGranted}
					locationRequestId={locationRequestId}
					disableFollowUser={disableFollowUser}
					onRegionChange={onRegionChange}
					focusPaddingBottom={focusPaddingBottom}
					overlayFloor={currentFloor?.floor ?? 'EG'}
				/>
				<View className="absolute right-4 top-4">
					<SheetActionButton
						testID="map-current-location"
						accessibilityLabel={t('pages.map.haw.locate')}
						onPress={() => void handleLocate()}
						iosFilledSymbol="location.circle.fill"
						androidName="my_location"
						webName="Locate"
					/>
				</View>
				{overlayError === null && uniqueEtages.length > 0 && (
					<FloorPicker
						floors={uniqueEtages}
						showAllFloors={showAllFloors}
						toggleShowAllFloors={toggleShowAllFloors}
						locationPermissionGranted={locationPermissionGranted}
						onLocate={handleLocate}
					/>
				)}
			</View>

			{mapLoadState === LoadingState.LOADED && (
				<OsmCopyright style={animatedStyles} />
			)}
			<MapBottomSheet
				index={searchIndex}
				onIndexChange={setSearchIndex}
				detents={searchDetents}
				currentPosition={currentPosition}
				allRooms={allRooms}
				selectMapElement={selectMapElement}
			/>

			<BottomSheetDetailModal
				index={detailIndex}
				onIndexChange={handleDetailIndexChange}
				detents={detailDetents}
				currentPositionModal={currentPositionModal}
				roomData={roomData}
				modalSection={allSections}
			/>
		</View>
	)
}

export default MapScreen
