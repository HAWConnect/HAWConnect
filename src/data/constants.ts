import { projectLinks } from './project-links'
export const PRIVACY_URL = projectLinks.privacy
export const IMPRINT_URL = projectLinks.imprint
export const FAQ_URL = projectLinks.faq
export const STATUS_URL = projectLinks.status
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'
export const primussLink = 'https://myhaw.haw-hamburg.de/'
const moodleLink = 'https://moodle.haw-hamburg.de/?lang=de'
const mailLink = 'https://outlook.office.com/'
const studverLink = 'https://asta.haw-hamburg.de/'
const shopLink = 'https://shop.haw-hamburg.de/'
export const libraryLink = 'https://www.haw-hamburg.de/hibs/'
export const vscoutLink = 'https://www.haw-hamburg.de/hibs/'
const hawLink = 'https://www.haw-hamburg.de/'
export const printLink = 'https://www.haw-hamburg.de/online-services/'

export const quicklinks = [
	{
		key: 'primuss',
		url: primussLink,
		icon: {
			ios: 'graduationcap',
			android: 'school',
			web: 'GraduationCap'
		}
	},
	{
		key: 'moodle',
		url: moodleLink,
		urlEn: 'https://moodle.haw-hamburg.de/?lang=en',
		icon: {
			ios: 'tray.full',
			android: 'note_stack',
			web: 'FolderOpen'
		}
	},
	{
		key: 'viamint',
		url: 'https://viamint.de/?lang=de',
		urlEn: 'https://viamint.de/?lang=en',
		icon: { ios: 'graduationcap', android: 'school', web: 'GraduationCap' }
	},
	{
		key: 'libraryCatalogue',
		url: 'https://katalog.haw-hamburg.de/',
		icon: { ios: 'books.vertical', android: 'local_library', web: 'Library' }
	},
	{
		key: 'onlineServices',
		url: 'https://www.haw-hamburg.de/online-services/',
		urlEn: 'https://www.haw-hamburg.de/en/online-services/',
		icon: { ios: 'square.grid.2x2', android: 'apps', web: 'LayoutGrid' }
	},
	{
		key: 'examCollection',
		url: 'https://i2e.fsr.haw-hamburg.de/klausurensammlung',
		icon: { ios: 'doc.text', android: 'description', web: 'FileText' }
	},
	{
		key: 'webmail',
		url: mailLink,
		icon: {
			ios: 'envelope',
			android: 'mail',
			web: 'Mail'
		}
	},
	{
		key: 'studVer',
		url: studverLink,
		icon: {
			ios: 'person.bubble',
			android: '3p',
			web: 'CircleUser'
		}
	},
	{
		key: 'university',
		url: hawLink,
		urlEn: 'https://www.haw-hamburg.de/en/',
		icon: {
			ios: 'globe',
			android: 'captive_portal',
			web: 'Globe'
		}
	},
	{
		key: 'marketplace',
		url: shopLink,
		icon: {
			ios: 'cart',
			android: 'shopping_cart',
			web: 'ShoppingCart'
		}
	}
]

export function quicklinkUrl(
	link: { url: string; urlEn?: string },
	language: string
): string {
	return language.startsWith('en') ? (link.urlEn ?? link.url) : link.url
}

export const defaultQuicklinks = ['primuss', 'moodle', 'webmail']
