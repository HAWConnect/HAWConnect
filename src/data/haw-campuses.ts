import type { MapCoordinate } from '@/types/map'
export interface HawCampus {
	id: string
	label: string
	name: { de: string; en: string }
	address: string
	coordinates: MapCoordinate
	mapPDF: string
	coordinateSource: string
}
export const HAW_LOCATIONS_URL = {
	de: 'https://www.haw-hamburg.de/hochschule/standorte/',
	en: 'https://www.haw-hamburg.de/en/university/locations/'
}
const documents =
	'https://www.haw-hamburg.de/fileadmin/zentrale_PDF/Zentrale_Dokumente/'
// Official campus/address/PDF sources checked 2026-10-23. Points are approximate
// address locations from a one-time Nominatim lookup (OSM/ODbL), not verified entrances.
export const HAW_CAMPUSES: HawCampus[] = [
	{
		id: 'berliner-tor',
		label: 'Berliner Tor',
		name: { de: 'Campus Berliner Tor', en: 'Berliner Tor Campus' },
		address: 'Berliner Tor 5, 20099 Hamburg',
		coordinates: [10.0215785, 53.5564215],
		mapPDF: `${documents}HAW_Hamburg_Lageplan_Campus_Berliner_Tor.pdf`,
		coordinateSource: 'https://www.openstreetmap.org/way/1422087522'
	},
	{
		id: 'bergedorf',
		label: 'Bergedorf',
		name: { de: 'Campus Bergedorf', en: 'Bergedorf Campus' },
		address: 'Ulmenliet 20, 21033 Hamburg',
		coordinates: [10.2004417, 53.4941253],
		mapPDF: `${documents}HAW_Hamburg_Lageplan_Bergedorf.pdf`,
		coordinateSource: 'https://www.openstreetmap.org/node/1774157526'
	},
	{
		id: 'finkenau',
		label: 'Finkenau',
		name: {
			de: 'Kunst- und Mediencampus Hamburg',
			en: 'Hamburg Art and Media Campus'
		},
		address: 'Finkenau 35, 22081 Hamburg',
		coordinates: [10.0331257, 53.568867],
		mapPDF: `${documents}HAW_Hamburg_Lageplan_Kunst_Mediencampus_Hamburg_Campus_Armgartstrasse.pdf`,
		coordinateSource: 'https://www.openstreetmap.org/way/82898724'
	},
	{
		id: 'armgartstrasse',
		label: 'Armgartstraße',
		name: { de: 'Campus Armgartstraße', en: 'Armgartstraße Campus' },
		address: 'Armgartstraße 24, 22087 Hamburg',
		coordinates: [10.0224577, 53.5650967],
		mapPDF: `${documents}HAW_Hamburg_Lageplan_Kunst_Mediencampus_Hamburg_Campus_Armgartstrasse.pdf`,
		coordinateSource: 'https://www.openstreetmap.org/way/44140524'
	}
]
export const HAMBURG_MAP_CENTER: MapCoordinate = [10.095, 53.536]
