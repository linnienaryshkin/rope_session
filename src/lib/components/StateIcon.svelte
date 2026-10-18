<script lang="ts">
  import type { ItemState } from '$lib/schema';
  export let state: ItemState;
  export let small: boolean = false;
  $: size = small ? 14 : 18;
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  class={state}
  aria-hidden="true"
>
  {#if state === 'enabled'}
    <circle cx="12" cy="12" r="8" class="fill-accent" />
  {:else if state === 'disabled'}
    <circle cx="12" cy="12" r="8" />
  {:else}
    <circle cx="12" cy="12" r="3" />
  {/if}
</svg>

<style>
  svg {
    display: block;
    transition: color 0.15s;
  }
  svg.enabled {
    color: var(--accent);
  }
  svg.disabled {
    color: var(--muted);
  }
  svg.hidden {
    color: var(--disabled);
  }
  .fill-accent {
    fill: var(--accent);
    stroke: var(--accent);
  }
</style>
