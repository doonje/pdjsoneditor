<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Copy, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { decodeJWT, formatTimestamp, isExpired, type DecodedJWT } from '$lib/utils/jwt';

	let jwtInput = $state('');
	let decoded = $state<DecodedJWT | null>(null);

	$effect(() => {
		if (jwtInput.trim()) {
			decoded = decodeJWT(jwtInput);
		} else {
			decoded = null;
		}
	});

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
		toast.success($LL.jwt.copySuccess());
	}

	function formatJson(obj: unknown) {
		return JSON.stringify(obj, null, 2);
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.jwt.title()}</h1>
		<p class="text-muted-foreground">{$LL.jwt.description()}</p>
	</div>

	<div class="space-y-4">
		<Card>
			<CardHeader>
				<CardTitle>{$LL.jwt.input()}</CardTitle>
			</CardHeader>
			<CardContent>
				<Textarea
					bind:value={jwtInput}
					placeholder={$LL.jwt.tokenPlaceholder()}
					class="min-h-[150px] font-mono text-sm"
				/>
			</CardContent>
		</Card>

		{#if decoded}
			{#if !decoded.isValid && decoded.error}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertDescription>{decoded.error}</AlertDescription>
				</Alert>
			{/if}

			<div class="grid gap-4 md:grid-cols-2">
				<!-- Header -->
				<Card>
					<CardHeader>
						<div class="flex items-center justify-between">
							<CardTitle class="text-base">{$LL.jwt.header()}</CardTitle>
							<Button
								onclick={() => decoded && copyText(formatJson(decoded.header))}
								variant="ghost"
								size="sm"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<pre class="rounded bg-muted p-3 text-sm overflow-auto">{formatJson(
								decoded.header
							)}</pre>
					</CardContent>
				</Card>

				<!-- Payload -->
				<Card>
					<CardHeader>
						<div class="flex items-center justify-between">
							<CardTitle class="text-base">{$LL.jwt.payload()}</CardTitle>
							<Button
								onclick={() => decoded && copyText(formatJson(decoded.payload))}
								variant="ghost"
								size="sm"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<pre class="rounded bg-muted p-3 text-sm overflow-auto">{formatJson(
								decoded.payload
							)}</pre>
					</CardContent>
				</Card>
			</div>

			<!-- Claims -->
			<Card>
				<CardHeader>
					<CardTitle>{$LL.jwt.claims()}</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-4 md:grid-cols-2">
						{#if decoded.payload.iss}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.issuer()}</Label>
								<p class="font-mono text-sm">{decoded.payload.iss}</p>
							</div>
						{/if}

						{#if decoded.payload.sub}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.subject()}</Label>
								<p class="font-mono text-sm">{decoded.payload.sub}</p>
							</div>
						{/if}

						{#if decoded.payload.aud}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.audience()}</Label>
								<p class="font-mono text-sm">
									{Array.isArray(decoded.payload.aud)
										? decoded.payload.aud.join(', ')
										: decoded.payload.aud}
								</p>
							</div>
						{/if}

						{#if decoded.payload.exp !== undefined}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.expiration()}</Label>
								<p class="font-mono text-sm">
									{formatTimestamp(decoded.payload.exp)}
									{#if isExpired(decoded.payload.exp)}
										<span class="text-destructive">({$LL.jwt.expired()})</span>
									{/if}
								</p>
							</div>
						{/if}

						{#if decoded.payload.nbf !== undefined}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.notBefore()}</Label>
								<p class="font-mono text-sm">{formatTimestamp(decoded.payload.nbf)}</p>
							</div>
						{/if}

						{#if decoded.payload.iat !== undefined}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.issuedAt()}</Label>
								<p class="font-mono text-sm">{formatTimestamp(decoded.payload.iat)}</p>
							</div>
						{/if}

						{#if decoded.payload.jti}
							<div>
								<Label class="text-muted-foreground">{$LL.jwt.jwtId()}</Label>
								<p class="font-mono text-sm">{decoded.payload.jti}</p>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Signature -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>{$LL.jwt.signature()}</CardTitle>
						<Button onclick={() => decoded && copyText(decoded.signature)} variant="ghost" size="sm">
							<Copy class="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<code class="block rounded bg-muted p-3 text-sm break-all">{decoded.signature}</code>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
