import type { Locales } from '$i18n/i18n-types';

/**
 * Get initial locale from localStorage or browser
 */
function getInitialLocale(): Locales {
	if (typeof window === 'undefined') return 'en';

	// Check localStorage first
	const stored = localStorage.getItem('language');
	if (stored === 'ko' || stored === 'en') {
		return stored as Locales;
	}

	// Check browser language
	const browserLang = navigator.language.toLowerCase();
	if (browserLang.startsWith('ko')) {
		return 'ko';
	}

	return 'en';
}

/**
 * Create locale store using Svelte 5 runes
 * Handles language selection and persistence
 */
export function createLocaleStore() {
	// Initialize locale state
	let currentLocale = $state<Locales>(getInitialLocale());

	// Persist to localStorage when locale changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('language', currentLocale);
		}
	});

	/**
	 * Set the locale
	 */
	function setLocale(newLocale: Locales) {
		currentLocale = newLocale;
	}

	/**
	 * Toggle between available locales
	 */
	function toggleLocale() {
		currentLocale = currentLocale === 'en' ? 'ko' : 'en';
	}

	/**
	 * Get available locales
	 */
	function getAvailableLocales(): Locales[] {
		return ['en', 'ko'];
	}

	/**
	 * Check if a locale is currently active
	 */
	function isActive(locale: Locales): boolean {
		return currentLocale === locale;
	}

	return {
		// State
		get locale() { return currentLocale; },

		// Methods
		setLocale,
		toggleLocale,
		getAvailableLocales,
		isActive,
	};
}

// Create singleton instance
export const localeStore = createLocaleStore();