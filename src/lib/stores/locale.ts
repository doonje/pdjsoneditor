import { writable } from 'svelte/store';
import type { Locales } from '$i18n/i18n-types';

// Get saved locale from localStorage or default to 'ko'
const getInitialLocale = (): Locales => {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('locale');
		if (saved === 'ko' || saved === 'en') {
			return saved as Locales;
		}
	}
	return 'ko';
};

export const locale = writable<Locales>(getInitialLocale());

// Save locale to localStorage when it changes
locale.subscribe((value) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('locale', value);
	}
});
