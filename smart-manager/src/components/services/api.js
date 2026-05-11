const API = 'http://localhost:8000/api'

export async function api(path, options = {}) {

  const session = localStorage.getItem('session')

  let finalPath = path

  if (session) {
    const sep = path.includes('?') ? '&' : '?'
    finalPath += `${sep}session=${session}`
  }

  const res = await fetch(API + finalPath, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  if (!res.ok) {
    throw new Error('API Error')
  }

  return res.json()
}