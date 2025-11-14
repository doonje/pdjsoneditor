import type { TabData } from '../tabs.svelte';
import { useTabsManager } from './useTabsManager.svelte';
import { useTabsRepository } from './useTabsRepository.svelte';
import { logger } from '$lib/logger';

/**
 * Get default JSON content for new tabs
 */
function getDefaultJSON(): string {
	return '""';
}

/**
 * Create a new tabs store with functional composition
 * This is a refactored version of the original class-based TabsStore
 */
export function createTabsStore() {
	// Core state
	const tabs = $state<TabData[]>([]);
	let activeTabId = $state<string>('');

	// Helper to set active tab ID
	function setActiveTabId(id: string) {
		activeTabId = id;
	}

	// Compose functionality
	const manager = useTabsManager(tabs, activeTabId, setActiveTabId, getDefaultJSON);
	const repository = useTabsRepository(tabs, activeTabId, setActiveTabId);

	// Initialize on client side
	if (typeof window !== 'undefined') {
		// Try to load from storage first
		const loaded = repository.loadFromStorage();
		if (!loaded || tabs.length === 0) {
			// Initialize with one default tab if no stored tabs
			manager.addTab('Tab 1', getDefaultJSON());
		}
	}

	/**
	 * Update JSON content of active tab
	 */
	function updateActiveTabContent(content: string) {
		const tab = manager.getActiveTab();
		if (!tab) return;

		tab.jsonContent = content;

		// Try to parse and cache the JSON
		try {
			tab.parsedJson = JSON.parse(content);
		} catch {
			tab.parsedJson = null;
		}

		tab.metadata = {
			...tab.metadata,
			lastModified: new Date()
		};

		// Auto-save after content update
		repository.debouncedSave();
	}

	/**
	 * Update request settings for active tab
	 */
	function updateActiveTabRequestSettings(settings: Partial<TabData['requestSettings']>) {
		const tab = manager.getActiveTab();
		if (!tab) return;

		tab.requestSettings = {
			...tab.requestSettings,
			...settings
		} as TabData['requestSettings'];

		repository.debouncedSave();
	}

	/**
	 * Update graph state for active tab
	 */
	function updateActiveTabGraphState(graphState: Partial<TabData['graphState']>) {
		const tab = manager.getActiveTab();
		if (!tab) return;

		tab.graphState = {
			...tab.graphState,
			...graphState
		} as TabData['graphState'];
	}

	/**
	 * Update editor state for active tab
	 */
	function updateActiveTabEditorState(editorState: Partial<TabData['editorState']>) {
		const tab = manager.getActiveTab();
		if (!tab) return;

		tab.editorState = {
			...tab.editorState,
			...editorState
		};
	}

	/**
	 * Save current tab state (called before switching tabs)
	 */
	function saveCurrentTabState() {
		const tab = manager.getActiveTab();
		if (!tab) return;

		// The editor and graph components will handle saving their states
		// through event listeners
		logger.debug(`[TabsStore] Saved state for tab: ${tab.name}`);
	}

	/**
	 * Reset store to initial state
	 */
	function reset() {
		tabs.length = 0;
		activeTabId = '';
		manager.addTab('Tab 1', getDefaultJSON());
		logger.debug('[TabsStore] Store reset');
	}

	// Auto-save on tab changes
	$effect(() => {
		// Watch for tab changes and save
		if (tabs.length > 0) {
			repository.debouncedSave();
		}
	});

	return {
		// State (read-only)
		get tabs() { return tabs; },
		get activeTabId() { return activeTabId; },

		// Manager methods
		addTab: manager.addTab,
		closeTab: manager.closeTab,
		switchTab: manager.switchTab,
		renameTab: manager.renameTab,
		duplicateTab: manager.duplicateTab,
		getTab: manager.getTab,
		getActiveTab: manager.getActiveTab,

		// Repository methods
		saveToStorage: repository.saveToStorage,
		loadFromStorage: repository.loadFromStorage,
		debouncedSave: repository.debouncedSave,
		clearStorage: repository.clearStorage,
		hasStoredTabs: repository.hasStoredTabs,

		// Update methods
		updateActiveTabContent,
		updateActiveTabRequestSettings,
		updateActiveTabGraphState,
		updateActiveTabEditorState,
		saveCurrentTabState,

		// Utility methods
		reset,
	};
}

// Create singleton instance
export const tabsStore = createTabsStore();