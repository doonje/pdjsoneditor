<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Copy, Eraser, Hash as HashIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { md5 } from 'js-md5';

	let inputText = $state('');
	let md5Hash = $state('');
	let sha1Hash = $state('');
	let sha256Hash = $state('');
	let sha512Hash = $state('');

	async function generateHashes() {
		if (!inputText) {
			return;
		}

		try {
			// MD5 using js-md5
			md5Hash = md5(inputText);

			// SHA hashes using Web Crypto API
			const encoder = new TextEncoder();
			const data = encoder.encode(inputText);

			// SHA-1
			const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
			sha1Hash = bufferToHex(sha1Buffer);

			// SHA-256
			const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
			sha256Hash = bufferToHex(sha256Buffer);

			// SHA-512
			const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
			sha512Hash = bufferToHex(sha512Buffer);
		} catch (error) {
			toast.error('Failed to generate hashes');
			console.error(error);
		}
	}

	function bufferToHex(buffer: ArrayBuffer): string {
		return Array.from(new Uint8Array(buffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	}

	function copyHash(hash: string, algorithm: string) {
		if (hash) {
			navigator.clipboard.writeText(hash);
			toast.success($LL.hash.copySuccess());
		}
	}

	function clearAll() {
		inputText = '';
		md5Hash = '';
		sha1Hash = '';
		sha256Hash = '';
		sha512Hash = '';
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.hash.title()}</h1>
		<p class="text-muted-foreground">{$LL.hash.description()}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Input Section -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.hash.input()}</CardTitle>
				<CardDescription>
					{$LL.hash.description()}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="hash-input">{$LL.hash.input()}</Label>
					<Textarea
						id="hash-input"
						bind:value={inputText}
						placeholder={$LL.hash.inputPlaceholder()}
						class="min-h-[300px] font-mono"
					/>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button onclick={generateHashes}>
						<HashIcon class="mr-2 h-4 w-4" />
						{$LL.hash.generate()}
					</Button>
					<Button onclick={clearAll} variant="outline">
						<Eraser class="mr-2 h-4 w-4" />
						{$LL.hash.clear()}
					</Button>
				</div>
			</CardContent>
		</Card>

		<!-- Results Section -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.hash.result()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- MD5 -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="md5-hash">{$LL.hash.md5()}</Label>
						<Button onclick={() => copyHash(md5Hash, 'MD5')} variant="ghost" size="sm">
							<Copy class="mr-2 h-4 w-4" />
							{$LL.hash.copy()}
						</Button>
					</div>
					<Input
						id="md5-hash"
						value={md5Hash}
						readonly
						class="font-mono text-sm"
						placeholder="MD5 hash will appear here..."
					/>
				</div>

				<!-- SHA-1 -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="sha1-hash">{$LL.hash.sha1()}</Label>
						<Button onclick={() => copyHash(sha1Hash, 'SHA-1')} variant="ghost" size="sm">
							<Copy class="mr-2 h-4 w-4" />
							{$LL.hash.copy()}
						</Button>
					</div>
					<Input
						id="sha1-hash"
						value={sha1Hash}
						readonly
						class="font-mono text-sm"
						placeholder="SHA-1 hash will appear here..."
					/>
				</div>

				<!-- SHA-256 -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="sha256-hash">{$LL.hash.sha256()}</Label>
						<Button onclick={() => copyHash(sha256Hash, 'SHA-256')} variant="ghost" size="sm">
							<Copy class="mr-2 h-4 w-4" />
							{$LL.hash.copy()}
						</Button>
					</div>
					<Input
						id="sha256-hash"
						value={sha256Hash}
						readonly
						class="font-mono text-sm"
						placeholder="SHA-256 hash will appear here..."
					/>
				</div>

				<!-- SHA-512 -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="sha512-hash">{$LL.hash.sha512()}</Label>
						<Button onclick={() => copyHash(sha512Hash, 'SHA-512')} variant="ghost" size="sm">
							<Copy class="mr-2 h-4 w-4" />
							{$LL.hash.copy()}
						</Button>
					</div>
					<Input
						id="sha512-hash"
						value={sha512Hash}
						readonly
						class="font-mono text-sm"
						placeholder="SHA-512 hash will appear here..."
					/>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
