import { Parser } from 'htmlparser2'

export type ClubRichNode =
	| { type: 'text'; text: string }
	| {
			type: 'element'
			tag: string
			children: ClubRichNode[]
			url?: string
			alt?: string
	  }

const allowed = new Set([
	'p',
	'br',
	'strong',
	'b',
	'em',
	'i',
	'h2',
	'h3',
	'ul',
	'ol',
	'li',
	'blockquote',
	'a',
	'img'
])
const discarded = new Set([
	'script',
	'style',
	'svg',
	'iframe',
	'object',
	'embed',
	'template',
	'math',
	'video',
	'audio',
	'canvas',
	'noscript'
])

/** URL objects reject malformed URLs; explicit checks also exclude control obfuscation. */
export function safeClubUrl(
	value: string | undefined,
	image = false
): string | undefined {
	if (
		!value ||
		Array.from(value).some(
			(character) =>
				character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127
		)
	)
		return undefined
	try {
		const url = new URL(value)
		if (url.username || url.password) return undefined
		if (url.protocol === 'https:' && url.hostname) return url.href
		if (
			!image &&
			url.protocol === 'mailto:' &&
			url.pathname &&
			!/[\r\n]/.test(decodeURIComponent(value))
		)
			return url.href
	} catch {
		return undefined
	}
	return undefined
}

/** Build a bounded native rendering tree, never interpreting HTML as executable markup. */
export function parseClubRichText(
	html: string,
	{ allowImages = true }: { allowImages?: boolean } = {}
): ClubRichNode[] {
	if (html.length > 100_000) return []
	const root: ClubRichNode[] = []
	const stack = [{ children: root, drop: false }]
	let count = 0
	const parser = new Parser(
		{
			onopentag(tag, attributes) {
				const parent = stack[stack.length - 1]
				const drop =
					parent.drop ||
					discarded.has(tag) ||
					(tag === 'img' && !allowImages) ||
					stack.length > 32 ||
					count >= 2000
				let children = parent.children
				if (!drop && allowed.has(tag)) {
					const url = safeClubUrl(
						tag === 'img' ? attributes.src : attributes.href,
						tag === 'img'
					)
					const node: ClubRichNode = {
						type: 'element',
						tag,
						children: [],
						...(url ? { url } : {}),
						...(tag === 'img'
							? { alt: (attributes.alt ?? '').slice(0, 500) }
							: {})
					}
					// An unsafe image has no useful rendering representation.
					if (tag !== 'img' || url) {
						parent.children.push(node)
						count++
					}
					children = node.children
				}
				stack.push({ children, drop })
			},
			ontext(text) {
				const parent = stack[stack.length - 1]
				if (!parent.drop && count < 2000) {
					const previous = parent.children[parent.children.length - 1]
					if (previous?.type === 'text') previous.text += text
					else {
						parent.children.push({ type: 'text', text })
						count++
					}
				}
			},
			onclosetag() {
				if (stack.length > 1) stack.pop()
			}
		},
		{ decodeEntities: true }
	)
	parser.end(html)
	const hasContent = (nodes: ClubRichNode[]): boolean =>
		nodes.some((node) =>
			node.type === 'text'
				? Boolean(node.text.trim())
				: Boolean(node.tag === 'img' && node.url) || hasContent(node.children)
		)
	return hasContent(root) ? root : []
}
