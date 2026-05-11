const API = 'http://localhost:8000/api'

export async function api(path, options = {}) {
  const session = localStorage.getItem('session')

  let url = API + path

  if (session) {
    const sep = url.includes('?') ? '&' : '?'
    url += `${sep}session=${session}`
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json()
}