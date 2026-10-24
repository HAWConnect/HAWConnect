import SignInEntry from '@/components/Account/sign-in-entry'
import { useAccountStore } from '@/hooks/useAccountStore'
export default function GuestUserNote(): React.JSX.Element | null {
	const authenticated = useAccountStore(
		(state) => state.status === 'authenticated'
	)
	return authenticated ? null : <SignInEntry />
}
