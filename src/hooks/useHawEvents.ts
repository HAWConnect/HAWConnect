import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import HAWConnectAPI from '@/api/hawconnect-api'
export function useHawEvents() {
	const { i18n } = useTranslation()
	const language = i18n.language.startsWith('de') ? 'de' : 'en'
	return useQuery({
		queryKey: ['haw-events', 2, language],
		queryFn: () => HAWConnectAPI.getHawEvents(language),
		staleTime: 300000,
		gcTime: 86400000,
		retry: 1
	})
}
