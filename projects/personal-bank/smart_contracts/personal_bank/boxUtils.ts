export function getBoxId(prefix: string, name: Uint8Array): Uint8Array {
  const prefixBytes = new TextEncoder().encode(prefix)
  return new Uint8Array([...prefixBytes, ...name])
}

export function Uint8ArrayToString(uint8Array: Uint8Array): string {
  return new TextDecoder().decode(uint8Array)
}

export function Uint8ArrayToBigInt(a: Uint8Array): bigint {
  return Buffer.from(a).readBigUInt64BE(0)
}
