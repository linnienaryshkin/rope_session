export type ItemState = 'enabled' | 'disabled' | 'hidden';

// master = master is configuring; form = master sent to client to fill; client = client's completed response
export interface MasterConfig {
	v: number;
	d: number;
	mode: 'master' | 'form';
	sections: Record<string, ItemState>;
	extras: Record<string, ItemState>;
	note?: string;
}

export interface ClientAnswers {
	v: number;
	d: number;
	mode: 'client';
	master: MasterConfig;
	answers: Record<string, unknown>;
}

export type Payload = MasterConfig | ClientAnswers;

export function daysSinceEpoch(): number {
	return Math.floor(Date.now() / 86400000);
}
