import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'
export async function pickCalendarFile(): Promise<{
	name: string
	text: string
} | null> {
	const result = await DocumentPicker.getDocumentAsync({
		type: ['text/calendar', 'text/plain', 'application/octet-stream'],
		copyToCacheDirectory: true
	})
	if (result.canceled) return null
	const asset = result.assets[0]
	if ((asset.size ?? 0) > 2_000_000) throw new Error('calendarTooLarge')
	return { name: asset.name, text: await new File(asset.uri).text() }
}
