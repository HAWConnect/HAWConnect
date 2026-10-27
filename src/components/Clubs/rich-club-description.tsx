import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Linking, Text, type TextStyle, View } from 'react-native'
import { type ClubRichNode, parseClubRichText } from '@/utils/club-rich-text'

const blockTags = new Set([
	'p',
	'h2',
	'h3',
	'ul',
	'ol',
	'li',
	'blockquote',
	'img'
])

export default function RichClubDescription({
	html,
	fallback,
	allowImages = true,
	selectable = false
}: {
	html?: string | null
	fallback: string
	allowImages?: boolean
	selectable?: boolean
}): React.JSX.Element {
	const { t } = useTranslation('common')
	const nodes = useMemo(
		() => parseClubRichText(html ?? '', { allowImages }),
		[html, allowImages]
	)

	function inline(node: ClubRichNode, key: number): React.ReactNode {
		if (node.type === 'text') return node.text
		if (node.tag === 'br') return '\n'
		if (node.tag === 'img') return null
		const link = node.tag === 'a' ? node.url : undefined
		return (
			<Text
				selectable={selectable}
				key={key}
				className={link ? 'text-primary underline' : undefined}
				style={{
					fontWeight:
						node.tag === 'strong' || node.tag === 'b' ? '700' : undefined,
					fontStyle:
						node.tag === 'em' || node.tag === 'i' ? 'italic' : undefined
				}}
				accessibilityRole={link ? 'link' : undefined}
				onPress={
					link ? () => void Linking.openURL(link).catch(() => {}) : undefined
				}
			>
				{node.children.map(inline)}
			</Text>
		)
	}

	function blocks(
		children: ClubRichNode[],
		textStyle?: TextStyle
	): React.ReactNode[] {
		const result: React.ReactNode[] = []
		let run: ClubRichNode[] = []
		const flush = () => {
			if (!run.length) return
			const content = run
			run = []
			result.push(
				<Text
					selectable={selectable}
					key={result.length}
					className="text-text text-base leading-6"
					style={textStyle}
				>
					{content.map(inline)}
				</Text>
			)
		}
		const hasBlock = (node: ClubRichNode): boolean =>
			node.type === 'element' &&
			(blockTags.has(node.tag) || node.children.some(hasBlock))
		for (const node of children) {
			// Images can be nested inside links/emphasis. Keep them outside native Text.
			if (
				node.type === 'element' &&
				!blockTags.has(node.tag) &&
				node.children.some(hasBlock)
			) {
				flush()
				const content = blocks(node.children, {
					...textStyle,
					...(node.tag === 'strong' || node.tag === 'b'
						? { fontWeight: '700' }
						: {}),
					...(node.tag === 'em' || node.tag === 'i'
						? { fontStyle: 'italic' }
						: {})
				})
				result.push(
					node.tag === 'a' && node.url ? (
						<View key={result.length} className="gap-2">
							<Text
								selectable={selectable}
								accessibilityRole="link"
								className="text-primary underline"
								onPress={() =>
									void Linking.openURL(node.url ?? '').catch(() => {})
								}
							>
								{node.url}
							</Text>
							{content}
						</View>
					) : (
						<View key={result.length} className="gap-2">
							{content}
						</View>
					)
				)
				continue
			}
			if (node.type === 'text' || !blockTags.has(node.tag)) {
				run.push(node)
				continue
			}
			flush()
			const key = result.length
			if (node.tag === 'img' && node.url) {
				result.push(
					<Image
						key={key}
						source={{ uri: node.url }}
						accessibilityLabel={node.alt || t('pages.clubs.image')}
						accessible
						resizeMode="contain"
						style={{ width: '100%', height: 240, maxWidth: 800 }}
					/>
				)
			} else if (node.tag === 'ul' || node.tag === 'ol') {
				let number = 0
				result.push(
					<View key={key} className="gap-2 pl-3">
						{node.children.map((child, index) => {
							if (child.type !== 'element' || child.tag !== 'li')
								return <View key={index}>{blocks([child])}</View>
							number++
							return (
								<View key={index} className="flex-row gap-2">
									<Text
										selectable={selectable}
										className="text-text text-base leading-6"
									>
										{node.tag === 'ol' ? `${number}.` : '•'}
									</Text>
									<View className="flex-1 gap-2">{blocks(child.children)}</View>
								</View>
							)
						})}
					</View>
				)
			} else {
				const heading = node.tag === 'h2' || node.tag === 'h3'
				result.push(
					<View
						key={key}
						accessibilityRole={heading ? 'header' : undefined}
						className={
							node.tag === 'blockquote'
								? 'border-l-2 border-primary pl-4 gap-2'
								: 'gap-2'
						}
					>
						{blocks(
							node.children,
							heading
								? {
										fontWeight: '700',
										fontSize: node.tag === 'h2' ? 22 : 19,
										lineHeight: 28
									}
								: textStyle
						)}
					</View>
				)
			}
		}
		flush()
		return result
	}

	return (
		<View className="gap-3">
			{nodes.length ? (
				blocks(nodes)
			) : (
				<Text selectable={selectable} className="text-text text-base leading-6">
					{fallback}
				</Text>
			)}
		</View>
	)
}
