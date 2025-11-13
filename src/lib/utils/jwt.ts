import { decodeJwt, type JWTPayload } from 'jose';

export interface DecodedJWT {
	header: Record<string, unknown>;
	payload: JWTPayload;
	signature: string;
	isValid: boolean;
	error?: string;
}

export function decodeJWT(token: string): DecodedJWT {
	try {
		// Split the token into its parts
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid JWT format');
		}

		// Decode header
		const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));

		// Decode payload using jose
		const payload = decodeJwt(token);

		// Extract signature
		const signature = parts[2];

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		const isExpired = payload.exp !== undefined && payload.exp < now;

		return {
			header,
			payload,
			signature,
			isValid: !isExpired,
			error: isExpired ? 'Token has expired' : undefined
		};
	} catch (error) {
		return {
			header: {},
			payload: {},
			signature: '',
			isValid: false,
			error: error instanceof Error ? error.message : 'Failed to decode JWT'
		};
	}
}

export function formatTimestamp(timestamp: number | undefined): string {
	if (timestamp === undefined) return 'N/A';
	return new Date(timestamp * 1000).toLocaleString();
}

export function isExpired(exp: number | undefined): boolean {
	if (exp === undefined) return false;
	return exp < Math.floor(Date.now() / 1000);
}
