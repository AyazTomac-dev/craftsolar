import { listRecords, getRecord, putRecord } from './lib/data.mjs'
import { json, methodNotAllowed, readJson } from './lib/http.mjs'
import { createSession, readSession, sessionConfigError, sessionCookie, verifyAdminPassword } from './lib/session.mjs'

const statuses = {
  applications: new Set(['Bekliyor', 'İnceleniyor', 'Kabul Edildi', 'Reddedildi']),
  support: new Set(['Açık', 'Yanıtlandı', 'Kapandı']),
  orders: new Set(['Bekliyor', 'Teslim Edildi'])
}

export default async request => {
  if (request.method === 'POST') {
    const parsed = await readJson(request)
    if (parsed.error) return json({ error: parsed.error }, parsed.status)
    const configError = sessionConfigError()
    if (configError) return json({ error: 'Yönetim oturumu henüz yapılandırılmamış.' }, 503)
    let valid = false
    try { valid = verifyAdminPassword(typeof parsed.value.password === 'string' ? parsed.value.password : '') } catch { return json({ error: 'Yönetim parolası henüz yapılandırılmamış.' }, 503) }
    if (!valid) return json({ error: 'Yönetim parolası hatalı.' }, 401)
    const user = { username: 'CraftSolar Yönetim', role: 'admin' }
    return json({ user }, 200, { 'Set-Cookie': sessionCookie(createSession(user), request) })
  }

  if (request.method === 'DELETE') return json({ ok: true }, 200, { 'Set-Cookie': `craftsolar_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}` })

  const session = readSession(request)
  if (session?.role !== 'admin') return json({ error: 'Yönetim oturumu gerekiyor.' }, 401)

  if (request.method === 'GET') {
    const [accounts, applications, support, orders] = await Promise.all([
      listRecords('accounts'),
      listRecords('applications'),
      listRecords('support'),
      listRecords('orders')
    ])
    return json({
      users: accounts.map(({ username, createdAt }) => ({ username, createdAt })),
      applications,
      support,
      orders
    })
  }

  if (request.method !== 'PATCH') return methodNotAllowed('GET, POST, PATCH, DELETE')
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const { collection, id, status } = parsed.value
  if (!Object.hasOwn(statuses, collection) || typeof id !== 'string' || !statuses[collection].has(status)) return json({ error: 'Geçersiz kayıt veya durum.' }, 400)
  const record = await getRecord(collection, id)
  if (!record) return json({ error: 'Kayıt bulunamadı.' }, 404)
  const updated = { ...record, status, updatedAt: new Date().toISOString() }
  await putRecord(collection, id, updated)
  return json({ record: updated })
}

export const config = { path: '/api/admin' }
