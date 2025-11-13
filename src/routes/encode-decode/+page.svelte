<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Copy, Eraser } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let inputText = $state('');
	let outputText = $state('');
	let activeTab = $state<'base64' | 'url'>('base64');

	function base64Encode() {
		try {
			const encoded = btoa(unescape(encodeURIComponent(inputText)));
			outputText = encoded;
		} catch (error) {
			toast.error($LL.encodeDecode.encodeError());
		}
	}

	function base64Decode() {
		try {
			const decoded = decodeURIComponent(escape(atob(inputText)));
			outputText = decoded;
		} catch (error) {
			toast.error($LL.encodeDecode.decodeError());
		}
	}

	function urlEncode() {
		try {
			outputText = encodeURIComponent(inputText);
		} catch (error) {
			toast.error($LL.encodeDecode.encodeError());
		}
	}

	function urlDecode() {
		try {
			outputText = decodeURIComponent(inputText);
		} catch (error) {
			toast.error($LL.encodeDecode.decodeError());
		}
	}

	function copyToClipboard() {
		if (outputText) {
			navigator.clipboard.writeText(outputText);
			toast.success($LL.encodeDecode.copySuccess());
		}
	}

	function clearAll() {
		inputText = '';
		outputText = '';
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.encodeDecode.title()}</h1>
		<p class="text-muted-foreground">{$LL.encodeDecode.description()}</p>
	</div>

	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="grid w-full max-w-md grid-cols-2">
			<TabsTrigger value="base64">{$LL.encodeDecode.base64()}</TabsTrigger>
			<TabsTrigger value="url">{$LL.encodeDecode.url()}</TabsTrigger>
		</TabsList>

		<TabsContent value="base64" class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>{$LL.encodeDecode.base64()}</CardTitle>
					<CardDescription>
						{$LL.encodeDecode.description()}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Input -->
					<div class="space-y-2">
						<Label for="base64-input">{$LL.encodeDecode.input()}</Label>
						<Textarea
							id="base64-input"
							bind:value={inputText}
							placeholder={$LL.encodeDecode.inputPlaceholder()}
							class="min-h-[200px] font-mono"
						/>
					</div>

					<!-- Buttons -->
					<div class="flex flex-wrap gap-2">
						<Button onclick={base64Encode}>{$LL.encodeDecode.base64Encode()}</Button>
						<Button onclick={base64Decode} variant="secondary">
							{$LL.encodeDecode.base64Decode()}
						</Button>
						<Button onclick={clearAll} variant="outline">
							<Eraser class="mr-2 h-4 w-4" />
							{$LL.encodeDecode.clear()}
						</Button>
					</div>

					<!-- Output -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label for="base64-output">{$LL.encodeDecode.output()}</Label>
							<Button onclick={copyToClipboard} variant="ghost" size="sm">
								<Copy class="mr-2 h-4 w-4" />
								{$LL.encodeDecode.copy()}
							</Button>
						</div>
						<Textarea
							id="base64-output"
							bind:value={outputText}
							readonly
							class="min-h-[200px] font-mono"
						/>
					</div>
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="url" class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>{$LL.encodeDecode.url()}</CardTitle>
					<CardDescription>
						{$LL.encodeDecode.description()}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Input -->
					<div class="space-y-2">
						<Label for="url-input">{$LL.encodeDecode.input()}</Label>
						<Textarea
							id="url-input"
							bind:value={inputText}
							placeholder={$LL.encodeDecode.inputPlaceholder()}
							class="min-h-[200px] font-mono"
						/>
					</div>

					<!-- Buttons -->
					<div class="flex flex-wrap gap-2">
						<Button onclick={urlEncode}>{$LL.encodeDecode.urlEncode()}</Button>
						<Button onclick={urlDecode} variant="secondary">
							{$LL.encodeDecode.urlDecode()}
						</Button>
						<Button onclick={clearAll} variant="outline">
							<Eraser class="mr-2 h-4 w-4" />
							{$LL.encodeDecode.clear()}
						</Button>
					</div>

					<!-- Output -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label for="url-output">{$LL.encodeDecode.output()}</Label>
							<Button onclick={copyToClipboard} variant="ghost" size="sm">
								<Copy class="mr-2 h-4 w-4" />
								{$LL.encodeDecode.copy()}
							</Button>
						</div>
						<Textarea
							id="url-output"
							bind:value={outputText}
							readonly
							class="min-h-[200px] font-mono"
						/>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>
