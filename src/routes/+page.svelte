<script lang="ts">
	import { onMount } from 'svelte';
	import { decodePayload } from '$lib/url';
	import type { MasterConfig, ClientAnswers } from '$lib/schema';
	import MasterHome from '$lib/components/MasterHome.svelte';
	import ClientForm from '$lib/components/ClientForm.svelte';
	import Summary from '$lib/components/Summary.svelte';

	let mode: 'master' | 'form' | 'client' | null = null;
	let masterConfig: MasterConfig | undefined = undefined;
	let clientAnswers: ClientAnswers | undefined = undefined;

	onMount(() => {
		const payload = decodePayload(window.location.hash);
		if (!payload) {
			mode = 'master';
		} else if (payload.mode === 'client') {
			mode = 'client';
			clientAnswers = payload as ClientAnswers;
		} else {
			mode = payload.mode;
			masterConfig = payload as MasterConfig;
		}
	});
</script>

{#if mode === 'master'}
	<MasterHome config={masterConfig} />
{:else if mode === 'form'}
	<ClientForm master={masterConfig} />
{:else if mode === 'client' && clientAnswers}
	<Summary data={clientAnswers} />
{/if}
