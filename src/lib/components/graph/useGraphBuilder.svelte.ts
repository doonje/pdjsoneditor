import { Position } from '@xyflow/svelte';
import type { Edge } from '@xyflow/svelte';
import type { JsonValue, NodeItem } from '$lib/types/json';
import type { Node, NodeData } from './useGraphState.svelte';
import { LAYOUT_CONFIG } from './useGraphLayout.svelte';
import { logger } from '$lib/logger';

/**
 * Composable for building graph from JSON data
 * Handles node and edge creation from JSON structure
 */
export function useGraphBuilder() {
	let nodeId = 0;

	// Temporary arrays for building the graph
	let tempNodes: Node[] = [];
	let tempEdges: Edge[] = [];

	/**
	 * Reset the builder state
	 */
	function reset() {
		nodeId = 0;
		tempNodes = [];
		tempEdges = [];
	}

	/**
	 * Get original number format from JSON string
	 */
	function getOriginalNumberFormat(
		jsonStr: string,
		path: string,
		parsedValue: number
	): string | null {
		try {
			// For root level properties, create a simple regex
			if (!path.includes('.')) {
				const keyPattern = new RegExp(
					`"${path}"\\s*:\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)`,
					'g'
				);
				const match = keyPattern.exec(jsonStr);
				if (match && parseFloat(match[1]) === parsedValue) {
					return match[1];
				}
			} else {
				// For nested properties, this is more complex
				// For now, just check if it's a whole number that could be a float
				if (Number.isInteger(parsedValue)) {
					// Check if original contains this number with decimal point
					const numberStr = parsedValue.toString();
					const floatPattern = new RegExp(`\\b${numberStr}\\.0\\b`);
					if (floatPattern.test(jsonStr)) {
						return `${numberStr}.0`;
					}
				}
			}
		} catch {
			// If regex fails, return null
		}
		return null;
	}

	/**
	 * Get JSON value at a specific path
	 */
	function getJsonAtPath(root: JsonValue, pathStr: string): JsonValue | null {
		if (!pathStr) return root;
		const parts = pathStr.split('.').filter(Boolean);
		let cur = root as JsonValue;
		for (const p of parts) {
			if (cur == null) return null;
			if (Array.isArray(cur)) {
				const idx = Number(p);
				if (Number.isNaN(idx)) return null;
				cur = cur[idx];
			} else if (typeof cur === 'object') {
				cur = (cur as Record<string, JsonValue>)[p];
			} else {
				return null;
			}
		}
		return cur as JsonValue;
	}

	/**
	 * Create a compact graph representation of JSON data
	 */
	function createCompactGraph(
		data: JsonValue | null | undefined,
		parentId: string | null = null,
		key: string = 'root',
		level = 0,
		path: string[] = [],
		isFromReference = false,
		preGeneratedNodeId?: string,
		expandedNodes?: Set<string>,
		jsonString?: string,
		isFirstLoad = false
	): void {
		const currentNodeId = preGeneratedNodeId || `node-${nodeId++}`;
		// On first load, expand all nodes
		const isExpanded = isFirstLoad ? true : (expandedNodes?.has(currentNodeId) || false);
		if (isFirstLoad && expandedNodes && !expandedNodes.has(currentNodeId)) {
			expandedNodes.add(currentNodeId);
		}
		const currentPath = key === 'root' ? [] : [...path, key];

		if (data === null || data === undefined) {
			// Leaf node for null/undefined
			const node: Node = {
				id: currentNodeId,
				type: 'compact',
				data: {
					label: `${key} ${data}`,
					items: undefined,
					hasParent: parentId !== null,
					hasChildren: false
				},
				position: { x: 0, y: 0 }, // Position will be calculated by dagre
				sourcePosition: Position.Right,
				targetPosition: Position.Left
			};
			tempNodes.push(node);

			if (parentId && !isFromReference) {
				tempEdges.push({
					id: `edge-${parentId}-${currentNodeId}`,
					source: parentId,
					target: currentNodeId,
					type: 'bezier',
					animated: false,
					style: 'stroke: #9ca3af; stroke-width: 1'
				} as Edge);
			}
			return;
		}

		if (typeof data === 'object' && !Array.isArray(data)) {
			// Object node
			const entries = Object.entries(data);
			const items: NodeItem[] = [];
			const allItems: NodeItem[] = [];
			let hasReferences = false;

			for (const [entryKey, value] of entries) {
				const valuePath = [...currentPath, entryKey];
				const valuePathStr = valuePath.join('.');

				if (value !== null && typeof value === 'object') {
					// Reference to another node
					hasReferences = true;
					allItems.push({
						key: entryKey,
						value: Array.isArray(value) ? `[${value.length}]` : '{...}',
						type: 'reference',
						path: valuePathStr,
						targetNodeId: `node-${nodeId}` // Pre-allocate ID for the child
					});
				} else if (value === null) {
					allItems.push({
						key: entryKey,
						value: 'null',
						type: 'null',
						path: valuePathStr
					});
				} else if (value === undefined) {
					allItems.push({
						key: entryKey,
						value: 'undefined',
						type: 'undefined',
						path: valuePathStr
					});
				} else if (typeof value === 'boolean') {
					allItems.push({
						key: entryKey,
						value: value.toString(),
						type: 'boolean',
						path: valuePathStr
					});
				} else if (typeof value === 'number') {
					// Check for original formatting if jsonString is provided
					let displayValue = value.toString();
					if (jsonString) {
						const originalFormat = getOriginalNumberFormat(jsonString, valuePathStr, value);
						if (originalFormat) {
							displayValue = originalFormat;
						}
					}
					allItems.push({
						key: entryKey,
						value: displayValue,
						type: 'number',
						path: valuePathStr
					});
				} else {
					allItems.push({
						key: entryKey,
						value: String(value),
						type: 'string',
						path: valuePathStr
					});
				}
			}

			// Decide which items to show based on expanded state
			if (isExpanded) {
				items.push(...allItems);
			} else {
				// When collapsed, only show reference items
				items.push(...allItems.filter((item) => item.type === 'reference'));
			}

			const node: Node = {
				id: currentNodeId,
				type: 'compact',
				data: {
					label: key === 'root' ? 'Root Object' : key,
					items: items,
					allItems: allItems,
					isExpanded: isExpanded,
					nodeId: currentNodeId,
					hasToggle: hasReferences,
					hasExpandAll: hasReferences,
					path: currentPath.join('.'),
					hasParent: parentId !== null,
					hasChildren: hasReferences,
					totalCount: allItems.length
				},
				position: { x: 0, y: 0 },
				sourcePosition: Position.Right,
				targetPosition: Position.Left
			};

			tempNodes.push(node);

			if (parentId && !isFromReference) {
				tempEdges.push({
					id: `edge-${parentId}-${currentNodeId}`,
					source: parentId,
					target: currentNodeId,
					type: 'bezier',
					animated: false,
					style: 'stroke: #9ca3af; stroke-width: 1'
				} as Edge);
			}

			// Create child nodes only if expanded
			if (isExpanded) {
				for (const [entryKey, value] of entries) {
					if (value !== null && typeof value === 'object') {
						const preAllocatedId = allItems.find((item) => item.key === entryKey)?.targetNodeId;
						createCompactGraph(
							value,
							currentNodeId,
							entryKey,
							level + 1,
							currentPath,
							false,
							preAllocatedId,
							expandedNodes,
							jsonString,
							isFirstLoad
						);
					}
				}
			}
		} else if (Array.isArray(data)) {
			// Array node
			const items: NodeItem[] = [];
			const allItems: NodeItem[] = [];
			let hasReferences = false;

			for (let i = 0; i < data.length; i++) {
				const value = data[i];
				const valuePath = [...currentPath, String(i)];
				const valuePathStr = valuePath.join('.');

				if (value !== null && typeof value === 'object') {
					// Reference to another node
					hasReferences = true;
					allItems.push({
						key: `[${i}]`,
						value: Array.isArray(value) ? `[${value.length}]` : '{...}',
						type: 'reference',
						path: valuePathStr,
						targetNodeId: `node-${nodeId}` // Pre-allocate ID for the child
					});
				} else if (value === null) {
					allItems.push({
						key: `[${i}]`,
						value: 'null',
						type: 'null',
						path: valuePathStr
					});
				} else if (typeof value === 'boolean') {
					allItems.push({
						key: `[${i}]`,
						value: value.toString(),
						type: 'boolean',
						path: valuePathStr
					});
				} else if (typeof value === 'number') {
					// Check for original formatting
					let displayValue = value.toString();
					if (jsonString) {
						const originalFormat = getOriginalNumberFormat(jsonString, valuePathStr, value);
						if (originalFormat) {
							displayValue = originalFormat;
						}
					}
					allItems.push({
						key: `[${i}]`,
						value: displayValue,
						type: 'number',
						path: valuePathStr
					});
				} else {
					allItems.push({
						key: `[${i}]`,
						value: String(value),
						type: 'string',
						path: valuePathStr
					});
				}
			}

			// Decide which items to show based on expanded state
			if (isExpanded) {
				items.push(...allItems);
			} else {
				// When collapsed, only show reference items
				items.push(...allItems.filter((item) => item.type === 'reference'));
			}

			const node: Node = {
				id: currentNodeId,
				type: 'compact',
				data: {
					label: key === 'root' ? `Root Array [${data.length}]` : `${key} [${data.length}]`,
					items: items,
					allItems: allItems,
					isExpanded: isExpanded,
					isArray: true,
					nodeId: currentNodeId,
					hasToggle: hasReferences,
					hasExpandAll: hasReferences,
					path: currentPath.join('.'),
					hasParent: parentId !== null,
					hasChildren: hasReferences,
					totalCount: allItems.length
				},
				position: { x: 0, y: 0 },
				sourcePosition: Position.Right,
				targetPosition: Position.Left
			};

			tempNodes.push(node);

			if (parentId && !isFromReference) {
				tempEdges.push({
					id: `edge-${parentId}-${currentNodeId}`,
					source: parentId,
					target: currentNodeId,
					type: 'bezier',
					animated: false,
					style: 'stroke: #9ca3af; stroke-width: 1'
				} as Edge);
			}

			// Create child nodes only if expanded
			if (isExpanded) {
				for (let i = 0; i < data.length; i++) {
					const value = data[i];
					if (value !== null && typeof value === 'object') {
						const preAllocatedId = allItems.find((item) => item.key === `[${i}]`)?.targetNodeId;
						createCompactGraph(
							value,
							currentNodeId,
							`[${i}]`,
							level + 1,
							currentPath,
							false,
							preAllocatedId,
							expandedNodes,
							jsonString,
							isFirstLoad
						);
					}
				}
			}
		} else {
			// Primitive leaf node
			let displayValue = String(data);

			// Handle number formatting
			if (typeof data === 'number' && jsonString) {
				const pathStr = currentPath.join('.');
				const originalFormat = getOriginalNumberFormat(jsonString, pathStr, data);
				if (originalFormat) {
					displayValue = originalFormat;
				}
			}

			const node: Node = {
				id: currentNodeId,
				type: 'compact',
				data: {
					label: key === 'root' ? 'Root' : key,
					items: [
						{
							key: 'value',
							value: displayValue,
							type: typeof data as NodeItem['type'],
							path: currentPath.join('.')
						}
					],
					hasParent: parentId !== null,
					hasChildren: false
				},
				position: { x: 0, y: 0 },
				sourcePosition: Position.Right,
				targetPosition: Position.Left
			};

			tempNodes.push(node);

			if (parentId && !isFromReference) {
				tempEdges.push({
					id: `edge-${parentId}-${currentNodeId}`,
					source: parentId,
					target: currentNodeId,
					type: 'bezier',
					animated: false,
					style: 'stroke: #9ca3af; stroke-width: 1'
				} as Edge);
			}
		}
	}

	/**
	 * Build graph from JSON data
	 */
	function buildGraph(
		jsonData: JsonValue,
		jsonString: string | undefined,
		expandedNodes: Set<string>,
		isFirstLoad: boolean
	): { nodes: Node[]; edges: Edge[] } {
		reset();

		createCompactGraph(
			jsonData,
			null,
			'root',
			0,
			[],
			false,
			undefined,
			expandedNodes,
			jsonString,
			isFirstLoad
		);

		logger.debug(`[buildGraph] Created ${tempNodes.length} nodes, ${tempEdges.length} edges`);
		return { nodes: tempNodes, edges: tempEdges };
	}

	/**
	 * Incrementally create children for a parent node
	 */
	function incrementallyCreateChildren(
		parentId: string,
		parentPath: string,
		parentJson: JsonValue,
		allItems: NodeItem[],
		showAllItemsNodes: Set<string>,
		expandedReferences: Set<string>,
		jsonData: JsonValue,
		jsonString?: string
	): { nodes: Node[]; edges: Edge[] } {
		const nodeShowsAll = showAllItemsNodes.has(parentId);
		const refItems = allItems.filter((it) => it.type === 'reference');

		// Reset temp arrays
		tempNodes = [];
		tempEdges = [];

		refItems.forEach((refItem: NodeItem, idx: number) => {
			const visible = nodeShowsAll || idx < LAYOUT_CONFIG.MAX_DISPLAY_ITEMS;
			const referenceKey = `${parentId}-${refItem.key}`;
			const isRefExpanded = expandedReferences.has(referenceKey) || true; // default expanded

			if (!visible || !isRefExpanded) return;

			const childId: string = refItem.targetNodeId || `node-${++nodeId}`;
			const childPath = parentPath ? `${parentPath}.${refItem.key}` : refItem.key;
			const childJson = getJsonAtPath(jsonData as JsonValue, childPath);

			// Build subtree starting from this child
			createCompactGraph(
				childJson as JsonValue,
				parentId,
				refItem.key,
				0,
				parentPath ? parentPath.split('.') : [],
				true,
				childId,
				undefined,
				jsonString,
				false
			);

			// Connect parent to child with reference edge
			tempEdges.push({
				id: `edge-${parentId}-${refItem.key}-${childId}`,
				source: parentId,
				sourceHandle: `${parentId}-${refItem.key}`,
				target: childId,
				type: 'bezier',
				animated: false,
				style: 'stroke: #9ca3af; stroke-width: 1'
			} as Edge);

			expandedReferences.add(referenceKey);
		});

		return { nodes: tempNodes, edges: tempEdges };
	}

	/**
	 * Get descendant node IDs for a given root node
	 */
	function getDescendantNodeIds(rootId: string, edges: Edge[]): Set<string> {
		const childrenMap = new Map<string, string[]>();
		for (const e of edges) {
			const arr = childrenMap.get(e.source) || [];
			arr.push(e.target);
			childrenMap.set(e.source, arr);
		}

		const result = new Set<string>();
		const stack: string[] = [...(childrenMap.get(rootId) || [])];

		while (stack.length) {
			const cur = stack.pop()!;
			if (result.has(cur)) continue;
			result.add(cur);
			const kids = childrenMap.get(cur);
			if (kids && kids.length) stack.push(...kids);
		}

		return result;
	}

	return {
		buildGraph,
		incrementallyCreateChildren,
		getDescendantNodeIds,
		getJsonAtPath,
		getOriginalNumberFormat,
	};
}