import { regulationData } from './regulationData'

// Note: This module builds a searchable index from the canonical regulation objects
// (src/utils/regulationData.js + src/utils/regulations/*). This avoids "drift" between
// regulation data and subject lookup.

const DEFAULT_REGULATION = 'R2021'
const ALLOWED_DEPTS = new Set(['ECE', 'CSE', 'IT'])

const STORAGE_KEYS = {
  OVERRIDES: 'annagrade_overrides',
  LEARNED: 'annagrade_learned_subjects',
}

let overridesDB = {}
let learnedDB = {}
let persistenceLoaded = false

function loadPersistence() {
  if (persistenceLoaded) return
  persistenceLoaded = true
  try {
    overridesDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.OVERRIDES) || '{}')
    learnedDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNED) || '{}')
  } catch (e) {
    // In non-browser contexts localStorage might be unavailable.
    overridesDB = {}
    learnedDB = {}
  }
}

export function saveOverride(code, credits) {
  loadPersistence()
  const key = normalizeCode(code)
  if (!key) return
  overridesDB[key] = Number(credits)
  try {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overridesDB))
  } catch {}
}

export function saveToLearned(code, credits, name = '') {
  loadPersistence()
  const key = normalizeCode(code)
  if (!key) return
  learnedDB[key] = { credits: Number(credits), name }
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNED, JSON.stringify(learnedDB))
  } catch {}
}

export function normalizeCode(code) {
  return (code ?? '').toString().trim().toUpperCase()
}

function normalizeText(text) {
  return (text ?? '').toString().trim().toLowerCase()
}

// Regex-based department inference to narrow results quickly.
export function detectDeptFromCode(code) {
  const upper = normalizeCode(code)
  if (!upper) return ''

  // ECE subjects usually start with EC or CEC (professional electives)
  if (/^(EC|CEC)[A-Z0-9]/.test(upper)) return 'ECE'

  // CSE subjects usually start with CS or CCS
  if (/^(CS|CCS)[A-Z0-9]/.test(upper)) return 'CSE'

  // IT subjects usually start with IT or CIT
  if (/^(IT|CIT)[A-Z0-9]/.test(upper)) return 'IT'

  return ''
}

function tokeniseForKeywords(str) {
  // Keep only useful tokens; remove punctuation and obvious short noise.
  const tokens = normalizeText(str)
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)

  // Filter out very short tokens like "i", "ii" unless they are part of a larger token.
  return tokens.filter(t => t.length >= 2)
}

function buildKeywords(code, name, dept) {
  const tokens = new Set()

  // Include code + dept for high precision matching.
  if (code) tokens.add(normalizeCode(code).toLowerCase())
  if (dept) tokens.add(dept.toLowerCase())

  for (const t of tokeniseForKeywords(name)) tokens.add(t)

  return Array.from(tokens)
}

// Fast, deterministic "fuzzy" similarity (bigram Jaccard).
function bigramSimilarity(a, b) {
  const s1 = normalizeText(a).replace(/\s+/g, '')
  const s2 = normalizeText(b).replace(/\s+/g, '')
  if (!s1 || !s2) return 0
  if (s1 === s2) return 1

  const makeBigrams = (s) => {
    if (s.length < 2) return new Set([s])
    const set = new Set()
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2))
    return set
  }

  const A = makeBigrams(s1)
  const B = makeBigrams(s2)

  let inter = 0
  for (const x of A) if (B.has(x)) inter++

  const union = A.size + B.size - inter
  if (union === 0) return 0
  return inter / union
}

let indexCacheByRegulation = null

function buildIndexForRegulation(regulation = DEFAULT_REGULATION) {
  const reg = regulationData?.[regulation]
  const index = new Map()

  if (!reg) return index

  for (const [deptKey, deptObj] of Object.entries(reg)) {
    if (!ALLOWED_DEPTS.has(deptKey)) continue
    const dept = deptKey // ECE/CSE/IT

    const semesters = deptObj?.semesters || {}
    for (const semesterSubjects of Object.values(semesters)) {
      for (const subj of semesterSubjects) {
        if (!subj?.code) continue
        const code = normalizeCode(subj.code)
        if (!code) continue

        // "JSON-based lookup table": we store canonical subject entries in a plain object shape.
        index.set(code, {
          code,
          name: subj.name || '',
          credits: Number(subj.credits) || 0,
          type: subj.type || 'theory',
          regulation,
          dept,
          keywords: buildKeywords(code, subj.name || '', dept),
        })
      }
    }
  }

  return index
}

function getIndex(regulation = DEFAULT_REGULATION) {
  // Since this app currently supports R2021 in production UX, we keep a simple cache.
  if (!indexCacheByRegulation || indexCacheByRegulation.regulation !== regulation) {
    const idx = buildIndexForRegulation(regulation)
    indexCacheByRegulation = { regulation, idx }
  }
  return indexCacheByRegulation.idx
}

function isLikelySubjectCode(inputUpper) {
  // Accept codes like EC3551, CS8392, CCS3XX won't match (X placeholders), which is fine:
  // exact lookups for real codes should still work.
  return /^[A-Z]{2,3}\d{3,4}[A-Z]?$/.test(inputUpper)
}

function applyPersistence(entry) {
  loadPersistence()
  const key = normalizeCode(entry.code)

  if (overridesDB[key] !== undefined) {
    return { ...entry, credits: Number(overridesDB[key]), source: 'override' }
  }
  if (learnedDB[key]) {
    const learned = learnedDB[key]
    return { ...entry, credits: Number(learned.credits), name: learned.name || entry.name, source: 'learned' }
  }
  return { ...entry, source: 'database' }
}

export function getSubjectDetails(input, context = {}) {
  const raw = (input ?? '').toString()
  const trimmed = raw.trim()
  if (!trimmed) return { found: false, reason: 'Not Found' }

  const regulation = context.regulation || DEFAULT_REGULATION
  const deptFromContext = context.dept || ''
  const deptInferred = detectDeptFromCode(trimmed)
  const dept = deptFromContext || deptInferred || ''

  const index = getIndex(regulation)
  const inputUpper = normalizeCode(trimmed)

  const filteredEntries = []
  for (const entry of index.values()) {
    if (dept && entry.dept !== dept) continue
    filteredEntries.push(entry)
  }

  // 1) Exact code match
  if (isLikelySubjectCode(inputUpper) && index.has(inputUpper)) {
    return applyPersistence(index.get(inputUpper))
  }

  const qLower = normalizeText(trimmed)

  // 2) Keyword match
  // Prefer matches where the query is contained in the name or keywords.
  let best = null
  let bestScore = 0
  for (const entry of filteredEntries) {
    const nameLower = entry.name.toLowerCase()
    let score = 0

    if (nameLower.includes(qLower)) score += 0.85
    if (entry.keywords?.some(k => k.includes(qLower))) score += 0.65
    if (entry.keywords?.some(k => qLower.includes(k) && k.length >= 3)) score += 0.35

    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  if (best && bestScore >= 0.5) {
    const persisted = applyPersistence(best)
    // Map "non-exact match" to an estimated source for UI.
    const source = persisted.source === 'database' ? 'keyword' : persisted.source
    return { ...persisted, source }
  }

  // 3) Fuzzy suggestions (typo tolerant)
  best = null
  bestScore = 0
  for (const entry of filteredEntries) {
    const nameScore = bigramSimilarity(qLower, entry.name)
    let keywordsScore = 0
    for (const k of entry.keywords || []) {
      keywordsScore = Math.max(keywordsScore, bigramSimilarity(qLower, k))
    }

    const score = Math.max(nameScore, keywordsScore)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  if (best && bestScore >= 0.28) {
    const persisted = applyPersistence(best)
    const source = persisted.source === 'database' ? 'fuzzy' : persisted.source
    return { ...persisted, source }
  }

  return { found: false, reason: 'Not Found' }
}

export function getSubjectSuggestions(query, context = {}, limit = 5) {
  const raw = (query ?? '').toString()
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length < 1) return []

  const regulation = context.regulation || DEFAULT_REGULATION
  const dept = context.dept || detectDeptFromCode(trimmed) || ''

  const index = getIndex(regulation)
  const qLower = normalizeText(trimmed)
  const results = []

  // If input already looks like a code prefix, rank by code similarity first.
  const inputUpper = normalizeCode(trimmed)
  const hasCodeLikePrefix = /^[A-Z]{1,3}\d*$/.test(inputUpper)

  for (const entry of index.values()) {
    if (dept && entry.dept !== dept) continue

    let score = 0
    let matchType = 'unknown'

    if (hasCodeLikePrefix && entry.code.startsWith(inputUpper)) {
      score = 0.95
      matchType = 'code-prefix'
    } else if (entry.code === inputUpper) {
      score = 1
      matchType = 'exact-code'
    } else {
      // Text ranking: name includes / keyword includes / fuzzy similarity.
      const nameLower = entry.name.toLowerCase()
      if (nameLower.includes(qLower)) {
        score = 0.75
        matchType = 'name'
      } else if (entry.keywords?.some(k => k.includes(qLower))) {
        score = 0.6
        matchType = 'keyword'
      } else {
        const nameScore = bigramSimilarity(qLower, entry.name)
        let keywordsScore = 0
        for (const k of entry.keywords || []) {
          keywordsScore = Math.max(keywordsScore, bigramSimilarity(qLower, k))
        }
        score = Math.max(nameScore, keywordsScore)
        if (score >= 0.28) matchType = 'fuzzy'
      }
    }

    if (score > 0) results.push({ ...entry, score, matchType })
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}

