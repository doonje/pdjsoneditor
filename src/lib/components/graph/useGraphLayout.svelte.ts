import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/svelte';
import type { NodeData } from './useGraphState.svelte';
// @ts-expect-error - Vite injects a Worker constructor type via ?worker
import GraphLayoutWorker from '$lib/workers/graphLayout.worker.ts?worker&module';
import { graphLoading } from '$lib/stores/graphLoading';
import { logger } from '$lib/logger';

// Layout Configuration
export const LAYOUT_CONFIG = {
	// Node size
	NODE_WIDTH: 280,
	INITIAL_HEIGHT: 100, // Fallback height (should rarely be used)

	// Estimated layout metrics (keep in sync with CompactNode.svelte CSS)
	METRICS: {
		NODE_PADDING_Y: 16, // .compact-node padding 8px top/bottom => 16
		NODE_BORDER_Y: 2, // .compact-node border 1px top/bottom => 2
		HEADER_HEIGHT: 20, // .node-header min-height
		ITEMS_TOP_MARGIN: 4, // .node-items margin-top
		ITEM_ROW_HEIGHT: 24, // .item fixed height
		MORE_BUTTON_HEIGHT: 24 // .more-items-btn height
	},

	// dagre layout settings
	DAGRE: {
		RANK_DIR: 'LR',
		NODE_SEP: 20, // LR mode: vertical spacing between nodes at same x coordinate
		RANK_SEP: 150, // LR mode: horizontal spacing between levels
		EDGE_SEP: 10,
		RANKER: 'network-simplex',
		ALIGN: 'UL',
		MARGIN_X: 50,
		MARGIN_Y: 50
	},

	// Overlap prevention
	OVERLAP: {
		MIN_SPACING: 30, // Minimum spacing between nodes
		X_TOLERANCE: 5 // X coordinate grouping tolerance
	},

	// Others
	MAX_DISPLAY_ITEMS: 20 // Maximum number of items to display
};

/**
 * Composable for managing graph layout calculations
 * Handles both synchronous (Dagre) and asynchronous (Worker) layout
 */
export function useGraphLayout() {
	let reflowScheduled = false;
	let fakeProgressTimer: number | null = null;

	// Dagre layout configuration
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	/**
	 * Estimate node height based on its data
	 */
	function estimateNodeHeight(nodeData: NodeData, showAllItems: boolean): number {
		const m = LAYOUT_CONFIG.METRICS;
		let height = m.NODE_PADDING_Y + m.NODE_BORDER_Y + m.HEADER_HEIGHT;

		if (nodeData.items && nodeData.items.length > 0) {
			height += m.ITEMS_TOP_MARGIN;
			const displayCount = estimateDisplayItemCount(nodeData, showAllItems);
			height += displayCount * m.ITEM_ROW_HEIGHT;

			// Add more button height if needed
			if (nodeData.totalCount && nodeData.totalCount > LAYOUT_CONFIG.MAX_DISPLAY_ITEMS && !showAllItems) {
				height += m.MORE_BUTTON_HEIGHT;
			}
		}

		return height;
	}

	/**
	 * Estimate how many items will be displayed
	 */
	function estimateDisplayItemCount(nodeData: NodeData, showAllItems: boolean): number {
		if (!nodeData.items) return 0;

		if (showAllItems || !nodeData.totalCount) {
			return nodeData.items.length;
		}

		return Math.min(nodeData.items.length, LAYOUT_CONFIG.MAX_DISPLAY_ITEMS);
	}

	/**
	 * Schedule a reflow of the graph layout
	 */
	function scheduleReflow(callback: () => void) {
		if (reflowScheduled) {
			logger.debug('[scheduleReflow] Already scheduled, skipping');
			return;
		}
		reflowScheduled = true;
		logger.debug('[scheduleReflow] Scheduling reflow');
		requestAnimationFrame(() => {
			reflowScheduled = false;
			logger.debug('[scheduleReflow] Executing reflow');
			callback();
		});
	}

	/**
	 * Layout nodes using Dagre library (synchronous)
	 */
	function layoutNodesWithDagre(
		nodes: Node<NodeData>[],
		edges: Edge[],
		measuredHeights: Map<string, number>,
		showAllItemsNodes: Set<string>
	): { nodes: Node<NodeData>[]; edges: Edge[] } {
		const cfg = LAYOUT_CONFIG.DAGRE;

		dagreGraph.setGraph({
			rankdir: cfg.RANK_DIR,
			nodesep: cfg.NODE_SEP,
			ranksep: cfg.RANK_SEP,
			edgesep: cfg.EDGE_SEP,
			ranker: cfg.RANKER,
			align: cfg.ALIGN,
			marginx: cfg.MARGIN_X,
			marginy: cfg.MARGIN_Y
		});

		// Add nodes to dagre graph
		nodes.forEach(node => {
			const showAll = showAllItemsNodes.has(node.id);
			const height = measuredHeights.get(node.id) || estimateNodeHeight(node.data, showAll);

			dagreGraph.setNode(node.id, {
				width: LAYOUT_CONFIG.NODE_WIDTH,
				height: height
			});
		});

		// Add edges to dagre graph
		edges.forEach(edge => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		// Perform layout
		dagre.layout(dagreGraph);

		// Update node positions
		const layoutedNodes = nodes.map(node => {
			const dagreNode = dagreGraph.node(node.id);
			if (dagreNode) {
				return {
					...node,
					position: {
						x: dagreNode.x - dagreNode.width / 2,
						y: dagreNode.y - dagreNode.height / 2
					}
				};
			}
			return node;
		});

		// Prevent overlaps
		preventOverlaps(layoutedNodes);

		return { nodes: layoutedNodes, edges };
	}

	/**
	 * Layout using Web Worker (asynchronous)
	 */
	async function performLayoutWithWorker(
		nodes: Node<NodeData>[],
		edges: Edge[],
		measuredHeights: Map<string, number>,
		showAllItemsNodes: Set<string>
	): Promise<{ nodes: Node<NodeData>[]; edges: Edge[] }> {
		// Instantiate bundled worker via Vite's ?worker plugin
		const worker: Worker = new (GraphLayoutWorker as unknown as new () => Worker)();
		const LARGE_GRAPH_NODE_THRESHOLD = 400;
		const isLarge = nodes.length >= LARGE_GRAPH_NODE_THRESHOLD;

		const cfg = {
			...LAYOUT_CONFIG,
			DAGRE: {
				...LAYOUT_CONFIG.DAGRE,
				RANKER: isLarge ? 'longest-path' : LAYOUT_CONFIG.DAGRE.RANKER,
				NODE_SEP: isLarge
					? Math.max(16, LAYOUT_CONFIG.DAGRE.NODE_SEP - 4)
					: LAYOUT_CONFIG.DAGRE.NODE_SEP,
				RANK_SEP: isLarge
					? Math.max(80, LAYOUT_CONFIG.DAGRE.RANK_SEP - 40)
					: LAYOUT_CONFIG.DAGRE.RANK_SEP
			}
		};

		graphLoading.set({ active: true, phase: 'build', progress: 0 });

		return new Promise((resolve, reject) => {
			worker.onmessage = (e: MessageEvent) => {
				const data = e.data as {
					type: string;
					nodes?: Node<NodeData>[];
					edges?: Edge[];
					progress?: number;
					message?: string;
					phase?: 'build' | 'layout' | 'finalize';
				};

				if (data.type === 'progress') {
					// Stop fake progress when real progress starts arriving
					if (fakeProgressTimer) {
						clearInterval(fakeProgressTimer);
						fakeProgressTimer = null;
					}
					graphLoading.set({
						active: true,
						phase: data.phase || 'build',
						progress: data.progress || 0
					});
				} else if (data.type === 'done') {
					graphLoading.set({ active: true, phase: 'finalize', progress: 1 });
					worker.terminate();
					resolve({ nodes: data.nodes || [], edges: data.edges || edges });
				}
			};

			worker.onerror = (err) => {
				worker.terminate();
				reject(err);
			};

			worker.postMessage({
				type: 'layout',
				nodes: nodes,
				edges: edges,
				config: cfg,
				measuredHeights: Object.fromEntries(measuredHeights),
				showAllItemsNodes: Array.from(showAllItemsNodes)
			});
		});
	}

	/**
	 * Start fake progress animation while waiting for real progress
	 */
	function startFakeProgress() {
		let fakeProgress = 0;
		fakeProgressTimer = setInterval(() => {
			fakeProgress = Math.min(fakeProgress + 0.05, 0.9);
			graphLoading.set({
				active: true,
				phase: 'build',
				progress: fakeProgress
			});
		}, 100) as unknown as number;
	}

	/**
	 * Stop fake progress animation
	 */
	function stopFakeProgress() {
		if (fakeProgressTimer) {
			clearInterval(fakeProgressTimer);
			fakeProgressTimer = null;
		}
	}

	/**
	 * Prevent node overlaps by adjusting positions
	 */
	function preventOverlaps(nodes: Node<NodeData>[]) {
		// Group nodes by approximate X coordinate
		const columnGroups = new Map<number, Node<NodeData>[]>();
		const tolerance = LAYOUT_CONFIG.OVERLAP.X_TOLERANCE;

		nodes.forEach(node => {
			if (!node.position) return;
			const roundedX = Math.round(node.position.x / tolerance) * tolerance;

			if (!columnGroups.has(roundedX)) {
				columnGroups.set(roundedX, []);
			}
			columnGroups.get(roundedX)!.push(node);
		});

		// Sort and space out nodes in each column
		columnGroups.forEach(columnNodes => {
			if (columnNodes.length <= 1) return;

			// Sort by Y position
			columnNodes.sort((a, b) => a.position!.y - b.position!.y);

			// Adjust spacing
			for (let i = 1; i < columnNodes.length; i++) {
				const prevNode = columnNodes[i - 1];
				const currNode = columnNodes[i];

				const prevHeight = prevNode.data.items ? estimateNodeHeight(prevNode.data, false) : LAYOUT_CONFIG.INITIAL_HEIGHT;
				const prevBottom = prevNode.position!.y + prevHeight;
				const currTop = currNode.position!.y;

				if (currTop < prevBottom + LAYOUT_CONFIG.OVERLAP.MIN_SPACING) {
					currNode.position!.y = prevBottom + LAYOUT_CONFIG.OVERLAP.MIN_SPACING;
				}
			}
		});
	}

	return {
		LAYOUT_CONFIG,
		estimateNodeHeight,
		estimateDisplayItemCount,
		scheduleReflow,
		layoutNodesWithDagre,
		performLayoutWithWorker,
		startFakeProgress,
		stopFakeProgress,
	};
}