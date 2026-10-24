import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import { getLegalDocuments } from '@/api/legal-api'
export function useLegalDocuments() {
	const query = useQuery({
		queryKey: ['haw-legal-documents', 1],
		queryFn: getLegalDocuments,
		staleTime: 0,
		gcTime: 60000,
		refetchOnMount: 'always',
		refetchOnWindowFocus: 'always',
		retry: 1
	})
	const { refetch } = query
	useFocusEffect(
		useCallback(() => {
			void refetch()
		}, [refetch])
	)
	useEffect(() => {
		const subscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') void refetch()
		})
		return () => subscription.remove()
	}, [refetch])
	return query
}
