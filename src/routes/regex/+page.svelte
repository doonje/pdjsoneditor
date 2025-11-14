<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle } from 'lucide-svelte';

	interface Match {
		text: string;
		index: number;
		groups: string[];
	}

	let pattern = $state('');
	let testString = $state('');
	const flags = $state({
		global: true,
		multiline: false,
		caseInsensitive: false,
		dotAll: false,
		unicode: false,
		sticky: false
	});

	let matches = $state<Match[]>([]);
	let error = $state<string | null>(null);

	$effect(() => {
		pattern;
		testString;
		flags;
		testRegex();
	});

	function testRegex() {
		if (!pattern || !testString) {
			matches = [];
			error = null;
			return;
		}

		try {
			const flagString =
				(flags.global ? 'g' : '') +
				(flags.multiline ? 'm' : '') +
				(flags.caseInsensitive ? 'i' : '') +
				(flags.dotAll ? 's' : '') +
				(flags.unicode ? 'u' : '') +
				(flags.sticky ? 'y' : '');

			const regex = new RegExp(pattern, flagString);
			const foundMatches: Match[] = [];

			if (flags.global) {
				let match;
				while ((match = regex.exec(testString)) !== null) {
					foundMatches.push({
						text: match[0],
						index: match.index,
						groups: match.slice(1)
					});
				}
			} else {
				const match = regex.exec(testString);
				if (match) {
					foundMatches.push({
						text: match[0],
						index: match.index,
						groups: match.slice(1)
					});
				}
			}

			matches = foundMatches;
			error = null;
		} catch (e) {
			matches = [];
			error = e instanceof Error ? e.message : 'Invalid regular expression';
		}
	}

	function highlightMatches(text: string, matches: Match[]): string {
		if (matches.length === 0) return text;

		let result = '';
		let lastIndex = 0;

		const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

		for (const match of sortedMatches) {
			result += text.slice(lastIndex, match.index);
			result += `<mark class="bg-yellow-300 dark:bg-yellow-700">${match.text}</mark>`;
			lastIndex = match.index + match.text.length;
		}

		result += text.slice(lastIndex);
		return result;
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.regex.title()}</h1>
		<p class="text-muted-foreground">{$LL.regex.description()}</p>
	</div>

	<div class="space-y-4">
		<!-- Pattern Input -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.regex.pattern()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="pattern">{$LL.regex.pattern()}</Label>
					<Input
						id="pattern"
						bind:value={pattern}
						placeholder={$LL.regex.patternPlaceholder()}
						class="font-mono"
					/>
				</div>

				<div class="space-y-2">
					<Label>{$LL.regex.flags()}</Label>
					<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.global}
								id="flag-g"
								class="h-4 w-4"
							/>
							<Label for="flag-g" class="font-normal">
								<code class="text-sm">g</code> - {$LL.regex.global()}
							</Label>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.multiline}
								id="flag-m"
								class="h-4 w-4"
							/>
							<Label for="flag-m" class="font-normal">
								<code class="text-sm">m</code> - {$LL.regex.multiline()}
							</Label>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.caseInsensitive}
								id="flag-i"
								class="h-4 w-4"
							/>
							<Label for="flag-i" class="font-normal">
								<code class="text-sm">i</code> - {$LL.regex.caseInsensitive()}
							</Label>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.dotAll}
								id="flag-s"
								class="h-4 w-4"
							/>
							<Label for="flag-s" class="font-normal">
								<code class="text-sm">s</code> - {$LL.regex.dotAll()}
							</Label>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.unicode}
								id="flag-u"
								class="h-4 w-4"
							/>
							<Label for="flag-u" class="font-normal">
								<code class="text-sm">u</code> - {$LL.regex.unicode()}
							</Label>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								bind:checked={flags.sticky}
								id="flag-y"
								class="h-4 w-4"
							/>
							<Label for="flag-y" class="font-normal">
								<code class="text-sm">y</code> - {$LL.regex.sticky()}
							</Label>
						</div>
					</div>
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

		<!-- Test String -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.regex.testString()}</CardTitle>
			</CardHeader>
			<CardContent>
				<Textarea
					bind:value={testString}
					placeholder={$LL.regex.testStringPlaceholder()}
					class="min-h-[200px] font-mono text-sm"
				/>
			</CardContent>
		</Card>

		<!-- Results -->
		{#if pattern && testString && !error}
			<Card>
				<CardHeader>
					<CardTitle>
						{$LL.regex.matches()}: {matches.length}
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Highlighted Text -->
					<div>
						<Label>{$LL.regex.highlightedText()}</Label>
						<div class="mt-2 rounded bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">
							{@html highlightMatches(testString, matches)}
						</div>
					</div>

					<!-- Match Details -->
					{#if matches.length > 0}
						<div class="space-y-2">
							<Label>{$LL.regex.matchDetails()}</Label>
							{#each matches as match, i}
								<div class="rounded border p-3">
									<div class="flex items-start justify-between">
										<div class="space-y-1">
											<p class="text-sm font-medium">
												{$LL.regex.match()} {i + 1}
											</p>
											<code class="block rounded bg-muted p-2 text-sm">{match.text}</code>
											<p class="text-xs text-muted-foreground">
												{$LL.regex.position()}: {match.index}
											</p>
										</div>
									</div>

									{#if match.groups.length > 0}
										<div class="mt-2 space-y-1">
											<p class="text-xs font-medium text-muted-foreground">
												{$LL.regex.captureGroups()}:
											</p>
											{#each match.groups as group, gi}
												<code class="block rounded bg-muted p-1 text-xs">
													Group {gi + 1}: {group || '(empty)'}
												</code>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">{$LL.regex.noMatches()}</p>
					{/if}
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
