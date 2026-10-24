import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { accountAPI } from '@/api/account-api'
import Button from '@/components/Universal/button'
import FormList from '@/components/Universal/form-list'
import { useAccountStore } from '@/hooks/useAccountStore'
import {
	clearCurrentAccountCache,
	syncAccountNow,
	useCloudCalendarCopies
} from '@/hooks/useAccountSync'
import {
	useAccountLifecycleStore,
	useAccountSyncStore
} from '@/hooks/useAccountSyncStore'
import { accountProfileStorage } from '@/utils/storage'
import SignInEntry from './sign-in-entry'

export default function AccountControls(): React.JSX.Element {
	const { t } = useTranslation('account')
	const status = useAccountStore((s) => s.status)
	const user = useAccountStore((s) => s.user)
	const pending = useAccountSyncStore((s) => s.pending.length)
	const conflicts = useAccountSyncStore((s) => s.conflicts.length)
	const syncError = useAccountSyncStore((s) => s.error)
	const syncing = useAccountLifecycleStore((s) => s.syncing)
	const [busy, setBusy] = useState(false)
	const [mode, setMode] = useState<'logout' | 'delete' | 'conflicts' | null>(
		null
	)
	const [error, setError] = useState('')
	async function run(action: () => Promise<void>) {
		setBusy(true)
		setError('')
		try {
			await action()
			setMode(null)
		} catch {
			setError(t('actionFailed'))
		} finally {
			setBusy(false)
		}
	}
	async function leave(action: 'logout' | 'delete', syncFirst = false) {
		const owner = useAccountStore.getState().user?.id
		const generation = accountProfileStorage.getGeneration()
		const unchanged = () =>
			!!owner &&
			useAccountStore.getState().user?.id === owner &&
			accountProfileStorage.getGeneration() === generation
		if (!unchanged()) throw new Error('AccountChanged')
		if (syncFirst) {
			await syncAccountNow()
			if (useAccountSyncStore.getState().pending.length)
				throw new Error('PendingChanges')
		}
		if (!unchanged()) throw new Error('AccountChanged')
		if (action === 'logout') await accountAPI.signOut()
		else await accountAPI.deleteAccount()
		if (!unchanged()) return
		await clearCurrentAccountCache(owner)
		if (useAccountStore.getState().user?.id === owner)
			useAccountStore.getState().signedOut()
	}
	if (status !== 'authenticated') return <SignInEntry />
	return (
		<View className="gap-3 mt-3">
			<FormList
				sections={[
					{
						items: [
							{
								testID: 'account-signed-in-email',
								title: t('signedInAs', { email: user?.email ?? '' }),
								icon: {
									ios: 'person.crop.circle',
									android: 'account_circle',
									web: 'User'
								},
								selectable: true
							}
						]
					}
				]}
			/>
			{conflicts > 0 && (
				<>
					<Text className="text-notification">
						{t('conflicts', { count: conflicts })}
					</Text>
					<Button
						variant="secondary"
						disabled={busy || syncing}
						onPress={() => setMode('conflicts')}
					>
						{t('resolveConflicts')}
					</Button>
				</>
			)}
			{!!syncError && (
				<Text className="text-notification" accessibilityRole="alert">
					{t('syncFailed')}
				</Text>
			)}
			<FormList
				sections={[
					{
						items: [
							{
								testID: 'account-sign-out',
								title: t('signOut'),
								icon: {
									ios: 'rectangle.portrait.and.arrow.right',
									android: 'logout',
									web: 'LogOut'
								},
								disabled: busy || syncing,
								onPress: () =>
									pending ? setMode('logout') : void run(() => leave('logout'))
							},
							{
								testID: 'account-delete',
								title: t('deleteAccount'),
								icon: { ios: 'trash', android: 'delete', web: 'Trash' },
								disabled: busy || syncing,
								onPress: () => setMode('delete')
							}
						]
					}
				]}
			/>
			{mode === 'conflicts' && (
				<>
					<Text className="text-label">{t('cloudCopyWarning')}</Text>
					<Button
						disabled={busy || syncing}
						onPress={() => void run(useCloudCalendarCopies)}
					>
						{t('useCloudCopies')}
					</Button>
				</>
			)}
			{mode === 'logout' && (
				<>
					<Text className="text-label">{t('pendingWarning')}</Text>
					{pending > 0 && (
						<Button
							disabled={busy}
							onPress={() => void run(() => leave(mode, true))}
						>
							{t('syncAndSignOut')}
						</Button>
					)}
					<Button
						variant="secondary"
						disabled={busy}
						onPress={() => void run(() => leave(mode))}
					>
						{pending ? t('discardAndSignOut') : t('confirmSignOut')}
					</Button>
				</>
			)}
			{mode === 'delete' && (
				<>
					<Text className="text-notification">{t('deleteWarning')}</Text>
					<Button
						disabled={busy}
						onPress={() => void run(() => leave('delete'))}
					>
						{t('confirmDelete')}
					</Button>
				</>
			)}
			{!!mode && (
				<Button
					variant="secondary"
					disabled={busy}
					onPress={() => setMode(null)}
				>
					{t('cancel')}
				</Button>
			)}
			{!!error && (
				<Text className="text-notification" accessibilityRole="alert">
					{error}
				</Text>
			)}
		</View>
	)
}
