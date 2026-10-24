import { Tabs } from 'expo-router'
import { BottomTabBar } from 'expo-router/js-tabs'
import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { SettingsTabButton } from '@/components/Settings/tab-button'
import PlatformIcon from '@/components/Universal/icon'
import { appStorage } from '@/utils/storage'
import { toColor } from '@/utils/uniwind-utils'

const TabLayout = (): JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const primaryBackgroundColor = String(
		toColor(useCSSVariable('--color-primary-background')) ?? '#007aff15'
	)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const { t } = useTranslation('navigation')
	const { width } = useWindowDimensions()
	const isMobile = width < 900
	const [collapsed, setCollapsed] = useState(
		() => appStorage.getBoolean('hawconnect-sidebar-collapsed') ?? false
	)
	const sidebarWidth = collapsed ? 72 : 220
	const toggleLabel = t(
		collapsed ? 'navigation.expandSidebar' : 'navigation.collapseSidebar'
	)

	return (
		<Tabs
			tabBar={(props) =>
				isMobile ? (
					<BottomTabBar {...props} />
				) : (
					<View style={{ width: sidebarWidth, backgroundColor: cardColor }}>
						<BottomTabBar {...props} />
						<Pressable
							testID="sidebar-toggle"
							accessibilityRole="button"
							accessibilityLabel={toggleLabel}
							aria-expanded={!collapsed}
							onPress={() => {
								appStorage.set('hawconnect-sidebar-collapsed', !collapsed)
								setCollapsed(!collapsed)
							}}
							className="flex-row items-center justify-center gap-3 px-3 py-4 active:opacity-70"
						>
							<PlatformIcon
								ios={{
									name: collapsed ? 'chevron.right' : 'chevron.left',
									size: 20
								}}
								android={{
									name: collapsed ? 'chevron_right' : 'chevron_left',
									size: 20
								}}
								web={{
									name: collapsed ? 'PanelLeftOpen' : 'PanelLeftClose',
									size: 20
								}}
								style={{ color: labelColor }}
							/>
						</Pressable>
					</View>
				)
			}
			screenOptions={{
				tabBarPosition: isMobile ? 'bottom' : 'left',
				tabBarActiveTintColor: primaryColor,
				tabBarActiveBackgroundColor: primaryBackgroundColor,
				tabBarInactiveTintColor: labelColor,
				tabBarStyle: {
					backgroundColor: cardColor,
					...(!isMobile ? { width: sidebarWidth, minWidth: 0, flex: 1 } : {})
				},
				tabBarIconStyle: {
					marginTop: isMobile ? 4 : 0
				},
				tabBarLabelStyle: {
					paddingTop: 0
				},
				tabBarShowLabel: !isMobile && !collapsed,
				tabBarLabelPosition: isMobile
					? undefined
					: collapsed
						? 'below-icon'
						: 'beside-icon',
				tabBarVariant: isMobile ? 'uikit' : 'material'
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: t('navigation.home'),
					headerShown: false,
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'house',
								variant: focused ? 'fill' : 'outline',
								size: size
							}}
							android={{
								name: 'home',
								size
							}}
							web={{
								name: 'House',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="timetable"
				options={{
					headerShown: false,
					title: t('navigation.timetable'),
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'clock',
								variant: focused ? 'fill' : 'outline',

								size: size
							}}
							android={{
								name: 'calendar_month',
								size
							}}
							web={{
								name: 'Clock',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="map"
				options={{
					title: t('navigation.map'),
					headerShown: false,
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'map',
								size: size,
								variant: focused ? 'fill' : 'outline'
							}}
							android={{
								name: 'map',
								size
							}}
							web={{
								name: 'Map',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>

			<Tabs.Screen
				name="food"
				options={{
					title: t('navigation.food'),
					headerShown: false,
					tabBarLabel: t('navigation.food'),
					tabBarIcon: ({ color, size, focused }) => (
						<PlatformIcon
							ios={{
								name: 'fork.knife',
								variant: focused ? 'fill' : 'outline',

								size: size
							}}
							android={{
								name: 'restaurant',
								size
							}}
							web={{
								name: 'Utensils',
								size: size - 2
							}}
							style={{
								color
							}}
						/>
					)
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: t('navigation.profile'),
					headerShown: false,
					tabBarLabel: t('navigation.profile'),
					tabBarIcon: ({ color, size, focused }) => (
						<SettingsTabButton color={color} size={size} focused={focused} />
					)
				}}
			/>
		</Tabs>
	)
}

export default TabLayout
