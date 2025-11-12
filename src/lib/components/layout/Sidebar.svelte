<script lang="ts">
	import { page } from '$app/stores';
	import { LL } from '$i18n/i18n-svelte';
	import { FileJson, Hash, Clock, Code2 } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface MenuItem {
		href: string;
		icon: any;
		labelKey: keyof typeof $LL.navigation;
	}

	const menuItems: MenuItem[] = [
		{
			href: '/',
			icon: FileJson,
			labelKey: 'jsonEditor'
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
			href: '/timestamp',
			icon: Clock,
			labelKey: 'timestamp'
		}
	];

	let { isOpen = $bindable(false) } = $props();

	function isActive(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
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
		<div class="flex h-16 items-center border-b px-6">
			<h1 class="text-xl font-bold">Dev Utils</h1>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 overflow-y-auto p-4">
			{#each menuItems as item}
				{@const Icon = item.icon}
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
			{/each}
		</nav>
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
