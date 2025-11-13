<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { ArrowLeftRight, Copy, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import yaml from 'js-yaml';

	type ConversionDirection = 'yaml-to-json' | 'json-to-yaml';

	let inputText = $state('');
	let outputText = $state('');
	let direction = $state<ConversionDirection>('yaml-to-json');
	let error = $state<string | null>(null);
	let indentSize = $state(2);

	$effect(() => {
		inputText;
		direction;
		indentSize;
		convert();
	});

	function convert() {
		if (!inputText.trim()) {
			outputText = '';
			error = null;
			return;
		}

		try {
			if (direction === 'yaml-to-json') {
				// YAML to JSON
				const parsed = yaml.load(inputText);
				outputText = JSON.stringify(parsed, null, indentSize);
			} else {
				// JSON to YAML
				const parsed = JSON.parse(inputText);
				outputText = yaml.dump(parsed, {
					indent: indentSize,
					lineWidth: -1,
					noRefs: true
				});
			}
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
			outputText = '';
		}
	}

	function switchDirection() {
		// Swap direction
		direction = direction === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json';

		// Swap input and output
		const temp = inputText;
		inputText = outputText;
		outputText = temp;
	}

	function copyOutput() {
		navigator.clipboard.writeText(outputText);
		toast.success($LL.yamlJson.copySuccess());
	}

	function clear() {
		inputText = '';
		outputText = '';
		error = null;
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.yamlJson.title()}</h1>
		<p class="text-muted-foreground">{$LL.yamlJson.description()}</p>
	</div>

	<div class="space-y-4">
		<!-- Controls -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.yamlJson.settings()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center gap-4">
					<div class="flex items-center space-x-2">
						<input
							type="radio"
							bind:group={direction}
							value="yaml-to-json"
							id="yaml-to-json"
							class="h-4 w-4"
						/>
						<Label for="yaml-to-json" class="font-normal">{$LL.yamlJson.yamlToJson()}</Label>
					</div>

					<div class="flex items-center space-x-2">
						<input
							type="radio"
							bind:group={direction}
							value="json-to-yaml"
							id="json-to-yaml"
							class="h-4 w-4"
						/>
						<Label for="json-to-yaml" class="font-normal">{$LL.yamlJson.jsonToYaml()}</Label>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<Label for="indent">{$LL.yamlJson.indentSize()}</Label>
					<input
						id="indent"
						type="number"
						bind:value={indentSize}
						min="2"
						max="8"
						step="1"
						class="w-20 rounded border px-3 py-1"
					/>
				</div>

				<div class="flex gap-2">
					<Button onclick={switchDirection} variant="outline">
						<ArrowLeftRight class="mr-2 h-4 w-4" />
						{$LL.yamlJson.switch()}
					</Button>
					<Button onclick={clear} variant="outline">{$LL.yamlJson.clear()}</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Error -->
		{#if error}
			<Alert variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		{/if}

		<!-- Input/Output -->
		<div class="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>
						{direction === 'yaml-to-json' ? $LL.yamlJson.yamlInput() : $LL.yamlJson.jsonInput()}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Textarea
						bind:value={inputText}
						placeholder={direction === 'yaml-to-json'
							? $LL.yamlJson.yamlPlaceholder()
							: $LL.yamlJson.jsonPlaceholder()}
						class="min-h-[400px] font-mono text-sm"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>
							{direction === 'yaml-to-json'
								? $LL.yamlJson.jsonOutput()
								: $LL.yamlJson.yamlOutput()}
						</CardTitle>
						<Button onclick={copyOutput} variant="ghost" size="sm" disabled={!outputText}>
							<Copy class="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Textarea
						value={outputText}
						readonly
						placeholder={$LL.yamlJson.outputPlaceholder()}
						class="min-h-[400px] font-mono text-sm"
					/>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
