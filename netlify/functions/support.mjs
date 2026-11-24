import { randomUUID } from 'node:crypto'
import { listRecords, putRecord } from './lib/data.mjs'
import { cleanText, json, methodNotAllowed, readJson } from './lib/http.mjs'
import { resolveSession } from './lib/session.mjs'

export default async request => {
  const session = await resolveSession(request)
  if (session?.role === 'banned') return json({ error: `Hesabın kısıtlandı. Gerekçe: ${session.ban.reason}` }, 403)
  if (request.method === 'GET') {
    if (!session) return json({ error: 'Hesabına giriş yap.' }, 401)
    const tickets = await listRecords('support')
    return json({ tickets: session.role === 'admin' ? tickets : tickets.filter(ticket => ticket.username.toLowerCase() === session.username.toLowerCase()) })
  }
  if (request.method === 'PATCH') {
    if (session?.role !== 'admin') return json({ error: 'Yönetim oturumu gerekiyor.' }, 401)
    const parsed = await readJson(request)
    if (parsed.error) return json({ error: parsed.error }, parsed.status)
    const ticket = await listRecords('support').then(items => items.find(item => item.id === parsed.value.id))
    if (!ticket) return json({ error: 'Destek talebi bulunamadı.' }, 404)
    const reply = cleanText(parsed.value.reply, 3000)
    if (reply.length < 2) return json({ error: 'Yanıt en az 2 karakter olmalı.' }, 400)
    const updated = { ...ticket, replies: [...(ticket.replies || []), { text: reply, createdAt: new Date().toISOString() }], status: 'Yanıtlandı', updatedAt: new Date().toISOString() }
    await putRecord('support', ticket.id, updated)
    return json({ ticket: updated })
  }
  if (request.method !== 'POST') return methodNotAllowed('GET, POST, PATCH')
  if (session?.role !== 'user') return json({ error: 'Destek talebi göndermek için hesabına giriş yap.' }, 401)
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const category = cleanText(parsed.value.category, 32)
  const subject = cleanText(parsed.value.subject, 100)
  const message = cleanText(parsed.value.message, 3000)
  if (!['Hesap', 'Oyun içi', 'Mağaza', 'Diğer'].includes(category)) return json({ error: 'Geçerli bir destek konusu seç.' }, 400)
  if (subject.length < 4 || message.length < 12) return json({ error: 'Konu ve açıklama alanlarını kontrol et.' }, 400)
  const ticket = { id: randomUUID(), username: session.username, category, subject, message, status: 'Açık', createdAt: new Date().toISOString() }
  await putRecord('support', ticket.id, ticket, { onlyIfNew: true })
  return json({ ticket }, 201)
}

export const config = { path: '/api/support' }
