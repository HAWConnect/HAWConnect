import type { MaterialIcon } from '@/types/material-icons'
import type { AllCards } from './all-cards'
import type { LucideIcon } from './Universal/icon'

// Define the type for individual platform icons
interface PlatformIcon {
	ios: string
	iosScale?: number
	android: MaterialIcon
	web: LucideIcon
}

type CardKey = (typeof AllCards)[number]['key']

type CardIcons = Record<CardKey, PlatformIcon>

export const cardIcons: CardIcons = {
	timetable: {
		ios: 'clock.fill',
		iosScale: 1.05,
		android: 'calendar_month',
		web: 'CalendarDays'
	},
	calendar: {
		ios: 'graduationcap.fill',
		android: 'school',
		web: 'GraduationCap'
	},
	events: {
		ios: 'party.popper.fill',
		iosScale: 1.1,
		android: 'celebration',
		web: 'PartyPopper'
	},
	hawEvents: {
		ios: 'building.columns.fill',
		android: 'account_balance',
		web: 'Building'
	},
	clubs: {
		ios: 'person.3.fill',
		android: 'groups',
		web: 'Users'
	},
	news: {
		ios: 'newspaper.fill',
		android: 'newspaper',
		web: 'Newspaper'
	},
	login: {
		ios: 'person.fill.questionmark',
		android: 'person',
		web: 'UserCheck'
	},
	links: {
		ios: 'safari.fill',
		iosScale: 1.05,
		android: 'link',
		web: 'Link'
	}
}
