import { randomUUID } from 'node:crypto'
import { listRecords, putRecord } from './lib/data.mjs'
import { json, methodNotAllowed, readJson } from './lib/http.mjs'
import { readSession } from './lib/session.mjs'

const productIds = new Set(['vip', 'solar', 'solar-plus', 'spider', 'weakness', 'lightning', 'prot5', 'prot6'])

export default async request => {
  const session = readSession(request)
  if (!session) return json({ error: 'Siparişlerini görmek için hesabına giriş yap.' }, 401)
  if (request.method === 'GET') {
    const orders = await listRecords('orders')
    return json({ orders: session.role === 'admin' ? orders : orders.filter(order => order.username.toLowerCase() === session.username.toLowerCase()) })
  }
  if (request.method !== 'POST') return methodNotAllowed('GET, POST')
  if (session.role !== 'user') return json({ error: 'Bu işlem için oyuncu hesabı gerekiyor.' }, 403)
  const parsed = await readJson(request)
  if (parsed.error) return json({ error: parsed.error }, parsed.status)
  const items = Array.isArray(parsed.value.items) ? parsed.value.items.slice(0, 20) : []
  const validItems = items.every(item => productIds.has(item?.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 20)
  if (!items.length || !validItems) return json({ error: 'Sepetindeki ürünleri kontrol et.' }, 400)
  const order = { id: randomUUID(), username: session.username, items, status: 'Bekliyor', createdAt: new Date().toISOString() }
  await putRecord('orders', order.id, order, { onlyIfNew: true })
  return json({ order }, 201)
}

export const config = { path: '/api/orders' }
