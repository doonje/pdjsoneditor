<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Trash2 } from 'lucide-svelte';
	import LL from '$i18n/i18n-svelte';

	interface Props {
		isOpen: boolean;
		headers: Array<{ key: string; value: string }>;
		body: string;
		sendAsRawText: boolean;
		useEditorContent: boolean;
		onSave: (settings: {
			headers: Array<{ key: string; value: string }>;
			body: string;
			sendAsRawText: boolean;
			useEditorContent: boolean;
		}) => void;
		onCancel: () => void;
		onClearAll: () => void;
	}

	let {
		isOpen = $bindable(),
		headers = [],
		body = '',
		sendAsRawText = false,
		useEditorContent = false,
		onSave,
		onCancel,
		onClearAll
	}: Props = $props();

	let tempHeaders = $state<Array<{ key: string; value: string }>>([]);
	let tempBody = $state<string>('');
	let tempSendAsRawText = $state<boolean>(false);
	let tempUseEditorContent = $state<boolean>(false);

	$effect(() => {
		if (isOpen) {
			// 다이얼로그가 열릴 때 현재 값을 temp로 복사
			if (headers && headers.length > 0) {
				tempHeaders = headers.map((h) => ({ ...h }));
			} else {
				tempHeaders = [{ key: '', value: '' }];
			}
			tempBody = body || '';
			tempSendAsRawText = sendAsRawText;
			tempUseEditorContent = useEditorContent;
		}
	});

	function addHeader() {
		tempHeaders = [...tempHeaders, { key: '', value: '' }];
	}

	function removeHeader(index: number) {
		tempHeaders = tempHeaders.filter((_, i) => i !== index);
	}

	function updateHeader(index: number, field: 'key' | 'value', value: string) {
		tempHeaders = tempHeaders.map((header, i) =>
			i === index ? { ...header, [field]: value } : header
		);
	}

	function handleSave() {
		onSave({
			headers: [...tempHeaders],
			body: tempBody,
			sendAsRawText: tempSendAsRawText,
			useEditorContent: tempUseEditorContent
		});
		isOpen = false;
	}

	function handleCancel() {
		onCancel();
		isOpen = false;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{$LL.editor.requestSettings()}</Dialog.Title>
			<Dialog.Description>
				{$LL.editor.requestSettingsDescription()}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Headers Section -->
			<div>
				<h4 class="text-sm font-medium mb-2">{$LL.editor.headers()}</h4>
				<div class="space-y-2">
					<div class={tempHeaders.length >= 4 ? 'max-h-48 overflow-y-auto space-y-2' : 'space-y-2'}>
						{#each tempHeaders as header, index}
							<div class="flex gap-2">
								<Input
									placeholder={$LL.editor.headerKey()}
									value={header.key}
									oninput={(e) => updateHeader(index, 'key', e.currentTarget.value)}
									class="flex-1"
								/>
								<Input
									placeholder={$LL.editor.headerValue()}
									value={header.value}
									oninput={(e) => updateHeader(index, 'value', e.currentTarget.value)}
									class="flex-1"
								/>
								<Button variant="ghost" size="icon" onclick={() => removeHeader(index)}>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						{/each}
					</div>
					<Button variant="outline" size="sm" onclick={addHeader} class="w-full">
						<Plus class="h-4 w-4 mr-2" />
						{$LL.editor.addHeader()}
					</Button>
				</div>
			</div>

			<!-- Body Section -->
			<div>
				<h4 class="text-sm font-medium mb-2">{$LL.editor.body()}</h4>
				<p class="text-xs text-muted-foreground mb-2">
					{$LL.editor.bodyDescription()}
				</p>
				<div class="space-y-3 mb-3">
					<div class="flex items-center space-x-2">
						<Checkbox id="use-editor-content" bind:checked={tempUseEditorContent} />
						<label for="use-editor-content" class="text-sm cursor-pointer">
							{$LL.editor.useEditorContent()}
						</label>
					</div>
					<div class="flex items-center space-x-2">
						<Checkbox id="raw-body-mode" bind:checked={tempSendAsRawText} />
						<label for="raw-body-mode" class="text-sm cursor-pointer">
							{$LL.editor.sendAsRawText()}
						</label>
					</div>
				</div>
				<Textarea
					placeholder={$LL.editor.bodyPlaceholder()}
					bind:value={tempBody}
					class="min-h-[150px] font-mono text-sm"
				/>
			</div>
		</div>

		<Dialog.Footer class="!flex !justify-between !items-center !flex-row">
			<Button variant="destructive" onclick={onClearAll}>
				{$LL.editor.clearAll()}
			</Button>
			<div class="flex gap-2">
				<Button variant="outline" onclick={handleCancel}>
					{$LL.editor.cancel()}
				</Button>
				<Button onclick={handleSave}>
					{$LL.editor.save()}
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
