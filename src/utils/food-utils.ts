import { trackEvent } from '@aptabase/react-native'
import type { i18n, TFunction } from 'i18next'
import { Platform } from 'react-native'
import { getFragmentData } from '@/__generated__/gql'
import { FoodFieldsFragmentDoc } from '@/__generated__/gql/graphql'
import HAWConnectAPI from '@/api/hawconnect-api'
import allergenMap from '@/data/allergens.json'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import flapMap from '@/data/mensa-flags.json'
import type { FoodLanguage } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import appI18n from '@/localization/i18n'
import type { Food, Meal, Name } from '@/types/hawconnect-api'
import type { Labels, Prices } from '@/types/utils'
import { getMealRouteId } from '@/utils/food-display'
import { getPublishedFoodDays } from '@/utils/food-source-utils'
import { mealWarningCodes } from '@/utils/hamburg-food-labels'
import { copyToClipboard, shareNative } from './ui-utils'

export const humanLocations = {
	BerlinerTorMensa: 'Mensa Berliner Tor',
	BergedorfMensa: 'Mensa Bergedorf',
	FinkenauMensa: 'Mensa Finkenau'
}
export const FOOD_DETAIL_RESTAURANTS = [
	'BerlinerTorMensa',
	'BergedorfMensa',
	'FinkenauMensa'
] as const
export const foodDataSources = {
	BerlinerTorMensa: 'https://www.stwhh.de/speiseplan',
	BergedorfMensa: 'https://www.stwhh.de/speiseplan',
	FinkenauMensa: 'https://www.stwhh.de/speiseplan'
} as const
export const foodRestaurantLocations = {} as Record<string, string>

export function capitalizeRestaurant(
	restaurant: string | null | undefined
): string {
	if (restaurant == null) {
		return ''
	}
	return restaurant.charAt(0).toUpperCase() + restaurant.slice(1)
}

/**
 * Fetches and parses the meal plan
 * @param {string[]} restaurants Requested restaurants
 * @returns {object[]}
 */
export async function loadFoodEntries(
	restaurants: string[],
	includeStatic = false,
	language = appI18n.language.startsWith('en') ? 'en' : 'de'
): Promise<Food[]> {
	const foodData = (await HAWConnectAPI.getFoodPlan(restaurants, language)).food
	const days = getFragmentData(FoodFieldsFragmentDoc, foodData).foodData ?? []
	return getPublishedFoodDays(
		days.map((day) => ({
			timestamp: day.timestamp,
			meals: (day.meals ?? []).filter(
				(meal) => includeStatic || !meal.static
			) as unknown as Meal[]
		})),
		true
	)
}

/**
 * Converts an array of allergens to a string of relevant allergens
 * @param {string[]} allergens Array of allergens
 * @param {string[]} selectedAllergens Array of selected allergens
 * @returns {string} String of relevant allergens
 */
export function convertRelevantAllergens(
	allergens: string[],
	selectedAllergens: string[],
	language: string
): string {
	const relevantAllergens = allergens?.filter((allergen) =>
		selectedAllergens?.includes(allergen)
	)
	const convertedAllergens = relevantAllergens?.map(
		(allergen) =>
			allergenMap[allergen as keyof typeof allergenMap]?.[
				language as LanguageKey
			] ?? allergen
	)
	return convertedAllergens?.join(' • ')
}

/**
 * Converts an array of flags to an array of relevant flags
 * @param {string[]} flags Array of flags
 * @param {string[]} selectedFlags Array of selected flags
 * @param {string} language selected language from `i18n.language`
 * @returns {string[]} Array of relevant flags
 */
export function convertRelevantFlags(
	flags: string[],
	selectedFlags: string[],
	language: string
): { name: string; isVeg: boolean }[] {
	const relevantFlags = flags?.filter((flag) => selectedFlags?.includes(flag))
	return relevantFlags?.map((flag) => ({
		isVeg:
			(flag as keyof typeof flapMap) === 'veg' ||
			(flag as keyof typeof flapMap) === 'V',
		name:
			flapMap[flag as keyof typeof flapMap]?.[language as LanguageKey] ?? flag
	}))
}

/**
 * Formats a price to a string with euro sign
 * @param {number} price Price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(
	price?: number | null,
	language = appI18n.language
): string {
	return price != null
		? new Intl.NumberFormat(language, {
				style: 'currency',
				currency: 'EUR'
			}).format(price)
		: ''
}

/**
 * Formats a price according to the users group (student, employee or guest).
 * @param {object} meal Parsed meal object
 * @param {string} userKind User group (student, employee or guest)
 * @returns {string}
 */
export function getUserSpecificPrice(meal: Meal, userKind: string): string {
	const prices: Prices = {
		guest: meal.prices.guest,
		employee: meal.prices.employee,
		student: meal.prices.student
	}
	return formatPrice(prices[userKind])
}

/**
 * Returns a label according to the users group (student, employee or guest).
 * @param {string} userKind User group (student, employee or guest)
 * @returns {string}
 */

export function getUserSpecificLabel(
	userKind: string,
	t: TFunction<'food'>
): string {
	const labels: Labels = {
		[USER_GUEST]: t('price.guests', { ns: 'food' }),
		[USER_EMPLOYEE]: t('price.employees', { ns: 'food' }),
		[USER_STUDENT]: t('price.students', { ns: 'food' })
	}
	return labels[userKind]
}

/**
 * Returns the name of a meal in the correct language.
 * @param mealName Array with the name of the meal in different languages (de, en)
 * @param {FoodLanguage} foodLang Food language set by the user (de, en, default)
 * @param {LanguageKey} i18nLang Language set by the user (de, en)
 * @returns
 */
export function mealName(
	mealName: Name,
	foodLang: FoodLanguage,
	i18nLang: LanguageKey
): string {
	if (foodLang !== 'default') {
		return mealName[foodLang]
	}
	return mealName[i18nLang]
}

/**
 * Calculates the rating of a meal for the current user. The rating is based on the user's allergen and preference selection.
 * @param meal  - The meal to calculate the rating for.
 * @returns A number representing the rating of the meal.
 */
export function userMealRating(
	meal: Meal,
	allergenSelection: string[],
	preferencesSelection: string[]
): number {
	if (mealWarningCodes(meal).some((x) => allergenSelection.includes(x))) {
		return -1
	}
	if (meal.flags?.some((x) => preferencesSelection.includes(x)) ?? false) {
		return 2
	}
	if (meal.allergens == null && allergenSelection !== null) {
		return 0
	}
	return 1
}

export function shareMeal(
	meal: Meal,
	i18n: i18n,
	userKind: 'guest' | 'employee' | 'student'
): void {
	trackEvent('Share', {
		type: 'meal'
	})
	const message = i18n.t('details.share.message', {
		ns: 'food',
		meal: meal?.name[i18n.language as LanguageKey],
		price: formatPrice(meal.prices[userKind ?? USER_GUEST]),
		location:
			meal?.restaurant != null
				? humanLocations[meal.restaurant as keyof typeof humanLocations]
				: i18n.t('misc.unknown', { ns: 'common' }),

		id: getMealRouteId(meal.id)
	})

	if (Platform.OS === 'web') {
		void copyToClipboard(message)
		return
	}

	void shareNative({
		message
	})
}
