import { trackEvent } from '@aptabase/react-native'
import { Stack, useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { HeaderTitle } from 'expo-router/react-navigation'
import React, { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Share, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import ViewShot, { captureRef, type ViewShotRef } from 'react-native-view-shot'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import DetailsBody from '@/components/Timetable/details-body'
import DetailsRow from '@/components/Timetable/details-row'
import DetailsSymbol from '@/components/Timetable/details-symbol'
import Separator from '@/components/Timetable/separator'
import ShareCard from '@/components/Timetable/share-card'
import PlatformIcon from '@/components/Universal/icon'
import { useLecturerLookupSources } from '@/hooks/useLecturerLookupSources'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { useSheetDetailScroll } from '@/hooks/useSheetDetailScroll'
import {
	diffInMinutes,
	formatFriendlyDate,
	formatFriendlyTime
} from '@/utils/date-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { resolveLecturerLinks } from '@/utils/lecturers-utils'
import { openMapRoom } from '@/utils/map-actions'
import { isValidRoom } from '@/utils/timetable-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function TimetableDetails(): React.JSX.Element {
	const router = useRouter()
	const navigation = useNavigation()
	const { t } = useTranslation('timetable')
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const shareRef = useRef<ViewShotRef>(null)
	const lecture = useRouteParamsStore((state) => state.selectedLecture)
	const setSelectedLecturer = useRouteParamsStore(
		(state) => state.setSelectedLecturer
	)
	const allLecturers = useLecturerLookupSources()
	const lecturerLinks = useMemo(() => {
		if (lecture == null || lecture.lecturer == null) return []
		return resolveLecturerLinks(
			lecture.lecturer,
			lecture.lecturerIds ?? [],
			allLecturers
		)
	}, [lecture, allLecturers])
	const { scrollHandler, headerStyle, contentInsetAdjustmentBehavior } =
		useSheetDetailScroll()
	useFocusEffect(
		useCallback(() => {
			if (lecture === undefined) {
				navigation.setOptions({
					...getPlatformHeaderButtons({})
				})
			} else {
				navigation.setOptions({
					...getPlatformHeaderButtons({
						onShare: shareEvent
					})
				})
			}
		}, [lecture, navigation])
	)

	if (lecture === undefined) {
		return <ErrorView title={t('error.cannotDisplayLecture')} />
	}

	const startDate = new Date(lecture.startDate)
	const endDate = new Date(lecture.endDate)

	async function shareEvent(): Promise<void> {
		try {
			const uri = await captureRef(shareRef, {
				format: 'png',
				quality: 1
			})
			trackEvent('Share', {
				type: 'lecture'
			})

			await Share.share({
				url: uri
			})
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<Animated.ScrollView
			testID="lecture-details-screen"
			onScroll={scrollHandler}
			scrollEventThrottle={16}
			contentContainerClassName="flex pb-bottom-safe px-page pt-page"
			contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View
							className="overflow-hidden"
							style={{
								marginBottom: Platform.OS === 'ios' ? -10 : 0,
								paddingRight: Platform.OS === 'ios' ? 0 : 50
							}}
						>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={String(textColor)}>
									{lecture.name}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View>
				<DetailsRow>
					<DetailsSymbol>
						<View className="aspect-square bg-primary rounded-infinite w-[15px]" />
					</DetailsSymbol>
					<DetailsBody>
						<Text className="text-text text-2xl font-bold">{lecture.name}</Text>
						{lecture.shortName.length > 0 ? (
							<Text className="text-label text-sm">{lecture.shortName}</Text>
						) : (
							// biome-ignore lint/complexity/noUselessFragments: okay here
							<></>
						)}
					</DetailsBody>
				</DetailsRow>

				<Separator />

				<DetailsRow>
					<DetailsSymbol>
						<PlatformIcon
							style={{ color: labelColor }}
							ios={{
								name: 'clock',
								size: 21
							}}
							android={{
								name: 'calendar_month',
								size: 24,
								variant: 'outlined'
							}}
							web={{
								name: 'Clock',
								size: 24
							}}
						/>
					</DetailsSymbol>

					<DetailsBody>
						<View className="flex-row items-center flex-1 justify-between pr-3 w-full">
							<View>
								<Text className="text-text text-lg">
									{formatFriendlyDate(startDate, {
										weekday: 'long',
										relative: false
									})}
								</Text>

								<View className="flex-row items-center gap-1">
									<Text className="text-text text-sm">
										{formatFriendlyTime(startDate)}
									</Text>

									<PlatformIcon
										style={{ color: labelColor }}
										ios={{
											name: 'chevron.forward',
											size: 12
										}}
										android={{
											name: 'chevron_right',
											size: 16
										}}
										web={{
											name: 'ChevronRight',
											size: 16
										}}
									/>

									<Text className="text-text text-sm">
										{formatFriendlyTime(endDate)}
									</Text>

									<Text className="text-label text-sm">
										{`(${diffInMinutes(startDate, endDate)} ${t('time.minutes')})`}
									</Text>
								</View>
							</View>
							{}
						</View>
					</DetailsBody>
				</DetailsRow>

				{lecture.rooms.length > 0 ? (
					<>
						<Separator />
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'mappin.and.ellipse',
										size: 21
									}}
									android={{
										name: 'place',
										size: 24,
										variant: 'outlined'
									}}
									web={{
										name: 'MapPin',
										size: 24
									}}
									style={{ color: labelColor }}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<View className="flex-row">
									{lecture.rooms.map((room, i) => {
										const isValid = isValidRoom(room)
										return (
											<React.Fragment key={i}>
												<Pressable
													onPress={() => {
														openMapRoom(room)
													}}
													disabled={!isValid}
												>
													<Text
														className="text-lg"
														style={{
															color: isValid ? primaryColor : textColor
														}}
													>
														{room}
													</Text>
												</Pressable>
												{i < lecture.rooms.length - 1 && (
													<Text className="text-text text-lg">{', '}</Text>
												)}
											</React.Fragment>
										)
									})}
								</View>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}

				{lecture.lecturer != null && lecturerLinks.length > 0 ? (
					<>
						<Separator />
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'person',
										size: 21
									}}
									android={{
										name: 'person',
										size: 24,
										variant: 'outlined'
									}}
									web={{
										name: 'User',
										size: 24
									}}
									style={{ color: labelColor }}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<View className="flex-row flex-wrap">
									{lecturerLinks.map((link, i) => (
										<React.Fragment key={link.lecturer?.id ?? link.name}>
											<Pressable
												onPress={() => {
													if (link.lecturer == null) return
													setSelectedLecturer(link.lecturer)
													// Replace the lecture sheet instead of stacking another form sheet.
													router.dismiss()
													router.push('/lecturer')
												}}
												disabled={link.lecturer == null}
											>
												<Text
													className="text-lg"
													style={{
														color:
															link.lecturer != null ? primaryColor : textColor
													}}
												>
													{link.name}
												</Text>
											</Pressable>
											{i < lecturerLinks.length - 1 && (
												<Text className="text-text text-lg">{', '}</Text>
											)}
										</React.Fragment>
									))}
								</View>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}
				<ViewShot
					ref={shareRef}
					style={{
						transform: [{ translateX: -1000 }],
						position: 'absolute',
						zIndex: -1
					}}
				>
					<ShareCard event={lecture} />
				</ViewShot>
			</View>
		</Animated.ScrollView>
	)
}
