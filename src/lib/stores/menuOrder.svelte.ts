import type { ComponentType, SvelteComponent } from 'svelte';

/**
 * Menu item interface
 */
export interface MenuItem {
	href: string;
	icon: ComponentType<SvelteComponent>; // Improved from 'any'
	labelKey: string;
}

// Storage key for menu order
const MENU_ORDER_KEY = 'pdjsoneditor_menu_order';

// Default menu order
const defaultMenuOrder: MenuItem[] = [
	// This will be populated by the actual menu items
	// The order can be customized by the user
];

/**
 * Get stored menu order from localStorage
 */
function getStoredOrder(): MenuItem[] | null {
	if (typeof window === 'undefined') return null;

	try {
		const stored = localStorage.getItem(MENU_ORDER_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.error('Failed to parse menu order:', e);
	}

	return null;
}

/**
 * Create menu order store using Svelte 5 runes
 * Manages the order of menu items in the sidebar
 */
export function createMenuOrderStore() {
	// Initialize with stored order or default
	const storedOrder = getStoredOrder();
	let menuItems = $state<MenuItem[]>(storedOrder || defaultMenuOrder);

	// Persist to localStorage when order changes
	$effect(() => {
		if (typeof window !== 'undefined' && menuItems.length > 0) {
			try {
				// Store only the essential data (href and labelKey)
				const dataToStore = menuItems.map(item => ({
					href: item.href,
					labelKey: item.labelKey
				}));
				localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(dataToStore));
			} catch (e) {
				console.error('Failed to save menu order:', e);
			}
		}
	});

	/**
	 * Set menu items
	 */
	function setMenuItems(items: MenuItem[]) {
		menuItems = items;
	}

	/**
	 * Reorder menu items
	 */
	function reorderMenuItems(fromIndex: number, toIndex: number) {
		if (fromIndex < 0 || fromIndex >= menuItems.length ||
			toIndex < 0 || toIndex >= menuItems.length) {
			return;
		}

		const items = [...menuItems];
		const [movedItem] = items.splice(fromIndex, 1);
		items.splice(toIndex, 0, movedItem);
		menuItems = items;
	}

	/**
	 * Move item up in the order
	 */
	function moveUp(index: number) {
		if (index > 0) {
			reorderMenuItems(index, index - 1);
		}
	}

	/**
	 * Move item down in the order
	 */
	function moveDown(index: number) {
		if (index < menuItems.length - 1) {
			reorderMenuItems(index, index + 1);
		}
	}

	/**
	 * Reset to default order
	 */
	function resetToDefault(defaultItems: MenuItem[]) {
		menuItems = defaultItems;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(MENU_ORDER_KEY);
		}
	}

	/**
	 * Add a menu item
	 */
	function addMenuItem(item: MenuItem, index?: number) {
		if (index !== undefined && index >= 0 && index <= menuItems.length) {
			menuItems = [
				...menuItems.slice(0, index),
				item,
				...menuItems.slice(index)
			];
		} else {
			menuItems = [...menuItems, item];
		}
	}

	/**
	 * Remove a menu item
	 */
	function removeMenuItem(href: string) {
		menuItems = menuItems.filter(item => item.href !== href);
	}

	/**
	 * Find menu item by href
	 */
	function findMenuItem(href: string): MenuItem | undefined {
		return menuItems.find(item => item.href === href);
	}

	/**
	 * Get menu item index
	 */
	function getMenuItemIndex(href: string): number {
		return menuItems.findIndex(item => item.href === href);
	}

	return {
		// State
		get menuItems() { return menuItems; },

		// Methods
		setMenuItems,
		reorderMenuItems,
		moveUp,
		moveDown,
		resetToDefault,
		addMenuItem,
		removeMenuItem,
		findMenuItem,
		getMenuItemIndex,
	};
}

// Create singleton instance
export const menuOrderStore = createMenuOrderStore();