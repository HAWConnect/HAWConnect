import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import { quicklinks } from '@/data/constants'
import { guardedFetch } from '@/utils/integration-utils'
import {
	type AppQuickLink,
	parseManagedQuickLinks
} from '@/utils/managed-quick-links'

async function getQuickLinks() {
	const url = new URL(
		'/api/quick-links',
		process.env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT ??
			'http://localhost:4000/graphql'
	)
	const response = await guardedFetch(url, {
		credentials: 'omit',
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(15000)
	})
	if (!response.ok) throw Error('QuickLinksUnavailable')
	const text = await response.text()
	if (text.length > 524288) throw Error('InvalidQuickLinks')
	return parseManagedQuickLinks(JSON.parse(text))
}
export function useQuickLinks(): AppQuickLink[] {
	const query = useQuery({
		queryKey: ['haw-quick-links', 1],
		queryFn: getQuickLinks,
		staleTime: 60000,
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
	return query.data?.managed ? query.data.links : (quicklinks as AppQuickLink[])
}
