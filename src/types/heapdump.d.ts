declare module 'heapdump' {
  export function writeSnapshot(
    filename: string,
    callback: (err: Error | null, filename: string) => void
  ): void;
} 