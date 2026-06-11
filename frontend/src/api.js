const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export async function fetchFonts() {
  const res = await fetch(`${API_BASE}/fonts/`)
  const data = await handleResponse(res)
  return data.fonts
}

export async function convertText(text, font) {
  const res = await fetch(`${API_BASE}/text/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, font }),
  })
  const data = await handleResponse(res)
  return data.ascii
}

export async function convertImage(file, { width, charset, invert }) {
  const form = new FormData()
  form.append('image', file)
  form.append('width', width)
  form.append('charset', charset)
  form.append('invert', invert)
  const res = await fetch(`${API_BASE}/image/`, {
    method: 'POST',
    body: form,
  })
  const data = await handleResponse(res)
  return data.ascii
}
