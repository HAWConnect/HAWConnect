import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { Meal } from '@/types/hawconnect-api'
import { getMealSourceId } from '@/utils/food-display'
import { FOOD_DETAIL_RESTAURANTS, loadFoodEntries } from '@/utils/food-utils'

const MEALS_STALE_TIME_MS = 1000 * 60 * 5
const MEALS_GC_TIME_MS = 1000 * 60 * 60 * 24

export interface MealWithDate {
	meal: Meal | undefined
	date: string | undefined
}

export function useMealDetail(id: string): {
	queryData: Awaited<ReturnType<typeof loadFoodEntries>> | undefined
	isLoading: boolean
	error: Error | null
	meal: Meal | undefined
	date: string | undefined
} {
	const { i18n } = useTranslation()
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const language = (foodLanguage === 'default'
		? i18n.language
		: foodLanguage
	).startsWith('en')
		? 'en'
		: 'de'
	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['meals', FOOD_DETAIL_RESTAURANTS, true, language],
		queryFn: () =>
			loadFoodEntries([...FOOD_DETAIL_RESTAURANTS], true, language),
		staleTime: MEALS_STALE_TIME_MS,
		gcTime: MEALS_GC_TIME_MS
	})

	const mealWithDate = queryData?.reduce<MealWithDate>(
		(acc, day) => {
			const meal = day.meals.find((m) => m.id === getMealSourceId(id))
			if (meal) {
				return { meal, date: day.timestamp.toString() }
			}
			return acc
		},
		{ meal: undefined, date: undefined }
	)

	return {
		queryData,
		isLoading,
		error,
		meal: mealWithDate?.meal,
		date: mealWithDate?.date
	}
}
