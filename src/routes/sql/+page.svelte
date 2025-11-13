<script lang="ts">
	import { LL } from '$i18n/i18n-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Copy, Eraser, AlertCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { format } from 'sql-formatter';

	type SQLLanguage = 'sql' | 'mysql' | 'postgresql' | 'mariadb' | 'sqlite' | 'plsql' | 'tsql';

	let inputSQL = $state('');
	let formattedSQL = $state('');
	let language = $state<SQLLanguage>('sql');
	let uppercase = $state(true);
	let indentSize = $state(2);
	let error = $state<string | null>(null);

	$effect(() => {
		inputSQL;
		language;
		uppercase;
		indentSize;
		formatSQL();
	});

	function formatSQL() {
		if (!inputSQL.trim()) {
			formattedSQL = '';
			error = null;
			return;
		}

		try {
			formattedSQL = format(inputSQL, {
				language,
				keywordCase: uppercase ? 'upper' : 'lower',
				indentStyle: 'standard',
				tabWidth: indentSize,
				linesBetweenQueries: 2
			});
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to format SQL';
			formattedSQL = '';
		}
	}

	function copyFormatted() {
		navigator.clipboard.writeText(formattedSQL);
		toast.success($LL.sql.copySuccess());
	}

	function clear() {
		inputSQL = '';
		formattedSQL = '';
		error = null;
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">{$LL.sql.title()}</h1>
		<p class="text-muted-foreground">{$LL.sql.description()}</p>
	</div>

	<div class="space-y-4">
		<!-- Settings -->
		<Card>
			<CardHeader>
				<CardTitle>{$LL.sql.settings()}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<Label for="language">{$LL.sql.language()}</Label>
						<select
							id="language"
							bind:value={language}
							class="w-full rounded border bg-background px-3 py-2"
						>
							<option value="sql">Standard SQL</option>
							<option value="mysql">MySQL</option>
							<option value="postgresql">PostgreSQL</option>
							<option value="mariadb">MariaDB</option>
							<option value="sqlite">SQLite</option>
							<option value="plsql">PL/SQL (Oracle)</option>
							<option value="tsql">T-SQL (SQL Server)</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label for="indent">{$LL.sql.indentSize()}</Label>
						<input
							id="indent"
							type="number"
							bind:value={indentSize}
							min="2"
							max="8"
							step="1"
							class="w-full rounded border bg-background px-3 py-2"
						/>
					</div>

					<div class="flex items-center space-x-2 pt-8">
						<input
							type="checkbox"
							bind:checked={uppercase}
							id="uppercase"
							class="h-4 w-4"
						/>
						<Label for="uppercase" class="font-normal">{$LL.sql.uppercase()}</Label>
					</div>
				</div>

				<div class="flex gap-2">
					<Button onclick={clear} variant="outline">
						<Eraser class="mr-2 h-4 w-4" />
						{$LL.sql.clear()}
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

		<!-- Input/Output -->
		<div class="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{$LL.sql.input()}</CardTitle>
				</CardHeader>
				<CardContent>
					<Textarea
						bind:value={inputSQL}
						placeholder={$LL.sql.inputPlaceholder()}
						class="min-h-[400px] font-mono text-sm"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>{$LL.sql.output()}</CardTitle>
						<Button onclick={copyFormatted} variant="ghost" size="sm" disabled={!formattedSQL}>
							<Copy class="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Textarea
						value={formattedSQL}
						readonly
						placeholder={$LL.sql.outputPlaceholder()}
						class="min-h-[400px] font-mono text-sm"
					/>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
