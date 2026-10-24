import { useQuery } from '@tanstack/react-query'
import { hawMapFeatures } from '@/utils/haw-campus-map'
export const MAP_OVERLAY_QUERY_KEY = ['hawCampusMap', 3] as const
export function useMapOverlayQuery() {
	return useQuery({
		queryKey: MAP_OVERLAY_QUERY_KEY,
		queryFn: async () => hawMapFeatures(),
		initialData: hawMapFeatures,
		staleTime: Number.POSITIVE_INFINITY,
		networkMode: 'always'
	})
}
