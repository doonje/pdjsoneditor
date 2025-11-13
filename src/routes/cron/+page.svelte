<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Copy, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import cronstrue from 'cronstrue';
	import * as cronParser from 'cron-parser';

	let expression = $state('0 0 * * *');
	let description = $state('');
	let error = $state<string | null>(null);
	let nextRuns = $state<Date[]>([]);

	// Builder fields
	let minute = $state('0');
	let hour = $state('0');
	let dayOfMonth = $state('*');
	let month = $state('*');
	let dayOfWeek = $state('*');

	$effect(() => {
		expression;
		explainCron();
		calculateNextRuns();
	});

	function explainCron() {
		if (!expression.trim()) {
			description = '';
			error = null;
			return;
		}

		try {
			description = cronstrue.toString(expression, {
				use24HourTimeFormat: true
			});
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Invalid cron expression';
			description = '';
		}
	}

	function calculateNextRuns() {
		if (!expression.trim() || error) {
			nextRuns = [];
			return;
		}

		try {
			const interval = cronParser.CronExpressionParser.parse(expression);
			const runs: Date[] = [];

			for (let i = 0; i < 5; i++) {
				runs.push(interval.next().toDate());
			}

			nextRuns = runs;
		} catch (e) {
			nextRuns = [];
		}
	}

	function generateFromBuilder() {
		expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
	}

	function copyExpression() {
		navigator.clipboard.writeText(expression);
		toast.success($LL.cron.copySuccess());
	}

	function setPreset(preset: string) {
		switch (preset) {
			case 'everyMinute':
				expression = '* * * * *';
				break;
			case 'everyHour':
				expression = '0 * * * *';
				break;
			case 'everyDay':
				expression = '0 0 * * *';
				break;
			case 'everyWeek':
				expression = '0 0 * * 0';
				break;
			case 'everyMonth':
				expression = '0 0 1 * *';
				break;
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.cron.title()}</h1>
		<p class="text-muted-foreground">{$LL.cron.description()}</p>
	</div>

	<div class="space-y-4">
		<!-- Expression Input -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.cron.expression()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex gap-2">
					<Input
						bind:value={expression}
						placeholder={$LL.cron.expressionPlaceholder()}
						class="font-mono"
					/>
					<Button onclick={copyExpression} variant="outline">
						<Copy class="h-4 w-4" />
					</Button>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button onclick={() => setPreset('everyMinute')} variant="outline" size="sm">
						{$LL.cron.everyMinute()}
					</Button>
					<Button onclick={() => setPreset('everyHour')} variant="outline" size="sm">
						{$LL.cron.everyHour()}
					</Button>
					<Button onclick={() => setPreset('everyDay')} variant="outline" size="sm">
						{$LL.cron.everyDay()}
					</Button>
					<Button onclick={() => setPreset('everyWeek')} variant="outline" size="sm">
						{$LL.cron.everyWeek()}
					</Button>
					<Button onclick={() => setPreset('everyMonth')} variant="outline" size="sm">
						{$LL.cron.everyMonth()}
					</Button>
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

		<!-- Description -->
		{#if description}
			<Card>
				<CardHeader>
					<CardTitle>{$LL.cron.descriptionLabel()}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-lg">{description}</p>
				</CardContent>
			</Card>
		{/if}

		<!-- Next Runs -->
		{#if nextRuns.length > 0}
			<Card>
				<CardHeader>
					<CardTitle>{$LL.cron.nextRuns({ count: 5 })}</CardTitle>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2">
						{#each nextRuns as run, i}
							<li class="flex items-center gap-2">
								<span class="text-muted-foreground">{i + 1}.</span>
								<code class="font-mono text-sm">{run.toLocaleString()}</code>
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>
		{/if}

		<!-- Builder -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.cron.builder()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-5">
					<div class="space-y-2">
						<Label for="minute">{$LL.cron.minute()}</Label>
						<Input id="minute" bind:value={minute} placeholder="0-59 or *" class="font-mono" />
					</div>

					<div class="space-y-2">
						<Label for="hour">{$LL.cron.hour()}</Label>
						<Input id="hour" bind:value={hour} placeholder="0-23 or *" class="font-mono" />
					</div>

					<div class="space-y-2">
						<Label for="dayOfMonth">{$LL.cron.dayOfMonth()}</Label>
						<Input
							id="dayOfMonth"
							bind:value={dayOfMonth}
							placeholder="1-31 or *"
							class="font-mono"
						/>
					</div>

					<div class="space-y-2">
						<Label for="month">{$LL.cron.month()}</Label>
						<Input id="month" bind:value={month} placeholder="1-12 or *" class="font-mono" />
					</div>

					<div class="space-y-2">
						<Label for="dayOfWeek">{$LL.cron.dayOfWeek()}</Label>
						<Input
							id="dayOfWeek"
							bind:value={dayOfWeek}
							placeholder="0-7 or *"
							class="font-mono"
						/>
					</div>
				</div>

				<Button onclick={generateFromBuilder}>{$LL.cron.generate()}</Button>
			</CardContent>
		</Card>

		<!-- Help -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.cron.help()}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2 text-sm">
					<p>
						<code class="rounded bg-muted px-2 py-1">*</code> - {$LL.cron.helpAny()}
					</p>
					<p>
						<code class="rounded bg-muted px-2 py-1">*/5</code> - {$LL.cron.helpEvery()}
					</p>
					<p>
						<code class="rounded bg-muted px-2 py-1">1-5</code> - {$LL.cron.helpRange()}
					</p>
					<p>
						<code class="rounded bg-muted px-2 py-1">1,3,5</code> - {$LL.cron.helpList()}
					</p>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
