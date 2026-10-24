import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import AccountControls from '@/components/Account/account-controls'
import SettingsMenu from './settings-menu'

export default function Settings(): React.JSX.Element {
	const { t } = useTranslation('settings')
	return (
		<ScrollView
			testID="settings-screen"
			showsVerticalScrollIndicator={false}
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="pb-[60px]"
		>
			<View className="px-3">
				<AccountControls />
				<View className="my-4 mt-6">
					<SettingsMenu />
				</View>
			</View>
			<Text className="text-label-secondary text-xs -mb-2.5 mt-3 text-center">
				{t('menu.copyright')}
			</Text>
		</ScrollView>
	)
}
