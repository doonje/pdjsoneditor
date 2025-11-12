<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onMount } from 'svelte';
	import { loadLocale } from '$i18n/i18n-util.sync';
	import { setLocale } from '$i18n/i18n-svelte';
	import { locale } from '$lib/stores/locale';
	import type { Locales } from '$i18n/i18n-types';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import { Menu } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	const { children } = $props();

	let isSidebarOpen = $state(false);

	// Initialize i18n on mount
	onMount(() => {
		const unsubscribe = locale.subscribe((value) => {
			loadLocale(value);
			setLocale(value);
		});

		// Load initial locale
		const initialLocale = (localStorage.getItem('locale') as Locales) || 'en';
		locale.set(initialLocale);

		return unsubscribe;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster />

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar -->
	<Sidebar bind:isOpen={isSidebarOpen} />

	<!-- Main Content -->
	<div class="flex flex-1 flex-col lg:ml-64">
		<!-- Mobile Header -->
		<header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
			<Button variant="ghost" size="icon" onclick={() => (isSidebarOpen = !isSidebarOpen)}>
				<Menu class="h-6 w-6" />
				<span class="sr-only">Toggle sidebar</span>
			</Button>
			<h1 class="text-lg font-semibold">Dev Utils</h1>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-auto">
			{@render children?.()}
		</main>
	</div>
</div>
