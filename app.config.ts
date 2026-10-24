import { validateTestFlightEnvironment } from './config/testflight-config'
import packageInfo from './package.json'

if (process.env.EAS_BUILD_PROFILE === 'testflight')
	validateTestFlightEnvironment(process.env)

export default {
	name: 'HAWConnect',
	slug: 'hawconnect',
	scheme: 'hawconnect',

	version: packageInfo.version,
	runtimeVersion: {
		policy: 'appVersion'
	},
	updates: {
		enabled: false
	},
	orientation: 'portrait',
	githubUrl: process.env.EXPO_PUBLIC_SOURCE_REPOSITORY_URL || undefined,
	userInterfaceStyle: 'automatic',
	ios: {
		bundleIdentifier: 'dev.hawconnect.app',
		buildNumber: '199',
		supportsTablet: true,
		userInterfaceStyle: 'automatic',
		associatedDomains: [],
		entitlements: {},
		config: {
			usesNonExemptEncryption: false
		},
		infoPlist: {
			RCTAsyncStorageExcludeFromBackup: false,
			CFBundleAllowMixedLocalizations: true,
			CFBundleDevelopmentRegion: 'en',
			UIViewControllerBasedStatusBarAppearance: false,
			NSLocationWhenInUseUsageDescription:
				'Allow HAWConnect to access your location to show your location on the map.'
		},
		icon: {
			light: './src/assets/hawconnect/icon.png',
			dark: './src/assets/hawconnect/icon-dark.png',
			tinted: './src/assets/hawconnect/icon-tinted.png'
		}
	},
	locales: {
		en: './src/localization/en/metadata.json',
		de: './src/localization/de/metadata.json'
	},
	android: {
		package: 'dev.hawconnect.app',
		userInterfaceStyle: 'automatic',
		icon: './src/assets/hawconnect/icon.png',
		adaptiveIcon: {
			foregroundImage: './src/assets/hawconnect/foreground.png',
			backgroundColor: '#087cfa'
		},
		permissions: [
			'android.permission.ACCESS_COARSE_LOCATION',
			'android.permission.ACCESS_FINE_LOCATION'
		],
		intentFilters: []
	},
	experiments: {
		autolinkingModuleResolution: true,
		reactCompiler: true,
		tsconfigPaths: true,
		typedRoutes: true
	},
	plugins: [
		[
			'expo-build-properties',
			{
				ios: {
					enableSceneSupport: true
				},
				android: {
					// R8 minify/obfuscation for Play Console DEX optimization (≥25% obfuscation).
					// Resource shrinking left off until release builds are validated with minify alone.
					enableMinifyInReleaseBuilds: true
				}
			}
		],
		[
			// Hide floating Dev Tools FAB / onboarding overlays that block Maestro taps.
			'expo-dev-client',
			{
				toolsButton: false,
				skipOnboarding: true,
				showMenuAtLaunch: false
			}
		],
		[
			'expo-router',
			{
				headOrigin: process.env.EXPO_PUBLIC_WEBSITE_URL || undefined,
				sitemap: true
			}
		],
		'expo-web-browser',
		[
			'expo-alternate-app-icons',
			[
				{
					name: 'Cat',
					ios: './src/assets/appIcons/cat.png',
					android: {
						foregroundImage: './src/assets/appIcons/cat.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'RainbowNeon',
					ios: './src/assets/appIcons/rainbowNeon.png',
					android: {
						foregroundImage: './src/assets/appIcons/rainbowNeon.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'Luxury',
					ios: './src/assets/appIcons/luxury.png',
					android: {
						foregroundImage: './src/assets/appIcons/luxury.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'RainbowGlow',
					ios: './src/assets/appIcons/rainbowGlow.png',
					android: {
						foregroundImage: './src/assets/appIcons/rainbowGlow.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'Hacker',
					ios: './src/assets/appIcons/hacker.png',
					android: {
						foregroundImage: './src/assets/appIcons/hacker.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'Retro',
					ios: './src/assets/appIcons/retro.png',
					android: {
						foregroundImage: './src/assets/appIcons/retro.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'ModernGreen',
					ios: {
						light: './src/assets/appIcons/modernGreen.png',
						dark: './src/assets/appIcons/dark/modernGreenDark.png',
						tinted: './src/assets/appIcons/tinted/darkTinted.png'
					},
					android: {
						foregroundImage: './src/assets/appIcons/modernGreen.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'ModernPink',
					ios: {
						light: './src/assets/appIcons/modernPurple.png',
						dark: './src/assets/appIcons/dark/purpleDark.png',
						tinted: './src/assets/appIcons/tinted/darkTinted.png'
					},
					android: {
						foregroundImage: './src/assets/appIcons/modernPurple.png',
						backgroundColor: '#ffffff'
					}
				},
				{
					name: 'RainbowMoonLight',
					ios: {
						light: './src/assets/appIcons/rainbowMoonLight.png',
						dark: './src/assets/appIcons/dark/darkRainbow.png',
						tinted: './src/assets/appIcons/tinted/darkTinted.png'
					},
					android: {
						foregroundImage: './src/assets/appIcons/rainbowMoonLight.png',
						backgroundColor: '#ffffff'
					}
				}
			]
		],
		['expo-secure-store'],
		[
			'expo-localization',
			{
				supportedLocales: ['en', 'de']
			}
		],
		['@maplibre/maplibre-react-native'],
		[
			'expo-splash-screen',
			{
				backgroundColor: '#ffffff',
				image: './src/assets/hawconnect/splash-dark.png',
				dark: {
					image: './src/assets/hawconnect/splash-light.png',
					backgroundColor: '#000000'
				},
				imageWidth: 200
			}
		],
		[
			'expo-quick-actions',
			{
				androidIcons: {
					account: {
						foregroundImage: 'src/assets/android/account.png',
						backgroundColor: '#ffffff'
					},
					calendar: {
						foregroundImage: 'src/assets/android/calendar.png',
						backgroundColor: '#ffffff'
					},
					food: {
						foregroundImage: 'src/assets/android/food.png',
						backgroundColor: '#ffffff'
					},
					link: {
						foregroundImage: 'src/assets/android/link.png',
						backgroundColor: '#ffffff'
					}
				}
			}
		],
		[
			'./config/plugins/withDrawableAssets.js',
			'./src/assets/android/check.xml'
		],
		'./config/plugins/withIosCiArtifacts.js',
		'./config/plugins/withCiScriptsSymlink.js',
		'./config/plugins/withGradleJvmArgs.js',
		[
			'expo-font',
			{
				fonts: [
					'./config/fonts/MaterialSymbolsRoundedFill.ttf',
					'./config/fonts/MaterialSymbolsRoundedOutline.ttf'
				]
			}
		],
		['@react-native-community/datetimepicker'],
		['expo-image']
	],
	extra: {
		eas: {
			projectId:
				process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
				'0cb4308b-8ede-46dc-b9e7-67234f449a1b'
		}
	},
	web: {
		favicon: './src/assets/hawconnect/icon.png',
		shortName: 'HAWConnect',
		name: 'HAWConnect - Deine App für die HAW Hamburg',
		description:
			'HAWConnect ist deine App für die HAW Hamburg, entwickelt von Studierenden für Studierende. Sie bietet dir alle Funktionen, die du für dein Studium benötigst, an einem Ort.',
		lang: 'de',
		dir: 'ltr',
		startUrl: '.',
		display: 'standalone',
		backgroundColor: '#f2f2f2',
		// theme-color is set in public/index.html (light/dark media queries) and
		// updated at runtime from src/app/_layout.tsx to match the active app theme.
		barStyle: 'black-translucent',
		preferRelatedApplications: true,
		output: 'single',
		bundler: 'metro'
	}
}
