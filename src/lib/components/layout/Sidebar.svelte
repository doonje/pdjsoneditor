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
	import { menuOrderStore } from '$lib/stores/menuOrder';
	import { onMount } from 'svelte';
	import type { ComponentType } from 'svelte';

	interface MenuItem {
		href: string;
		icon: ComponentType;
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
	let touchStartY = $state<number>(0);
	let currentTouchIndex = $state<number | null>(null);

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
		console.log('[Sidebar] Drag start:', index);
		// preventDefault()를 호출하면 드래그가 시작되지 않음 - 제거해야 함
		e.stopPropagation();
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		if (!isReorderMode) return;
		e.preventDefault(); // drop을 허용하기 위해 필수
		e.stopPropagation();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(e: DragEvent, dropIndex: number) {
		if (!isReorderMode || draggedIndex === null) return;
		console.log('[Sidebar] Drop:', draggedIndex, '→', dropIndex);
		e.preventDefault(); // 기본 동작 차단을 위해 필수
		e.stopPropagation();

		if (draggedIndex !== dropIndex) {
			console.log('[Sidebar] Moving item from', draggedIndex, 'to', dropIndex);
			menuOrderStore.moveItem(draggedIndex, dropIndex);
		}

		draggedIndex = null;
	}

	function handleDragEnd(e: DragEvent) {
		// dragend는 정리 작업만 하므로 preventDefault 불필요
		console.log('[Sidebar] Drag end');
		e.stopPropagation();
		draggedIndex = null;
	}

	function resetOrder() {
		if (confirm('메뉴 순서를 초기화하시겠습니까?')) {
			menuOrderStore.reset();
		}
	}

	// Touch event handlers for mobile
	function handleTouchStart(e: TouchEvent, index: number) {
		if (!isReorderMode) return;
		console.log('[Sidebar] Touch start:', index);
		e.stopPropagation();
		draggedIndex = index;
		currentTouchIndex = index;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isReorderMode || draggedIndex === null) return;
		e.preventDefault();
		e.stopPropagation();

		const touch = e.touches[0];
		const currentY = touch.clientY;
		const deltaY = currentY - touchStartY;

		// 메뉴 아이템 높이 (대략 48px)
		const itemHeight = 48;
		const movedItems = Math.round(deltaY / itemHeight);

		if (movedItems !== 0) {
			const newIndex = Math.max(0, Math.min(menuItems.length - 1, draggedIndex + movedItems));
			if (newIndex !== currentTouchIndex) {
				console.log('[Sidebar] Touch move:', currentTouchIndex, '→', newIndex);
				currentTouchIndex = newIndex;
			}
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (!isReorderMode || draggedIndex === null || currentTouchIndex === null) return;
		console.log('[Sidebar] Touch end:', draggedIndex, '→', currentTouchIndex);
		e.stopPropagation();

		if (draggedIndex !== currentTouchIndex) {
			console.log('[Sidebar] Moving item from', draggedIndex, 'to', currentTouchIndex);
			menuOrderStore.moveItem(draggedIndex, currentTouchIndex);
		}

		draggedIndex = null;
		currentTouchIndex = null;
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
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 overflow-y-auto p-4">
			{#each menuItems as item, index}
				{@const Icon = item.icon}
				{#if isReorderMode}
					<!-- Reorder Mode: Draggable div -->
					<div
						role="button"
						tabindex={0}
						draggable={true}
						ondragstart={(e) => handleDragStart(e, index)}
						ondragover={handleDragOver}
						ondrop={(e) => handleDrop(e, index)}
						ondragend={handleDragEnd}
						ontouchstart={(e) => handleTouchStart(e, index)}
						ontouchmove={handleTouchMove}
						ontouchend={handleTouchEnd}
						class={cn(
							'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-opacity cursor-move',
							'text-muted-foreground hover:bg-accent',
							draggedIndex === index && 'opacity-50',
							'select-none'
						)}
					>
						<GripVertical class="h-5 w-5 text-muted-foreground" />
						<span>{$LL.navigation[item.labelKey]()}</span>
					</div>
				{:else}
					<!-- Normal Mode: Clickable link -->
					<a
						href={item.href}
						class={cn(
							'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							isActive(item.href)
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
						)}
						onclick={() => {
							if (window.innerWidth < 1024) {
								isOpen = false;
							}
						}}
					>
						<Icon class="h-5 w-5" />
						<span>{$LL.navigation[item.labelKey]()}</span>
					</a>
				{/if}
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
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onclick={() => {
							isReorderMode = !isReorderMode;
							console.log('[Sidebar] Reorder mode:', isReorderMode);
						}}
						class={cn('h-8 w-8', isReorderMode && 'bg-accent')}
						title={isReorderMode ? '순서 변경 종료' : '메뉴 순서 변경'}
					>
						<GripVertical class="h-5 w-5" />
					</Button>
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
