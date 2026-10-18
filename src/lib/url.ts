import pako from 'pako';
import type { Payload } from './schema';

function toBase64url(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(str: string): Uint8Array {
	const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export function encodePayload(p: Payload): string {
	const json = JSON.stringify(p);
	const compressed = pako.deflate(json);
	return toBase64url(compressed);
}

export function decodePayload(hash: string): Payload | null {
	const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
	if (!fragment) return null;
	try {
		const bytes = fromBase64url(fragment);
		const json = pako.inflate(bytes, { to: 'string' });
		return JSON.parse(json) as Payload;
	} catch {
		return null;
	}
}
