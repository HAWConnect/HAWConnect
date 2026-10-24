import { useState } from 'react'
import { View } from 'react-native'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import WebMapCanvas from '@/components/Map/map-canvas.web'
import { OsmCopyright } from '@/components/Map/osm-copyright'
import { useMapScreenChrome } from '@/hooks/useMapScreenChrome'
import { LoadingState } from '@/utils/ui-utils'
import MapLoadNotice from './map-load-notice'

const MapScreen = (): React.JSX.Element => {
	const [mapKey, setMapKey] = useState(0)
	const {
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
	} = useMapScreenChrome()

	const handleRefresh = () => {
		setMapLoadState(LoadingState.LOADING)
		setMapKey((key) => key + 1)
	}

	return (
		<View testID="map-screen" className="flex-1">
			<MapLoadNotice state={mapLoadState} onRetry={handleRefresh} />

			<WebMapCanvas
				key={mapKey}
				setMapLoadState={setMapLoadState}
				mapLoadState={mapLoadState}
				cameraResetRequestId={cameraResetRequestId}
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
				onRegionChange={onRegionChange}
				focusPaddingBottom={focusPaddingBottom}
				overlayFloor={currentFloor?.floor ?? 'EG'}
			/>
			{overlayError === null && uniqueEtages.length > 0 && (
				<FloorPicker
					floors={uniqueEtages}
					showAllFloors={showAllFloors}
					toggleShowAllFloors={toggleShowAllFloors}
				/>
			)}
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
