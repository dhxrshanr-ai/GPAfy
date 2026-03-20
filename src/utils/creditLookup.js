import { detectDeptFromCode, getSubjectDetails, saveOverride, saveToLearned, getSubjectSuggestions } from './subjectLookup'
import { regulationData } from './regulationData'

export { saveOverride, saveToLearned, getSubjectSuggestions }

/* ─── LAYER 2: Intelligent Patterns ─── */
function detectCreditsFromPattern(code) {
  const upper = code.toUpperCase().trim()

  if (/^PR|\d{2}PR|PROJECT/i.test(upper) || upper.endsWith('811')) {
    return { credits: 6, type: 'project', source: 'pattern' }
  }

  if (upper.startsWith('HS')) {
    if (upper.includes('151') || upper.includes('251')) return { credits: 4, type: 'theory', source: 'pattern' }
    return { credits: 3, type: 'theory', source: 'pattern' }
  }

  if (upper.endsWith('L') || /\d{2}L$/.test(upper) || /\d{2}11$/.test(upper) || /\d{2}71$/.test(upper) || /\d{2}81$/.test(upper)) {
    return { credits: 2, type: 'lab', source: 'pattern' }
  }

  if (upper.startsWith('O') || upper.startsWith('C') || upper.startsWith('PE')) {
    return { credits: 3, type: 'elective', source: 'pattern' }
  }

  return { credits: 3, type: 'theory', source: 'default' }
}

/* ─── MULTI-LAYER RESOLVER ─── */
export function getCreditsFromSubjectCode(code) {
  if (!code || code.trim().length < 2) {
    return { credits: 0, name: '', type: '', source: 'none' }
  }

  const regs = Object.keys(regulationData)
  let details = { found: false }
  
  // Try all regulations, starting with R2021
  const sortedRegs = ['R2021', ...regs.filter(r => r !== 'R2021')]
  for (const reg of sortedRegs) {
    const res = getSubjectDetails(code, { regulation: reg, dept: detectDeptFromCode(code) || '' })
    if (res.found) {
      details = res
      break
    }
  }

  // Layer 1: Database or Learned Lookups

  if (details.found) {
    // Preserve existing UI badges by mapping "non-exact" matches to "pattern".
    const source =
      details.source === 'database'
        ? 'database'
        : details.source === 'override'
          ? 'override'
          : details.source === 'learned'
            ? 'learned'
            : 'pattern'


    return { credits: details.credits, name: details.name, type: details.type, source }
  }

  // Layer 2: Pattern-Based Detection (credits only)


  return detectCreditsFromPattern(code)
}

export function getSubjectNameFromCode(code) {
  if (!code) return ''
  const regs = Object.keys(regulationData)
  const sortedRegs = ['R2021', ...regs.filter(r => r !== 'R2021')]
  for (const reg of sortedRegs) {
    const details = getSubjectDetails(code, { regulation: reg, dept: detectDeptFromCode(code) || '' })
    if (details.found) return details.name
  }
  return ''
}

export function validateSubjectCode(code) {
  if (!code || code.trim().length === 0) return { valid: false, message: '' }
  const trimmed = code.trim()
  if (trimmed.length < 3) return { valid: false, message: 'Too short' }
  if (!/^[A-Za-z]{2,3}\d{3,4}[A-Za-z]?$/i.test(trimmed)) {
    return { valid: false, message: 'Invalid format' }
  }
  return { valid: true, message: '' }
}
