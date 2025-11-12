<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		X,
		Copy,
		FileCode2,
		Minimize2,
		RefreshCw
	} from 'lucide-svelte';
	import LL from '$i18n/i18n-svelte';

	interface Props {
		onClear: () => void;
		onCopy: () => void;
		onFormat: () => void;
		onMinify: () => void;
		onRegenerate: () => void;
	}

	let {
		onClear,
		onCopy,
		onFormat,
		onMinify,
		onRegenerate
	}: Props = $props();
</script>

<div class="h-8 flex items-center justify-end px-2 flex-shrink-0 gap-1 border-t">
	<Button
		size="sm"
		variant="ghost"
		onclick={onClear}
		class="h-7 px-2 text-sm flex items-center gap-1"
		title={$LL.header.clear()}
	>
		<X class="w-3 h-3" />
		<span class="hidden sm:inline">{$LL.header.clear()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onCopy}
		class="h-7 px-2 text-sm flex items-center gap-1"
		title={$LL.header.copy()}
	>
		<Copy class="w-3 h-3" />
		<span class="hidden sm:inline">{$LL.header.copy()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onFormat}
		class="h-7 px-2 text-sm flex items-center gap-1"
		title={$LL.header.format()}
	>
		<FileCode2 class="w-3 h-3" />
		<span class="hidden sm:inline">{$LL.header.format()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onMinify}
		class="h-7 px-2 text-sm flex items-center gap-1"
		title={$LL.header.minify()}
	>
		<Minimize2 class="w-3 h-3" />
		<span class="hidden sm:inline">{$LL.header.minify()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onRegenerate}
		class="h-7 px-2 text-sm flex items-center gap-1"
		title={$LL.editor.regenerateTooltip()}
	>
		<RefreshCw class="w-3 h-3" />
		<span class="hidden sm:inline">{$LL.editor.regenerate()}</span>
	</Button>
</div>
