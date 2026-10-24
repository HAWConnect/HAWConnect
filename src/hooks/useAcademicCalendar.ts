import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import HAWConnectAPI from '@/api/hawconnect-api'
import type { Calendar } from '@/types/data'
export function useAcademicCalendar() {
	const query = useQuery({
		queryKey: ['haw-academic-calendar', 1],
		queryFn: () => HAWConnectAPI.getAcademicCalendar(),
		staleTime: 3600000,
		gcTime: 86400000,
		retry: 1
	})
	const today = new Date().setHours(0, 0, 0, 0)
	const prepared = useMemo(() => {
		const semesters = (query.data?.semesters ?? [])
			.map((term) => ({
				...term,
				events: term.events
					.map(
						(event) =>
							({
								...event,
								begin: new Date(event.begin + 'T00:00:00'),
								end: event.end ? new Date(event.end + 'T23:59:59') : undefined
							}) as Calendar
					)
					.filter((event) => (event.end ?? event.begin).getTime() >= today)
					.sort((a, b) => a.begin.getTime() - b.begin.getTime())
			}))
			.filter((term) => term.events.length)
		return { semesters, events: semesters.flatMap((term) => term.events) }
	}, [query.data, today])
	return {
		...query,
		...prepared,
		available: query.data?.available ?? false
	}
}
