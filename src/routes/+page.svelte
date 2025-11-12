<script lang="ts">
	import { onMount } from 'svelte';
	import JsonEditor from '$lib/components/JsonEditor.svelte';
	import JsonGraph from '$lib/components/JsonGraph.svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import EditorToolbar from '$lib/components/EditorToolbar.svelte';
	import EditorActions from '$lib/components/EditorActions.svelte';
	import RequestSettingsDialog from '$lib/components/RequestSettingsDialog.svelte';
	import { tabsStore } from '$lib/stores/tabs.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Moon, Sun } from 'lucide-svelte';
	import { mode, toggleMode } from 'mode-watcher';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import LL from '$i18n/i18n-svelte';
	import { toast } from 'svelte-sonner';
	import type { JsonValue } from '$lib/types/json';
	import { STORAGE_KEYS } from '$lib/constants';
	import { requestJson, type HttpMethod } from '$lib/services/http';
	import { logger } from '$lib/logger';
	import { regenerateJSONValues, generateSampleJSON } from '$lib/utils/faker-generator';

	// Create a local state for the editor that syncs with the active tab
	let editorValue = $state('');

	// Update editor value when tab changes
	$effect(() => {
		const activeTab = tabsStore.getActiveTab();
		if (activeTab) {
			editorValue = activeTab.jsonContent;
			// Use cached parsed JSON if available for instant switching
			if (activeTab.parsedJson !== undefined) {
				parsedJson = activeTab.parsedJson as JsonValue;
				error = activeTab.parsedJson ? '' : $LL.editor.invalidJson();
			} else {
				// Parse if not cached
				try {
					parsedJson = JSON.parse(activeTab.jsonContent);
					error = '';
				} catch (e) {
					error = e instanceof Error ? e.message : $LL.editor.invalidJson();
					parsedJson = null;
				}
			}
		}
	});

	// Update tab content when editor changes
	$effect(() => {
		const activeTab = tabsStore.getActiveTab();
		if (activeTab && editorValue !== activeTab.jsonContent) {
			tabsStore.updateActiveTabContent(editorValue);
		}
	});

	let parsedJson = $state<JsonValue | null>(null);
	let error = $state<string>('');
	let editorRef = $state<JsonEditor | null>(null);
	let parseTimeout: ReturnType<typeof setTimeout>;

	// Mobile responsive state
	let isMobile = $state(false);
	let mobileView = $state<'editor' | 'graph'>('editor');

	// Local state for URL input (for two-way binding)
	let urlInputLocal = $state<string>('');

	// Get current tab's request settings (derived)
	let httpMethod = $derived(tabsStore.getActiveTab()?.requestSettings?.method || 'GET');
	let customHeaders = $derived(tabsStore.getActiveTab()?.requestSettings?.headers || []);
	let customBody = $derived(tabsStore.getActiveTab()?.requestSettings?.body || '');
	let sendAsRawText = $derived(tabsStore.getActiveTab()?.requestSettings?.sendAsRawText || false);
	let useEditorContent = $derived(
		tabsStore.getActiveTab()?.requestSettings?.useEditorContent || false
	);

	// Sync local URL input with tab's URL
	$effect(() => {
		const tabUrl =
			tabsStore.getActiveTab()?.requestSettings?.url ||
			'https://jsonplaceholder.typicode.com/todos/1';
		urlInputLocal = tabUrl;
	});

	// UI state (not tab-specific)
	let isLoading = $state<boolean>(false);
	let isDialogOpen = $state<boolean>(false);
	let httpStatusCode = $state<number | null>(null);
	let responseTime = $state<number | null>(null);

	// Track in-flight request for cancellation
	let abortController: AbortController | null = null;

	function handleSettingsSave(settings: {
		headers: Array<{ key: string; value: string }>;
		body: string;
		sendAsRawText: boolean;
		useEditorContent: boolean;
	}) {
		tabsStore.updateActiveTabRequestSettings(settings);
	}

	function handleSettingsCancel() {
		// Nothing to do, dialog will close
	}

	function clearAllSettings() {
		if (confirm($LL.editor.clearAllConfirm())) {
			// Clear all localStorage keys
			Object.values(STORAGE_KEYS).forEach((key) => {
				localStorage.removeItem(key);
			});

			// Reset tab's request settings to defaults
			tabsStore.updateActiveTabRequestSettings({
				url: 'https://jsonplaceholder.typicode.com/todos/1',
				method: 'GET',
				headers: [],
				body: '',
				sendAsRawText: false,
				useEditorContent: false
			});
			httpStatusCode = null;
			responseTime = null;
			error = '';

			// Close dialog
			isDialogOpen = false;
		}
	}

	function saveUrlAndMethod(url?: string, method?: string) {
		const activeTab = tabsStore.getActiveTab();
		if (!activeTab) return;

		tabsStore.updateActiveTabRequestSettings({
			url: url ?? activeTab.requestSettings?.url ?? '',
			method: method ?? activeTab.requestSettings?.method ?? 'GET'
		});
	}

	function clearJson() {
		const activeTab = tabsStore.getActiveTab();
		if (activeTab) {
			tabsStore.updateActiveTabContent('');
			// Update local state immediately
			editorValue = '';
			parsedJson = null;
		}
		error = '';
	}

	async function copyJson() {
		try {
			await navigator.clipboard.writeText(editorValue);
			toast.success($LL.header.copySuccess());
		} catch (e) {
			logger.error('Failed to copy to clipboard:', e);
			// Fallback for older browsers
			try {
				const textArea = document.createElement('textarea');
				textArea.value = editorValue;
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				toast.success($LL.header.copySuccess());
			} catch (fallbackError) {
				logger.error('Fallback copy failed:', fallbackError);
				toast.error($LL.header.copyError());
			}
		}
	}

	function formatJson() {
		try {
			const activeTab = tabsStore.getActiveTab();
			if (activeTab) {
				const parsed = JSON.parse(activeTab.jsonContent);
				const formatted = JSON.stringify(parsed, null, 2);
				tabsStore.updateActiveTabContent(formatted);
				// Update local state immediately
				editorValue = formatted;
				parsedJson = parsed;
				error = '';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : $LL.editor.invalidJson();
		}
	}

	function minifyJson() {
		try {
			const activeTab = tabsStore.getActiveTab();
			if (activeTab) {
				const parsed = JSON.parse(activeTab.jsonContent);
				const minified = JSON.stringify(parsed);
				tabsStore.updateActiveTabContent(minified);
				// Update local state immediately
				editorValue = minified;
				parsedJson = parsed;
				error = '';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : $LL.editor.invalidJson();
		}
	}

	function regenerateValues() {
		try {
			const activeTab = tabsStore.getActiveTab();
			if (activeTab) {
				let regenerated;

				// Check if current JSON is empty or invalid
				if (!activeTab.jsonContent || activeTab.jsonContent.trim() === '') {
					// Generate new sample JSON
					regenerated = generateSampleJSON();
				} else {
					try {
						// Try to parse existing JSON
						const parsed = JSON.parse(activeTab.jsonContent);
						// Regenerate values while preserving structure
						regenerated = regenerateJSONValues(parsed);
					} catch {
						// If parsing fails, generate new sample JSON
						regenerated = generateSampleJSON();
					}
				}

				const formatted = JSON.stringify(regenerated, null, 2);
				tabsStore.updateActiveTabContent(formatted);
				// Update local state immediately
				editorValue = formatted;
				parsedJson = regenerated as JsonValue;
				error = '';
				toast.success($LL.editor.regenerateSuccess());
			}
		} catch (e) {
			logger.error('Failed to regenerate JSON values:', e);
			toast.error($LL.editor.invalidJson());
		}
	}

	async function fetchJsonFromUrl() {
		if (!urlInputLocal.trim()) {
			error = $LL.editor.urlRequired();
			return;
		}

		// Save the URL before fetching
		saveUrlAndMethod(urlInputLocal, undefined);

		isLoading = true;
		// Only clear error if it's a fetch-related error
		if (error && (error.includes('fetch') || error.includes('HTTP'))) {
			error = '';
		}
		httpStatusCode = null;
		responseTime = null;

		try {
			// Cancel previous request if any
			if (abortController) {
				abortController.abort();
			}
			abortController = new AbortController();

			const startTime = performance.now();
			const res = await requestJson({
				method: httpMethod as HttpMethod,
				url: urlInputLocal,
				headers: customHeaders,
				editorJson: editorValue,
				customBody,
				sendAsRawText,
				useEditorContent,
				signal: abortController.signal
			});
			const endTime = performance.now();
			responseTime = Math.round(endTime - startTime);
			httpStatusCode = res.status;

			if (res.data !== undefined) {
				const formattedJson = JSON.stringify(res.data, null, 2);
				tabsStore.updateActiveTabContent(formattedJson);
				// Also update the local parsed JSON immediately
				parsedJson = res.data as JsonValue;
			} else if (res.rawText !== undefined) {
				// Non-JSON response shown as text
				const responseObj = { response: res.rawText };
				const formattedJson = JSON.stringify(responseObj, null, 2);
				tabsStore.updateActiveTabContent(formattedJson);
				// Also update the local parsed JSON immediately
				parsedJson = responseObj as JsonValue;
			}

			if (res.ok && error && (error.includes('fetch') || error.includes('HTTP'))) {
				error = '';
			}
		} catch (e) {
			if ((e as Error)?.name === 'AbortError') {
				// silently ignore aborted request
				return;
			}
			if (e instanceof Error) {
				if (e.message.includes('Failed to fetch')) {
					error = $LL.editor.fetchError();
				} else {
					error = e.message;
				}
			} else {
				error = $LL.editor.fetchError();
			}
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		const currentJsonValue = editorValue;

		// Clear previous timeout
		if (parseTimeout) {
			clearTimeout(parseTimeout);
		}

		// Set new timeout for 500ms delay
		parseTimeout = setTimeout(async () => {
			try {
				// Activate graph loading overlay before parsing to improve perceived responsiveness with large inputs
				const mod = await import('$lib/stores/graphLoading');
				mod.graphLoading.set({ active: true, phase: 'build', progress: 0 });
				parsedJson = JSON.parse(currentJsonValue);
				error = '';

				// Update cached parsed JSON in the active tab
				const activeTab = tabsStore.getActiveTab();
				if (activeTab) {
					activeTab.parsedJson = parsedJson;
				}
			} catch (e) {
				error = e instanceof Error ? e.message : $LL.editor.invalidJson();
				parsedJson = null;

				// Update cached parsed JSON in the active tab
				const activeTab = tabsStore.getActiveTab();
				if (activeTab) {
					activeTab.parsedJson = null;
				}
			}
		}, 500);

		return () => {
			if (parseTimeout) {
				clearTimeout(parseTimeout);
			}
		};
	});

	onMount(() => {
		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

		const handleNodeClick = (e: CustomEvent) => {
			const path = e.detail;
			if (path && editorRef) {
				editorRef.navigateToPath(path);
				// On mobile, switch to editor view when node is clicked
				if (isMobile) {
					mobileView = 'editor';
				}
			}
		};

		const handleTabChanged = () => {
			// Force re-render of graph when tab changes
			const activeTab = tabsStore.getActiveTab();
			if (activeTab) {
				editorValue = activeTab.jsonContent;
				// Use cached parsed JSON if available for instant switching
				if (activeTab.parsedJson !== undefined) {
					parsedJson = activeTab.parsedJson as JsonValue;
					error = activeTab.parsedJson ? '' : $LL.editor.invalidJson();
				} else {
					// Parse if not cached
					try {
						parsedJson = JSON.parse(activeTab.jsonContent);
						error = '';
					} catch (e) {
						error = e instanceof Error ? e.message : $LL.editor.invalidJson();
						parsedJson = null;
					}
				}
			}
		};

		window.addEventListener('nodeClick', handleNodeClick as EventListener);
		window.addEventListener('tabChanged', handleTabChanged as EventListener);

		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('nodeClick', handleNodeClick as EventListener);
			window.removeEventListener('tabChanged', handleTabChanged as EventListener);
		};
	});
</script>

<div class="h-full flex flex-col bg-background">
	<!-- Header -->
	<header class="h-12 border-b bg-card flex items-center px-4 flex-shrink-0">
		<h1 class="text-base font-semibold">{$LL.header.title()}</h1>
		<div class="ml-auto flex items-center gap-2">
			<LanguageSwitcher />
			<Button size="sm" variant="ghost" onclick={toggleMode} class="h-8 w-8 px-0">
				{#if mode.current === 'light'}
					<Moon class="h-4 w-4" />
				{:else}
					<Sun class="h-4 w-4" />
				{/if}
			</Button>
		</div>
	</header>

	<!-- Tab Bar -->
	<div class="flex-shrink-0">
		<TabBar />
	</div>

	{#if isMobile}
		<!-- Mobile Layout: Tabs for Editor/Graph -->
		<Tabs.Root bind:value={mobileView} class="flex-1 flex flex-col overflow-hidden min-h-0">
			<Tabs.List class="grid w-full grid-cols-2 h-10 px-2 flex-shrink-0">
				<Tabs.Trigger value="editor">{$LL.navigation.editor()}</Tabs.Trigger>
				<Tabs.Trigger value="graph">{$LL.navigation.graph()}</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="editor" class="flex-1 flex flex-col overflow-hidden mt-0 min-h-0">
				<div class="flex flex-col border-b bg-muted/50 flex-shrink-0">
					<EditorToolbar
						{httpMethod}
						bind:url={urlInputLocal}
						{isLoading}
						onMethodChange={(method) => saveUrlAndMethod(undefined, method)}
						onUrlChange={(url) => (urlInputLocal = url)}
						onUrlBlur={() => saveUrlAndMethod(urlInputLocal, undefined)}
						onGo={fetchJsonFromUrl}
						onSettings={() => (isDialogOpen = true)}
					/>
					<EditorActions
						onClear={clearJson}
						onCopy={copyJson}
						onFormat={formatJson}
						onMinify={minifyJson}
						onRegenerate={regenerateValues}
					/>
				</div>
				<div class="flex-1 overflow-hidden min-h-0">
					{#key tabsStore.activeTabId}
						<JsonEditor bind:value={editorValue} bind:this={editorRef} class="h-full w-full" />
					{/key}
				</div>
			</Tabs.Content>
			<Tabs.Content value="graph" class="flex-1 overflow-hidden mt-0 min-h-0">
				{#key tabsStore.activeTabId}
					{#if parsedJson}
						<JsonGraph jsonData={parsedJson} jsonString={editorValue} class="h-full w-full" />
					{:else}
						<div class="h-full flex items-center justify-center text-muted-foreground">
							{$LL.editor.placeholder()}
						</div>
					{/if}
				{/key}
			</Tabs.Content>
		</Tabs.Root>
	{:else}
		<!-- Desktop Layout: Resizable Panes -->
		<Resizable.PaneGroup direction="horizontal" class="flex-1">
			<Resizable.Pane defaultSize={30} minSize={20}>
				<div class="h-full flex flex-col overflow-hidden">
					<div class="flex flex-col border-b bg-muted/50">
						<EditorToolbar
							{httpMethod}
							bind:url={urlInputLocal}
							{isLoading}
							onMethodChange={(method) => saveUrlAndMethod(undefined, method)}
							onUrlChange={(url) => (urlInputLocal = url)}
							onUrlBlur={() => saveUrlAndMethod(urlInputLocal, undefined)}
							onGo={fetchJsonFromUrl}
							onSettings={() => (isDialogOpen = true)}
						/>
						<EditorActions
							onClear={clearJson}
							onCopy={copyJson}
							onFormat={formatJson}
							onMinify={minifyJson}
							onRegenerate={regenerateValues}
						/>
					</div>
					<div class="flex-1 overflow-hidden">
						{#key tabsStore.activeTabId}
							<JsonEditor bind:value={editorValue} bind:this={editorRef} class="h-full w-full" />
						{/key}
					</div>
				</div>
			</Resizable.Pane>

			<Resizable.Handle withHandle />

			<Resizable.Pane defaultSize={50} minSize={20}>
				<div class="h-full flex flex-col overflow-hidden">
					<div class="flex-1 overflow-hidden">
						{#key tabsStore.activeTabId}
							{#if parsedJson}
								<JsonGraph jsonData={parsedJson} jsonString={editorValue} class="h-full" />
							{:else}
								<div class="h-full flex items-center justify-center text-muted-foreground">
									{$LL.editor.placeholder()}
								</div>
							{/if}
						{/key}
					</div>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{/if}

	<!-- Footer -->
	<footer class="h-8 border-t bg-card flex items-center px-4 text-sm text-muted-foreground">
		<span>{$LL.footer.ready()}</span>
		{#if httpStatusCode !== null}
			<span class="ml-4 flex items-center gap-2">
				<span
					class={httpStatusCode >= 200 && httpStatusCode < 300
						? 'text-green-600'
						: httpStatusCode >= 400
							? 'text-red-600'
							: 'text-yellow-600'}
				>
					HTTP {httpStatusCode}
				</span>
				{#if responseTime !== null}
					<span class="text-muted-foreground">|</span>
					<span>{responseTime}ms</span>
				{/if}
			</span>
		{/if}
		{#if error}
			<span class="ml-4 text-destructive">{error}</span>
		{/if}
		<div class="ml-auto flex items-center gap-1">
			<span
				>Copyright © <a href="https://podosoft.io" target="_blank" class="hover:underline"
					>PODOSOFT.</a
				></span
			>
		</div>
	</footer>
</div>

<!-- HTTP Request Settings Dialog -->
<RequestSettingsDialog
	bind:isOpen={isDialogOpen}
	headers={customHeaders}
	body={customBody}
	{sendAsRawText}
	{useEditorContent}
	onSave={handleSettingsSave}
	onCancel={handleSettingsCancel}
	onClearAll={clearAllSettings}
/>
