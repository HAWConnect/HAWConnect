import { gcm } from '@noble/ciphers/aes.js'
import {
	bytesToHex,
	bytesToUtf8,
	hexToBytes,
	utf8ToBytes
} from '@noble/ciphers/utils.js'
export function createLocalSyncCipher(keyHex: string, profile: string) {
	const key = hexToBytes(keyHex)
	if (key.length !== 32) throw new Error('LocalEncryptionKeyRequired')
	const aad = utf8ToBytes(profile)
	return {
		seal(value: string, nonce: Uint8Array) {
			if (nonce.length !== 12) throw new Error('InvalidNonce')
			return `v1.${bytesToHex(nonce)}.${bytesToHex(gcm(key, nonce, aad).encrypt(utf8ToBytes(value)))}`
		},
		open(value: string) {
			try {
				const parts = value.split('.')
				if (parts.length !== 3 || parts[0] !== 'v1') throw new Error()
				return bytesToUtf8(
					gcm(key, hexToBytes(parts[1]), aad).decrypt(hexToBytes(parts[2]))
				)
			} catch {
				throw new Error('InvalidEncryptedCache')
			}
		}
	}
}
