/**
 * Graph loading phases
 */
export type GraphPhase = 'build' | 'layout' | 'finalize' | null;

/**
 * Graph loading state interface
 */
export interface GraphLoadingState {
	active: boolean;
	phase: GraphPhase;
	progress: number;
	message?: string;
}

/**
 * Create graph loading store using Svelte 5 runes
 * Manages loading state for graph generation and layout
 */
export function createGraphLoadingStore() {
	// Initialize state
	let state = $state<GraphLoadingState>({
		active: false,
		phase: null,
		progress: 0,
		message: undefined
	});

	/**
	 * Set loading state
	 */
	function set(newState: Partial<GraphLoadingState>) {
		state = {
			...state,
			...newState
		};
	}

	/**
	 * Start loading with a specific phase
	 */
	function start(phase: GraphPhase = 'build', message?: string) {
		state = {
			active: true,
			phase,
			progress: 0,
			message
		};
	}

	/**
	 * Update progress
	 */
	function updateProgress(progress: number, phase?: GraphPhase, message?: string) {
		state = {
			...state,
			progress: Math.min(Math.max(progress, 0), 1), // Clamp between 0 and 1
			...(phase !== undefined && { phase }),
			...(message !== undefined && { message })
		};
	}

	/**
	 * Move to next phase
	 */
	function nextPhase(phase: GraphPhase, message?: string) {
		state = {
			...state,
			phase,
			progress: 0,
			message
		};
	}

	/**
	 * Complete loading
	 */
	function complete() {
		state = {
			active: false,
			phase: null,
			progress: 1,
			message: undefined
		};
	}

	/**
	 * Reset loading state
	 */
	function reset() {
		state = {
			active: false,
			phase: null,
			progress: 0,
			message: undefined
		};
	}

	/**
	 * Check if loading is active
	 */
	function isLoading(): boolean {
		return state.active;
	}

	/**
	 * Get current phase
	 */
	function getCurrentPhase(): GraphPhase {
		return state.phase;
	}

	/**
	 * Get progress percentage (0-100)
	 */
	function getProgressPercentage(): number {
		return Math.round(state.progress * 100);
	}

	return {
		// State
		get state() { return state; },
		get active() { return state.active; },
		get phase() { return state.phase; },
		get progress() { return state.progress; },
		get message() { return state.message; },

		// Methods
		set,
		start,
		updateProgress,
		nextPhase,
		complete,
		reset,
		isLoading,
		getCurrentPhase,
		getProgressPercentage,
	};
}

// Create singleton instance
export const graphLoading = createGraphLoadingStore();