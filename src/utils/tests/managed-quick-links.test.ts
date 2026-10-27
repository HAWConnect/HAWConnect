import { expect, test } from 'bun:test'
import { parseManagedQuickLinks } from '../managed-quick-links'

const link = {
	key: 'moodle',
	title: { de: 'Deutsch', en: 'English' },
	url: { de: 'https://example.com/de', en: 'https://example.com/en' },
	visible: true,
	icon: 'FolderOpen'
}
test('maps bilingual links and platform icons without changing identity', () => {
	const result = parseManagedQuickLinks({ managed: true, links: [link] })
	expect(result.links[0]).toEqual({
		key: 'moodle',
		title: link.title,
		url: link.url.de,
		urlEn: link.url.en,
		icon: { ios: 'tray.full', android: 'note_stack', web: 'FolderOpen' }
	})
	expect(parseManagedQuickLinks({ managed: true, links: [] })).toEqual({
		managed: true,
		links: []
	})
})
test('rejects hidden, duplicate or unsafe server content', () => {
	for (const value of [
		{ ...link, icon: '__proto__' },
		{ ...link, visible: false },
		{ ...link, url: { de: 'javascript:alert(1)', en: link.url.en } }
	])
		expect(() =>
			parseManagedQuickLinks({ managed: true, links: [value] })
		).toThrow()
	expect(() =>
		parseManagedQuickLinks({ managed: true, links: [link, link] })
	).toThrow()
})
