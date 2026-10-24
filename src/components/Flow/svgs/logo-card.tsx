import type React from 'react'
import { View } from 'react-native'
import LogoSVG from './logo'
export default function LogoCardSVG({
	size = 310,
	opacity = 0.17,
	color
}: {
	size?: number
	opacity?: number
	color?: string
}): React.JSX.Element {
	return (
		<View style={{ opacity }}>
			<LogoSVG size={size} color={color} />
		</View>
	)
}
