import type { HttpMethod } from '$lib/services/http';
import { requestJson } from '$lib/services/http';
import { logger } from '$lib/logger';

/**
 * Composable for managing HTTP requests
 * Handles request state, cancellation, and response tracking
 */
export function useHttpRequest() {
	// Request state
	let isLoading = $state<boolean>(false);
	let httpStatusCode = $state<number | null>(null);
	let responseTime = $state<number | null>(null);
	let abortController: AbortController | null = null;

	/**
	 * Send HTTP request
	 */
	async function sendRequest(
		url: string,
		method: HttpMethod,
		headers: Array<{ key: string; value: string }>,
		body: string,
		options: {
			sendAsRawText?: boolean;
			useEditorContent?: boolean;
			editorContent?: string;
		} = {}
	): Promise<{ success: boolean; data?: unknown; error?: string }> {
		// Cancel any in-flight request
		if (abortController) {
			abortController.abort();
		}

		// Validate URL
		if (!url || !url.trim()) {
			return { success: false, error: 'URL is required' };
		}

		// Create new abort controller
		abortController = new AbortController();

		isLoading = true;
		httpStatusCode = null;
		responseTime = null;

		const startTime = Date.now();

		try {
			// Use editor content as body if specified
			const requestBody = options.useEditorContent && options.editorContent
				? options.editorContent
				: body;

			const result = await requestJson({
				url,
				method,
				headers,
				editorJson: options.editorContent || '',
				customBody: requestBody,
				sendAsRawText: options.sendAsRawText || false,
				useEditorContent: options.useEditorContent || false,
				signal: abortController.signal
			});

			responseTime = Date.now() - startTime;
			httpStatusCode = result.status || 200;

			logger.debug(`[HTTP] ${method} ${url} - Status: ${httpStatusCode}, Time: ${responseTime}ms`);

			return {
				success: true,
				data: result.data
			};
		} catch (error) {
			const elapsed = Date.now() - startTime;
			responseTime = elapsed;

			// Handle abort
			if (error instanceof Error && error.name === 'AbortError') {
				logger.debug('[HTTP] Request cancelled');
				return { success: false, error: 'Request cancelled' };
			}

			// Handle other errors
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			logger.error(`[HTTP] Request failed: ${errorMessage}`);

			// Try to extract status code from error
			if (error instanceof Error && 'status' in error) {
				const errorWithStatus = error as Error & { status: number };
				httpStatusCode = errorWithStatus.status;
			}

			return { success: false, error: errorMessage };
		} finally {
			isLoading = false;
			abortController = null;
		}
	}

	/**
	 * Cancel the current request
	 */
	function cancelRequest() {
		if (abortController) {
			abortController.abort();
			abortController = null;
			isLoading = false;
			logger.debug('[HTTP] Request cancelled by user');
		}
	}

	/**
	 * Reset request state
	 */
	function resetState() {
		isLoading = false;
		httpStatusCode = null;
		responseTime = null;
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	}

	/**
	 * Check if a request is in progress
	 */
	function isRequestInProgress(): boolean {
		return isLoading;
	}

	return {
		// State
		get isLoading() { return isLoading; },
		get httpStatusCode() { return httpStatusCode; },
		get responseTime() { return responseTime; },

		// Methods
		sendRequest,
		cancelRequest,
		resetState,
		isRequestInProgress,
	};
}