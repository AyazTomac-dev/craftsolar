import { randomUUID } from 'node:crypto'
import { listRecords, putRecord } from './lib/data.mjs'
import { cleanText, json, methodNotAllowed, readJson } from './lib/http.mjs'
import { readSession } from './lib/session.mjs'

export default async request => {
  const session = readSession(request)
  if (request.method === 'GET') {
    if (!session) return json({ error: 'Hesabına giriş yap.' }, 401)
    const tickets = await listRecords('support')
    return json({ tickets: session.role === 'admin' ? tickets : tickets.filter(ticket => ticket.username.toLowerCase() === session.username.toLowerCase()) })
  }
  if (request.method !== 'POST') return methodNotAllowed('GET, POST')
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
