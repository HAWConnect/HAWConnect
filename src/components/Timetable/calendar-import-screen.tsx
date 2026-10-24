import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Platform,
	ScrollView,
	Text,
	TextInput,
	View
} from 'react-native'
import {
	fetchCalendarText,
	normalizeCalendarUrl
} from '@/api/calendar-import-api'
import Button from '@/components/Universal/button'
import { useImportedCalendarStore } from '@/hooks/useImportedCalendarStore'
import type {
	CalendarPreview,
	CalendarSnapshot,
	ImportedOccurrence
} from '@/types/imported-calendar'
import { beginCalendarMutation } from '@/utils/account-mutation'
import { pickCalendarFile } from '@/utils/calendar-file-picker'
import {
	deleteCalendarLink,
	loadCalendarLink,
	saveCalendarLink
} from '@/utils/calendar-link-storage'
import { calendarUpdate } from '@/utils/calendar-update'
import { expandCalendar, parseCalendar } from '@/utils/ical-import'
import { accountProfileStorage } from '@/utils/storage'

export default function CalendarImportScreen(): React.JSX.Element {
	const { t, i18n } = useTranslation('timetable')
	const calendars = useImportedCalendarStore((s) => s.calendars)
	const upsertStore = useImportedCalendarStore((s) => s.upsert)
	const profile = accountProfileStorage.getProfile()
	const profileGeneration = accountProfileStorage.getGeneration()
	const upsert = (calendar: CalendarSnapshot) => {
		if (
			accountProfileStorage.getProfile() !== profile ||
			accountProfileStorage.getGeneration() !== profileGeneration
		)
			throw new Error('calendarStorageFailed')
		upsertStore(calendar)
	}
	const remove = useImportedCalendarStore((s) => s.remove)
	const [url, setUrl] = useState('')
	const [name, setName] = useState('')
	const [replacement, setReplacement] = useState<string | null>(null)
	const [draft, setDraft] = useState<{
		preview: CalendarPreview
		name: string
		url?: string
		events: ImportedOccurrence[]
	} | null>(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	const work = async (action: () => Promise<void>) => {
		const finishMutation = beginCalendarMutation()
		setBusy(true)
		setError('')
		try {
			await action()
		} catch (e) {
			const code = e instanceof Error ? e.message : ''
			setError(
				code === 'calendarTooLarge'
					? t('import.tooLarge')
					: code === 'calendarStorageFailed'
						? t('import.storageFailed')
						: t('import.failed')
			)
		} finally {
			finishMutation()
			setBusy(false)
		}
	}
	const loadFile = () =>
		work(async () => {
			const file = await pickCalendarFile()
			if (file)
				prepareDraft(parseCalendar(file.text), file.name.replace(/\.ics$/i, ''))
		})
	const loadLink = () =>
		work(async () => {
			const normalized = normalizeCalendarUrl(url)
			prepareDraft(
				parseCalendar(await fetchCalendarText(normalized)),
				name || t('import.defaultName'),
				normalized
			)
		})
	const confirm = () =>
		work(async () => {
			if (!draft) return
			const id =
				replacement ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
			if (draft.url) await saveCalendarLink(id, draft.url)
			else if (replacement) await deleteCalendarLink(id)
			upsert({
				...draft.preview,
				id,
				name: name || draft.name,
				sourceType: draft.url ? 'link' : 'file',
				updatedAt: new Date().toISOString()
			})
			setDraft(null)
			setReplacement(null)
			setUrl('')
			setName('')
		})
	function prepareDraft(
		preview: CalendarPreview,
		draftName: string,
		link?: string
	) {
		const events = expandCalendar(
			{
				...preview,
				id: 'preview',
				name: draftName,
				sourceType: 'file',
				updatedAt: ''
			},
			new Date(Date.now() - 30 * 86400000),
			new Date(Date.now() + 180 * 86400000)
		).slice(0, 10)
		setDraft({ preview, name: draftName, url: link, events })
	}
	const previewEvents = draft?.events ?? []
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="p-page gap-4 pb-10"
		>
			<Text className="text-text text-base">{t('import.instructions')}</Text>
			{replacement && (
				<Text className="text-primary">{t('import.replacing')}</Text>
			)}
			<View className="bg-card border-hairline border-border rounded-base p-4 gap-3">
				<TextInput
					accessibilityLabel={t('import.name')}
					placeholder={t('import.name')}
					value={name}
					onChangeText={setName}
					className="text-text border-hairline border-border rounded-base p-3"
				/>
				<TextInput
					accessibilityLabel={t('import.link')}
					placeholder="https://… / webcal://…"
					value={url}
					onChangeText={setUrl}
					autoCapitalize="none"
					autoCorrect={false}
					className="text-text border-hairline border-border rounded-base p-3"
				/>
				<Button onPress={() => void loadLink()} disabled={busy || !url}>
					{t('import.previewLink')}
				</Button>
				<Button
					variant="secondary"
					onPress={() => void loadFile()}
					disabled={busy}
				>
					{t('import.file')}
				</Button>
			</View>
			{error !== '' && (
				<Text accessibilityRole="alert" className="text-notification">
					{error}
				</Text>
			)}
			{draft && (
				<View className="bg-card border-hairline border-border rounded-base p-4 gap-3">
					<Text className="text-text font-semibold">
						{t('import.preview', { count: draft.preview.eventCount })}
					</Text>
					<Text className="text-label text-sm">{t('import.previewRange')}</Text>
					{previewEvents.map((e) => (
						<Text className="text-text" key={e.key}>
							{e.title} ·{' '}
							{e.allDay
								? e.start
								: new Date(e.start).toLocaleString(i18n.language)}
							{e.location ? ` · ${e.location}` : ''}
						</Text>
					))}
					<Button onPress={() => void confirm()} disabled={busy}>
						{t('import.confirm')}
					</Button>
					<Button
						variant="secondary"
						onPress={() => setDraft(null)}
						disabled={busy}
					>
						{t('import.cancel')}
					</Button>
				</View>
			)}
			{calendars.map((calendar) => (
				<View
					key={calendar.id}
					className="bg-card border-hairline border-border rounded-base p-4 gap-3"
				>
					<Text className="text-text font-semibold">{calendar.name}</Text>
					<Text className="text-label text-sm">
						{t('import.updated')}:{' '}
						{new Date(calendar.updatedAt).toLocaleString(i18n.language)}
					</Text>
					{calendar.sourceType === 'file' && (
						<Text className="text-label text-sm">
							{t('import.fileRefresh')}
						</Text>
					)}
					{calendar.sourceType === 'link' && (
						<Button
							disabled={busy}
							onPress={() =>
								void work(async () => {
									const link = await loadCalendarLink(calendar.id)
									if (!link) throw new Error('calendarStorageFailed')
									const preview = parseCalendar(await fetchCalendarText(link))
									expandCalendar(
										{ ...calendar, ...preview },
										new Date(Date.now() - 30 * 86400000),
										new Date(Date.now() + 180 * 86400000)
									)
									upsert(
										calendarUpdate(calendar, preview, new Date().toISOString())
									)
								})
							}
						>
							{t('import.refresh')}
						</Button>
					)}
					<Button
						variant="secondary"
						disabled={busy}
						onPress={() => {
							setReplacement(calendar.id)
							setName(calendar.name)
							setDraft(null)
						}}
					>
						{t('import.replace')}
					</Button>
					<Button
						variant="secondary"
						disabled={busy}
						onPress={() => {
							const removeConfirmed = () =>
								void work(async () => {
									await deleteCalendarLink(calendar.id)
									remove(calendar.id)
									if (replacement === calendar.id) setReplacement(null)
								})
							if (Platform.OS === 'web') {
								if (window.confirm(`${t('import.remove')}: ${calendar.name}`))
									removeConfirmed()
								return
							}
							Alert.alert(t('import.remove'), calendar.name, [
								{ text: t('import.cancel'), style: 'cancel' },
								{
									text: t('import.remove'),
									style: 'destructive',
									onPress: removeConfirmed
								}
							])
						}}
					>
						{t('import.remove')}
					</Button>
				</View>
			))}
		</ScrollView>
	)
}
