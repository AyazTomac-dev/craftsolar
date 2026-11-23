import { getStore } from '@netlify/blobs'

export const dataStore = getStore({ name: 'craftsolar-shared-data', consistency: 'strong' })

export async function getRecord(collection, id) {
  return dataStore.get(`${collection}/${id}`, { type: 'json', consistency: 'strong' })
}

export async function putRecord(collection, id, value, options) {
  return dataStore.setJSON(`${collection}/${id}`, value, options)
}

export async function listRecords(collection) {
  const { blobs } = await dataStore.list({ prefix: `${collection}/` })
  const records = await Promise.all(blobs.map(blob => dataStore.get(blob.key, { type: 'json', consistency: 'strong' })))
  return records.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
