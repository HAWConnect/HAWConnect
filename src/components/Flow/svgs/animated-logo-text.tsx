import type React from 'react'
import { Text } from 'react-native'
export default function AnimatedLogoText({
	dimensions
}: {
	dimensions: { logoWidth: number; logoHeight: number }
	speed: number
}): React.JSX.Element {
	return (
		<Text
			className="text-label font-bold"
			style={{ width: dimensions.logoWidth, fontSize: dimensions.logoHeight }}
		>
			HAWConnect
		</Text>
	)
}
