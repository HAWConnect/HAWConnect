import { useEffect, useMemo } from 'react'
import { AppState, Platform } from 'react-native'
import { fetchCalendarText } from '@/api/calendar-import-api'
import {
	accountMutationBusy,
	beginCalendarMutation
} from '@/utils/account-mutation'
import { createCalendarAutoRefresh } from '@/utils/calendar-auto-refresh'
import { loadCalendarLink } from '@/utils/calendar-link-storage'
import { expandCalendar, parseCalendar } from '@/utils/ical-import'
import { accountProfileStorage } from '@/utils/storage'
import { useAccountStore } from './useAccountStore'
import { useAccountLifecycleStore } from './useAccountSyncStore'
import { useImportedCalendarStore } from './useImportedCalendarStore'

function currentScope() {
	if (accountMutationBusy()) return null
	const state = useAccountStore.getState()
	const desired =
		state.status === 'guest'
			? 'guest'
			: state.status === 'authenticated' && state.user
				? `account.${state.user.id}`
				: null
	if (
		!desired ||
		useAccountLifecycleStore.getState().readyProfile !== desired ||
		accountProfileStorage.getProfile() !== desired
	)
		return null
	return JSON.stringify([desired, accountProfileStorage.getGeneration()])
}
export function useCalendarAutoRefresh() {
	const ready = useAccountLifecycleStore((s) => s.readyProfile)
	const status = useAccountStore((s) => s.status)
	const syncing = useAccountLifecycleStore((s) => s.syncing)
	const refresh = useMemo(
		() =>
			createCalendarAutoRefresh({
				scope: currentScope,
				calendars: () => useImportedCalendarStore.getState().calendars,
				loadLink: loadCalendarLink,
				download: async (url, calendar) => {
					const preview = parseCalendar(await fetchCalendarText(url))
					expandCalendar(
						{ ...calendar, ...preview },
						new Date(Date.now() - 30 * 86400000),
						new Date(Date.now() + 180 * 86400000)
					)
					return preview
				},
				save: (calendar) => {
					const finish = beginCalendarMutation()
					try {
						useImportedCalendarStore.getState().upsert(calendar)
					} finally {
						finish()
					}
				},
				now: Date.now
			}),
		[]
	)
	useEffect(() => {
		const run = () => {
			if (!useAccountLifecycleStore.getState().syncing) void refresh()
		}
		run()
		const subscription = AppState.addEventListener('change', (state) => {
			if (state === 'active') run()
		})
		const visible = () => {
			if (document.visibilityState === 'visible') run()
		}
		if (Platform.OS === 'web')
			document.addEventListener('visibilitychange', visible)
		return () => {
			subscription.remove()
			if (Platform.OS === 'web')
				document.removeEventListener('visibilitychange', visible)
		}
	}, [ready, status, syncing, refresh])
}
