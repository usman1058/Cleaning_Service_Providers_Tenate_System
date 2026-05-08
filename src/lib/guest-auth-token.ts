import crypto from 'crypto'

type GuestTokenPayload = {
  userId: string
  email: string
  bookingId: string
  exp: number
}

const TOKEN_VERSION = 'v1'

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(input: string) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4)
  return Buffer.from(padded, 'base64').toString('utf8')
}

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured')
  return secret
}

export function createGuestAuthToken(payload: Omit<GuestTokenPayload, 'exp'>, ttlSeconds = 60 * 60 * 24) {
  const data: GuestTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const body = `${TOKEN_VERSION}.${base64UrlEncode(JSON.stringify(data))}`
  const signature = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

export function verifyGuestAuthToken(token: string): GuestTokenPayload | null {
  try {
    const [version, encodedPayload, signature] = token.split('.')
    if (!version || !encodedPayload || !signature || version !== TOKEN_VERSION) return null

    const body = `${version}.${encodedPayload}`
    const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
    if (expected !== signature) return null

    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as GuestTokenPayload
    if (!parsed?.userId || !parsed?.email || !parsed?.bookingId || !parsed?.exp) return null
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null

    return parsed
  } catch {
    return null
  }
}
