import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import HAWConnectAPI from '@/api/hawconnect-api'
export function useHawClubs() {
	const { i18n } = useTranslation()
	const language = i18n.language.startsWith('de') ? 'de' : 'en'
	return useQuery({
		queryKey: ['haw-clubs', language],
		queryFn: () => HAWConnectAPI.getHawClubs(language),
		staleTime: 3600000,
		gcTime: 86400000,
		retry: 1
	})
}
