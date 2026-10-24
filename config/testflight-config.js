/** Prevent a store-distributed beta from silently shipping local development URLs. */
function validateTestFlightEnvironment(env) {
	const publicURL = (value) => {
		try {
			const url = new URL(value ?? '')
			const host = url.hostname.toLowerCase()
			return (
				url.protocol === 'https:' &&
				!url.username &&
				!url.password &&
				host.includes('.') &&
				!host.endsWith('.local') &&
				!host.endsWith('.localhost') &&
				!/^\d+(\.\d+){3}$/.test(host) &&
				!host.includes(':')
			)
		} catch {
			return false
		}
	}
	if (
		!publicURL(env.EXPO_PUBLIC_HAWCONNECT_GRAPHQL_ENDPOINT) ||
		(env.EXPO_PUBLIC_HAWCONNECT_AUTH_URL !== undefined &&
			!publicURL(env.EXPO_PUBLIC_HAWCONNECT_AUTH_URL))
	)
		throw new Error(
			'TestFlight requires a public HTTPS HAWConnect backend and authentication endpoint. Configure the EAS preview environment; localhost cannot be used on testers’ phones.'
		)
}

module.exports={validateTestFlightEnvironment}
