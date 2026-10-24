import packageInfo from '../../package.json'
import { projectLinks } from './project-links'

export const appVersion = packageInfo.version
export const appHomepage = projectLinks.website || projectLinks.source
export const appUserAgent = `hawconnect/${appVersion}${appHomepage ? ` (+${appHomepage})` : ''}`
