const PREFIX = 'gpafy_'

export function saveData(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export function loadData(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function clearData(key) {
  localStorage.removeItem(PREFIX + key)
}
