import type { FeatureCollection } from 'geojson'
import { use, useEffect, useMemo } from 'react'
import { MapContext } from '@/contexts/map'
import type { NormalizedLecturer } from '@/types/utils'
import { hawMapLabelFeatures } from '@/utils/haw-campus-map'
import type { loadTimetable } from '@/utils/timetable-utils'
import { useMapOverlayQuery } from './useMapOverlayQuery'
/** HAW public campus adapter; no university login, room occupancy or upstream university calls. */
export function useMapQueries() {
	const { setNextLecture, setAvailableRooms, setRoomOpenings } = use(MapContext)
	const { data, error } = useMapOverlayQuery()
	useEffect(() => {
		setNextLecture([])
		setAvailableRooms(null)
		setRoomOpenings(null)
	}, [setNextLecture, setAvailableRooms, setRoomOpenings])
	const allRooms = useMemo<FeatureCollection>(
		() => data ?? { type: 'FeatureCollection', features: [] },
		[data]
	)
	return {
		mapOverlay: data,
		overlayError: error,
		timetable: undefined as
			| Awaited<ReturnType<typeof loadTimetable>>
			| undefined,
		lecturers: undefined as NormalizedLecturer[] | undefined,
		allRooms,
		buildingGeoJSON: hawMapLabelFeatures(allRooms)
	}
}
