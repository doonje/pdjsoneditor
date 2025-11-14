import type { TabData } from '../tabs.svelte';
import { logger } from '$lib/logger';

/**
 * Composable for managing tab CRUD operations
 * Handles adding, removing, switching, renaming, and duplicating tabs
 */
export function useTabsManager(
	tabs: TabData[],
	activeTabId: string,
	setActiveTabId: (id: string) => void,
	getDefaultJSON: () => string
) {
	/**
	 * Add a new tab
	 */
	function addTab(name?: string, content?: string): string {
		const jsonContent = content || getDefaultJSON();

		// Try to parse the JSON content
		let parsedJson = null;
		try {
			parsedJson = JSON.parse(jsonContent);
		} catch {
			// Ignore parse errors
		}

		const newTab: TabData = {
			id: crypto.randomUUID(),
			name: name || `Tab ${tabs.length + 1}`,
			jsonContent,
			parsedJson,
			graphState: {
				expandedNodes: new Set<string>(),
				showAllItemsNodes: new Set<string>()
			},
			requestSettings: {
				url: '',
				method: 'GET',
				headers: [],
				body: '',
				sendAsRawText: false,
				useEditorContent: false
			}
		};

		tabs.push(newTab);
		setActiveTabId(newTab.id);
		logger.debug(`[TabsManager] Added new tab: ${newTab.name} (${newTab.id})`);

		// Trigger graph update for the new tab
		triggerGraphUpdate();

		return newTab.id;
	}

	/**
	 * Close a tab
	 */
	function closeTab(id: string): boolean {
		const index = tabs.findIndex((t) => t.id === id);
		if (index === -1) {
			logger.warn(`[TabsManager] Cannot close tab - not found: ${id}`);
			return false;
		}

		// Don't allow closing the last tab
		if (tabs.length === 1) {
			logger.warn('[TabsManager] Cannot close the last tab');
			return false;
		}

		const tabName = tabs[index].name;
		tabs.splice(index, 1);
		logger.debug(`[TabsManager] Closed tab: ${tabName} (${id})`);

		// If closing active tab, switch to adjacent tab
		if (activeTabId === id && tabs.length > 0) {
			const newIndex = Math.min(index, tabs.length - 1);
			setActiveTabId(tabs[newIndex].id);
			logger.debug(`[TabsManager] Switched to tab: ${tabs[newIndex].name}`);
			triggerGraphUpdate();
		}

		return true;
	}

	/**
	 * Switch to a different tab
	 */
	function switchTab(id: string): boolean {
		const tab = tabs.find((t) => t.id === id);
		if (!tab) {
			logger.warn(`[TabsManager] Tab not found: ${id}`);
			return false;
		}

		setActiveTabId(id);
		logger.debug(`[TabsManager] Switched to tab: ${tab.name} (${id})`);

		// Trigger graph update for the new tab
		triggerGraphUpdate();

		return true;
	}

	/**
	 * Rename a tab
	 */
	function renameTab(id: string, newName: string): boolean {
		const tab = tabs.find((t) => t.id === id);
		if (!tab) {
			logger.warn(`[TabsManager] Cannot rename tab - not found: ${id}`);
			return false;
		}

		const oldName = tab.name;
		tab.name = newName;
		logger.debug(`[TabsManager] Renamed tab from "${oldName}" to "${newName}" (${id})`);

		return true;
	}

	/**
	 * Duplicate a tab
	 */
	function duplicateTab(id: string): string | null {
		const tab = tabs.find((t) => t.id === id);
		if (!tab) {
			logger.warn(`[TabsManager] Cannot duplicate tab - not found: ${id}`);
			return null;
		}

		const newTab: TabData = {
			...tab,
			id: crypto.randomUUID(),
			name: `${tab.name} (copy)`,
			parsedJson: tab.parsedJson, // Copy the cached parsed JSON
			graphState: tab.graphState
				? {
						expandedNodes: new Set(tab.graphState.expandedNodes),
						showAllItemsNodes: new Set(tab.graphState.showAllItemsNodes),
						zoom: tab.graphState.zoom,
						pan: tab.graphState.pan ? { ...tab.graphState.pan } : undefined
					}
				: {
						expandedNodes: new Set<string>(),
						showAllItemsNodes: new Set<string>()
					},
			requestSettings: tab.requestSettings
				? {
						...tab.requestSettings,
						headers: tab.requestSettings.headers ? [...tab.requestSettings.headers] : []
					}
				: {
						url: '',
						method: 'GET',
						headers: [],
						body: '',
						sendAsRawText: false,
						useEditorContent: false
					}
		};

		tabs.push(newTab);
		setActiveTabId(newTab.id);
		logger.debug(`[TabsManager] Duplicated tab: ${tab.name} -> ${newTab.name} (${newTab.id})`);
		triggerGraphUpdate();

		return newTab.id;
	}

	/**
	 * Get tab by ID
	 */
	function getTab(id: string): TabData | undefined {
		return tabs.find((t) => t.id === id);
	}

	/**
	 * Get active tab
	 */
	function getActiveTab(): TabData | undefined {
		return tabs.find((t) => t.id === activeTabId);
	}

	/**
	 * Trigger graph update event
	 */
	function triggerGraphUpdate() {
		// Dispatch custom event to notify graph component to re-render
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('tabChanged'));
		}
	}

	return {
		addTab,
		closeTab,
		switchTab,
		renameTab,
		duplicateTab,
		getTab,
		getActiveTab,
	};
}