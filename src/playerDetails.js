/* ------------------------------------------------------------------ */
/*  Deep player data — agent, positions, per-competition, full career, */
/*  national team, Smart Valuation breakdown & trophies.               */
/*  (mock, keyed by player id; merged into PlayerProfile)              */
/* ------------------------------------------------------------------ */

/* Position dot coordinates on a portrait pitch (viewBox 0 0 100 140,   */
/* attacking upward — goal at the top).                                 */
export const POS = {
  GK: [50, 130], CB: [50, 108], LB: [18, 104], RB: [82, 104],
  DM: [50, 92], CM: [50, 76], LM: [20, 74], RM: [80, 74],
  AM: [50, 54], SS: [50, 40], LW: [22, 40], RW: [78, 40],
  CF: [50, 26], ST: [50, 24],
}

export const POS_LABEL = {
  GK: 'Goalkeeper', CB: 'Centre-Back', LB: 'Left-Back', RB: 'Right-Back',
  DM: 'Defensive Mid', CM: 'Central Mid', LM: 'Left Mid', RM: 'Right Mid',
  AM: 'Attacking Mid', SS: 'Second Striker', LW: 'Left Winger', RW: 'Right Winger',
  CF: 'Centre-Forward', ST: 'Striker',
}

/* Career rows: [season, club, clubCode, competition, compCode, MP, G, A, Y, R, Min] */
function c(season, club, cc, comp, code, mp, g, a, y, r, min) {
  return { season, club, cc, comp, code, mp, g, a, y, r, min }
}

export const DETAILS = {
  'lamine-yamal': {
    height: '1.80m',
    agent: 'Jorge Mendes (Gestifute)',
    joined: 'Jul 1, 2023',
    outfitter: 'Adidas',
    positions: { main: 'RW', others: ['CF', 'LW', 'AM'] },
    highest: { value: 180, date: 'Jun 2026' },
    competitions: [
      { comp: 'La Liga', code: 'LAL', matches: 34, goals: 12, assists: 15, minutes: 2680, yellow: 4, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 5, goals: 4, assists: 5, minutes: 512, yellow: 1, red: 0 },
      { comp: 'Copa del Rey', code: 'CDR', matches: 2, goals: 2, assists: 2, minutes: 220, yellow: 0, red: 0 },
    ],
    career: [
      c('25/26', 'FC Barcelona', 'BAR', 'La Liga', 'LAL', 34, 12, 15, 4, 0, 2680),
      c('25/26', 'FC Barcelona', 'BAR', 'Champions League', 'UCL', 5, 4, 5, 1, 0, 512),
      c('25/26', 'FC Barcelona', 'BAR', 'Copa del Rey', 'CDR', 2, 2, 2, 0, 0, 220),
      c('24/25', 'FC Barcelona', 'BAR', 'La Liga', 'LAL', 35, 9, 13, 5, 0, 2960),
      c('24/25', 'FC Barcelona', 'BAR', 'Champions League', 'UCL', 12, 5, 6, 2, 0, 980),
      c('24/25', 'FC Barcelona', 'BAR', 'Copa del Rey', 'CDR', 4, 2, 3, 0, 0, 340),
      c('23/24', 'FC Barcelona', 'BAR', 'La Liga', 'LAL', 28, 5, 5, 3, 0, 2010),
      c('23/24', 'FC Barcelona', 'BAR', 'Champions League', 'UCL', 8, 2, 3, 1, 0, 620),
      c('23/24', 'FC Barcelona', 'BAR', 'Copa del Rey', 'CDR', 3, 1, 1, 0, 0, 210),
      c('22/23', 'FC Barcelona', 'BAR', 'La Liga', 'LAL', 1, 0, 0, 0, 0, 8),
      c('22/23', 'Barça Atlètic', 'BAT', 'Primera Fed.', 'P1F', 2, 0, 0, 0, 0, 96),
    ],
    nationalTeam: {
      code: 'ESP', name: 'Spain', caps: 27, goals: 8, assists: 11, minutes: 2140,
      debut: 'Sep 8, 2023', coach: 'Luis de la Fuente',
      seasons: [
        { season: '25/26', caps: 8, goals: 3, assists: 4, minutes: 680 },
        { season: '24/25', caps: 12, goals: 4, assists: 5, minutes: 980 },
        { season: '23/24', caps: 7, goals: 1, assists: 2, minutes: 480 },
      ],
      tournaments: [
        { name: 'UEFA EURO 2024', result: 'Winner', caps: 7, goals: 1, assists: 4 },
        { name: 'Nations League 24/25', result: 'Semi-final', caps: 4, goals: 2, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'La Liga', mult: 1.28, pct: 84, weight: 34, note: 'Top-3 UEFA coefficient league' },
      form: { rating: 7.91, pct: 94, weight: 28, note: 'Elite rolling match rating' },
      age: { label: 'Pre-peak upside (18)', pct: 98, weight: 26, note: 'Steepest part of the age curve' },
      nt: { label: '27 Spain caps', pct: 72, weight: 12, note: 'European champion at 17' },
    },
    injuries: [
      { season: '24/25', type: 'Ankle sprain', kind: 'injury', from: 'Feb 3, 2025', to: 'Feb 18, 2025', days: 15, matches: 3 },
      { season: '23/24', type: 'Muscle fatigue', kind: 'injury', from: 'Apr 10, 2024', to: 'Apr 21, 2024', days: 11, matches: 2 },
      { season: '23/24', type: 'Yellow card suspension', kind: 'suspension', from: 'Jan 14, 2024', to: 'Jan 21, 2024', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 2, name: 'La Liga', code: 'LAL', years: ['2022/23', '2024/25'] },
      { count: 1, name: 'Copa del Rey', code: 'CDR', years: ['2024/25'] },
      { count: 1, name: 'UEFA EURO', code: 'EUR', years: ['2024'] },
      { count: 1, name: 'Supercopa', code: 'SUP', years: ['2024/25'] },
    ],
  },

  'vinicius-junior': {
    height: '1.76m',
    agent: 'TFM Agency',
    joined: 'Jul 12, 2018',
    outfitter: 'Nike',
    positions: { main: 'LW', others: ['CF', 'RW'] },
    highest: { value: 150, date: 'Jun 2024' },
    competitions: [
      { comp: 'La Liga', code: 'LAL', matches: 32, goals: 16, assists: 7, minutes: 2560, yellow: 6, red: 1 },
      { comp: 'Champions League', code: 'UCL', matches: 10, goals: 6, assists: 3, minutes: 840, yellow: 2, red: 0 },
      { comp: 'Copa del Rey', code: 'CDR', matches: 2, goals: 2, assists: 1, minutes: 218, yellow: 0, red: 0 },
    ],
    career: [
      c('25/26', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 32, 16, 7, 6, 1, 2560),
      c('25/26', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 10, 6, 3, 2, 0, 840),
      c('25/26', 'Real Madrid', 'RMA', 'Copa del Rey', 'CDR', 2, 2, 1, 0, 0, 218),
      c('24/25', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 30, 15, 9, 5, 0, 2510),
      c('24/25', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 12, 7, 4, 3, 0, 1020),
      c('23/24', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 26, 15, 6, 4, 0, 2180),
      c('23/24', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 12, 6, 5, 2, 0, 1080),
      c('22/23', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 33, 10, 9, 7, 1, 2760),
      c('22/23', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 12, 7, 5, 3, 0, 1050),
      c('21/22', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 35, 17, 10, 3, 0, 3010),
      c('21/22', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 13, 4, 6, 2, 0, 1120),
      c('20/21', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 34, 6, 4, 2, 0, 2340),
      c('20/21', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 12, 3, 2, 1, 0, 780),
      c('19/20', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 34, 3, 5, 3, 0, 2010),
      c('18/19', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 31, 4, 5, 4, 0, 1980),
      c('17/18', 'Flamengo', 'FLA', 'Série A', 'BRA', 15, 2, 1, 2, 0, 760),
      c('17/18', 'Flamengo', 'FLA', 'Copa Libertadores', 'LIB', 5, 1, 0, 0, 0, 280),
    ],
    nationalTeam: {
      code: 'BRA', name: 'Brazil', caps: 40, goals: 6, assists: 9, minutes: 2680,
      debut: 'Nov 14, 2019', coach: 'Carlo Ancelotti',
      seasons: [
        { season: '25/26', caps: 6, goals: 1, assists: 2, minutes: 480 },
        { season: '24/25', caps: 8, goals: 2, assists: 2, minutes: 620 },
        { season: '23/24', caps: 9, goals: 1, assists: 3, minutes: 710 },
        { season: '22/23', caps: 10, goals: 2, assists: 1, minutes: 580 },
        { season: '19–22', caps: 7, goals: 0, assists: 1, minutes: 290 },
      ],
      tournaments: [
        { name: 'Copa América 2021', result: 'Runner-up', caps: 5, goals: 0, assists: 1 },
        { name: 'World Cup 2022', result: 'QF', caps: 4, goals: 1, assists: 0 },
        { name: 'Copa América 2024', result: 'QF', caps: 4, goals: 2, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'La Liga', mult: 1.28, pct: 84, weight: 34, note: 'Top-3 UEFA coefficient league' },
      form: { rating: 7.55, pct: 80, weight: 28, note: 'Consistent elite output' },
      age: { label: 'At peak (26)', pct: 62, weight: 26, note: 'Value plateau on the age curve' },
      nt: { label: '40 Brazil caps', pct: 84, weight: 12, note: 'Established senior international' },
    },
    injuries: [
      { season: '25/26', type: 'Hamstring', kind: 'injury', from: 'Sep 18, 2025', to: 'Oct 12, 2025', days: 24, matches: 5 },
      { season: '24/25', type: 'Thigh strain', kind: 'injury', from: 'Mar 2, 2025', to: 'Mar 22, 2025', days: 20, matches: 4 },
      { season: '23/24', type: 'Red card suspension', kind: 'suspension', from: 'May 12, 2024', to: 'May 26, 2024', days: 14, matches: 2 },
      { season: '22/23', type: 'Ankle knock', kind: 'injury', from: 'Nov 8, 2022', to: 'Nov 20, 2022', days: 12, matches: 2 },
      { season: '21/22', type: 'Yellow card suspension', kind: 'suspension', from: 'Feb 5, 2022', to: 'Feb 12, 2022', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 3, name: 'Champions League', code: 'UCL', years: ['2021/22', '2023/24', '2024/25'] },
      { count: 2, name: 'La Liga', code: 'LAL', years: ['2019/20', '2023/24'] },
      { count: 1, name: 'Club World Cup', code: 'CWC', years: ['2022'] },
      { count: 2, name: 'Supercopa', code: 'SUP', years: ['2019/20', '2023/24'] },
    ],
  },

  'kenan-yildiz': {
    height: '1.85m',
    agent: 'Family / U. Aytaçoğlu',
    joined: 'Jul 1, 2022',
    outfitter: 'Nike',
    positions: { main: 'AM', others: ['LW', 'SS'] },
    highest: { value: 75, date: 'Jun 2026' },
    competitions: [
      { comp: 'Serie A', code: 'SEA', matches: 30, goals: 10, assists: 7, minutes: 2450, yellow: 5, red: 0 },
      { comp: 'Coppa Italia', code: 'CIT', matches: 4, goals: 2, assists: 1, minutes: 380, yellow: 0, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 5, goals: 2, assists: 1, minutes: 275, yellow: 1, red: 0 },
    ],
    career: [
      c('25/26', 'Juventus', 'JUV', 'Serie A', 'SEA', 30, 10, 7, 5, 0, 2450),
      c('25/26', 'Juventus', 'JUV', 'Champions League', 'UCL', 5, 2, 1, 1, 0, 275),
      c('25/26', 'Juventus', 'JUV', 'Coppa Italia', 'CIT', 4, 2, 1, 0, 0, 380),
      c('24/25', 'Juventus', 'JUV', 'Serie A', 'SEA', 24, 6, 5, 4, 0, 1780),
      c('24/25', 'Juventus', 'JUV', 'Champions League', 'UCL', 6, 1, 2, 1, 0, 420),
      c('23/24', 'Juventus', 'JUV', 'Serie A', 'SEA', 12, 3, 2, 1, 0, 640),
      c('23/24', 'Juventus Next Gen', 'JNG', 'Serie C', 'SEC', 20, 4, 3, 3, 0, 1520),
      c('21/22', 'Bayern II', 'FC2', 'Regionalliga', 'RGL', 18, 9, 5, 2, 0, 1440),
    ],
    nationalTeam: {
      code: 'TUR', name: 'Türkiye', caps: 22, goals: 6, assists: 5, minutes: 1540,
      debut: 'Nov 16, 2023', coach: 'Vincenzo Montella',
      seasons: [
        { season: '25/26', caps: 6, goals: 2, assists: 2, minutes: 480 },
        { season: '24/25', caps: 10, goals: 3, assists: 2, minutes: 720 },
        { season: '23/24', caps: 6, goals: 1, assists: 1, minutes: 340 },
      ],
      tournaments: [
        { name: 'UEFA EURO 2024', result: 'QF', caps: 5, goals: 1, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'Serie A', mult: 1.18, pct: 74, weight: 34, note: 'Top-5 UEFA coefficient league' },
      form: { rating: 7.48, pct: 78, weight: 28, note: 'Rising rolling match rating' },
      age: { label: 'Pre-peak upside (21)', pct: 90, weight: 26, note: 'High projection on the age curve' },
      nt: { label: '22 Türkiye caps', pct: 66, weight: 12, note: 'Regular senior starter' },
    },
    injuries: [
      { season: '24/25', type: 'Knee contusion', kind: 'injury', from: 'Dec 1, 2024', to: 'Dec 18, 2024', days: 17, matches: 3 },
      { season: '23/24', type: 'Hamstring', kind: 'injury', from: 'Mar 15, 2024', to: 'Apr 5, 2024', days: 21, matches: 4 },
      { season: '23/24', type: 'Yellow card suspension', kind: 'suspension', from: 'Oct 22, 2023', to: 'Oct 29, 2023', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 1, name: 'Coppa Italia', code: 'CIT', years: ['2023/24'] },
      { count: 1, name: 'Regionalliga', code: 'RGL', years: ['2021/22'] },
    ],
  },

  'arda-guler': {
    height: '1.76m',
    agent: 'AAA Sports Mgmt',
    joined: 'Jul 6, 2023',
    outfitter: 'Nike',
    positions: { main: 'AM', others: ['RW', 'CM'] },
    highest: { value: 60, date: 'Jun 2026' },
    competitions: [
      { comp: 'La Liga', code: 'LAL', matches: 26, goals: 6, assists: 9, minutes: 1720, yellow: 3, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 6, goals: 2, assists: 2, minutes: 360, yellow: 1, red: 0 },
      { comp: 'Copa del Rey', code: 'CDR', matches: 3, goals: 1, assists: 1, minutes: 200, yellow: 0, red: 0 },
    ],
    career: [
      c('25/26', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 26, 6, 9, 3, 0, 1720),
      c('25/26', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 6, 2, 2, 1, 0, 360),
      c('25/26', 'Real Madrid', 'RMA', 'Copa del Rey', 'CDR', 3, 1, 1, 0, 0, 200),
      c('24/25', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 20, 4, 5, 2, 0, 1180),
      c('24/25', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 8, 2, 3, 1, 0, 480),
      c('23/24', 'Real Madrid', 'RMA', 'La Liga', 'LAL', 8, 2, 1, 1, 0, 410),
      c('23/24', 'Real Madrid', 'RMA', 'Champions League', 'UCL', 4, 1, 0, 0, 0, 120),
      c('22/23', 'Fenerbahçe', 'FEN', 'Süper Lig', 'SÜP', 16, 6, 4, 2, 0, 980),
      c('22/23', 'Fenerbahçe', 'FEN', 'Europa League', 'UEL', 6, 2, 1, 1, 0, 420),
      c('21/22', 'Fenerbahçe', 'FEN', 'Süper Lig', 'SÜP', 9, 1, 1, 1, 0, 420),
    ],
    nationalTeam: {
      code: 'TUR', name: 'Türkiye', caps: 34, goals: 8, assists: 7, minutes: 2280,
      debut: 'Mar 28, 2023', coach: 'Vincenzo Montella',
      seasons: [
        { season: '25/26', caps: 7, goals: 2, assists: 2, minutes: 560 },
        { season: '24/25', caps: 12, goals: 3, assists: 3, minutes: 890 },
        { season: '23/24', caps: 11, goals: 2, assists: 2, minutes: 640 },
        { season: '22/23', caps: 4, goals: 1, assists: 0, minutes: 190 },
      ],
      tournaments: [
        { name: 'UEFA EURO 2024', result: 'QF', caps: 5, goals: 1, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'La Liga', mult: 1.28, pct: 84, weight: 34, note: 'Top-3 UEFA coefficient league' },
      form: { rating: 7.62, pct: 82, weight: 28, note: 'Strong creative output per 90' },
      age: { label: 'Pre-peak upside (21)', pct: 90, weight: 26, note: 'High projection on the age curve' },
      nt: { label: '34 Türkiye caps', pct: 78, weight: 12, note: 'Nailed-on international starter' },
    },
    injuries: [
      { season: '23/24', type: 'Meniscus injury', kind: 'injury', from: 'Aug 12, 2023', to: 'Jan 5, 2024', days: 146, matches: 18 },
      { season: '24/25', type: 'Adductor strain', kind: 'injury', from: 'Nov 10, 2024', to: 'Nov 28, 2024', days: 18, matches: 3 },
      { season: '25/26', type: 'Yellow card suspension', kind: 'suspension', from: 'Jan 8, 2026', to: 'Jan 15, 2026', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 1, name: 'La Liga', code: 'LAL', years: ['2023/24'] },
      { count: 1, name: 'Champions League', code: 'UCL', years: ['2023/24'] },
      { count: 1, name: 'Copa del Rey', code: 'CDR', years: ['2022/23'] },
    ],
  },

  'desire-doue': {
    height: '1.81m',
    agent: 'Family',
    joined: 'Aug 24, 2024',
    outfitter: 'Nike',
    positions: { main: 'AM', others: ['RW', 'LW'] },
    highest: { value: 90, date: 'Jun 2026' },
    competitions: [
      { comp: 'Ligue 1', code: 'LI1', matches: 30, goals: 9, assists: 11, minutes: 2260, yellow: 4, red: 0 },
      { comp: 'Coupe de France', code: 'CDF', matches: 4, goals: 2, assists: 2, minutes: 300, yellow: 0, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 8, goals: 2, assists: 2, minutes: 450, yellow: 1, red: 0 },
    ],
    career: [
      c('25/26', 'Paris SG', 'PSG', 'Ligue 1', 'LI1', 30, 9, 11, 4, 0, 2260),
      c('25/26', 'Paris SG', 'PSG', 'Champions League', 'UCL', 8, 2, 2, 1, 0, 450),
      c('25/26', 'Paris SG', 'PSG', 'Coupe de France', 'CDF', 4, 2, 2, 0, 0, 300),
      c('24/25', 'Paris SG', 'PSG', 'Ligue 1', 'LI1', 28, 5, 7, 3, 0, 1980),
      c('24/25', 'Paris SG', 'PSG', 'Champions League', 'UCL', 10, 3, 4, 1, 0, 720),
      c('23/24', 'Stade Rennais', 'REN', 'Ligue 1', 'LI1', 25, 4, 5, 2, 0, 1610),
      c('23/24', 'Stade Rennais', 'REN', 'Europa League', 'UEL', 6, 1, 2, 1, 0, 380),
      c('22/23', 'Stade Rennais', 'REN', 'Ligue 1', 'LI1', 20, 2, 3, 1, 0, 980),
      c('21/22', 'Rennes II', 'RE2', 'National 2', 'N2', 12, 1, 2, 1, 0, 860),
    ],
    nationalTeam: {
      code: 'FRA', name: 'France', caps: 9, goals: 1, assists: 2, minutes: 480,
      debut: 'Nov 14, 2024', coach: 'Didier Deschamps',
      seasons: [
        { season: '25/26', caps: 5, goals: 1, assists: 1, minutes: 280 },
        { season: '24/25', caps: 4, goals: 0, assists: 1, minutes: 200 },
      ],
      tournaments: [
        { name: 'Nations League 24/25', result: 'Group', caps: 3, goals: 0, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'Ligue 1', mult: 1.14, pct: 70, weight: 34, note: 'Top-5 UEFA coefficient league' },
      form: { rating: 7.55, pct: 80, weight: 28, note: 'High chance creation volume' },
      age: { label: 'Pre-peak upside (21)', pct: 90, weight: 26, note: 'High projection on the age curve' },
      nt: { label: '9 France caps', pct: 52, weight: 12, note: 'Breaking into a deep squad' },
    },
    injuries: [
      { season: '24/25', type: 'Groin strain', kind: 'injury', from: 'Jan 20, 2025', to: 'Feb 8, 2025', days: 19, matches: 4 },
      { season: '23/24', type: 'Ankle sprain', kind: 'injury', from: 'Sep 3, 2023', to: 'Sep 20, 2023', days: 17, matches: 3 },
      { season: '22/23', type: 'Yellow card suspension', kind: 'suspension', from: 'Apr 2, 2023', to: 'Apr 9, 2023', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 1, name: 'Ligue 1', code: 'LI1', years: ['2024/25'] },
      { count: 1, name: 'Coupe de France', code: 'CDF', years: ['2024/25'] },
      { count: 1, name: 'Champions League', code: 'UCL', years: ['2024/25'] },
    ],
  },

  'michael-olise': {
    height: '1.81m',
    agent: 'ARfootball',
    joined: 'Jul 1, 2024',
    outfitter: 'Nike',
    positions: { main: 'RW', others: ['AM', 'LW'] },
    highest: { value: 110, date: 'Jun 2026' },
    competitions: [
      { comp: 'Bundesliga', code: 'BUN', matches: 30, goals: 13, assists: 10, minutes: 2600, yellow: 3, red: 0 },
      { comp: 'DFB-Pokal', code: 'DFB', matches: 3, goals: 2, assists: 2, minutes: 250, yellow: 0, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 7, goals: 2, assists: 2, minutes: 540, yellow: 1, red: 0 },
    ],
    career: [
      c('25/26', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 30, 13, 10, 3, 0, 2600),
      c('25/26', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 7, 2, 2, 1, 0, 540),
      c('25/26', 'Bayern Munich', 'FCB', 'DFB-Pokal', 'DFB', 3, 2, 2, 0, 0, 250),
      c('24/25', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 29, 12, 11, 4, 0, 2510),
      c('24/25', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 10, 4, 5, 1, 0, 820),
      c('23/24', 'Crystal Palace', 'CRY', 'Premier League', 'PRL', 19, 10, 6, 2, 0, 1620),
      c('23/24', 'Crystal Palace', 'CRY', 'FA Cup', 'FAC', 2, 1, 1, 0, 0, 180),
      c('22/23', 'Crystal Palace', 'CRY', 'Premier League', 'PRL', 37, 2, 11, 5, 0, 2900),
      c('21/22', 'Crystal Palace', 'CRY', 'Premier League', 'PRL', 32, 2, 7, 3, 1, 2100),
      c('20/21', 'Reading', 'RDG', 'Championship', 'CHP', 45, 7, 12, 6, 0, 3800),
      c('19/20', 'Reading', 'RDG', 'Championship', 'CHP', 16, 0, 1, 1, 0, 720),
    ],
    nationalTeam: {
      code: 'FRA', name: 'France', caps: 12, goals: 3, assists: 2, minutes: 720,
      debut: 'Sep 6, 2024', coach: 'Didier Deschamps',
      seasons: [
        { season: '25/26', caps: 6, goals: 2, assists: 1, minutes: 400 },
        { season: '24/25', caps: 6, goals: 1, assists: 1, minutes: 320 },
      ],
      tournaments: [
        { name: 'Nations League 24/25', result: 'Semi-final', caps: 4, goals: 1, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'Bundesliga', mult: 1.24, pct: 80, weight: 34, note: 'Top-4 UEFA coefficient league' },
      form: { rating: 7.70, pct: 86, weight: 28, note: 'Elite goal + assist involvement' },
      age: { label: 'Approaching peak (24)', pct: 78, weight: 26, note: 'Rising leg of the age curve' },
      nt: { label: '12 France caps', pct: 58, weight: 12, note: 'Emerging senior international' },
    },
    injuries: [
      { season: '23/24', type: 'Hamstring', kind: 'injury', from: 'Aug 20, 2023', to: 'Dec 15, 2023', days: 117, matches: 14 },
      { season: '22/23', type: 'Calf injury', kind: 'injury', from: 'Feb 11, 2023', to: 'Mar 1, 2023', days: 18, matches: 3 },
      { season: '25/26', type: 'Yellow card suspension', kind: 'suspension', from: 'Oct 5, 2025', to: 'Oct 12, 2025', days: 7, matches: 1 },
      { season: '21/22', type: 'Shoulder injury', kind: 'injury', from: 'Apr 16, 2022', to: 'May 5, 2022', days: 19, matches: 3 },
    ],

    trophies: [
      { count: 1, name: 'Bundesliga', code: 'BUN', years: ['2024/25'] },
      { count: 1, name: 'DFB-Pokal', code: 'DFB', years: ['2024/25'] },
      { count: 1, name: 'UEFA Super Cup', code: 'USC', years: ['2025'] },
    ],
  },

  'jamal-musiala': {
    height: '1.84m',
    agent: 'Family',
    joined: 'Jul 1, 2019',
    outfitter: 'Adidas',
    positions: { main: 'AM', others: ['LW', 'CM', 'SS'] },
    highest: { value: 130, date: 'Jun 2025' },
    competitions: [
      { comp: 'Bundesliga', code: 'BUN', matches: 26, goals: 9, assists: 7, minutes: 2050, yellow: 2, red: 0 },
      { comp: 'DFB-Pokal', code: 'DFB', matches: 2, goals: 1, assists: 1, minutes: 160, yellow: 0, red: 0 },
      { comp: 'Champions League', code: 'UCL', matches: 5, goals: 2, assists: 2, minutes: 344, yellow: 1, red: 0 },
    ],
    career: [
      c('25/26', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 26, 9, 7, 2, 0, 2050),
      c('25/26', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 5, 2, 2, 1, 0, 344),
      c('25/26', 'Bayern Munich', 'FCB', 'DFB-Pokal', 'DFB', 2, 1, 1, 0, 0, 160),
      c('24/25', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 28, 12, 8, 3, 0, 2320),
      c('24/25', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 10, 5, 4, 1, 0, 810),
      c('23/24', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 29, 10, 9, 2, 0, 2410),
      c('23/24', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 10, 3, 4, 1, 0, 780),
      c('22/23', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 30, 12, 10, 3, 0, 2480),
      c('22/23', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 9, 1, 3, 1, 0, 620),
      c('21/22', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 33, 5, 7, 2, 0, 1990),
      c('21/22', 'Bayern Munich', 'FCB', 'Champions League', 'UCL', 8, 1, 2, 0, 0, 410),
      c('20/21', 'Bayern Munich', 'FCB', 'Bundesliga', 'BUN', 26, 4, 2, 1, 0, 980),
    ],
    nationalTeam: {
      code: 'GER', name: 'Germany', caps: 42, goals: 8, assists: 10, minutes: 2890,
      debut: 'Mar 25, 2021', coach: 'Julian Nagelsmann',
      seasons: [
        { season: '25/26', caps: 6, goals: 1, assists: 2, minutes: 420 },
        { season: '24/25', caps: 10, goals: 2, assists: 3, minutes: 720 },
        { season: '23/24', caps: 12, goals: 3, assists: 3, minutes: 890 },
        { season: '21–23', caps: 14, goals: 2, assists: 2, minutes: 860 },
      ],
      tournaments: [
        { name: 'UEFA EURO 2024', result: 'QF', caps: 5, goals: 3, assists: 0 },
        { name: 'World Cup 2022', result: 'Group', caps: 3, goals: 0, assists: 1 },
      ],
    },
    smart: {
      league: { name: 'Bundesliga', mult: 1.24, pct: 80, weight: 34, note: 'Top-4 UEFA coefficient league' },
      form: { rating: 7.66, pct: 84, weight: 28, note: 'High progressive carry volume' },
      age: { label: 'Approaching peak (23)', pct: 84, weight: 26, note: 'Rising leg of the age curve' },
      nt: { label: '42 Germany caps', pct: 86, weight: 12, note: 'Core national-team creator' },
    },
    injuries: [
      { season: '25/26', type: 'Hamstring', kind: 'injury', from: 'Jul 5, 2026', to: 'Aug 20, 2026', days: 46, matches: 6 },
      { season: '24/25', type: 'Thigh problems', kind: 'injury', from: 'Mar 8, 2025', to: 'Mar 28, 2025', days: 20, matches: 4 },
      { season: '22/23', type: 'Knee injury', kind: 'injury', from: 'Oct 1, 2022', to: 'Oct 22, 2022', days: 21, matches: 3 },
      { season: '21/22', type: 'Yellow card suspension', kind: 'suspension', from: 'Dec 11, 2021', to: 'Dec 18, 2021', days: 7, matches: 1 },
    ],

    trophies: [
      { count: 4, name: 'Bundesliga', code: 'BUN', years: ['2019/20', '2020/21', '2021/22', '2022/23'] },
      { count: 2, name: 'DFB-Pokal', code: 'DFB', years: ['2019/20', '2024/25'] },
      { count: 1, name: 'Champions League', code: 'UCL', years: ['2019/20'] },
    ],
  },
}
