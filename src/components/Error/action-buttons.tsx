import * as Application from 'expo-application'
import { usePathname } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { STATUS_URL } from '@/data/constants'
import { projectLinks } from '@/data/project-links'

export const FeedbackButton = ({
	crash
}: {
	error: Error
	crash: boolean
}): React.JSX.Element => {
	const { t } = useTranslation('common')
	const platform = Platform.OS
	const appVersion = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`
	const subject = crash
		? t('feedbackMail.subjectCrash')
		: t('feedbackMail.subjectError')
	const pathname = usePathname()
	const mailContent = `mailto:${projectLinks.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
		t('feedbackMail.body', {
			version: appVersion,
			platform,
			path: pathname,
			error: 'Redacted'
		})
	)}`

	if (!projectLinks.supportEmail) return <></>

	const sendMail = (): void => {
		Linking.openURL(mailContent).catch(() => {
			console.error('Could not open mail client')
		})
	}
	return (
		<Pressable
			className="self-center items-center rounded-mg bg-background"
			onPress={() => {
				sendMail()
			}}
		>
			<View className="flex-row items-center px-[30px] py-2.5">
				<Text className="text-[15px] font-semibold text-text">
					{t('error.crash.feedback')}
				</Text>
			</View>
		</Pressable>
	)
}

export const StatusButton = (): React.JSX.Element => {
	const { t } = useTranslation('common')

	if (!STATUS_URL) return <></>

	return (
		<Pressable
			className="self-center items-center rounded-mg bg-background"
			onPress={() => {
				void Linking.openURL(STATUS_URL)
			}}
		>
			<View className="flex-row items-center px-[30px] py-2.5">
				<Text className="text-[15px] font-semibold text-text">
					{t('error.crash.status')}
				</Text>
			</View>
		</Pressable>
	)
}
