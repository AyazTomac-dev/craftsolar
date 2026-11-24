import { randomUUID } from 'node:crypto'
import { getRecord, listRecords, putRecord } from './lib/data.mjs'
import { json, methodNotAllowed, readJson } from './lib/http.mjs'
import { clearSessionCookie, createSession, hashPassword, readUserSession, sessionConfigError, sessionCookie, verifyPassword } from './lib/session.mjs'

const namePattern = /^[A-Za-z0-9_]{3,16}$/

export default async request => {
  if (request.method === 'GET') {
    const session = readUserSession(request)
    const settings = await getRecord('settings', 'site')
    if (session?.role === 'user') {
      const account = await getRecord('accounts', session.username.toLowerCase())
      if (!account || account.deletedAt) return json({ user: null, announcement: settings?.announcement || null })
      if (account.ban && (!account.ban.until || new Date(account.ban.until).getTime() > Date.now())) return json({ user: null, ban: account.ban, announcement: settings?.announcement || null, welcomeNotice: settings?.welcomeNotice || '' })
      const personalNotice = account.notice && (!account.notice.until || new Date(account.notice.until).getTime() > Date.now()) ? account.notice : null
      return json({ user: { username: session.username, role: session.role }, announcement: settings?.announcement || null, notice: personalNotice, welcomeNotice: settings?.welcomeNotice || '' })
    }
    return json({ user: session ? { username: session.username, role: session.role } : null, announcement: settings?.announcement || null, welcomeNotice: settings?.welcomeNotice || '' })
  }

  if (request.method !== 'POST') return methodNotAllowed('GET, POST')
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const { action } = parsed.value

  if (action === 'logout') return json({ user: null }, 200, { 'Set-Cookie': clearSessionCookie(request) })

  const configError = sessionConfigError()
  if (configError) return json({ error: 'Hesap servisi henüz yapılandırılmamış.' }, 503)

  const username = typeof parsed.value.username === 'string' ? parsed.value.username.trim() : ''
  const password = typeof parsed.value.password === 'string' ? parsed.value.password : ''
  if (!namePattern.test(username)) return json({ error: 'Minecraft nicki 3 ile 16 karakter arasında olmalı.' }, 400)
  if (password.length < 8 || password.length > 256) return json({ error: 'Şifre 8 ile 256 karakter arasında olmalı.' }, 400)

  const accountKey = username.toLowerCase()
  const key = `accounts/${accountKey}`
  let account = await getRecord('accounts', accountKey)

  if (action === 'register') {
    if (account) return json({ error: 'Bu Minecraft nickiyle bir hesap zaten var.' }, 409)
    const credentials = await hashPassword(password)
    account = { id: randomUUID(), username, ...credentials, createdAt: new Date().toISOString() }
    const result = await putRecord('accounts', accountKey, account, { onlyIfNew: true })
    if (!result.modified) return json({ error: 'Bu Minecraft nickiyle bir hesap zaten var.' }, 409)
  } else if (action === 'login') {
    if (account?.ban && (!account.ban.until || new Date(account.ban.until).getTime() > Date.now())) return json({ error: `Hesabın yönetim tarafından engellendi. Gerekçe: ${account.ban.reason}${account.ban.until ? ` · Bitiş: ${new Date(account.ban.until).toLocaleString('tr-TR')}` : ''}` }, 403)
    if (!account || !(await verifyPassword(password, account))) return json({ error: 'Minecraft nicki veya şifre hatalı.' }, 401)
  } else {
    return json({ error: 'Desteklenmeyen hesap işlemi.' }, 400)
  }

  const user = { username: account.username, role: 'user' }
  return json({ user }, action === 'register' ? 201 : 200, { 'Set-Cookie': sessionCookie(createSession(user), request) })
}

export const config = { path: '/api/auth' }
