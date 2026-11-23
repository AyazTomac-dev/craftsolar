import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const COOKIE_NAME = 'craftsolar_session'
const SESSION_SECONDS = 60 * 60 * 8

function sessionSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET en az 32 karakter olarak ayarlanmalıdır.')
  return secret
}

function signature(payload) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
}

export function createSession(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, expiresAt: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url')
  return `${body}.${signature(body)}`
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === 'https:'
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`
}

export function clearSessionCookie(request) {
  const secure = new URL(request.url).protocol === 'https:'
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`
}

export function readSession(request) {
  const cookie = request.headers.get('cookie') || ''
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1)
  if (!token) return null
  const [body, received, extra] = token.split('.')
  if (!body || !received || extra) return null
  try {
    const expected = Buffer.from(signature(body))
    const actual = Buffer.from(received)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
    const session = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (session.expiresAt < Date.now() || !['user', 'admin'].includes(session.role)) return null
    return session
  } catch {
    return null
  }
}

export function sessionConfigError() {
  try { sessionSecret(); return null } catch (error) { return error.message }
}

export function verifyAdminPassword(password) {
  const configured = process.env.ADMIN_PASSWORD
  if (!configured || configured.length < 20) throw new Error('ADMIN_PASSWORD en az 20 karakter olarak ayarlanmalıdır.')
  const received = Buffer.from(password)
  const expected = Buffer.from(configured)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64)
  return { salt: salt.toString('base64url'), passwordHash: Buffer.from(derived).toString('base64url') }
}

export async function verifyPassword(password, record) {
  const salt = Buffer.from(record.salt, 'base64url')
  const expected = Buffer.from(record.passwordHash, 'base64url')
  const derived = Buffer.from(await scrypt(password, salt, expected.length))
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}
