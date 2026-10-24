import type React from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import type { Food, Meal } from '@/types/hawconnect-api'
import { toColor } from '@/utils/uniwind-utils'
import { EmptyFoodAnimation } from './empty-food-animation'

import { MealEntry } from './meal-entry'

const sortCategoriesByPriority = (categories: string[]): string[] => {
	const categoryPriority: Record<string, number> = {
		main: 1,
		side: 2,
		dessert: 3,
		soup: 4
	}

	return [...categories].sort((a, b) => {
		const priorityA = categoryPriority[a] || 10
		const priorityB = categoryPriority[b] || 10

		if (priorityA === priorityB) {
			return a.localeCompare(b)
		}
		return priorityA - priorityB
	})
}

const MealGroup = ({
	group
}: {
	group: Record<string, Meal[]>
}): React.JSX.Element => {
	const sortedCategories = sortCategoriesByPriority(Object.keys(group))

	return (
		<>
			{sortedCategories.map((key) => (
				<MealCategory key={key} category={key} meals={group[key]} />
			))}
		</>
	)
}

const MealCategory = ({
	category,
	meals
}: {
	category: string
	meals: Meal[]
}): React.JSX.Element => {
	const [collapsed, setCollapsed] = useState(false)
	const { t } = useTranslation('food')
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	const toggleCollapsed = (): void => {
		setCollapsed(!collapsed)
	}

	return (
		<View style={styles.categoryContainerCollapsed}>
			<Pressable
				onPress={() => {
					toggleCollapsed()
				}}
				style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
				hitSlop={{ top: 6, bottom: 6 }}
			>
				<View style={styles.categoryContainer}>
					<Text className="text-label text-[15px] font-medium">
						{t(`categories.${category}`, category)}
					</Text>
					<PlatformIcon
						ios={{
							name: collapsed ? 'chevron.down' : 'chevron.up',
							size: 13,
							weight: 'semibold'
						}}
						android={{
							name: collapsed ? 'expand_more' : 'expand_less',
							size: 20
						}}
						web={{
							name: collapsed ? 'ChevronDown' : 'ChevronUp',
							size: 20
						}}
						style={{ color: primaryColor, alignSelf: 'center', marginRight: 4 }}
					/>
				</View>
			</Pressable>
			<Collapsible collapsed={collapsed}>
				{meals.map((meal: Meal, index: number) => (
					<MealEntry key={`${meal.id}-${index}`} meal={meal} />
				))}
			</Collapsible>
		</View>
	)
}

const filterMealsByRestaurant = (meals: Meal[], restaurant: string): Meal[] => {
	return meals.filter((meal: Meal) => meal.restaurant === restaurant)
}

const groupMealsByCategory = (meals: Meal[]): Record<string, Meal[]> => {
	return meals.reduce((r: Record<string, Meal[]>, a: Meal) => {
		const category = a.category
		if (Object.hasOwn(r, category)) {
			r[category].push(a)
		} else {
			r[category] = [a]
		}
		return r
	}, {})
}

interface RestaurantSectionProps {
	title: string
	meals: Meal[]
	groupedMeals: Record<string, Meal[]>
}

const RestaurantSection = ({
	title,
	meals,
	groupedMeals
}: RestaurantSectionProps): React.JSX.Element | null => {
	if (meals.length === 0) {
		return null
	}

	return (
		<View>
			<Text className="text-text text-lg font-bold pb-[3px] pt-3">{title}</Text>
			<MealGroup group={groupedMeals} />
		</View>
	)
}

export const MealDay = ({ day }: { day: Food }): React.JSX.Element => {
	const mealData = useMemo(() => {
		const berlinerTorMensa = filterMealsByRestaurant(
			day.meals,
			'BerlinerTorMensa'
		)
		const bergedorfMensa = filterMealsByRestaurant(day.meals, 'BergedorfMensa')
		const finkenauMensa = filterMealsByRestaurant(day.meals, 'FinkenauMensa')

		return {
			berlinerTorMensa,
			bergedorfMensa,
			finkenauMensa,
			berlinerTorMensaGrouped: groupMealsByCategory(berlinerTorMensa),
			bergedorfMensaGrouped: groupMealsByCategory(bergedorfMensa),
			finkenauMensaGrouped: groupMealsByCategory(finkenauMensa),
			isEmpty:
				berlinerTorMensa.length === 0 &&
				finkenauMensa.length === 0 &&
				bergedorfMensa.length === 0
		}
	}, [day.meals])

	if (mealData.isEmpty) {
		return <EmptyFoodAnimation />
	}

	return (
		<View style={styles.foodContainer}>
			<RestaurantSection
				title="Mensa Berliner Tor"
				meals={mealData.berlinerTorMensa}
				groupedMeals={mealData.berlinerTorMensaGrouped}
			/>
			<RestaurantSection
				title="Mensa Bergedorf"
				meals={mealData.bergedorfMensa}
				groupedMeals={mealData.bergedorfMensaGrouped}
			/>
			<RestaurantSection
				title="Mensa Finkenau"
				meals={mealData.finkenauMensa}
				groupedMeals={mealData.finkenauMensaGrouped}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	categoryContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: 3,
		paddingTop: 3
	},
	categoryContainerCollapsed: {
		paddingBottom: 8
	},
	foodContainer: {
		paddingBottom: 90
	}
})
