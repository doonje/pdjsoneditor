<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Copy, Eraser, Clock } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let timestampInput = $state('');
	let timestampUnit = $state<'seconds' | 'milliseconds'>('milliseconds');
	let convertedDate = $state('');
	let convertedDateLocal = $state('');

	let dateInput = $state('');
	let dateUnit = $state<'seconds' | 'milliseconds'>('milliseconds');
	let convertedTimestamp = $state('');

	function timestampToDate() {
		try {
			const ts = parseInt(timestampInput);
			if (isNaN(ts)) {
				toast.error($LL.timestamp.invalidTimestamp());
				return;
			}

			const date =
				timestampUnit === 'seconds' ? new Date(ts * 1000) : new Date(ts);

			if (isNaN(date.getTime())) {
				toast.error($LL.timestamp.invalidTimestamp());
				return;
			}

			// ISO 8601 format
			convertedDate = date.toISOString();

			// Local format
			convertedDateLocal = date.toLocaleString(undefined, {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		} catch (error) {
			toast.error($LL.timestamp.invalidTimestamp());
			console.error(error);
		}
	}

	function dateToTimestamp() {
		try {
			if (!dateInput) {
				toast.error($LL.timestamp.invalidDate());
				return;
			}

			const date = new Date(dateInput);

			if (isNaN(date.getTime())) {
				toast.error($LL.timestamp.invalidDate());
				return;
			}

			const ts = date.getTime();
			convertedTimestamp =
				dateUnit === 'seconds' ? Math.floor(ts / 1000).toString() : ts.toString();
		} catch (error) {
			toast.error($LL.timestamp.invalidDate());
			console.error(error);
		}
	}

	function getCurrentTimestamp() {
		const now = Date.now();
		timestampInput =
			timestampUnit === 'seconds' ? Math.floor(now / 1000).toString() : now.toString();
		timestampToDate();
	}

	function copyText(text: string) {
		if (text) {
			navigator.clipboard.writeText(text);
			toast.success($LL.timestamp.copySuccess());
		}
	}

	function clearTimestampToDate() {
		timestampInput = '';
		convertedDate = '';
		convertedDateLocal = '';
	}

	function clearDateToTimestamp() {
		dateInput = '';
		convertedTimestamp = '';
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.timestamp.title()}</h1>
		<p class="text-muted-foreground">{$LL.timestamp.description()}</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Timestamp to Date -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.timestamp.timestampToDate()}</CardTitle>
				<CardDescription>
					{$LL.timestamp.description()}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- Unit Selection -->
				<div class="space-y-2">
					<Label>{$LL.timestamp.unit()}</Label>
					<div class="flex gap-4">
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								bind:group={timestampUnit}
								value="milliseconds"
								id="ts-ms"
								class="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
							<Label for="ts-ms" class="font-normal">{$LL.timestamp.milliseconds()}</Label>
						</div>
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								bind:group={timestampUnit}
								value="seconds"
								id="ts-s"
								class="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
							<Label for="ts-s" class="font-normal">{$LL.timestamp.seconds()}</Label>
						</div>
					</div>
				</div>

				<!-- Timestamp Input -->
				<div class="space-y-2">
					<Label for="timestamp-input">{$LL.timestamp.timestamp()}</Label>
					<Input
						id="timestamp-input"
						bind:value={timestampInput}
						placeholder={$LL.timestamp.timestampPlaceholder()}
						type="text"
						class="font-mono"
					/>
				</div>

				<!-- Buttons -->
				<div class="flex flex-wrap gap-2">
					<Button onclick={getCurrentTimestamp} variant="secondary">
						<Clock class="mr-2 h-4 w-4" />
						{$LL.timestamp.currentTimestamp()}
					</Button>
					<Button onclick={timestampToDate}>{$LL.timestamp.convert()}</Button>
					<Button onclick={clearTimestampToDate} variant="outline">
						<Eraser class="mr-2 h-4 w-4" />
						{$LL.timestamp.clear()}
					</Button>
				</div>

				<!-- Results -->
				{#if convertedDate}
					<div class="space-y-4 border-t pt-4">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label>ISO 8601</Label>
								<Button onclick={() => copyText(convertedDate)} variant="ghost" size="sm">
									<Copy class="mr-2 h-4 w-4" />
									{$LL.timestamp.copy()}
								</Button>
							</div>
							<Input value={convertedDate} readonly class="font-mono text-sm" />
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label>Local</Label>
								<Button onclick={() => copyText(convertedDateLocal)} variant="ghost" size="sm">
									<Copy class="mr-2 h-4 w-4" />
									{$LL.timestamp.copy()}
								</Button>
							</div>
							<Input value={convertedDateLocal} readonly class="font-mono text-sm" />
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Date to Timestamp -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.timestamp.dateToTimestamp()}</CardTitle>
				<CardDescription>
					{$LL.timestamp.description()}
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- Unit Selection -->
				<div class="space-y-2">
					<Label>{$LL.timestamp.unit()}</Label>
					<div class="flex gap-4">
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								bind:group={dateUnit}
								value="milliseconds"
								id="date-ms"
								class="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
							<Label for="date-ms" class="font-normal">{$LL.timestamp.milliseconds()}</Label>
						</div>
						<div class="flex items-center space-x-2">
							<input
								type="radio"
								bind:group={dateUnit}
								value="seconds"
								id="date-s"
								class="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
							/>
							<Label for="date-s" class="font-normal">{$LL.timestamp.seconds()}</Label>
						</div>
					</div>
				</div>

				<!-- Date Input -->
				<div class="space-y-2">
					<Label for="date-input">{$LL.timestamp.date()}</Label>
					<Input id="date-input" bind:value={dateInput} type="datetime-local" />
				</div>

				<!-- Buttons -->
				<div class="flex flex-wrap gap-2">
					<Button onclick={dateToTimestamp}>{$LL.timestamp.convert()}</Button>
					<Button onclick={clearDateToTimestamp} variant="outline">
						<Eraser class="mr-2 h-4 w-4" />
						{$LL.timestamp.clear()}
					</Button>
				</div>

				<!-- Result -->
				{#if convertedTimestamp}
					<div class="space-y-2 border-t pt-4">
						<div class="flex items-center justify-between">
							<Label for="timestamp-output">{$LL.timestamp.timestamp()}</Label>
							<Button onclick={() => copyText(convertedTimestamp)} variant="ghost" size="sm">
								<Copy class="mr-2 h-4 w-4" />
								{$LL.timestamp.copy()}
							</Button>
						</div>
						<Input
							id="timestamp-output"
							value={convertedTimestamp}
							readonly
							class="font-mono text-sm"
						/>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
