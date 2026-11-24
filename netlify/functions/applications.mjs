import { randomUUID } from 'node:crypto'
import { listRecords, putRecord } from './lib/data.mjs'
import { cleanText, json, methodNotAllowed, readJson } from './lib/http.mjs'
import { resolveSession } from './lib/session.mjs'

export default async request => {
  const session = await resolveSession(request)
  if (session?.role === 'banned') return json({ error: `Hesabın kısıtlandı. Gerekçe: ${session.ban.reason}` }, 403)
  if (request.method === 'GET') {
    if (!session) return json({ error: 'Hesabına giriş yap.' }, 401)
    const applications = await listRecords('applications')
    return json({ applications: session.role === 'admin' ? applications : applications.filter(application => application.username.toLowerCase() === session.username.toLowerCase()) })
  }
  if (request.method === 'PATCH') {
    if (session?.role !== 'admin') return json({ error: 'Yönetim oturumu gerekiyor.' }, 401)
    const parsed = await readJson(request)
    if (parsed.error) return json({ error: parsed.error }, parsed.status)
    const records = await listRecords('applications')
    const application = records.find(item => item.id === parsed.value.id)
    if (!application) return json({ error: 'Başvuru bulunamadı.' }, 404)
    const reply = cleanText(parsed.value.reply, 3000)
    if (reply.length < 2) return json({ error: 'Yanıt en az 2 karakter olmalı.' }, 400)
    const updated = { ...application, adminReply: reply, repliedAt: new Date().toISOString(), status: parsed.value.status && ['Bekliyor', 'İnceleniyor', 'Kabul Edildi', 'Reddedildi'].includes(parsed.value.status) ? parsed.value.status : application.status }
    await putRecord('applications', application.id, updated)
    return json({ application: updated })
  }
  if (request.method !== 'POST') return methodNotAllowed('GET, POST, PATCH')
  if (session?.role !== 'user') return json({ error: 'Başvuru göndermek için hesabına giriş yap.' }, 401)
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const position = cleanText(parsed.value.position, 40)
  const discord = cleanText(parsed.value.discord, 48)
  const experience = cleanText(parsed.value.experience, 1600)
  const availability = cleanText(parsed.value.availability, 100)
  const motivation = cleanText(parsed.value.motivation, 2400)
  if (!['Oyun içi yetkili', 'Topluluk moderatörü', 'Yapı ekibi'].includes(position)) return json({ error: 'Geçerli bir başvuru alanı seç.' }, 400)
  if (!discord || !experience || !availability || !motivation) return json({ error: 'Tüm alanları doldur.' }, 400)
  const application = { id: randomUUID(), username: session.username, position, discord, experience, availability, motivation, status: 'Bekliyor', createdAt: new Date().toISOString() }
  await putRecord('applications', application.id, application, { onlyIfNew: true })
  return json({ application }, 201)
}

export const config = { path: '/api/applications' }
