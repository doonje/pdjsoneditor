import { writable } from 'svelte/store';

const MENU_ORDER_KEY = 'menu-order';

export interface MenuItem {
	href: string;
	icon: any;
	labelKey: string;
}

// Default menu order (hrefs)
export const defaultMenuOrder = [
	'/',
	'/uuid',
	'/string-case',
	'/color',
	'/encode-decode',
	'/hash',
	'/jwt',
	'/regex',
	'/diff',
	'/timestamp',
	'/yaml-json',
	'/sql',
	'/cron',
	'/qr-code'
];

function getStoredOrder(): string[] {
	if (typeof window === 'undefined') return defaultMenuOrder;

	try {
		const stored = localStorage.getItem(MENU_ORDER_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Validate that all default items are present
			if (Array.isArray(parsed) && parsed.length === defaultMenuOrder.length) {
				const hasAllItems = defaultMenuOrder.every(item => parsed.includes(item));
				if (hasAllItems) {
					return parsed;
				}
			}
		}
	} catch (e) {
		console.error('Failed to parse menu order:', e);
	}

	return defaultMenuOrder;
}

function createMenuOrderStore() {
	const { subscribe, set, update } = writable<string[]>(getStoredOrder());

	return {
		subscribe,
		set: (order: string[]) => {
			set(order);
			if (typeof window !== 'undefined') {
				localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order));
			}
		},
		reset: () => {
			set(defaultMenuOrder);
			if (typeof window !== 'undefined') {
				localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(defaultMenuOrder));
			}
		},
		moveItem: (fromIndex: number, toIndex: number) => {
			update((order) => {
				const newOrder = [...order];
				const [removed] = newOrder.splice(fromIndex, 1);
				newOrder.splice(toIndex, 0, removed);

				if (typeof window !== 'undefined') {
					localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(newOrder));
				}

				return newOrder;
			});
		}
	};
}

export const menuOrderStore = createMenuOrderStore();
