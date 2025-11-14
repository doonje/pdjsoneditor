import type { TabData } from '../tabs.svelte';
import { logger } from '$lib/logger';
import { STORAGE_KEYS } from '$lib/constants';

/**
 * Composable for managing tab persistence with localStorage
 * Handles saving and loading tab state
 */
export function useTabsRepository(
	tabs: TabData[],
	activeTabId: string,
	setActiveTabId: (id: string) => void
) {
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Save tabs to localStorage
	 */
	function saveToStorage() {
		try {
			const data = {
				tabs: tabs.map((tab) => ({
					...tab,
					graphState: tab.graphState
						? {
								...tab.graphState,
								expandedNodes: Array.from(tab.graphState.expandedNodes),
								showAllItemsNodes: Array.from(tab.graphState.showAllItemsNodes)
							}
						: undefined
				})),
				activeTabId: activeTabId
			};

			localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(data));
			logger.debug('[TabsRepository] Saved tabs to storage');
		} catch (error) {
			logger.error('[TabsRepository] Failed to save to storage:', error);
		}
	}

	/**
	 * Load tabs from localStorage
	 */
	function loadFromStorage(): boolean {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.TABS);
			if (!stored) return false;

			const data = JSON.parse(stored);
			if (!data.tabs || !Array.isArray(data.tabs)) return false;

			// Clear existing tabs
			tabs.length = 0;

			// Reconstruct tabs with Set objects
			const loadedTabs = data.tabs.map((tab: any) => ({
				...tab,
				graphState: tab.graphState
					? {
							...tab.graphState,
							expandedNodes: new Set(tab.graphState.expandedNodes || []),
							showAllItemsNodes: new Set(tab.graphState.showAllItemsNodes || [])
						}
					: {
							expandedNodes: new Set<string>(),
							showAllItemsNodes: new Set<string>()
						}
			}));

			// Add loaded tabs
			tabs.push(...loadedTabs);

			// Set active tab
			if (data.activeTabId && tabs.find((t) => t.id === data.activeTabId)) {
				setActiveTabId(data.activeTabId);
			} else if (tabs.length > 0) {
				setActiveTabId(tabs[0].id);
			}

			logger.debug(`[TabsRepository] Loaded ${tabs.length} tabs from storage`);
			return true;
		} catch (error) {
			logger.error('[TabsRepository] Failed to load from storage:', error);
			return false;
		}
	}

	/**
	 * Debounced save to localStorage
	 */
	function debouncedSave() {
		if (typeof window === 'undefined') return;

		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveTimeout = setTimeout(() => {
			saveToStorage();
		}, 1000);
	}

	/**
	 * Clear stored tabs
	 */
	function clearStorage() {
		try {
			localStorage.removeItem(STORAGE_KEYS.TABS);
			logger.debug('[TabsRepository] Cleared stored tabs');
		} catch (error) {
			logger.error('[TabsRepository] Failed to clear storage:', error);
		}
	}

	/**
	 * Check if storage has tabs
	 */
	function hasStoredTabs(): boolean {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.TABS);
			if (!stored) return false;

			const data = JSON.parse(stored);
			return data.tabs && Array.isArray(data.tabs) && data.tabs.length > 0;
		} catch {
			return false;
		}
	}

	return {
		saveToStorage,
		loadFromStorage,
		debouncedSave,
		clearStorage,
		hasStoredTabs,
	};
}