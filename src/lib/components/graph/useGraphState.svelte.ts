import type { Node as FlowNode, Edge } from '@xyflow/svelte';
import type { JsonValue, NodeItem } from '$lib/types/json';

export type NodeData = {
	label: string;
	items?: NodeItem[];
	allItems?: NodeItem[];
	isExpanded?: boolean;
	isArray?: boolean;
	nodeId?: string;
	hasToggle?: boolean;
	hasExpandAll?: boolean;
	path?: string;
	hasChildren?: boolean;
	hasParent?: boolean;
	totalCount?: number;
};

export type Node = FlowNode<NodeData>;

/**
 * Composable for managing graph state
 * Handles expanded nodes, references, and node visibility
 */
export function useGraphState() {
	// State for managing which nodes are expanded/collapsed
	const expandedNodes = $state(new Set<string>());
	const expandedReferences = $state(new Set<string>());
	const showAllItemsNodes = $state(new Set<string>());

	// Graph nodes and edges
	let nodes = $state<Node[]>([]);
	let edges = $state<Edge[]>([]);

	// Node height measurements for layout
	const measuredHeights = new Map<string, number>();

	// Node callbacks for interaction
	const nodeCallbacks = new Map<string, { toggle: () => void; expandAll: () => void }>();

	/**
	 * Toggle node expansion state
	 */
	function toggleNode(nodeId: string) {
		if (expandedNodes.has(nodeId)) {
			expandedNodes.delete(nodeId);
		} else {
			expandedNodes.add(nodeId);
		}
	}

	/**
	 * Toggle reference expansion state
	 */
	function toggleReference(refId: string) {
		if (expandedReferences.has(refId)) {
			expandedReferences.delete(refId);
		} else {
			expandedReferences.add(refId);
		}
	}

	/**
	 * Toggle show all items for a node
	 */
	function toggleShowAllItems(nodeId: string) {
		if (showAllItemsNodes.has(nodeId)) {
			showAllItemsNodes.delete(nodeId);
		} else {
			showAllItemsNodes.add(nodeId);
		}
	}

	/**
	 * Expand all nodes
	 */
	function expandAll() {
		nodes.forEach(node => {
			if (node.data.hasChildren) {
				expandedNodes.add(node.id);
			}
			if (node.data.items && node.data.totalCount && node.data.totalCount > 20) {
				showAllItemsNodes.add(node.id);
			}
		});
	}

	/**
	 * Collapse all nodes
	 */
	function collapseAll() {
		expandedNodes.clear();
		showAllItemsNodes.clear();
	}

	/**
	 * Reset state
	 */
	function reset() {
		nodes = [];
		edges = [];
		expandedNodes.clear();
		expandedReferences.clear();
		showAllItemsNodes.clear();
		measuredHeights.clear();
		nodeCallbacks.clear();
	}

	/**
	 * Update nodes and edges
	 */
	function updateGraph(newNodes: Node[], newEdges: Edge[]) {
		nodes = newNodes;
		edges = newEdges;
	}

	/**
	 * Register node callbacks for interaction
	 */
	function registerNodeCallbacks(nodeId: string, callbacks: { toggle: () => void; expandAll: () => void }) {
		nodeCallbacks.set(nodeId, callbacks);
	}

	/**
	 * Set measured height for a node
	 */
	function setNodeHeight(nodeId: string, height: number) {
		measuredHeights.set(nodeId, height);
	}

	return {
		// State
		get nodes() { return nodes; },
		get edges() { return edges; },
		get expandedNodes() { return expandedNodes; },
		get expandedReferences() { return expandedReferences; },
		get showAllItemsNodes() { return showAllItemsNodes; },
		get measuredHeights() { return measuredHeights; },
		get nodeCallbacks() { return nodeCallbacks; },

		// Methods
		toggleNode,
		toggleReference,
		toggleShowAllItems,
		expandAll,
		collapseAll,
		reset,
		updateGraph,
		registerNodeCallbacks,
		setNodeHeight,
	};
}