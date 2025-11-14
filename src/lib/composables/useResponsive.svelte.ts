/**
 * Device types for responsive design
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Mobile view modes
 */
export type MobileView = 'editor' | 'graph';

/**
 * Composable for managing responsive design and device detection
 * Handles viewport changes and mobile/tablet/desktop layouts
 */
export function useResponsive() {
	// Device detection state
	let deviceType = $state<DeviceType>('desktop');
	let isLandscape = $state(false);
	let mobileView = $state<MobileView>('editor');
	let windowWidth = $state(0);
	let windowHeight = $state(0);

	// Breakpoints (matching Tailwind defaults)
	const BREAKPOINTS = {
		mobile: 640,  // sm: 640px
		tablet: 768,  // md: 768px
		desktop: 1024 // lg: 1024px
	};

	// Initialize and listen to window resize
	$effect(() => {
		if (typeof window === 'undefined') return;

		function updateDeviceInfo() {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;

			// Determine device type based on width
			if (windowWidth < BREAKPOINTS.mobile) {
				deviceType = 'mobile';
			} else if (windowWidth < BREAKPOINTS.desktop) {
				deviceType = 'tablet';
			} else {
				deviceType = 'desktop';
			}

			// Check orientation
			isLandscape = windowWidth > windowHeight;
		}

		// Initial detection
		updateDeviceInfo();

		// Listen to resize events
		window.addEventListener('resize', updateDeviceInfo);

		// Cleanup
		return () => {
			window.removeEventListener('resize', updateDeviceInfo);
		};
	});

	/**
	 * Switch mobile view
	 */
	function switchMobileView(view: MobileView) {
		mobileView = view;
	}

	/**
	 * Toggle between editor and graph views (mobile only)
	 */
	function toggleMobileView() {
		mobileView = mobileView === 'editor' ? 'graph' : 'editor';
	}

	/**
	 * Check if current device is mobile
	 */
	function isMobile(): boolean {
		return deviceType === 'mobile';
	}

	/**
	 * Check if current device is tablet
	 */
	function isTablet(): boolean {
		return deviceType === 'tablet';
	}

	/**
	 * Check if current device is desktop
	 */
	function isDesktop(): boolean {
		return deviceType === 'desktop';
	}

	/**
	 * Check if current device is touch-enabled
	 */
	function isTouchDevice(): boolean {
		if (typeof window === 'undefined') return false;
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}

	/**
	 * Get responsive classes based on device type
	 */
	function getResponsiveClasses(
		mobile: string = '',
		tablet: string = '',
		desktop: string = ''
	): string {
		switch (deviceType) {
			case 'mobile':
				return mobile;
			case 'tablet':
				return tablet;
			case 'desktop':
				return desktop;
			default:
				return desktop;
		}
	}

	/**
	 * Get container padding based on device
	 */
	function getContainerPadding(): string {
		return getResponsiveClasses('px-2', 'px-4', 'px-6');
	}

	/**
	 * Get optimal pane sizes for resizable panels
	 */
	function getPaneSizes(): { default: number; min: number; max: number } {
		switch (deviceType) {
			case 'mobile':
				// Mobile: full width for each view
				return { default: 100, min: 100, max: 100 };
			case 'tablet':
				// Tablet: flexible split
				return { default: 50, min: 30, max: 70 };
			case 'desktop':
				// Desktop: optimal split
				return { default: 50, min: 20, max: 80 };
		}
	}

	/**
	 * Check if split view should be enabled
	 */
	function shouldShowSplitView(): boolean {
		// Only show split view on tablet and desktop
		return deviceType !== 'mobile';
	}

	return {
		// State
		get deviceType() { return deviceType; },
		get isLandscape() { return isLandscape; },
		get mobileView() { return mobileView; },
		get windowWidth() { return windowWidth; },
		get windowHeight() { return windowHeight; },

		// Methods
		switchMobileView,
		toggleMobileView,
		isMobile,
		isTablet,
		isDesktop,
		isTouchDevice,
		getResponsiveClasses,
		getContainerPadding,
		getPaneSizes,
		shouldShowSplitView,

		// Constants
		BREAKPOINTS,
	};
}