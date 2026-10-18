<script lang="ts">
	import { encodePayload } from '$lib/url';
	import { daysSinceEpoch } from '$lib/schema';
	import type { MasterConfig } from '$lib/schema';

	export let config: MasterConfig | undefined = undefined;

	function generateLink() {
		const payload: MasterConfig = config ?? {
			v: 1,
			d: daysSinceEpoch(),
			mode: 'master',
			sections: {},
			extras: {}
		};
		window.location.hash = encodePayload(payload);
	}
</script>

<div>
	<h1>Master configuration coming soon</h1>
	<button on:click={generateLink}>Generate link</button>
</div>
