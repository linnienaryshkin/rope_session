<script lang="ts">
  import { encodePayload } from '$lib/url';
  import { daysSinceEpoch } from '$lib/schema';
  import type { MasterConfig, ItemState } from '$lib/schema';
  import StateIcon from './StateIcon.svelte';

  export let config: MasterConfig | undefined = undefined;

  type SectionDef = {
    key: string;
    label: string;
    description: string;
    items?: { key: string; label: string }[];
  };

  const SECTIONS: SectionDef[] = [
    { key: 'experience', label: 'Experience', description: 'Background & familiarity with rope' },
    { key: 'physical', label: 'Physical Readiness', description: 'Mobility & body self-assessment' },
    { key: 'vibe', label: 'Vibe', description: 'Emotional tone for the session' },
    { key: 'rope_styles', label: 'Rope Styles', description: 'Japanese styles — shown with names & descriptions' },
    { key: 'body', label: 'Body Preferences', description: 'Areas, ties, marks' },
    {
      key: 'extras', label: 'Extras', description: 'Additional elements — enable individually',
      items: [
        { key: 'hair', label: 'Hair' },
        { key: 'gag', label: 'Gag / Blindfold' },
        { key: 'nails', label: 'Nails / Teeth' },
        { key: 'collar', label: 'Collar / Leash' },
        { key: 'impact', label: 'Impact' },
        { key: 'kiss', label: 'Kissing' },
        { key: 'breast', label: 'Breast' },
        { key: 'genital', label: 'Genital' },
      ]
    },
    { key: 'aftercare', label: 'Aftercare', description: 'Post-session preferences' },
    { key: 'privacy', label: 'Privacy', description: 'Photos & recording' },
  ];

  const CYCLE: ItemState[] = ['hidden', 'enabled', 'disabled'];

  function nextState(s: ItemState): ItemState {
    return CYCLE[(CYCLE.indexOf(s) + 1) % CYCLE.length];
  }

  let sections: Record<string, ItemState> = {};
  let extras: Record<string, ItemState> = {};
  let note: string = config?.note ?? '';

  if (config) {
    sections = { ...config.sections };
    extras = { ...config.extras };
  }

  function toggleSection(key: string) {
    const cur: ItemState = sections[key] ?? 'hidden';
    sections = { ...sections, [key]: nextState(cur) };
  }

  function toggleExtra(key: string) {
    const cur: ItemState = extras[key] ?? 'hidden';
    extras = { ...extras, [key]: nextState(cur) };
  }

  let copied = false;

  async function copyLink() {
    const payload: MasterConfig = {
      v: 1,
      d: daysSinceEpoch(),
      mode: 'form',
      sections,
      extras,
      note: note || undefined,
    };
    const hash = encodePayload(payload);
    const url = window.location.origin + window.location.pathname + '#' + hash;
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<main>
  <header>
    <div class="header-top">
      <span class="wordmark">rope session</span>
      <a
        class="github-link"
        href="https://github.com/linnienaryshkin/rope_session"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      </a>
    </div>
    <span class="subtitle">configure your session</span>
  </header>

  <section class="note-section">
    <textarea
      rows="3"
      placeholder="Optional note to your client…"
      bind:value={note}
    ></textarea>
  </section>

  <section class="sections-list">
    {#each SECTIONS as sec}
      {@const ss = sections[sec.key] ?? 'hidden'}
      <button
        class="section-row"
        class:is-enabled={ss === 'enabled'}
        class:is-disabled={ss === 'disabled'}
        on:click={() => toggleSection(sec.key)}
      >
        <StateIcon state={ss} />
        <div class="section-info">
          <span class="section-label">{sec.label}</span>
          <span class="section-desc">{sec.description}</span>
        </div>
      </button>

      {#if sec.items && (ss === 'enabled' || ss === 'disabled')}
        <div class="items-list">
          {#each sec.items as item}
            {@const es = extras[item.key] ?? 'hidden'}
            <button
              class="item-row"
              class:is-enabled={es === 'enabled'}
              class:is-disabled={es === 'disabled'}
              on:click|stopPropagation={() => toggleExtra(item.key)}
            >
              <StateIcon state={es} small={true} />
              <span class="item-label">{item.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    {/each}
  </section>

  <footer>
    <button class="copy-btn" on:click={copyLink}>
      {copied ? 'Copied!' : 'Copy link →'}
    </button>
  </footer>
</main>

<style>
  main {
    max-width: 560px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 2rem;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .github-link {
    color: var(--muted);
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .github-link:hover {
    color: var(--accent);
  }

  .wordmark {
    font-variant: small-caps;
    font-size: 1.5rem;
    letter-spacing: 0.12em;
    color: var(--accent);
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--muted);
    letter-spacing: 0.04em;
  }

  .note-section {
    margin-bottom: 2rem;
  }

  .note-section textarea {
    width: 100%;
    padding: 0.75rem;
    resize: vertical;
    line-height: 1.5;
  }

  .sections-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .section-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .section-row:last-child {
    border-bottom: none;
  }

  .section-row.is-enabled {
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }

  .section-row.is-disabled {
    background: color-mix(in srgb, var(--disabled) 30%, transparent);
  }

  .section-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .section-label {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .section-desc {
    font-size: 0.78rem;
    color: var(--muted);
  }

  .items-list {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem 0.5rem 2.5rem;
    border-bottom: 1px solid var(--border);
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .item-row:last-child {
    border-bottom: none;
  }

  .item-row.is-enabled {
    background: color-mix(in srgb, var(--accent) 4%, transparent);
  }

  .item-row.is-disabled {
    background: color-mix(in srgb, var(--disabled) 20%, transparent);
  }

  .item-label {
    font-size: 0.88rem;
  }

  footer {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .copy-btn {
    padding: 0.65rem 1.5rem;
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: var(--radius);
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    transition: background 0.15s, color 0.15s;
  }

  .copy-btn:hover {
    background: var(--accent);
    color: var(--bg);
  }
</style>
