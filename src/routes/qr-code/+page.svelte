<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Download } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	let text = $state('');
	let size = $state(256);
	let errorLevel = $state<'L' | 'M' | 'Q' | 'H'>('M');
	let qrCanvas: HTMLCanvasElement;
	let hasQRCode = $state(false);

	async function generateQRCode() {
		if (!text || !qrCanvas) return;

		try {
			await QRCode.toCanvas(qrCanvas, text, {
				width: size,
				errorCorrectionLevel: errorLevel,
				margin: 1
			});
			hasQRCode = true;
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to generate QR code'
			);
			hasQRCode = false;
		}
	}

	function downloadQRCode() {
		if (!qrCanvas || !hasQRCode) return;

		const url = qrCanvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.download = 'qrcode.png';
		link.href = url;
		link.click();
		toast.success($LL.qrCode.downloadSuccess());
	}

	$effect(() => {
		if (text) {
			generateQRCode();
		} else {
			hasQRCode = false;
		}
	});

	$effect(() => {
		size;
		errorLevel;
		if (text) {
			generateQRCode();
		}
	});
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.qrCode.title()}</h1>
		<p class="text-muted-foreground">{$LL.qrCode.description()}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Settings -->
		<div class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>{$LL.qrCode.settings()}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="text">{$LL.qrCode.text()}</Label>
						<Textarea
							id="text"
							bind:value={text}
							placeholder={$LL.qrCode.textPlaceholder()}
							class="min-h-[150px] font-mono"
						/>
					</div>

					<div class="space-y-2">
						<Label for="size">{$LL.qrCode.size()}: {size}px</Label>
						<Input
							id="size"
							type="range"
							bind:value={size}
							min="128"
							max="512"
							step="32"
							class="w-full"
						/>
					</div>

					<div class="space-y-2">
						<Label>{$LL.qrCode.errorCorrection()}</Label>
						<div class="grid grid-cols-2 gap-4">
							<div class="flex items-center space-x-2">
								<input
									type="radio"
									bind:group={errorLevel}
									value="L"
									id="error-l"
									class="h-4 w-4"
								/>
								<Label for="error-l" class="font-normal">
									<code class="text-sm">L</code> - {$LL.qrCode.errorLevelL()}
								</Label>
							</div>

							<div class="flex items-center space-x-2">
								<input
									type="radio"
									bind:group={errorLevel}
									value="M"
									id="error-m"
									class="h-4 w-4"
								/>
								<Label for="error-m" class="font-normal">
									<code class="text-sm">M</code> - {$LL.qrCode.errorLevelM()}
								</Label>
							</div>

							<div class="flex items-center space-x-2">
								<input
									type="radio"
									bind:group={errorLevel}
									value="Q"
									id="error-q"
									class="h-4 w-4"
								/>
								<Label for="error-q" class="font-normal">
									<code class="text-sm">Q</code> - {$LL.qrCode.errorLevelQ()}
								</Label>
							</div>

							<div class="flex items-center space-x-2">
								<input
									type="radio"
									bind:group={errorLevel}
									value="H"
									id="error-h"
									class="h-4 w-4"
								/>
								<Label for="error-h" class="font-normal">
									<code class="text-sm">H</code> - {$LL.qrCode.errorLevelH()}
								</Label>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Preview -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.qrCode.preview()}</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col items-center space-y-4">
				<div class="rounded border p-4 bg-white">
					<canvas bind:this={qrCanvas}></canvas>
				</div>

				{#if hasQRCode}
					<Button onclick={downloadQRCode}>
						<Download class="mr-2 h-4 w-4" />
						{$LL.qrCode.download()}
					</Button>
				{:else}
					<p class="text-sm text-muted-foreground">{$LL.qrCode.noQRCode()}</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
