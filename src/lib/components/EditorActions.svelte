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

	const {
		onClear,
		onCopy,
		onFormat,
		onMinify,
		onRegenerate
	}: Props = $props();
</script>

<div class="h-12 md:h-8 flex items-center justify-end px-2 flex-shrink-0 gap-2 md:gap-1 border-t">
	<Button
		size="sm"
		variant="ghost"
		onclick={onClear}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm md:text-sm flex items-center gap-1.5 md:gap-1"
		title={$LL.header.clear()}
	>
		<X class="w-4 h-4 md:w-3 md:h-3 flex-shrink-0" />
		<span class="text-xs md:text-sm">{$LL.header.clear()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onCopy}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm md:text-sm flex items-center gap-1.5 md:gap-1"
		title={$LL.header.copy()}
	>
		<Copy class="w-4 h-4 md:w-3 md:h-3 flex-shrink-0" />
		<span class="text-xs md:text-sm">{$LL.header.copy()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onFormat}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm md:text-sm flex items-center gap-1.5 md:gap-1"
		title={$LL.header.format()}
	>
		<FileCode2 class="w-4 h-4 md:w-3 md:h-3 flex-shrink-0" />
		<span class="text-xs md:text-sm">{$LL.header.format()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onMinify}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm md:text-sm flex items-center gap-1.5 md:gap-1"
		title={$LL.header.minify()}
	>
		<Minimize2 class="w-4 h-4 md:w-3 md:h-3 flex-shrink-0" />
		<span class="text-xs md:text-sm">{$LL.header.minify()}</span>
	</Button>
	<Button
		size="sm"
		variant="ghost"
		onclick={onRegenerate}
		class="h-10 md:h-7 px-3 md:px-2 min-w-[44px] md:min-w-0 text-sm md:text-sm flex items-center gap-1.5 md:gap-1"
		title={$LL.editor.regenerateTooltip()}
	>
		<RefreshCw class="w-4 h-4 md:w-3 md:h-3 flex-shrink-0" />
		<span class="text-xs md:text-sm">{$LL.editor.regenerate()}</span>
	</Button>
</div>
