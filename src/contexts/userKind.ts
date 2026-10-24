import { useMemo } from 'react'
import { USER_GUEST } from '@/data/constants'
export interface UserKindContextType {
	userKind: 'guest' | 'student' | 'employee' | undefined
	userFaculty: string | undefined
	userCampus: 'Ingolstadt' | 'Neuburg' | undefined
	toggleUserKind: (userKind: boolean | undefined) => void
}
/** A verified mailbox does not assert university enrolment or enable university APIs. */
export function useUserKind(): UserKindContextType {
	return useMemo(
		() => ({
			userKind: USER_GUEST,
			userFaculty: undefined,
			userCampus: undefined,
			toggleUserKind: () => {}
		}),
		[]
	)
}
