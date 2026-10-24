import type { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import buildingData from '@/data/haw-buildings.json'
import { HAW_CAMPUSES } from '@/data/haw-campuses'
import { SEARCH_TYPES } from '@/types/map'
export const findHawCampus = (label: string) =>
	HAW_CAMPUSES.find((campus) => campus.label === label)
export function hawCampusFeatures(): FeatureCollection<Point> {
	return {
		type: 'FeatureCollection',
		features: HAW_CAMPUSES.map((campus) => ({
			type: 'Feature',
			id: campus.id,
			geometry: { type: 'Point', coordinates: campus.coordinates },
			properties: {
				campusId: campus.id,
				Raum: campus.label,
				Gebaeude: campus.label,
				Standort: campus.label,
				Funktion_de: campus.address,
				Funktion_en: campus.address,
				rtype: SEARCH_TYPES.BUILDING,
				center: campus.coordinates,
				icon: { ios: 'building.2', android: 'apartment', web: 'Building' }
			}
		}))
	}
}
export function selectHawCampus(features: Feature[] | undefined) {
	const building = features
		?.map((f) => findHawBuilding(String(f.properties?.Raum ?? '')))
		.find(Boolean)
	if (building)
		return {
			room: String(building.properties?.Raum),
			center: building.properties?.center as [number, number]
		}

	const feature = features?.find((f) =>
		HAW_CAMPUSES.some((c) => c.id === f.properties?.campusId)
	)
	const campus = HAW_CAMPUSES.find(
		(c) => c.id === feature?.properties?.campusId
	)
	return campus ? { room: campus.label, center: campus.coordinates } : undefined
}

export function hawBuildingFeatures(): FeatureCollection<Polygon> {
	return {
		type: 'FeatureCollection',
		features: (buildingData as FeatureCollection<Polygon>).features.map(
			(feature) => {
				const ring = feature.geometry.coordinates[0]
				const center: [number, number] = [
					(Math.min(...ring.map((p) => p[0])) +
						Math.max(...ring.map((p) => p[0]))) /
						2,
					(Math.min(...ring.map((p) => p[1])) +
						Math.max(...ring.map((p) => p[1]))) /
						2
				]
				const p = feature.properties!
				return {
					...feature,
					properties: {
						...p,
						Raum: p.label,
						mapLabel: p.code,
						Gebaeude: p.label,
						Standort: p.campusId,
						Funktion_de: p.address,
						Funktion_en: p.address,
						rtype: SEARCH_TYPES.BUILDING,
						center: p.groupCenter ?? center,
						icon: { ios: 'building.2', android: 'apartment', web: 'Building' }
					}
				}
			}
		)
	}
}
export const findHawBuilding = (label: string) =>
	hawBuildingFeatures().features.find(
		(feature) => feature.properties?.Raum === label
	)
export function hawMapFeatures(): FeatureCollection {
	return {
		type: 'FeatureCollection',
		features: [
			...hawCampusFeatures().features,
			...hawBuildingFeatures().features
		]
	}
}

export function hawMapLabelFeatures(
	collection: FeatureCollection
): FeatureCollection<Point> {
	return {
		type: 'FeatureCollection',
		features: collection.features
			.filter(
				(f) =>
					!f.properties?.hideMapLabel &&
					!(
						f.geometry.type === 'Point' && f.properties?.campusId === 'finkenau'
					)
			)
			.map((f) => ({
				...f,
				geometry: {
					type: 'Point',
					coordinates: f.properties?.center as number[]
				}
			}))
	}
}
