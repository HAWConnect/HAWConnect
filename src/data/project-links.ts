// Club-controlled addresses are optional until the association configures them.
// Do not substitute upstream infrastructure or invent contact addresses.
export const projectLinks = {
	website: process.env.EXPO_PUBLIC_WEBSITE_URL ?? '',
	source: process.env.EXPO_PUBLIC_SOURCE_REPOSITORY_URL ?? '',
	supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
	download: process.env.EXPO_PUBLIC_DOWNLOAD_URL ?? '',
	privacy: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
	imprint: process.env.EXPO_PUBLIC_IMPRINT_URL ?? '',
	faq: process.env.EXPO_PUBLIC_FAQ_URL ?? '',
	status: process.env.EXPO_PUBLIC_STATUS_URL ?? ''
}
