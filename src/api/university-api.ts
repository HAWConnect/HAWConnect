/**
 * Error that is thrown when the API indicates an error.
 */
export class APIError extends Error {
	public status: number
	public data: object

	constructor(status: number, data: object) {
		super(`${JSON.stringify(data)} (${status.toString()})`)
		this.status = status
		this.data = data
	}
}

/**
 * Client for accessing the university API without authentication.
 *
 */
export class UniversityAPIClient {
	/**
	 * Submits an API request to the university backend using a WebSocket proxy
	 */

	// biome-ignore lint/suspicious/noExplicitAny: TODO
	async request(_params: Record<string, string>): Promise<any> {
		throw new Error('University integration unavailable')
	}

	/**
	 * Creates a login session.
	 */
	async login(
		username: string,
		passwd: string
	): Promise<{ session: string; isStudent: boolean }> {
		const res = await this.request({
			service: 'session',
			method: 'open',
			format: 'json',
			username,
			passwd
		})

		if (res.status !== 0) {
			throw new APIError(res.status, res.data)
		}

		return {
			session: res.data[0],
			isStudent: res.data[2] === 3
		}
	}

	/**
	 * Checks whether the session is still valid.
	 * @param {string} session Session token
	 * @returns {boolean} `true` if the session is valid.
	 */
	async isAlive(session: string | null): Promise<boolean> {
		if (session == null) {
			return false
		}
		const res = await this.request({
			service: 'session',
			method: 'isalive',
			format: 'json',
			session
		})

		return res.data === 'STATUS_OK'
	}

	/**
	 * Destroys a session.
	 * @param {string} session Session token
	 * @returns {boolean} `true` if the session was destroyed.
	 */
	async logout(session: string): Promise<boolean> {
		const res = await this.request({
			service: 'session',
			method: 'close',
			format: 'json',
			session
		})

		return res.data === 'STATUS_OK'
	}
}

export default new UniversityAPIClient()
