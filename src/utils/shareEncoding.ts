const BASE64_URL_SAFE_CHARS = { '/': '_', '+': '-', '=': '' } as const

const toBase64Url = (input: string): string => {
  return input.replace(/[+/=]/g, (char) => BASE64_URL_SAFE_CHARS[char as keyof typeof BASE64_URL_SAFE_CHARS])
}

const fromBase64Url = (input: string): string => {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padding = base64.length % 4
  if (padding) {
    base64 += "=".repeat(4 - padding)
  }
  return base64
}

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    let chunkString = ""
    for (let j = 0; j < chunk.length; j++) {
      chunkString += String.fromCharCode(chunk[j])
    }
    binary += chunkString
  }
  return btoa(binary)
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const length = binary.length
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export const encodeCalendarPayload = (payload: unknown): string => {
  const json = JSON.stringify(payload)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(json)
  const base64 = uint8ArrayToBase64(bytes)
  return toBase64Url(base64)
}

export const decodeCalendarPayload = (encoded: string): unknown => {
  const base64 = fromBase64Url(encoded)
  const bytes = base64ToUint8Array(base64)
  const decoder = new TextDecoder()
  const json = decoder.decode(bytes)
  return JSON.parse(json)
}
