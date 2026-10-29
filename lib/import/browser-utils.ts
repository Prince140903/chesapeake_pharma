/**
 * Browser-safe utilities for handling file buffers
 * Provides abstraction over Buffer to work in browser environment
 */

/**
 * Convert File or Blob to Uint8Array
 */
export async function fileToBuffer(file: File | Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert Uint8Array to string (for CSV)
 */
export function uint8ArrayToString(buffer: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(buffer);
}

/**
 * Create a simple Buffer-like object that works in browser
 */
export class BrowserBuffer {
  private data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  static from(arrayBuffer: ArrayBuffer): BrowserBuffer {
    return new BrowserBuffer(new Uint8Array(arrayBuffer));
  }

  toString(encoding?: string): string {
    return uint8ArrayToString(this.data);
  }

  get length(): number {
    return this.data.length;
  }

  toUint8Array(): Uint8Array {
    return this.data;
  }
}
