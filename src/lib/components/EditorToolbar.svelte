<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		ArrowRight,
		Loader,
		ChevronDown,
		Check,
		Settings2
	} from 'lucide-svelte';
	import LL from '$i18n/i18n-svelte';
	import type { HttpMethod } from '$lib/services/http';

	interface Props {
		httpMethod: HttpMethod;
		url: string;
		isLoading: boolean;
		onMethodChange: (method: HttpMethod) => void;
		onUrlChange: (url: string) => void;
		onUrlBlur: () => void;
		onGo: () => void;
		onSettings: () => void;
	}

	let {
		httpMethod,
		url = $bindable(),
		isLoading,
		onMethodChange,
		onUrlChange,
		onUrlBlur,
		onGo,
		onSettings
	}: Props = $props();

	const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

	function handleUrlKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			onGo();
		}
	}

	function handleUrlInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		onUrlChange(target.value);
	}
</script>

<div class="h-12 md:h-8 flex items-center px-2 flex-shrink-0 gap-2 md:gap-1">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="inline-flex items-center justify-center h-10 md:h-7 px-3 md:px-2 min-w-[44px] text-sm md:text-xs gap-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
		>
			{httpMethod}
			<ChevronDown class="h-4 w-4 md:h-3 md:w-3" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start">
			{#each httpMethods as method}
				<DropdownMenu.Item
					onclick={() => onMethodChange(method)}
					class="flex items-center justify-between min-h-[44px] md:min-h-0"
				>
					<span class="text-base md:text-sm">{method}</span>
					{#if httpMethod === method}
						<Check class="h-4 w-4 md:h-3 md:w-3" />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Input
		type="url"
		placeholder={$LL.editor.urlPlaceholder()}
		bind:value={url}
		onkeydown={handleUrlKeydown}
		onblur={onUrlBlur}
		oninput={handleUrlInput}
		class="h-10 md:h-7 text-sm md:text-xs flex-1"
		disabled={isLoading}
	/>
	<Button
		size="sm"
		variant="ghost"
		onclick={onSettings}
		class="h-10 md:h-7 w-10 md:w-auto px-2 min-w-[44px] md:min-w-0"
		title={$LL.editor.requestSettings()}
	>
		<Settings2 class="w-4 h-4 md:w-3 md:h-3" />
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onGo}
		disabled={isLoading}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm flex items-center gap-1.5 md:gap-1"
	>
		{#if isLoading}
			<Loader class="w-4 h-4 md:w-3 md:h-3 animate-spin" />
		{:else}
			<ArrowRight class="w-4 h-4 md:w-3 md:h-3" />
		{/if}
		<span class="hidden sm:inline">{$LL.editor.go()}</span>
	</Button>
</div>
