<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeftRight, Copy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { diffLines, diffWords, diffChars, type Change } from 'diff';

	type DiffMode = 'lines' | 'words' | 'chars';

	let originalText = $state('');
	let modifiedText = $state('');
	let diffMode = $state<DiffMode>('lines');
	let changes = $state<Change[]>([]);

	$effect(() => {
		originalText;
		modifiedText;
		diffMode;
		calculateDiff();
	});

	function calculateDiff() {
		if (!originalText && !modifiedText) {
			changes = [];
			return;
		}

		switch (diffMode) {
			case 'lines':
				changes = diffLines(originalText, modifiedText);
				break;
			case 'words':
				changes = diffWords(originalText, modifiedText);
				break;
			case 'chars':
				changes = diffChars(originalText, modifiedText);
				break;
		}
	}

	function swapTexts() {
		const temp = originalText;
		originalText = modifiedText;
		modifiedText = temp;
	}

	function copyDiff() {
		const diffText = changes
			.map((change) => {
				if (change.added) return `+ ${change.value}`;
				if (change.removed) return `- ${change.value}`;
				return `  ${change.value}`;
			})
			.join('');
		navigator.clipboard.writeText(diffText);
		toast.success($LL.diff.copySuccess());
	}

	function getStats() {
		const added = changes.filter((c) => c.added).reduce((sum, c) => sum + (c.count || 0), 0);
		const removed = changes.filter((c) => c.removed).reduce((sum, c) => sum + (c.count || 0), 0);
		return { added, removed };
	}

	$effect(() => {
		const stats = getStats();
	});
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.diff.title()}</h1>
		<p class="text-muted-foreground">{$LL.diff.description()}</p>
	</div>

	<div class="space-y-4">
		<!-- Mode Selection -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.diff.mode()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex gap-4">
					<div class="flex items-center space-x-2">
						<input
							type="radio"
							bind:group={diffMode}
							value="lines"
							id="mode-lines"
							class="h-4 w-4"
						/>
						<Label for="mode-lines" class="font-normal">{$LL.diff.lines()}</Label>
					</div>
					<div class="flex items-center space-x-2">
						<input
							type="radio"
							bind:group={diffMode}
							value="words"
							id="mode-words"
							class="h-4 w-4"
						/>
						<Label for="mode-words" class="font-normal">{$LL.diff.words()}</Label>
					</div>
					<div class="flex items-center space-x-2">
						<input
							type="radio"
							bind:group={diffMode}
							value="chars"
							id="mode-chars"
							class="h-4 w-4"
						/>
						<Label for="mode-chars" class="font-normal">{$LL.diff.characters()}</Label>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Input Texts -->
		<div class="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{$LL.diff.original()}</CardTitle>
				</CardHeader>
				<CardContent>
					<Textarea
						bind:value={originalText}
						placeholder={$LL.diff.originalPlaceholder()}
						class="min-h-[300px] font-mono text-sm"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{$LL.diff.modified()}</CardTitle>
				</CardHeader>
				<CardContent>
					<Textarea
						bind:value={modifiedText}
						placeholder={$LL.diff.modifiedPlaceholder()}
						class="min-h-[300px] font-mono text-sm"
					/>
				</CardContent>
			</Card>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			<Button onclick={swapTexts} variant="outline">
				<ArrowLeftRight class="mr-2 h-4 w-4" />
				{$LL.diff.swap()}
			</Button>
			<Button onclick={copyDiff} variant="outline" disabled={changes.length === 0}>
				<Copy class="mr-2 h-4 w-4" />
				{$LL.diff.copy()}
			</Button>
		</div>

		<!-- Statistics -->
		{#if changes.length > 0}
			{@const stats = getStats()}
			<Card>
				<CardHeader>
					<CardTitle>{$LL.diff.statistics()}</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-4 md:grid-cols-3">
						<div>
							<Label class="text-muted-foreground">{$LL.diff.additions()}</Label>
							<p class="text-2xl font-bold text-green-600 dark:text-green-400">+{stats.added}</p>
						</div>
						<div>
							<Label class="text-muted-foreground">{$LL.diff.deletions()}</Label>
							<p class="text-2xl font-bold text-red-600 dark:text-red-400">-{stats.removed}</p>
						</div>
						<div>
							<Label class="text-muted-foreground">{$LL.diff.changes()}</Label>
							<p class="text-2xl font-bold">{stats.added + stats.removed}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Diff Result -->
			<Card>
				<CardHeader>
					<CardTitle>{$LL.diff.result()}</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="rounded bg-muted p-4 font-mono text-sm overflow-auto">
						{#each changes as change}
							{#if change.added}
								<span class="bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100"
									>{change.value}</span
								>
							{:else if change.removed}
								<span class="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 line-through"
									>{change.value}</span
								>
							{:else}
								<span class="text-muted-foreground">{change.value}</span>
							{/if}
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
