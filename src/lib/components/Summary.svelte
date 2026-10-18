<script lang="ts">
	import type { ClientAnswers } from '$lib/schema';

	export let data: ClientAnswers;
</script>

<div>
	<h1>Summary coming soon</h1>
	<p>Client response from {data.d} days since epoch</p>
</div>
