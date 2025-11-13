<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Copy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		toCamelCase,
		toPascalCase,
		toSnakeCase,
		toKebabCase,
		toScreamingSnakeCase,
		toDotCase,
		toPathCase
	} from '$lib/utils/string-case';

	let inputText = $state('');

	$effect(() => {
		inputText;
	});

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
		toast.success($LL.stringCase.copySuccess());
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.stringCase.title()}</h1>
		<p class="text-muted-foreground">{$LL.stringCase.description()}</p>
	</div>

	<div class="space-y-4">
		<Card>
			<CardHeader>
				<CardTitle>{$LL.stringCase.input()}</CardTitle>
			</CardHeader>
			<CardContent>
				<Textarea
					bind:value={inputText}
					placeholder={$LL.stringCase.inputPlaceholder()}
					class="min-h-[100px] font-mono"
				/>
			</CardContent>
		</Card>

		{#if inputText}
			<div class="grid gap-4 md:grid-cols-2">
				{#each [
					{ key: 'camelCase', fn: toCamelCase },
					{ key: 'pascalCase', fn: toPascalCase },
					{ key: 'snakeCase', fn: toSnakeCase },
					{ key: 'kebabCase', fn: toKebabCase },
					{ key: 'screamingSnakeCase', fn: toScreamingSnakeCase },
					{ key: 'dotCase', fn: toDotCase },
					{ key: 'pathCase', fn: toPathCase }
				] as caseType}
					<Card>
						<CardHeader>
							<div class="flex items-center justify-between">
								<CardTitle class="text-base">{$LL.stringCase[caseType.key as keyof typeof $LL.stringCase]()}</CardTitle>
								<Button
									onclick={() => copyText(caseType.fn(inputText))}
									variant="ghost"
									size="sm"
								>
									<Copy class="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<code class="block rounded bg-muted p-3 text-sm">{caseType.fn(inputText)}</code>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>
