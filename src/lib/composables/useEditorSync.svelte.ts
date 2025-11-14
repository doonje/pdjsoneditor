import type { JsonValue } from '$lib/types/json';
import type { TabsStore } from '$lib/stores/tabs.svelte';
import LL from '$i18n/i18n-svelte';

/**
 * Composable for synchronizing editor content with tab store
 * Handles bidirectional sync between editor and active tab
 */
export function useEditorSync(tabsStore: TabsStore) {
	// Local state for the editor
	let editorValue = $state('');
	let parsedJson = $state<JsonValue | null>(null);
	let error = $state<string>('');
	let parseTimeout: ReturnType<typeof setTimeout> | undefined;

	// Sync from tab to editor when tab changes
	$effect(() => {
		const activeTab = tabsStore.getActiveTab();
		if (activeTab) {
			editorValue = activeTab.jsonContent;

			// Use cached parsed JSON if available for instant switching
			if (activeTab.parsedJson !== undefined) {
				parsedJson = activeTab.parsedJson as JsonValue;
				const translations = LL.get();
				error = activeTab.parsedJson ? '' : translations.editor.invalidJson();
			} else {
				// Parse if not cached
				parseJsonContent(activeTab.jsonContent);
			}
		}
	});

	// Sync from editor to tab when content changes
	$effect(() => {
		const activeTab = tabsStore.getActiveTab();
		if (activeTab && editorValue !== activeTab.jsonContent) {
			tabsStore.updateActiveTabContent(editorValue);

			// Debounce JSON parsing
			if (parseTimeout) {
				clearTimeout(parseTimeout);
			}

			parseTimeout = setTimeout(() => {
				parseJsonContent(editorValue);
			}, 500);
		}
	});

	/**
	 * Parse JSON content and update state
	 */
	function parseJsonContent(content: string) {
		try {
			const parsed = JSON.parse(content);
			parsedJson = parsed;
			error = '';
		} catch (e) {
			const translations = LL.get();
			error = e instanceof Error ? e.message : translations.editor.invalidJson();
			parsedJson = null;
		}
	}

	/**
	 * Format the JSON content
	 */
	function formatJson() {
		if (parsedJson) {
			editorValue = JSON.stringify(parsedJson, null, 2);
		}
	}

	/**
	 * Minify the JSON content
	 */
	function minifyJson() {
		if (parsedJson) {
			editorValue = JSON.stringify(parsedJson);
		}
	}

	/**
	 * Clear the editor content
	 */
	function clearJson() {
		editorValue = '{}';
		parsedJson = {};
		error = '';
	}

	/**
	 * Copy JSON to clipboard
	 */
	async function copyJson(): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(editorValue);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Set editor content
	 */
	function setContent(content: string) {
		editorValue = content;
	}

	return {
		// State
		get editorValue() { return editorValue; },
		set editorValue(value) { editorValue = value; },
		get parsedJson() { return parsedJson; },
		get error() { return error; },

		// Methods
		formatJson,
		minifyJson,
		clearJson,
		copyJson,
		setContent,
	};
}