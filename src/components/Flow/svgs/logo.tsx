import type React from 'react'
import { Path, Svg } from 'react-native-svg'
import { useCSSVariable } from 'uniwind'
import mark from '@/assets/hawconnect/mark.json'
import { toColor } from '@/utils/uniwind-utils'

export default function LogoSVG({
	size,
	color
}: {
	size: number
	color?: string
}): React.JSX.Element {
	const primary = toColor(useCSSVariable('--color-primary'))
	const logoColor = color ?? String(primary ?? '#007aff')
	return (
		<Svg
			viewBox={mark.viewBox}
			width={size}
			height={size}
			accessibilityLabel="HAWConnect"
			role="img"
		>
			{mark.paths.map((path) => (
				<Path
					key={path.d}
					d={path.d}
					fill={path.stroke ? 'none' : logoColor}
					stroke={path.stroke ? logoColor : undefined}
					strokeWidth={path.stroke ? 20 : undefined}
					strokeLinecap="round"
				/>
			))}
		</Svg>
	)
}
