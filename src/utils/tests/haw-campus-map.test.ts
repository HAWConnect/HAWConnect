import { expect, test } from 'bun:test'
import { SEARCH_TYPES } from '@/types/map'
import {
	findHawCampus,
	hawBuildingFeatures,
	hawCampusFeatures,
	hawMapFeatures,
	hawMapLabelFeatures,
	selectHawCampus
} from '../haw-campus-map'

test('provides the four official Hamburg campuses as points without invented rooms or floors', () => {
	const collection = hawCampusFeatures()
	expect(collection.features).toHaveLength(4)
	expect(new Set(collection.features.map((f) => f.id)).size).toBe(4)
	for (const f of collection.features) {
		expect(f.geometry.type).toBe('Point')
		expect(f.properties?.rtype).toBe(SEARCH_TYPES.BUILDING)
		expect(f.properties?.Ebene).toBeUndefined()
		expect(f.properties?.center[0]).toBeGreaterThan(9)
		expect(f.properties?.center[1]).toBeGreaterThan(53)
	}
})
test('selects only verified campus records and keeps stable identities', () => {
	const features = hawCampusFeatures().features
	expect(selectHawCampus(features)?.room).toBe('Berliner Tor')
	expect(findHawCampus('Finkenau')?.address).toBe('Finkenau 35, 22081 Hamburg')
	expect(
		selectHawCampus([{ ...features[0], properties: { campusId: 'invented' } }])
	).toBeUndefined()
})

test('includes real building polygons for every campus and excludes neighbouring institutions', () => {
	const buildings = hawBuildingFeatures().features
	expect(buildings.length).toBeGreaterThanOrEqual(17)
	expect(new Set(buildings.map((f) => f.properties?.campusId)).size).toBe(4)
	for (const f of buildings) {
		expect(f.geometry.type).toBe('Polygon')
		const ring = f.geometry.coordinates[0]
		expect(ring.length).toBeGreaterThan(3)
		expect(ring.at(-1)).toEqual(ring[0])
		expect(f.properties?.source).toMatch(
			/^https:\/\/www.openstreetmap.org\/way\//
		)
	}
	expect(
		buildings.some(
			(f) => f.id === 'osm-way-134644895' || f.id === 'osm-way-180934270'
		)
	).toBe(false)
	const selection = selectHawCampus([
		buildings.find((f) => f.properties?.Raum === 'Berliner Tor 7')!
	])
	expect(selection?.room).toBe('Berliner Tor 7')
})

test('matches official campus PDF codes and facility listings without assigning campus facilities to an individual wing', () => {
	const buildings = hawBuildingFeatures().features
	const bt7 = buildings.find((f) => f.properties?.code === 'BT7')
	expect(bt7?.properties?.pdfListing).toEqual([
		'Café / Mensa',
		'Copy-Shop',
		'Fakultät Elektro-, Medien- und Informationstechnik (EMI)',
		'Fakultät Informatik und Digitale Gesellschaft (INF)'
	])
	expect(bt7?.properties?.mapLabel).toBe('BT7')
	for (const code of ['AL1', 'JU10', 'AS24', 'U20', 'A24', 'F35'])
		expect(buildings.some((f) => f.properties?.code === code)).toBe(true)
	for (const f of buildings.filter((f) =>
		['F35', 'U20'].includes(f.properties?.code)
	))
		expect(f.properties?.listingScope).toBe('campus')
	expect(
		buildings.every(
			(f) =>
				Array.isArray(f.properties?.pdfListing) &&
				f.properties.pdfListing.length > 0
		)
	).toBe(true)
})

test('Finkenau uses a single F35 map label and shared selection identity across its footprints', () => {
	const features = hawBuildingFeatures().features.filter(
		(f) => f.properties?.campusId === 'finkenau'
	)
	expect(features).toHaveLength(2)
	expect(new Set(features.map((f) => f.properties?.Raum))).toEqual(
		new Set(['Finkenau 35'])
	)
	expect(features[0].properties?.center).toEqual(features[1].properties?.center)
	expect(
		hawMapLabelFeatures(hawMapFeatures()).features.filter(
			(f) => f.properties?.campusId === 'finkenau'
		)
	).toHaveLength(1)
	expect(selectHawCampus([features[1]])?.room).toBe('Finkenau 35')
})
