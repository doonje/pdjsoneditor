<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Copy } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { hexToRgb, rgbToHex, rgbToHsl } from '$lib/utils/color';

	let hexInput = $state('#FF5733');
	let rgb = $derived.by(() => hexToRgb(hexInput));
	let hsl = $derived.by(() => {
		const rgbColor = hexToRgb(hexInput);
		return rgbColor ? rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b) : null;
	});

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
		toast.success($LL.color.copySuccess());
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.color.title()}</h1>
		<p class="text-muted-foreground">{$LL.color.description()}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>{$LL.color.hex()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="hex">{$LL.color.hex()}</Label>
					<Input id="hex" bind:value={hexInput} placeholder={$LL.color.hexPlaceholder()} />
				</div>
				<div class="space-y-2">
					<Label>{$LL.color.preview()}</Label>
					<div class="h-32 rounded-lg border" style="background-color: {hexInput}"></div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Results</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if rgb}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>{$LL.color.rgb()}</Label>
							<Button
								onclick={() => copyText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
								variant="ghost"
								size="sm"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
						<code class="block rounded bg-muted p-3 text-sm">rgb({rgb.r}, {rgb.g}, {rgb.b})</code>
					</div>
				{/if}

				{#if hsl}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label>{$LL.color.hsl()}</Label>
							<Button
								onclick={() => copyText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
								variant="ghost"
								size="sm"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
						<code class="block rounded bg-muted p-3 text-sm"
							>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</code
						>
					</div>
				{/if}

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>{$LL.color.android()}</Label>
						<Button
							onclick={() =>
								copyText(`<color name="custom">${hexInput.toUpperCase()}</color>`)}
							variant="ghost"
							size="sm"
						>
							<Copy class="h-4 w-4" />
						</Button>
					</div>
					<code class="block rounded bg-muted p-3 text-sm"
						>&lt;color name="custom"&gt;{hexInput.toUpperCase()}&lt;/color&gt;</code
					>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
