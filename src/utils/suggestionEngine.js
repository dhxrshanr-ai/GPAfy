import subjectsData from '../data/subjects_map.json'

const subjectsMap = subjectsData.subjectsMap || {}
const entries = Object.entries(subjectsMap)

/**
 * findSuggestions
 * Returns top 5 matches based on code or keyword prefix
 */
export function findSuggestions(query) {
  if (!query || query.length < 2) return []
  
  const q = query.toUpperCase().trim()
  const results = []

  // Priority 1: Code starts with query
  for (const [code, data] of entries) {
    if (code.startsWith(q)) {
      results.push({ code, ...data, matchType: 'code' })
    }
    if (results.length >= 5) break
  }

  // Priority 2: Keywords or Name match
  if (results.length < 5) {
    const qLower = query.toLowerCase()
    for (const [code, data] of entries) {
      if (results.some(r => r.code === code)) continue
      
      const isKeywordMatch = data.keywords?.some(kw => kw.startsWith(qLower))
      const isNameMatch = data.name.toLowerCase().includes(qLower)
      
      if (isKeywordMatch || isNameMatch) {
         results.push({ code, ...data, matchType: 'keyword' })
      }
      if (results.length >= 5) break
    }
  }

  return results
}
