declare module 'node-fetch' {
    export default function fetch(url: string | Request, init?: RequestInit): Promise<Response>;
}

declare module 'uuid' {
    export function v4(): string;
}