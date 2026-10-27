import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import HAWConnectAPI from '@/api/hawconnect-api'
export function useHawClubs() {
	const { i18n } = useTranslation()
	const language = i18n.language.startsWith('de') ? 'de' : 'en'
	return useQuery({
		queryKey: ['haw-clubs', language],
		queryFn: () => HAWConnectAPI.getHawClubs(language),
		// Refetch stale directory data when a screen mounts/focuses, without polling.
		staleTime: 60_000,
		gcTime: 86400000,
		retry: 1
	})
}
