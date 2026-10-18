<script lang="ts">
	import { daysSinceEpoch } from '$lib/schema';
	import type { ClientAnswers, ItemState } from '$lib/schema';

	export let data: ClientAnswers;

	const raw = data.answers as Record<string, unknown>;
	const master = data.master;

	function obj(v: unknown): Record<string, unknown> { return (v && typeof v === 'object' && !Array.isArray(v)) ? v as Record<string, unknown> : {}; }
	function str(v: unknown): string { return typeof v === 'string' ? v : ''; }
	function num(v: unknown): number { return typeof v === 'number' ? v : 0; }
	function arr(v: unknown): string[] { return Array.isArray(v) ? v as string[] : []; }

	// Unwrap nested structure from ClientForm
	const cs = obj(raw.current_state);
	const health = obj(raw.health);
	const comm = obj(raw.communication);
	const exp = obj(raw.experience);
	const phys = obj(raw.physical);
	const body = obj(raw.body);
	const extrasAnswers = obj(raw.extras);
	const aftercareData = obj(raw.aftercare);
	const privacy = obj(raw.privacy);

	const daysAgo = daysSinceEpoch() - data.d;
	const ageLabel = daysAgo === 0 ? 'submitted today' : daysAgo === 1 ? 'submitted 1 day ago' : `submitted ${daysAgo} days ago`;

	const EXTRAS: { key: string; label: string }[] = [
		{ key: 'hair', label: 'Hair' },
		{ key: 'gag', label: 'Gag / Blindfold' },
		{ key: 'nails', label: 'Nails / Teeth' },
		{ key: 'collar', label: 'Collar / Leash' },
		{ key: 'impact', label: 'Impact' },
		{ key: 'kiss', label: 'Kissing' },
		{ key: 'breast', label: 'Breast' },
		{ key: 'genital', label: 'Genital' },
	];

	const ROPE_STYLES: { key: string; jp: string; en: string }[] = [
		{ key: '床', jp: '床', en: 'Yuka — floor work' },
		{ key: '吊り', jp: '吊り', en: 'Tsuri — suspension' },
		{ key: '壱縄', jp: '壱縄', en: 'Ichinawa — single rope' },
		{ key: '愛撫繩', jp: '愛撫繩', en: 'Aibunawa — caress' },
		{ key: '責め縄', jp: '責め縄', en: 'Semenawa — torment' },
		{ key: '羞恥縄', jp: '羞恥縄', en: 'Shūchinawa — exposure' },
		{ key: '和司縛り', jp: '和司縛り', en: 'Kazushi — deconstructed' },
	];

	const BODY_AREAS = ['chest', 'belly', 'arms', 'legs', 'hips'];

	function sectionVisible(key: string): boolean {
		const s: ItemState = (master.sections[key] as ItemState) ?? 'hidden';
		return s === 'enabled' || s === 'disabled';
	}

	function extraVisible(key: string): boolean {
		const s: ItemState = (master.extras[key] as ItemState) ?? 'hidden';
		return s === 'enabled' || s === 'disabled';
	}

	// Flags
	const flags: string[] = [];
	if (str(health.physical)) flags.push('Physical notes present');
	if (str(health.psych)) flags.push('Psychological notes present');
	if (phys.circulation === 'Yes') flags.push('Circulation issues reported');
	if (exp.injuries === 'Yes') flags.push('Past rope injuries reported');
	if (cs.substances === 'Notable') flags.push('Substances: notable');
	for (const ex of EXTRAS) {
		if (extraVisible(ex.key) && extrasAnswers[ex.key] === 'Maybe') {
			flags.push(`Maybe: ${ex.label}`);
		}
	}

	const ropeStylesSelected = arr(raw.rope_styles);
	const vibeSelected = arr(raw.vibe);
	const physBg = arr(exp.background);
	const aftercareSelected = arr(aftercareData.items);
	const bodyAreas = obj(body.areas);
</script>

<main>
	<header>
		<span class="wordmark">rope session</span>
		<span class="subtitle">session summary</span>
		<span class="age">{ageLabel}</span>
	</header>

	{#if master.note}
		<blockquote class="master-note">{master.note}</blockquote>
	{/if}

	{#if flags.length > 0}
		<div class="flags-panel">
			<span class="flags-title">Review before session</span>
			<ul>
				{#each flags as flag}
					<li>{flag}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Current State -->
	<section>
		<h2 class="section-header">Current State</h2>
		<div class="field">
			<span class="field-label">Mood</span>
			<div class="dots">
				{#each Array(5) as _, i}
					<span class="dot" class:filled={i < num(cs.mood)}></span>
				{/each}
			</div>
		</div>
		<div class="field">
			<span class="field-label">Sleep quality</span>
			<div class="dots">
				{#each Array(5) as _, i}
					<span class="dot" class:filled={i < num(cs.sleep)}></span>
				{/each}
			</div>
		</div>
		<div class="field">
			<span class="field-label">Ate today</span>
			<span class="pill">{cs.ate || '—'}</span>
		</div>
		<div class="field">
			<span class="field-label">Recent physical exertion</span>
			<span class="pill">{cs.exertion || '—'}</span>
		</div>
		<div class="field">
			<span class="field-label">Substances</span>
			<span class="pill" class:danger={cs.substances === 'Notable'}>{cs.substances || '—'}</span>
		</div>
	</section>

	<!-- Health Flags -->
	<section>
		<h2 class="section-header">Health Flags</h2>
		<div class="field">
			<span class="field-label">Physical notes</span>
			{#if str(health.physical)}
				<div class="highlight-box">{str(health.physical)}</div>
			{:else}
				<span class="muted">—</span>
			{/if}
		</div>
		<div class="field">
			<span class="field-label">Psychological notes</span>
			{#if str(health.psych)}
				<div class="highlight-box">{str(health.psych)}</div>
			{:else}
				<span class="muted">—</span>
			{/if}
		</div>
		<div class="field">
			<span class="field-label">Allergies</span>
			<span>{str(health.allergies) || '—'}</span>
		</div>
	</section>

	<!-- Communication -->
	<section>
		<h2 class="section-header">Communication</h2>
		<div class="field">
			<span class="field-label safeword-label">Safeword</span>
			<span class="safeword-value">{str(comm.safeword) || '—'}</span>
		</div>
		<div class="field">
			<span class="field-label">Non-verbal signal</span>
			<span>{str(comm.nonverbal) || '—'}</span>
		</div>
		<div class="field">
			<span class="field-label">Check-in style</span>
			<span class="pill">{comm.checkin || '—'}</span>
		</div>
	</section>

	<!-- Experience -->
	{#if sectionVisible('experience')}
		<section>
			<h2 class="section-header">Experience</h2>
			<div class="field">
				<span class="field-label">Shibari level</span>
				<div class="dots">
					{#each Array(6) as _, i}
						<span class="dot" class:filled={i < num(exp.level)}></span>
					{/each}
				</div>
				<span class="scale-hint">none → advanced</span>
			</div>
			<div class="field">
				<span class="field-label">Suspension experience</span>
				<span class="pill">{exp.suspension ?? '—'}</span>
			</div>
			{#if physBg.length > 0}
				<div class="field">
					<span class="field-label">Physical background</span>
					<div class="pills-row">
						{#each physBg as bg}
							<span class="pill selected">{bg}</span>
						{/each}
					</div>
				</div>
			{/if}
			<div class="field">
				<span class="field-label">Past rope injuries</span>
				<span class="pill">{exp.injuries ?? '—'}</span>
			</div>
			{#if exp.injuries === 'Yes' && str(exp.injuriesNotes)}
				<div class="highlight-box">{str(exp.injuriesNotes)}</div>
			{/if}
		</section>
	{/if}

	<!-- Physical Readiness -->
	{#if sectionVisible('physical')}
		<section>
			<h2 class="section-header">Physical Readiness</h2>
			<div class="field">
				<span class="field-label">Shoulder mobility</span>
				<div class="dots">
					{#each Array(5) as _, i}
						<span class="dot" class:filled={i < num(phys.shoulder)}></span>
					{/each}
				</div>
			</div>
			<div class="field">
				<span class="field-label">Hip flexibility</span>
				<div class="dots">
					{#each Array(5) as _, i}
						<span class="dot" class:filled={i < num(phys.hip)}></span>
					{/each}
				</div>
			</div>
			<div class="field">
				<span class="field-label">Lower back</span>
				<div class="dots">
					{#each Array(5) as _, i}
						<span class="dot" class:filled={i < num(phys.lowerBack)}></span>
					{/each}
				</div>
			</div>
			<div class="field">
				<span class="field-label">Circulation issues</span>
				<span class="pill" class:danger={phys.circulation === 'Yes'}>{phys.circulation ?? '—'}</span>
			</div>
			<div class="field">
				<span class="field-label">Position endurance</span>
				<span class="pill">{phys.endurance ?? '—'}</span>
			</div>
		</section>
	{/if}

	<!-- Vibe -->
	{#if sectionVisible('vibe') && vibeSelected.length > 0}
		<section>
			<h2 class="section-header">Vibe</h2>
			<div class="pills-row">
				{#each vibeSelected as v}
					<span class="pill selected">{v}</span>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Rope Styles -->
	{#if sectionVisible('rope_styles') && ropeStylesSelected.length > 0}
		<section>
			<h2 class="section-header">Rope Styles</h2>
			<div class="pills-row">
				{#each ROPE_STYLES as style}
					{#if ropeStylesSelected.includes(style.key)}
						<span class="pill selected">{style.jp} {style.en}</span>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	<!-- Body Preferences -->
	{#if sectionVisible('body')}
		<section>
			<h2 class="section-header">Body Preferences</h2>
			{#each BODY_AREAS as area}
				{@const val = bodyAreas[area]}
				{#if val}
					<div class="field">
						<span class="field-label">{area.charAt(0).toUpperCase() + area.slice(1)}</span>
						<span class="pill">{val}</span>
					</div>
				{/if}
			{/each}
			{#if body.boxTie}
				<div class="field">
					<span class="field-label">Box-tie</span>
					<span class="pill">{body.boxTie}</span>
				</div>
			{/if}
			{#if body.futomomo}
				<div class="field">
					<span class="field-label">Futomomo</span>
					<span class="pill">{body.futomomo}</span>
				</div>
			{/if}
			{#if body.marks}
				<div class="field">
					<span class="field-label">Marks / bruising</span>
					<span class="pill" class:muted-pill={body.marks === 'Prefer none'}>{body.marks}</span>
				</div>
			{/if}
		</section>
	{/if}

	<!-- Extras -->
	{#if EXTRAS.some(ex => extraVisible(ex.key))}
		<section>
			<h2 class="section-header">Extras</h2>
			{#each EXTRAS as ex}
				{#if extraVisible(ex.key)}
					{@const val = extrasAnswers[ex.key]}
					<div class="field">
						<span class="field-label">{ex.label}</span>
						<span class="pill" class:maybe={val === 'Maybe'}>{val ?? '—'}</span>
					</div>
				{/if}
			{/each}
		</section>
	{/if}

	<!-- Aftercare -->
	{#if sectionVisible('aftercare')}
		<section>
			<h2 class="section-header">Aftercare</h2>
			{#if aftercareSelected.length > 0}
				<div class="field">
					<span class="field-label">Preferences</span>
					<div class="pills-row">
						{#each aftercareSelected as ac}
							<span class="pill selected">{ac}</span>
						{/each}
					</div>
				</div>
			{/if}
			{#if aftercareData.debriefing}
				<div class="field">
					<span class="field-label">Debriefing</span>
					<span class="pill">{aftercareData.debriefing}</span>
				</div>
			{/if}
		</section>
	{/if}

	<!-- Privacy -->
	{#if sectionVisible('privacy')}
		<section>
			<h2 class="section-header">Privacy</h2>
			{#if privacy.photos}
				<div class="field">
					<span class="field-label">Photos</span>
					<span class="pill">{privacy.photos}</span>
				</div>
			{/if}
			{#if str(privacy.notes)}
				<div class="field">
					<span class="field-label">Notes</span>
					<span>{str(privacy.notes)}</span>
				</div>
			{/if}
		</section>
	{/if}

	<footer>
		<span class="muted">— end of summary —</span>
	</footer>
</main>

<style>
	main {
		max-width: 560px;
		margin: 0 auto;
		padding: 2rem 1.25rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
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

	.age {
		font-size: 0.75rem;
		color: var(--disabled);
		margin-top: 0.1rem;
	}

	.master-note {
		border-left: 2px solid var(--accent);
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, var(--accent) 5%, transparent);
		font-style: italic;
		font-size: 0.9rem;
		color: var(--muted);
		border-radius: 0 var(--radius) var(--radius) 0;
	}

	.flags-panel {
		border: 1px solid var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, transparent);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.flags-title {
		font-variant: small-caps;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--danger);
	}

	.flags-panel ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.flags-panel li {
		font-size: 0.88rem;
		color: var(--text);
	}

	.flags-panel li::before {
		content: '· ';
		color: var(--danger);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		font-variant: small-caps;
		font-size: 0.85rem;
		letter-spacing: 0.1em;
		color: var(--accent);
		font-weight: 400;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid var(--border);
	}

	.field {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.field-label {
		font-size: 0.8rem;
		color: var(--muted);
		min-width: 140px;
		flex-shrink: 0;
	}

	.dots {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--border);
		display: inline-block;
	}

	.dot.filled {
		background: var(--accent);
	}

	.scale-hint {
		font-size: 0.72rem;
		color: var(--disabled);
	}

	.pill {
		font-size: 0.82rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--muted);
	}

	.pill.selected {
		border-color: var(--accent);
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, transparent);
	}

	.pill.danger {
		border-color: var(--danger);
		color: var(--danger);
	}

	.pill.maybe {
		border-color: var(--accent);
		color: var(--accent);
	}

	.pill.muted-pill {
		color: var(--disabled);
		border-color: var(--disabled);
	}

	.pills-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.highlight-box {
		border-left: 2px solid var(--accent);
		padding: 0.5rem 0.75rem;
		background: color-mix(in srgb, var(--accent) 5%, transparent);
		font-size: 0.88rem;
		border-radius: 0 var(--radius) var(--radius) 0;
		width: 100%;
	}

	.safeword-label {
		font-variant: small-caps;
		letter-spacing: 0.06em;
	}

	.safeword-value {
		font-size: 1.2rem;
		color: var(--accent);
		letter-spacing: 0.05em;
	}

	.muted {
		color: var(--muted);
		font-size: 0.85rem;
	}

	footer {
		text-align: center;
		padding-top: 1rem;
	}
</style>
