import type React from 'react'
import { Text } from 'react-native'
export default function LogoText({
	size,
	color
}: {
	size: number
	color: string
}): React.JSX.Element {
	return (
		<Text style={{ fontSize: size, color }} className="font-bold">
			HAWConnect
		</Text>
	)
}
