declare module '*.WAV' {
    const src: string;
    export default src;
}

declare module '*.wav' {
    const src: string;
    export default src;
}

declare module '*.mp3' {
    const src: string;
    export default src;
}

declare module '*.MP3' {
    const src: string;
    export default src;
}

declare module '*.ogg' {
    const src: string;
    export default src;
}

declare module 'howler' {
    export class Howl {
        constructor(options: Record<string, unknown>);
        play(): number;
        stop(): void;
        unload(): void;
    }
}
