import { FliptClient } from '@flipt-io/flipt'
import * as Application from 'expo-application'
import { getEvaluationPlatform } from '@/utils/evaluation-platform'
import { assertRequestAllowed } from '@/utils/integration-utils'

const namespace = process.env.EXPO_PUBLIC_FLIPT_NAMESPACE ?? 'hawconnect-app'
const fliptUrl = process.env.EXPO_PUBLIC_FLIPT_URL ?? ''

let fliptClient: FliptClient | undefined

function getFliptClient(): FliptClient {
	if (!fliptUrl) throw new Error('Feature flag service unavailable')
	assertRequestAllowed(fliptUrl)
	if (!fliptClient) {
		fliptClient = new FliptClient({ url: fliptUrl })
	}

	return fliptClient
}

/** Warms the shared Flipt client (called from the root provider on mount). */
export async function ensureFliptClient(): Promise<void> {
	if (process.env.EXPO_PUBLIC_FLIPT_URL) getFliptClient()
}

/**
 * Optional attributes merged into every Flipt evaluation.
 *
 * Built-in context (always sent):
 * - `targetingKey`: `anonymous` — no per-device identifier
 * - `platform`: `ios` | `android` | `web` | `web-dev` | `web-local`
 * - `appVersion`: from expo-application
 *
 * On web, `platform` is derived from hostname (the configured development host → `web-dev`,
 * the configured production host → `web`, else `web-local`).
 *
 * Optional:
 * - `userKind`: self-reported profile (`guest` | `student` | `employee`)
 */
export interface FeatureFlagContextAttributes {
	userKind?: string
}

export interface FliptEvaluationContext {
	targetingKey: string
	platform: string
	appVersion: string
	userKind?: string
}

export function buildEvaluationContext(
	attributes: FeatureFlagContextAttributes = {}
): FliptEvaluationContext {
	const context: FliptEvaluationContext = {
		targetingKey: 'anonymous',
		platform: getEvaluationPlatform(),
		appVersion: Application.nativeApplicationVersion ?? 'unknown'
	}

	if (attributes.userKind) {
		context.userKind = attributes.userKind
	}

	return context
}

function toFliptContext(
	context: FliptEvaluationContext
): Record<string, string> {
	const fliptContext: Record<string, string> = {
		platform: context.platform,
		appVersion: context.appVersion
	}

	if (context.userKind) {
		fliptContext.userKind = context.userKind
	}

	return fliptContext
}

export async function evaluateFliptBoolean(
	flagKey: string,
	defaultValue: boolean,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	if (!process.env.EXPO_PUBLIC_FLIPT_URL) return defaultValue
	const context = buildEvaluationContext(attributes)

	try {
		const evaluation = await getFliptClient().evaluation.boolean({
			namespaceKey: namespace,
			flagKey,
			entityId: context.targetingKey,
			context: toFliptContext(context)
		})

		if (evaluation.reason === 'UNKNOWN_EVALUATION_REASON') {
			return defaultValue
		}

		return evaluation.enabled
	} catch (error) {
		console.error(`Failed to evaluate Flipt flag "${flagKey}":`, error)
		return defaultValue
	}
}
