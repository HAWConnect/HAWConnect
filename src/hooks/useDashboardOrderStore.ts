import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

interface State {
	shown: string[] | undefined
	setShown: (shown: string[]) => void
}
export const useDashboardOrderStore = create<State>()(
	persist(
		(set) => ({ shown: undefined, setShown: (shown) => set({ shown }) }),
		{
			name: 'dashboard-order-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
