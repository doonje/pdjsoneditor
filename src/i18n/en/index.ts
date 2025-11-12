import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
	navigation: {
		jsonEditor: 'JSON Editor',
		encodeDecode: 'Encode/Decode',
		hash: 'Hash Generator',
		timestamp: 'Timestamp Converter'
	},
	header: {
		title: 'JSON Editor',
		clear: 'Clear',
		copy: 'Copy',
		copySuccess: 'Copied to clipboard',
		copyError: 'Failed to copy to clipboard',
		format: 'Format',
		minify: 'Minify',
		sample: 'Sample Data',
		language: 'Language'
	},
	editor: {
		placeholder: 'Enter your JSON data here...',
		invalidJson: 'Invalid JSON',
		validJson: 'Valid JSON',
		urlPlaceholder: 'Enter URL to fetch JSON...',
		urlRequired: 'URL is required',
		fetchError: 'Failed to fetch data',
		go: 'Go',
		requestSettings: 'Request Settings',
		requestSettingsDescription: 'Configure HTTP headers and request body',
		headers: 'Headers',
		headerKey: 'Header key',
		headerValue: 'Header value',
		addHeader: 'Add Header',
		body: 'Body',
		bodyDescription: 'Configure the request body for POST/PUT/PATCH requests.',
		bodyPlaceholder: 'Enter request body (JSON, XML, etc.)',
		useEditorContent: 'Use editor content as request body',
		sendAsRawText: "Send as raw text (don't parse as JSON)",
		clearAll: 'Clear All',
		clearAllConfirm:
			'Are you sure you want to clear all settings? This will remove all saved headers, body, and URL from storage.',
		cancel: 'Cancel',
		save: 'Save',
		regenerate: 'Regenerate',
		regenerateTooltip: 'Regenerate values while preserving JSON structure',
		regenerateSuccess: 'JSON values regenerated successfully'
	},
	graph: {
		showMore: 'Show {count} more',
		showLess: 'Show less',
		expand: 'Expand',
		collapse: 'Collapse',
		expandAll: 'Expand all'
	},
	languages: {
		en: 'English',
		ko: '한국어',
		ja: '日本語'
	},
	footer: {
		ready: 'Ready'
	},
	tabs: {
		rename: 'Rename',
		duplicate: 'Duplicate',
		exportJson: 'Export JSON',
		closeTab: 'Close Tab',
		importJsonFile: 'Import JSON File',
		newTab: 'New Tab',
		import: 'Import'
	},
	encodeDecode: {
		title: 'Encode/Decode',
		description: 'Encode or decode text using various encoding methods',
		input: 'Input',
		output: 'Output',
		inputPlaceholder: 'Enter text to encode or decode...',
		base64: 'Base64',
		base64Encode: 'Base64 Encode',
		base64Decode: 'Base64 Decode',
		url: 'URL',
		urlEncode: 'URL Encode',
		urlDecode: 'URL Decode',
		encode: 'Encode',
		decode: 'Decode',
		clear: 'Clear',
		copy: 'Copy',
		copySuccess: 'Copied to clipboard',
		decodeError: 'Failed to decode. Please check your input.',
		encodeError: 'Failed to encode. Please check your input.'
	},
	hash: {
		title: 'Hash Generator',
		description: 'Generate hash values using various algorithms',
		input: 'Input',
		inputPlaceholder: 'Enter text to generate hash...',
		md5: 'MD5',
		sha1: 'SHA-1',
		sha256: 'SHA-256',
		sha512: 'SHA-512',
		generate: 'Generate',
		clear: 'Clear',
		copy: 'Copy',
		copySuccess: 'Copied to clipboard',
		result: 'Result',
		algorithm: 'Algorithm'
	},
	timestamp: {
		title: 'Timestamp Converter',
		description: 'Convert between timestamp and date',
		timestampToDate: 'Timestamp to Date',
		dateToTimestamp: 'Date to Timestamp',
		timestamp: 'Timestamp',
		timestampPlaceholder: 'Enter timestamp (e.g., 1234567890)',
		date: 'Date',
		currentTimestamp: 'Current Timestamp',
		convert: 'Convert',
		clear: 'Clear',
		copy: 'Copy',
		copySuccess: 'Copied to clipboard',
		invalidTimestamp: 'Invalid timestamp',
		invalidDate: 'Invalid date',
		milliseconds: 'Milliseconds',
		seconds: 'Seconds',
		unit: 'Unit'
	}
} satisfies BaseTranslation;

export default en;
