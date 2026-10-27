import type { LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
export const quickLinkIconMap = {
	GraduationCap: ['graduationcap', 'school'],
	FolderOpen: ['tray.full', 'note_stack'],
	Library: ['books.vertical', 'local_library'],
	LayoutGrid: ['square.grid.2x2', 'apps'],
	FileText: ['doc.text', 'description'],
	Mail: ['envelope', 'mail'],
	CircleUser: ['person.crop.circle', 'account_circle'],
	Globe: ['globe', 'captive_portal'],
	ShoppingCart: ['cart', 'shopping_cart'],
	Link: ['link', 'link'],
	BookOpen: ['book', 'menu_book'],
	Calendar: ['calendar', 'calendar_month'],
	MapPin: ['mappin', 'location_on'],
	Users: ['person.2', 'group'],
	Heart: ['heart', 'favorite'],
	Info: ['info.circle', 'info'],
	ExternalLink: ['arrow.up.right.square', 'open_in_new'],
	Laptop: ['laptopcomputer', 'computer'],
	Coffee: ['cup.and.saucer', 'local_cafe'],
	Building: ['building.2', 'apartment'],
	Bell: ['bell', 'notifications'],
	Briefcase: ['briefcase', 'work'],
	Code: ['chevron.left.forwardslash.chevron.right', 'code'],
	MessageCircle: ['bubble', 'chat']
} as const
export interface AppQuickLink {
	key: string
	title?: { de: string; en: string }
	url: string
	urlEn?: string
	icon: { ios: string; android: MaterialIcon; web: LucideIcon }
}
export function parseManagedQuickLinks(value: unknown): {
	managed: boolean
	links: AppQuickLink[]
} {
	if (!value || typeof value !== 'object') throw Error('InvalidQuickLinks')
	const data = value as Record<string, unknown>
	if (
		typeof data.managed !== 'boolean' ||
		!Array.isArray(data.links) ||
		data.links.length > 100
	)
		throw Error('InvalidQuickLinks')
	const seen = new Set<string>()
	const links = data.links.map((item) => {
		if (!item || typeof item !== 'object') throw Error('InvalidQuickLinks')
		const row = item as Record<string, unknown>
		if (
			typeof row.key !== 'string' ||
			!/^[a-zA-Z0-9_-]{1,80}$/.test(row.key) ||
			seen.has(row.key) ||
			typeof row.icon !== 'string' ||
			!Object.hasOwn(quickLinkIconMap, row.icon) ||
			row.visible !== true
		)
			throw Error('InvalidQuickLinks')
		seen.add(row.key)
		const pair = (v: unknown, max: number) => {
			if (!v || typeof v !== 'object') throw Error('InvalidQuickLinks')
			const p = v as Record<string, unknown>
			if (
				typeof p.de !== 'string' ||
				typeof p.en !== 'string' ||
				!p.de.trim() ||
				!p.en.trim() ||
				p.de.length > max ||
				p.en.length > max
			)
				throw Error('InvalidQuickLinks')
			return { de: p.de, en: p.en }
		}
		const title = pair(row.title, 120)
		const url = pair(row.url, 2048)
		for (const text of Object.values(url)) {
			const u = new URL(text)
			if (u.protocol !== 'https:' || u.username || u.password)
				throw Error('InvalidQuickLinks')
		}
		const icon = row.icon as keyof typeof quickLinkIconMap
		const [ios, android] = quickLinkIconMap[icon]
		return {
			key: row.key,
			title,
			url: url.de,
			urlEn: url.en,
			icon: { ios, android: android as MaterialIcon, web: icon as LucideIcon }
		}
	})
	return { managed: data.managed, links }
}
