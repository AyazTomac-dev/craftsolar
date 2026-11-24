import { listRecords, getRecord, putRecord, deleteRecord } from './lib/data.mjs'
import { cleanText, json, methodNotAllowed, readJson } from './lib/http.mjs'
import { clearSessionCookie, createSession, readAdminSession, sessionConfigError, sessionCookie, verifyAdminPassword } from './lib/session.mjs'

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
    return json({ user }, 200, { 'Set-Cookie': sessionCookie(createSession(user), request, 'admin') })
  }

  if (request.method === 'DELETE') return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(request, 'admin') })

  const session = readAdminSession(request)
  if (session?.role !== 'admin') return json({ error: 'Yönetim oturumu gerekiyor.' }, 401)

  if (request.method === 'GET') {
    const [accounts, applications, support, orders, settings] = await Promise.all([
      listRecords('accounts'),
      listRecords('applications'),
      listRecords('support'),
      listRecords('orders'),
      getRecord('settings', 'site')
    ])
    return json({
      users: accounts.filter(account => !account.deletedAt).map(({ username, createdAt, ban, notice }) => ({ username, createdAt, ban, notice })),
      applications,
      support,
      orders,
      announcement: settings?.announcement || null,
      welcomeNotice: settings?.welcomeNotice || ''
    })
  }

  if (request.method !== 'PATCH' && request.method !== 'DELETE') return methodNotAllowed('GET, POST, PATCH, DELETE')
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const { collection, id, status, action } = parsed.value
  if (action === 'announcement') {
    const text = cleanText(parsed.value.text, 180)
    const announcement = text ? { text, background: cleanText(parsed.value.background, 32) || '#f0ae42', color: cleanText(parsed.value.color, 32) || '#17202a', fontSize: Math.max(12, Math.min(24, Number(parsed.value.fontSize) || 14)), enabled: parsed.value.enabled !== false, updatedAt: new Date().toISOString() } : null
    const current = await getRecord('settings', 'site') || {}
    const welcomeNotice = cleanText(parsed.value.welcomeText, 1000)
    await putRecord('settings', 'site', { ...current, announcement, welcomeNotice })
    return json({ announcement, welcomeNotice })
  }
  if (action === 'reply') {
    if (!['support', 'applications'].includes(collection) || typeof id !== 'string') return json({ error: 'Geçersiz başvuru veya destek kaydı.' }, 400)
    const reply = cleanText(parsed.value.reply, 3000)
    if (reply.length < 2) return json({ error: 'Yanıt en az 2 karakter olmalı.' }, 400)
    const record = await getRecord(collection, id)
    if (!record) return json({ error: 'Kayıt bulunamadı.' }, 404)
    const updated = collection === 'support'
      ? { ...record, replies: [...(record.replies || []), { text: reply, createdAt: new Date().toISOString() }], status: 'Yanıtlandı', updatedAt: new Date().toISOString() }
      : { ...record, adminReply: reply, repliedAt: new Date().toISOString(), status: parsed.value.status && statuses.applications.has(parsed.value.status) ? parsed.value.status : record.status }
    await putRecord(collection, id, updated)
    return json({ record: updated })
  }
  if (action === 'user') {
    const username = cleanText(parsed.value.username, 16)
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) return json({ error: 'Geçersiz kullanıcı adı.' }, 400)
    const key = username.toLowerCase()
    const account = await getRecord('accounts', key)
    if (!account) return json({ error: 'Kullanıcı bulunamadı.' }, 404)
    if (parsed.value.operation === 'delete') {
      const reason = cleanText(parsed.value.reason, 300)
      if (reason.length < 3) return json({ error: 'Hesap silme gerekçesini yaz.' }, 400)
      await putRecord('accounts', key, { id: account.id, username: account.username, createdAt: account.createdAt, deletedAt: new Date().toISOString(), deletionReason: reason })
      for (const group of ['applications', 'support', 'orders']) {
        const matching = await listRecords(group)
        await Promise.all(matching.filter(record => record.username?.toLowerCase() === key).map(record => deleteRecord(group, record.id)))
      }
      return json({ ok: true })
    }
    const operation = parsed.value.operation
    if (operation === 'ban') {
      const reason = cleanText(parsed.value.reason, 300)
      if (reason.length < 3) return json({ error: 'Ban gerekçesini yaz.' }, 400)
      const duration = Number(parsed.value.duration)
      const until = duration > 0 ? new Date(Date.now() + Math.min(duration, 8760) * 3600000).toISOString() : null
      const updated = { ...account, ban: { reason, until, createdAt: new Date().toISOString() } }
      await putRecord('accounts', key, updated)
      return json({ user: { username, ban: updated.ban } })
    }
    if (operation === 'unban') {
      const updated = { ...account, ban: null }
      await putRecord('accounts', key, updated)
      return json({ user: { username, ban: null } })
    }
    if (operation === 'notice') {
      const text = cleanText(parsed.value.text, 1000)
      const notice = text ? { text, createdAt: new Date().toISOString() } : null
      await putRecord('accounts', key, { ...account, notice })
      return json({ user: { username, notice } })
    }
    return json({ error: 'Bilinmeyen kullanıcı işlemi.' }, 400)
  }
  if (!Object.hasOwn(statuses, collection) || typeof id !== 'string' || !statuses[collection].has(status)) return json({ error: 'Geçersiz kayıt veya durum.' }, 400)
  const record = await getRecord(collection, id)
  if (!record) return json({ error: 'Kayıt bulunamadı.' }, 404)
  const updated = { ...record, status, updatedAt: new Date().toISOString() }
  await putRecord(collection, id, updated)
  return json({ record: updated })
}

export const config = { path: '/api/admin' }
