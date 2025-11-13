<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Copy, Eraser, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let version = $state<'v1' | 'v4'>('v4');
	let count = $state(1);
	let uppercase = $state(false);
	let hyphens = $state(true);
	let results = $state<string[]>([]);

	function generateUUIDs() {
		const uuids: string[] = [];
		for (let i = 0; i < count; i++) {
			let uuid: string = crypto.randomUUID();

			if (!hyphens) {
				uuid = uuid.replace(/-/g, '');
			}
			if (uppercase) {
				uuid = uuid.toUpperCase();
			}
			uuids.push(uuid);
		}
		results = uuids;
	}

	function copyAll() {
		if (results.length > 0) {
			navigator.clipboard.writeText(results.join('\n'));
			toast.success($LL.uuid.copySuccess());
		}
	}

	function clear() {
		results = [];
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.uuid.title()}</h1>
		<p class="text-muted-foreground">{$LL.uuid.description()}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Settings -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.uuid.title()}</CardTitle>
				<CardDescription>{$LL.uuid.description()}</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label>{$LL.uuid.version()}</Label>
					<div class="flex gap-4">
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								bind:group={version}
								value="v4"
								id="v4"
								class="h-4 w-4"
							/>
							<Label for="v4" class="font-normal">{$LL.uuid.v4()}</Label>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="count">{$LL.uuid.count()}</Label>
					<Input
						id="count"
						type="number"
						bind:value={count}
						min="1"
						max="100"
						class="w-32"
					/>
				</div>

				<div class="flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={uppercase}
						id="uppercase"
						class="h-4 w-4"
					/>
					<Label for="uppercase" class="font-normal">{$LL.uuid.uppercase()}</Label>
				</div>

				<div class="flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={hyphens}
						id="hyphens"
						class="h-4 w-4"
					/>
					<Label for="hyphens" class="font-normal">{$LL.uuid.hyphens()}</Label>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button onclick={generateUUIDs}>
						<RefreshCw class="mr-2 h-4 w-4" />
						{$LL.uuid.generate()}
					</Button>
					<Button onclick={clear} variant="outline">
						<Eraser class="mr-2 h-4 w-4" />
						{$LL.uuid.clear()}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Results -->
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>{$LL.uuid.result()}</CardTitle>
					<Button onclick={copyAll} variant="ghost" size="sm" disabled={results.length === 0}>
						<Copy class="mr-2 h-4 w-4" />
						{$LL.uuid.copy()}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Textarea
					value={results.join('\n')}
					readonly
					class="min-h-[400px] font-mono text-sm"
					placeholder="Generated UUIDs will appear here..."
				/>
			</CardContent>
		</Card>
	</div>
</div>
