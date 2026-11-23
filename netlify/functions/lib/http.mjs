export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  })
}

export async function readJson(request, limit = 20000) {
  const size = Number(request.headers.get('content-length') || 0)
  if (size > limit) return { error: 'İstek boyutu sınırı aşıldı.', status: 413 }
  try {
    const value = await request.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { error: 'Geçersiz istek.', status: 400 }
    return { value }
  } catch {
    return { error: 'Geçersiz JSON verisi.', status: 400 }
  }
}

export function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : ''
}

export function methodNotAllowed(allow) {
  return json({ error: 'Bu işlem bu istek yöntemiyle kullanılamaz.' }, 405, { Allow: allow })
}
