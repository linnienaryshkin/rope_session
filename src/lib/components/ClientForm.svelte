<script lang="ts">
  import { encodePayload, decodePayload } from '$lib/url';
  import { daysSinceEpoch } from '$lib/schema';
  import type { MasterConfig, ClientAnswers } from '$lib/schema';

  export let master: MasterConfig | undefined = undefined;

  // helpers
  function secState(key: string): 'enabled' | 'disabled' | 'hidden' {
    return (master?.sections[key] ?? 'hidden') as 'enabled' | 'disabled' | 'hidden';
  }
  function extraState(key: string): 'enabled' | 'disabled' | 'hidden' {
    return (master?.extras[key] ?? 'hidden') as 'enabled' | 'disabled' | 'hidden';
  }
  function showSection(key: string): boolean {
    const s = secState(key);
    return s === 'enabled' || s === 'disabled';
  }

  // ── Current State ──
  let mood = 0;
  let sleep = 0;
  let ate: string = '';
  let exertion: string = '';
  let substances: string = '';

  // ── Health Flags ──
  let healthPhysical = '';
  let healthPsych = '';
  let allergies = '';

  // ── Communication ──
  let safeword = '';
  let nonverbal = '';
  let checkinStyle = '';

  // ── Experience ──
  let shibarExp = 0;
  let suspensionExp: string = '';
  let physBackground: string[] = [];
  let pastInjuries: string = '';
  let pastInjuriesNotes = '';

  // ── Physical Readiness ──
  let shoulder = 0;
  let hip = 0;
  let lowerBack = 0;
  let circulation: string = '';
  let endurance: string = '';

  // ── Vibe ──
  let vibes: string[] = [];

  // ── Rope Styles ──
  let ropeStyles: string[] = [];

  // ── Body Preferences ──
  let bodyAreas: Record<string, string> = {};
  let boxTie = '';
  let futomomo = '';
  let marks = '';

  // ── Extras ──
  let extrasAnswers: Record<string, string> = {};

  // ── Aftercare ──
  let aftercareItems: string[] = [];
  let debriefing: string = '';

  // ── Privacy ──
  let photos: string = '';
  let privacyNotes = '';

  // Dot scale component helper
  function dotClick(value: number, current: number): number {
    return current === value ? 0 : value;
  }

  function toggleMulti(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  const VIBE_OPTIONS = ['Art', 'Sensual', 'Meditative', 'Fun', 'Care', 'Powerful', 'Powerless', 'Pain', 'Humiliation'];
  const ROPE_STYLES = [
    { key: 'yuka', jp: '床', en: 'Yuka', desc: 'floor work' },
    { key: 'tsuri', jp: '吊り', en: 'Tsuri', desc: 'suspension' },
    { key: 'ichinawa', jp: '壱縄', en: 'Ichinawa', desc: 'single rope' },
    { key: 'aibunawa', jp: '愛撫繩', en: 'Aibunawa', desc: 'caress' },
    { key: 'semenawa', jp: '責め縄', en: 'Semenawa', desc: 'torment' },
    { key: 'shuchinawa', jp: '羞恥縄', en: 'Shūchinawa', desc: 'exposure' },
    { key: 'kazushi', jp: '和司縛り', en: 'Kazushi', desc: 'deconstructed' },
  ];
  const EXTRAS_DEFS: { key: string; label: string }[] = [
    { key: 'hair', label: 'Hair' },
    { key: 'gag', label: 'Gag / Blindfold' },
    { key: 'nails', label: 'Nails / Teeth' },
    { key: 'collar', label: 'Collar / Leash' },
    { key: 'impact', label: 'Impact' },
    { key: 'kiss', label: 'Kissing' },
    { key: 'breast', label: 'Breast' },
    { key: 'genital', label: 'Genital' },
  ];

  let copied = false;

  async function submit() {
    const answers: Record<string, unknown> = {
      current_state: { mood, sleep, ate, exertion, substances },
      health: { physical: healthPhysical, psych: healthPsych, allergies },
      communication: { safeword, nonverbal, checkin: checkinStyle },
    };
    if (showSection('experience')) {
      answers.experience = { level: shibarExp, suspension: suspensionExp, background: physBackground, injuries: pastInjuries, injuriesNotes: pastInjuriesNotes };
    }
    if (showSection('physical')) {
      answers.physical = { shoulder, hip, lowerBack, circulation, endurance };
    }
    if (showSection('vibe')) answers.vibe = vibes;
    if (showSection('rope_styles')) answers.rope_styles = ropeStyles;
    if (showSection('body')) {
      answers.body = { areas: bodyAreas, boxTie, futomomo, marks };
    }
    if (showSection('extras')) answers.extras = extrasAnswers;
    if (showSection('aftercare')) answers.aftercare = { items: aftercareItems, debriefing };
    if (showSection('privacy')) answers.privacy = { photos, notes: privacyNotes };

    const payload: ClientAnswers = {
      v: 1,
      d: daysSinceEpoch(),
      mode: 'client',
      master: master ?? { v: 1, d: 0, mode: 'form', sections: {}, extras: {} },
      answers,
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
    <span class="wordmark">rope session</span>
    {#if master?.note}
      <p class="master-note">{master.note}</p>
    {/if}
  </header>

  <!-- ── Current State ── -->
  <section class="form-section">
    <h2 class="sec-label">Current State</h2>

    <div class="field">
      <label class="field-label">Mood</label>
      <div class="dots">
        {#each [1,2,3,4,5] as n}
          <button class="dot" class:filled={mood >= n} on:click={() => { mood = dotClick(n, mood); }}></button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="field-label">Sleep quality</label>
      <div class="dots">
        {#each [1,2,3,4,5] as n}
          <button class="dot" class:filled={sleep >= n} on:click={() => { sleep = dotClick(n, sleep); }}></button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="field-label">Ate today</label>
      <div class="chips">
        {#each ['Yes', 'No'] as opt}
          <button class="chip" class:selected={ate === opt} on:click={() => { ate = ate === opt ? '' : opt; }}>{opt}</button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="field-label">Recent physical exertion</label>
      <div class="chips">
        {#each ['Yes', 'No'] as opt}
          <button class="chip" class:selected={exertion === opt} on:click={() => { exertion = exertion === opt ? '' : opt; }}>{opt}</button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="field-label">Substances</label>
      <div class="chips">
        {#each ['None', 'Light', 'Notable'] as opt}
          <button class="chip" class:selected={substances === opt} on:click={() => { substances = substances === opt ? '' : opt; }}>{opt}</button>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Health Flags ── -->
  <section class="form-section">
    <h2 class="sec-label">Health Flags</h2>

    <div class="field">
      <label class="field-label">Anything physical I should know about today?</label>
      <textarea rows="2" placeholder="Injury, tension, sensitivity…" bind:value={healthPhysical}></textarea>
    </div>

    <div class="field">
      <label class="field-label">Anything psychological that might come up? <span class="optional">(optional)</span></label>
      <textarea rows="2" placeholder="" bind:value={healthPsych}></textarea>
    </div>

    <div class="field">
      <label class="field-label">Allergies relevant to rope / touch</label>
      <input type="text" placeholder="e.g. latex" bind:value={allergies} />
    </div>
  </section>

  <!-- ── Communication ── -->
  <section class="form-section">
    <h2 class="sec-label">Communication</h2>

    <div class="field">
      <label class="field-label">Safeword</label>
      <input type="text" placeholder="Red / Yellow / Green" bind:value={safeword} />
    </div>

    <div class="field">
      <label class="field-label">Non-verbal signal</label>
      <input type="text" placeholder="e.g. tap three times" bind:value={nonverbal} />
    </div>

    <div class="field">
      <label class="field-label">Check-in style</label>
      <div class="chips">
        {#each ['Verbal', 'Silent'] as opt}
          <button class="chip" class:selected={checkinStyle === opt} on:click={() => { checkinStyle = checkinStyle === opt ? '' : opt; }}>{opt}</button>
        {/each}
      </div>
    </div>
  </section>

  <!-- ── Experience ── -->
  {#if showSection('experience')}
    {@const disabled = secState('experience') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Experience {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>

      <div class="field">
        <label class="field-label">Shibari experience</label>
        <div class="dots">
          {#each [0,1,2,3,4,5] as n}
            <button class="dot" class:filled={shibarExp >= n && n > 0} on:click={() => { shibarExp = dotClick(n, shibarExp); }}></button>
          {/each}
        </div>
        <span class="scale-hint">none → advanced</span>
      </div>

      <div class="field">
        <label class="field-label">Suspension experience</label>
        <div class="chips">
          {#each ['Yes', 'No'] as opt}
            <button class="chip" class:selected={suspensionExp === opt} on:click={() => { suspensionExp = suspensionExp === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Physical background</label>
        <div class="chips">
          {#each ['Yoga', 'Dance', 'Acrobatics', 'Climbing', 'Massage'] as opt}
            <button class="chip" class:selected={physBackground.includes(opt)} on:click={() => { physBackground = toggleMulti(physBackground, opt); }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Past rope injuries</label>
        <div class="chips">
          {#each ['Yes', 'No'] as opt}
            <button class="chip" class:selected={pastInjuries === opt} on:click={() => { pastInjuries = pastInjuries === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
        {#if pastInjuries === 'Yes'}
          <textarea rows="2" placeholder="Briefly describe…" bind:value={pastInjuriesNotes} style="margin-top: 0.5rem;"></textarea>
        {/if}
      </div>
    </section>
  {/if}

  <!-- ── Physical Readiness ── -->
  {#if showSection('physical')}
    {@const disabled = secState('physical') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Physical Readiness {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>

      {#each [['Shoulder mobility', 'shoulder'], ['Hip flexibility', 'hip'], ['Lower back', 'lowerBack']] as [lbl, _key]}
        <div class="field">
          <label class="field-label">{lbl}</label>
          <div class="dots">
            {#each [1,2,3,4,5] as n}
              {#if _key === 'shoulder'}
                <button class="dot" class:filled={shoulder >= n} on:click={() => { shoulder = dotClick(n, shoulder); }}></button>
              {:else if _key === 'hip'}
                <button class="dot" class:filled={hip >= n} on:click={() => { hip = dotClick(n, hip); }}></button>
              {:else}
                <button class="dot" class:filled={lowerBack >= n} on:click={() => { lowerBack = dotClick(n, lowerBack); }}></button>
              {/if}
            {/each}
          </div>
        </div>
      {/each}

      <div class="field">
        <label class="field-label">Circulation issues</label>
        <div class="chips">
          {#each ['Yes', 'No'] as opt}
            <button class="chip" class:selected={circulation === opt} on:click={() => { circulation = circulation === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Position endurance</label>
        <div class="chips">
          {#each [['Short', 'Short (<30min)'], ['Medium', 'Medium'], ['Long', 'Long (1h+)']] as [val, lbl]}
            <button class="chip" class:selected={endurance === val} on:click={() => { endurance = endurance === val ? '' : val; }}>{lbl}</button>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- ── Vibe ── -->
  {#if showSection('vibe')}
    {@const disabled = secState('vibe') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Vibe {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>
      <div class="chips">
        {#each VIBE_OPTIONS as opt}
          <button class="chip" class:selected={vibes.includes(opt)} on:click={() => { vibes = toggleMulti(vibes, opt); }}>{opt}</button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- ── Rope Styles ── -->
  {#if showSection('rope_styles')}
    {@const disabled = secState('rope_styles') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Rope Styles {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>
      <div class="chips">
        {#each ROPE_STYLES as s}
          <button class="chip chip-jp" class:selected={ropeStyles.includes(s.key)} on:click={() => { ropeStyles = toggleMulti(ropeStyles, s.key); }}>
            <span class="jp">{s.jp}</span>
            <span class="en">{s.en} — {s.desc}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- ── Body Preferences ── -->
  {#if showSection('body')}
    {@const disabled = secState('body') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Body Preferences {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>

      {#each [['Chest', 'chest'], ['Belly', 'belly'], ['Arms', 'arms'], ['Legs', 'legs'], ['Hips', 'hips']] as [lbl, areaKey]}
        {@const areaVal = bodyAreas[areaKey] ?? ''}
        <div class="field field-row">
          <label class="field-label-inline">{lbl}</label>
          <div class="chips">
            {#each [['yes','Yes'], ['no','No'], ['ask','Ask me']] as [val, chip_lbl]}
              <button class="chip chip-sm" class:selected={areaVal === val}
                on:click={() => { bodyAreas = { ...bodyAreas, [areaKey]: bodyAreas[areaKey] === val ? '' : val }; }}
              >{chip_lbl}</button>
            {/each}
          </div>
        </div>
      {/each}

      <div class="field field-row">
        <label class="field-label-inline">Box-tie</label>
        <div class="chips">
          {#each ['Yes', 'No', 'Soft'] as opt}
            <button class="chip chip-sm" class:selected={boxTie === opt} on:click={() => { boxTie = boxTie === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field field-row">
        <label class="field-label-inline">Futomomo</label>
        <div class="chips">
          {#each ['Yes', 'No', 'Soft'] as opt}
            <button class="chip chip-sm" class:selected={futomomo === opt} on:click={() => { futomomo = futomomo === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field field-row">
        <label class="field-label-inline">Marks</label>
        <div class="chips">
          {#each ['Welcome', 'Minor ok', 'Prefer none'] as opt}
            <button class="chip chip-sm" class:selected={marks === opt} on:click={() => { marks = marks === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- ── Extras ── -->
  {#if showSection('extras')}
    {@const disabled = secState('extras') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Extras {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>
      {#each EXTRAS_DEFS as extra}
        {@const es = extraState(extra.key)}
        {#if es === 'enabled' || es === 'disabled'}
          <div class="field field-row" class:item-disabled={es === 'disabled'}>
            <label class="field-label-inline">{extra.label}</label>
            <div class="chips">
              {#each ['Yes', 'No', 'Maybe'] as opt}
                <button class="chip chip-sm" class:selected={extrasAnswers[extra.key] === opt}
                  on:click={() => { extrasAnswers = { ...extrasAnswers, [extra.key]: extrasAnswers[extra.key] === opt ? '' : opt }; }}
                >{opt}</button>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </section>
  {/if}

  <!-- ── Aftercare ── -->
  {#if showSection('aftercare')}
    {@const disabled = secState('aftercare') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Aftercare {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>

      <div class="field">
        <label class="field-label">What helps you land?</label>
        <div class="chips">
          {#each ['Hug', 'Talk', 'Quiet', 'Check-in next day'] as opt}
            <button class="chip" class:selected={aftercareItems.includes(opt)} on:click={() => { aftercareItems = toggleMulti(aftercareItems, opt); }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Debriefing preference</label>
        <div class="chips">
          {#each ['Call', 'Text', 'Async'] as opt}
            <button class="chip" class:selected={debriefing === opt} on:click={() => { debriefing = debriefing === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- ── Privacy ── -->
  {#if showSection('privacy')}
    {@const disabled = secState('privacy') === 'disabled'}
    <section class="form-section" class:section-disabled={disabled}>
      <h2 class="sec-label">Privacy {#if disabled}<span class="unavailable">not available today</span>{/if}</h2>

      <div class="field">
        <label class="field-label">Photos / recording</label>
        <div class="chips">
          {#each ['No', 'Private only', 'Shareable'] as opt}
            <button class="chip" class:selected={photos === opt} on:click={() => { photos = photos === opt ? '' : opt; }}>{opt}</button>
          {/each}
        </div>
      </div>

      <div class="field">
        <label class="field-label">Anything else about privacy? <span class="optional">(optional)</span></label>
        <textarea rows="2" placeholder="" bind:value={privacyNotes}></textarea>
      </div>
    </section>
  {/if}

  <footer>
    <button class="submit-btn" on:click={submit}>
      {copied ? 'Copied!' : 'Done →'}
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
    margin-bottom: 2rem;
  }

  .wordmark {
    font-variant: small-caps;
    font-size: 1.5rem;
    letter-spacing: 0.12em;
    color: var(--accent);
    display: block;
    margin-bottom: 0.25rem;
  }

  .master-note {
    font-size: 0.85rem;
    color: var(--muted);
    border-left: 2px solid var(--accent);
    padding-left: 0.75rem;
    margin-top: 0.75rem;
    font-style: italic;
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .sec-label {
    font-variant: small-caps;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.4rem;
    margin-bottom: 1rem;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .unavailable {
    font-style: italic;
    font-variant: normal;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .section-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field-label {
    display: block;
    font-size: 0.8rem;
    color: var(--muted);
    margin-bottom: 0.4rem;
  }

  .optional {
    color: var(--disabled);
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .field-label-inline {
    font-size: 0.8rem;
    color: var(--muted);
    width: 90px;
    flex-shrink: 0;
  }

  .item-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .dots {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.12s;
    flex-shrink: 0;
  }

  .dot.filled {
    background: var(--accent);
  }

  .scale-hint {
    display: block;
    font-size: 0.72rem;
    color: var(--muted);
    margin-top: 0.25rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .chip {
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.8rem;
    transition: border-color 0.12s, color 0.12s, background 0.12s;
  }

  .chip.selected {
    border-color: var(--accent);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  .chip-sm {
    padding: 0.2rem 0.55rem;
    font-size: 0.76rem;
  }

  .chip-jp {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border-radius: var(--radius);
    padding: 0.4rem 0.75rem;
    gap: 0.1rem;
  }

  .chip-jp .jp {
    font-size: 0.95rem;
    color: var(--text);
  }

  .chip-jp .en {
    font-size: 0.7rem;
    color: var(--muted);
  }

  .chip-jp.selected .jp {
    color: var(--accent);
  }

  textarea, input[type="text"] {
    width: 100%;
    padding: 0.6rem 0.75rem;
  }

  footer {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .submit-btn {
    padding: 0.65rem 1.5rem;
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: var(--radius);
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    transition: background 0.15s, color 0.15s;
  }

  .submit-btn:hover {
    background: var(--accent);
    color: var(--bg);
  }
</style>
