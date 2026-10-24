export async function pickCalendarFile(): Promise<{
	name: string
	text: string
} | null> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.ics,text/calendar'
		input.oncancel = () => resolve(null)
		input.onchange = async () => {
			const file = input.files?.[0]
			if (!file) return resolve(null)
			try {
				if (file.size > 2_000_000) throw new Error('calendarTooLarge')
				resolve({ name: file.name, text: await file.text() })
			} catch (error) {
				reject(error)
			}
		}
		input.click()
	})
}
