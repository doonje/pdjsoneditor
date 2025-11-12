<script lang="ts">
	import { page } from '$app/stores';
	import { LL } from '$i18n/i18n-svelte';
	import {
		FileJson,
		Hash,
		Clock,
		Code2,
		Moon,
		Sun,
		Fingerprint,
		CaseSensitive,
		Palette,
		Key,
		Search,
		GitCompare,
		QrCode,
		FileCode,
		Database,
		CalendarClock,
		GripVertical,
		RotateCcw
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { menuOrderStore, defaultMenuOrder } from '$lib/stores/menuOrder';
	import { onMount } from 'svelte';

	interface MenuItem {
		href: string;
		icon: any;
		labelKey: keyof typeof $LL.navigation;
	}

	const allMenuItems: MenuItem[] = [
		{
			href: '/',
			icon: FileJson,
			labelKey: 'jsonEditor'
		},
		{
			href: '/uuid',
			icon: Fingerprint,
			labelKey: 'uuid'
		},
		{
			href: '/string-case',
			icon: CaseSensitive,
			labelKey: 'stringCase'
		},
		{
			href: '/color',
			icon: Palette,
			labelKey: 'color'
		},
		{
			href: '/encode-decode',
			icon: Code2,
			labelKey: 'encodeDecode'
		},
		{
			href: '/hash',
			icon: Hash,
			labelKey: 'hash'
		},
		{
			href: '/jwt',
			icon: Key,
			labelKey: 'jwt'
		},
		{
			href: '/regex',
			icon: Search,
			labelKey: 'regex'
		},
		{
			href: '/diff',
			icon: GitCompare,
			labelKey: 'diff'
		},
		{
			href: '/timestamp',
			icon: Clock,
			labelKey: 'timestamp'
		},
		{
			href: '/yaml-json',
			icon: FileCode,
			labelKey: 'yamlJson'
		},
		{
			href: '/sql',
			icon: Database,
			labelKey: 'sql'
		},
		{
			href: '/cron',
			icon: CalendarClock,
			labelKey: 'cron'
		},
		{
			href: '/qr-code',
			icon: QrCode,
			labelKey: 'qrCode'
		}
	];

	let { isOpen = $bindable(false) } = $props();

	let menuItems = $state<MenuItem[]>([]);
	let draggedIndex = $state<number | null>(null);
	let isReorderMode = $state(false);

	// Subscribe to menu order store
	onMount(() => {
		const unsubscribe = menuOrderStore.subscribe((order) => {
			// Sort menu items based on stored order
			menuItems = order
				.map((href) => allMenuItems.find((item) => item.href === href))
				.filter((item): item is MenuItem => item !== undefined);
		});

		return unsubscribe;
	});

	function isActive(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

	function handleDragStart(e: DragEvent, index: number) {
		if (!isReorderMode) return;
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		if (!isReorderMode) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(e: DragEvent, dropIndex: number) {
		if (!isReorderMode || draggedIndex === null) return;
		e.preventDefault();

		if (draggedIndex !== dropIndex) {
			menuOrderStore.moveItem(draggedIndex, dropIndex);
		}

		draggedIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
	}

	function resetOrder() {
		if (confirm('메뉴 순서를 초기화하시겠습니까?')) {
			menuOrderStore.reset();
		}
	}
</script>

<!-- Desktop Sidebar -->
<aside
	class={cn(
		'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0',
		isOpen ? 'translate-x-0' : '-translate-x-full'
	)}
>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex h-16 items-center justify-between border-b px-6">
			<h1 class="text-xl font-bold">Dev Utils</h1>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (isReorderMode = !isReorderMode)}
				class={cn('h-8 w-8', isReorderMode && 'bg-accent')}
				title={isReorderMode ? '순서 변경 종료' : '메뉴 순서 변경'}
			>
				<GripVertical class="h-4 w-4" />
			</Button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 overflow-y-auto p-4">
			{#each menuItems as item, index}
				{@const Icon = item.icon}
				<div
					role={isReorderMode ? 'button' : undefined}
					tabindex={isReorderMode ? 0 : undefined}
					draggable={isReorderMode}
					ondragstart={(e) => handleDragStart(e, index)}
					ondragover={handleDragOver}
					ondrop={(e) => handleDrop(e, index)}
					ondragend={handleDragEnd}
					class={cn(
						'transition-opacity',
						isReorderMode && 'cursor-move',
						draggedIndex === index && 'opacity-50'
					)}
				>
					<a
						href={item.href}
						class={cn(
							'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							isActive(item.href)
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
							isReorderMode && 'pointer-events-none'
						)}
						onclick={() => {
							if (window.innerWidth < 1024) {
								isOpen = false;
							}
						}}
					>
						{#if isReorderMode}
							<GripVertical class="h-5 w-5 text-muted-foreground" />
						{:else}
							<Icon class="h-5 w-5" />
						{/if}
						<span>{$LL.navigation[item.labelKey]()}</span>
					</a>
				</div>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t p-4">
			{#if isReorderMode}
				<Button variant="outline" size="sm" onclick={resetOrder} class="w-full mb-2">
					<RotateCcw class="h-4 w-4 mr-2" />
					순서 초기화
				</Button>
			{/if}
			<div class="flex items-center justify-between gap-2">
				<LanguageSwitcher />
				<Button variant="ghost" size="icon" onclick={toggleMode}>
					{#if mode.current === 'dark'}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</div>
</aside>

<!-- Mobile Overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		onclick={() => (isOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
		role="button"
		tabindex="0"
		aria-label="Close sidebar"
	></div>
{/if}
