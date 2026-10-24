import type React from 'react'
import { Text, View } from 'react-native'
import LogoSVG from '@/components/Flow/svgs/logo'
export default function SettingsLogo({
	size
}: {
	scrollY: number
	size: { width: number; height: number }
}): React.JSX.Element {
	return (
		<View style={size} className="flex-row items-center gap-2">
			<LogoSVG size={28} />
			<Text className="text-text text-xl font-bold">HAWConnect</Text>
		</View>
	)
}
