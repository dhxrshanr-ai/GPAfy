import { detectDeptFromCode, getSubjectSuggestions } from './subjectLookup'

/**
 * findSuggestions
 * Returns top 5 matches based on code similarity and typo-tolerant name matching.
 */
export function findSuggestions(query) {
  if (!query || query.length < 2) return []
  const dept = detectDeptFromCode(query) || ''
  return getSubjectSuggestions(query, { regulation: 'R2021', dept }, 5)
}
