import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Text, View } from 'react-native'
import Button from '@/components/Universal/button'
import { LoadingState } from '@/utils/ui-utils'
/** Keep the local campus sheet usable even when external basemap requests fail. */
export default function MapLoadNotice({
	state,
	onRetry
}: {
	state: LoadingState
	onRetry: () => void
}): React.JSX.Element | null {
	const { t } = useTranslation('common')
	if (state === LoadingState.LOADED) return null
	const failed = state === LoadingState.ERROR
	return (
		<View
			testID={failed ? 'map-load-error' : 'map-loading'}
			className="absolute top-4 right-4 left-16 max-w-[340px] z-[100] bg-card border-hairline border-border rounded-md p-4 gap-3"
		>
			{!failed && <ActivityIndicator />}
			<Text
				className="text-text text-sm"
				accessibilityRole={failed ? 'alert' : undefined}
			>
				{t(
					failed ? 'pages.map.haw.mapUnavailable' : 'pages.map.haw.mapLoading'
				)}
			</Text>
			{failed && (
				<Button testID="map-retry" onPress={onRetry}>
					{t('pages.map.haw.retry')}
				</Button>
			)}
		</View>
	)
}
