import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CalendarSnapshot } from '@/types/imported-calendar'
import { replaceCalendar } from '@/utils/ical-import'
import { zustandStorage } from '@/utils/storage'

interface ImportedCalendarStore {
	calendars: CalendarSnapshot[]
	upsert: (calendar: CalendarSnapshot) => void
	remove: (id: string) => void
}
export const useImportedCalendarStore = create<ImportedCalendarStore>()(
	persist(
		(set) => ({
			calendars: [],
			upsert: (next) =>
				set((state) => ({ calendars: replaceCalendar(state.calendars, next) })),
			remove: (id) =>
				set((state) => ({
					calendars: state.calendars.filter((c) => c.id !== id)
				}))
		}),
		{
			name: 'hawconnect-imported-calendars-v1',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
