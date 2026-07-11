/**
 * Pretty competition / league display names (EN + TR).
 * Warehouse often has slugs or lowercase codes as `name`.
 */

const EN = {
  // Big 5 + TR (+ TM domestic codes)
  'premier-league': 'Premier League',
  premierleague: 'Premier League',
  GB1: 'Premier League',
  gb1: 'Premier League',
  'la-liga': 'La Liga',
  laliga: 'La Liga',
  ES1: 'La Liga',
  es1: 'La Liga',
  bundesliga: 'Bundesliga',
  L1: 'Bundesliga',
  l1: 'Bundesliga',
  'serie-a': 'Serie A',
  seriea: 'Serie A',
  IT1: 'Serie A',
  it1: 'Serie A',
  'ligue-1': 'Ligue 1',
  ligue1: 'Ligue 1',
  FR1: 'Ligue 1',
  fr1: 'Ligue 1',
  'super-lig': 'Süper Lig',
  superlig: 'Süper Lig',
  TR1: 'Süper Lig',
  tr1: 'Süper Lig',
  'trendyol-super-lig': 'Trendyol Süper Lig',
  // Europe other
  eredivisie: 'Eredivisie',
  NL1: 'Eredivisie',
  nl1: 'Eredivisie',
  'primeira-liga': 'Primeira Liga',
  PO1: 'Primeira Liga',
  po1: 'Primeira Liga',
  'belgian-pro': 'Belgian Pro League',
  BE1: 'Belgian Pro League',
  be1: 'Belgian Pro League',
  championship: 'Championship',
  GB2: 'Championship',
  gb2: 'Championship',
  SC1: 'Scottish Premiership',
  sc1: 'Scottish Premiership',
  RU1: 'Premier Liga',
  UKR1: 'Premier Liga',
  GR1: 'Super League Greece',
  TS1: 'Süper Lig',
  // Cups
  ucl: 'UEFA Champions League',
  'uefa-champions-league': 'UEFA Champions League',
  CL: 'UEFA Champions League',
  cl: 'UEFA Champions League',
  uel: 'UEFA Europa League',
  'uefa-europa-league': 'UEFA Europa League',
  EL: 'UEFA Europa League',
  el: 'UEFA Europa League',
  uecl: 'UEFA Conference League',
  'uefa-conference-league': 'UEFA Conference League',
  ECL: 'UEFA Conference League',
  ecl: 'UEFA Conference League',
  'afc-cl': 'AFC Champions League',
  libertadores: 'Copa Libertadores',
  'caf-cl': 'CAF Champions League',
  'concacaf-cc': 'Concacaf Champions Cup',
  'club-world-cup': 'FIFA Club World Cup',
  // Others common TM codes
  'saudi-pro': 'Saudi Pro League',
  SA1: 'Saudi Pro League',
  mls: 'Major League Soccer',
  'liga-mx': 'Liga MX',
  mexicana1: 'Liga MX',
  brasileirao: 'Brasileirão',
  BRA1: 'Brasileirão',
  'liga-profesional': 'Liga Profesional',
  AR1N: 'Liga Profesional',
  'j1-league': 'J1 League',
  'a-league': 'A-League',
  'egyptian-premier': 'Egyptian Premier League',
}

const TR = {
  'premier-league': 'Premier League',
  premierleague: 'Premier League',
  GB1: 'Premier League',
  'la-liga': 'La Liga',
  laliga: 'La Liga',
  ES1: 'La Liga',
  bundesliga: 'Bundesliga',
  L1: 'Bundesliga',
  'serie-a': 'Serie A',
  seriea: 'Serie A',
  IT1: 'Serie A',
  'ligue-1': 'Ligue 1',
  ligue1: 'Ligue 1',
  FR1: 'Ligue 1',
  'super-lig': 'Süper Lig',
  superlig: 'Süper Lig',
  TR1: 'Süper Lig',
  'trendyol-super-lig': 'Trendyol Süper Lig',
  eredivisie: 'Eredivisie',
  NL1: 'Eredivisie',
  'primeira-liga': 'Primeira Liga',
  PO1: 'Primeira Liga',
  'belgian-pro': 'Belçika Pro Ligi',
  BE1: 'Belçika Pro Ligi',
  championship: 'Championship',
  GB2: 'Championship',
  ucl: 'UEFA Şampiyonlar Ligi',
  'uefa-champions-league': 'UEFA Şampiyonlar Ligi',
  CL: 'UEFA Şampiyonlar Ligi',
  uel: 'UEFA Avrupa Ligi',
  'uefa-europa-league': 'UEFA Avrupa Ligi',
  EL: 'UEFA Avrupa Ligi',
  uecl: 'UEFA Konferans Ligi',
  'uefa-conference-league': 'UEFA Konferans Ligi',
  ECL: 'UEFA Konferans Ligi',
  'afc-cl': 'AFC Şampiyonlar Ligi',
  libertadores: 'Copa Libertadores',
  'caf-cl': 'CAF Şampiyonlar Ligi',
  'concacaf-cc': 'Concacaf Şampiyonlar Kupası',
  'club-world-cup': 'FIFA Kulüpler Dünya Kupası',
  'saudi-pro': 'Suudi Pro Lig',
  mls: 'Major League Soccer',
  'liga-mx': 'Liga MX',
  brasileirao: 'Brasileirão',
  'liga-profesional': 'Liga Profesional',
  'j1-league': 'J1 Ligi',
  'a-league': 'A-League',
  'egyptian-premier': 'Mısır Premier Ligi',
}

function keyify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
}

function titleCaseSlug(s) {
  return String(s || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/**
 * @param {{ id?: string, name?: string, code?: string, fullName?: string }} entity
 * @param {'en'|'tr'} locale
 */
export function competitionDisplayName(entity, locale = 'en') {
  if (!entity) return '—'
  const dict = locale === 'tr' ? TR : EN
  const candidates = [entity.id, entity.code, entity.name, entity.fullName, keyify(entity.name)]
  for (const c of candidates) {
    if (!c) continue
    const raw = String(c)
    if (dict[raw]) return dict[raw]
    if (dict[raw.toUpperCase()]) return dict[raw.toUpperCase()]
    if (dict[raw.toLowerCase()]) return dict[raw.toLowerCase()]
    if (dict[keyify(raw)]) return dict[keyify(raw)]
    if (EN[raw]) return locale === 'tr' && TR[raw] ? TR[raw] : EN[raw]
    if (EN[raw.toUpperCase()]) {
      const k = raw.toUpperCase()
      return locale === 'tr' && TR[k] ? TR[k] : EN[k]
    }
    if (EN[keyify(raw)]) return locale === 'tr' && TR[keyify(raw)] ? TR[keyify(raw)] : EN[keyify(raw)]
  }
  // Already pretty?
  const n = entity.fullName || entity.name || entity.id || '—'
  if (n.includes(' ') && n !== n.toLowerCase()) return n
  return titleCaseSlug(n)
}
