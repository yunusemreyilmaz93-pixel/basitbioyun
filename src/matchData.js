/* ------------------------------------------------------------------ */
/*  Match Center deep data (mock)                                      */
/* ------------------------------------------------------------------ */

function xi(shirt, name, pos, opts = {}) {
  return {
    shirt,
    name,
    pos,
    captain: !!opts.captain,
    playerId: opts.playerId ?? null,
    rating: opts.rating ?? null,
  }
}

function event(minute, type, team, payload = {}) {
  return { minute, type, team, ...payload }
}

export const MATCHES_DETAIL = {
  'bayern-leverkusen': {
    id: 'bayern-leverkusen',
    league: 'Bundesliga',
    leagueCode: 'BUN',
    matchday: 28,
    status: 'ft',
    clock: null,
    kickoff: '2026-03-15T17:30:00Z',
    home: {
      name: 'Bayern Munich',
      short: 'FCB',
      clubId: 'bayern-munich',
      score: 3,
      formation: '4-2-3-1',
      manager: 'Vincent Kompany',
    },
    away: {
      name: 'Bayer Leverkusen',
      short: 'B04',
      clubId: null,
      score: 2,
      formation: '3-4-2-1',
      manager: 'Xabi Alonso',
    },
    venue: {
      stadium: 'Allianz Arena',
      city: 'Munich',
      attendance: 75000,
      capacity: 75024,
    },
    referee: {
      name: 'Felix Zwayer',
      nation: 'GER',
    },
    scorers: {
      home: [
        { name: 'Olise', minute: "44'", playerId: 'michael-olise' },
        { name: 'Musiala', minute: "62'", playerId: 'jamal-musiala' },
        { name: 'Kane', minute: "78'" },
      ],
      away: [
        { name: 'Wirtz', minute: "23'" },
        { name: 'Boniface', minute: "55'" },
      ],
    },
    lineups: {
      home: {
        starting: [
          xi(1, 'Neuer', 'GK', { captain: true }),
          xi(19, 'Davies', 'LB'),
          xi(3, 'Kim Min-jae', 'CB'),
          xi(2, 'Upamecano', 'CB'),
          xi(22, 'Guerreiro', 'RB'),
          xi(6, 'Kimmich', 'DM'),
          xi(45, 'Pavlović', 'DM'),
          xi(10, 'Sané', 'LW'),
          xi(42, 'Musiala', 'AM', { playerId: 'jamal-musiala' }),
          xi(17, 'Olise', 'RW', { playerId: 'michael-olise' }),
          xi(9, 'Kane', 'ST'),
        ],
        bench: [
          xi(26, 'Ulreich', 'GK'),
          xi(4, 'de Ligt', 'CB'),
          xi(8, 'Goretzka', 'CM'),
          xi(7, 'Gnabry', 'FW'),
          xi(11, 'Coman', 'FW'),
          xi(25, 'Müller', 'AM'),
          xi(39, 'Tel', 'ST'),
        ],
      },
      away: {
        starting: [
          xi(1, 'Hrádecký', 'GK', { captain: true }),
          xi(12, 'Tapsoba', 'CB'),
          xi(4, 'Tah', 'CB'),
          xi(3, 'Hincapié', 'CB'),
          xi(30, 'Frimpong', 'RWB'),
          xi(20, 'Grimaldo', 'LWB'),
          xi(34, 'Xhaka', 'CM'),
          xi(8, 'Andrich', 'CM'),
          xi(10, 'Wirtz', 'AM'),
          xi(21, 'Adli', 'AM'),
          xi(22, 'Boniface', 'ST'),
        ],
        bench: [
          xi(17, 'Kovar', 'GK'),
          xi(6, 'Kossounou', 'CB'),
          xi(7, 'Hofmann', 'AM'),
          xi(14, 'Schick', 'ST'),
          xi(19, 'Tella', 'FW'),
          xi(25, 'Palacios', 'CM'),
          xi(9, 'Hložek', 'FW'),
        ],
      },
    },
    stats: [
      { key: 'possession', label: 'Possession %', home: 58, away: 42, unit: '%', higher: 'home' },
      { key: 'xg', label: 'xG (Expected Goals)', home: 2.41, away: 1.68, unit: '', higher: 'home', decimals: 2 },
      { key: 'shots', label: 'Total Shots', home: 18, away: 11, unit: '', higher: 'home' },
      { key: 'sot', label: 'Shots on Target', home: 9, away: 5, unit: '', higher: 'home' },
      { key: 'freekicks', label: 'Freekicks', home: 14, away: 11, unit: '', higher: 'home' },
      { key: 'corners', label: 'Corners', home: 7, away: 4, unit: '', higher: 'home' },
      { key: 'bigChances', label: 'Big Chances Created', home: 5, away: 3, unit: '', higher: 'home' },
    ],
    events: [
      event(7, 'yellow', 'away', { player: 'Andrich', detail: 'Tactical foul' }),
      event(23, 'goal', 'away', { player: 'Wirtz', assist: 'Frimpong', score: '0-1' }),
      event(31, 'sub', 'home', { playerIn: 'Gnabry', playerOut: 'Sané' }),
      event(38, 'yellow', 'home', { player: 'Upamecano', detail: 'Late challenge' }),
      event(44, 'goal', 'home', { player: 'Olise', assist: 'Musiala', score: '1-1', playerId: 'michael-olise' }),
      event(45, 'ht', 'neutral', { detail: 'Half-time' }),
      event(55, 'goal', 'away', { player: 'Boniface', assist: 'Wirtz', score: '1-2' }),
      event(58, 'sub', 'away', { playerIn: 'Schick', playerOut: 'Adli' }),
      event(62, 'goal', 'home', { player: 'Musiala', assist: 'Olise', score: '2-2', playerId: 'jamal-musiala' }),
      event(67, 'yellow', 'away', { player: 'Xhaka', detail: 'Dissent' }),
      event(71, 'sub', 'home', { playerIn: 'Goretzka', playerOut: 'Pavlović' }),
      event(74, 'sub', 'away', { playerIn: 'Tella', playerOut: 'Frimpong' }),
      event(78, 'goal', 'home', { player: 'Kane', assist: 'Davies', score: '3-2' }),
      event(82, 'yellow', 'away', { player: 'Tah', detail: 'Handball' }),
      event(86, 'sub', 'home', { playerIn: 'Coman', playerOut: 'Olise', playerOutId: 'michael-olise' }),
      event(90, 'ft', 'neutral', { detail: 'Full time · 3-2' }),
    ],
  },

  'barcelona-real-madrid': {
    id: 'barcelona-real-madrid',
    league: 'La Liga',
    leagueCode: 'LAL',
    matchday: 30,
    status: 'live',
    clock: "67'",
    kickoff: '2026-03-22T20:00:00Z',
    home: {
      name: 'FC Barcelona',
      short: 'BAR',
      clubId: 'fc-barcelona',
      score: 2,
      formation: '4-2-3-1',
      manager: 'Hansi Flick',
    },
    away: {
      name: 'Real Madrid',
      short: 'RMA',
      clubId: 'real-madrid',
      score: 1,
      formation: '4-3-3',
      manager: 'Carlo Ancelotti',
    },
    venue: {
      stadium: 'Spotify Camp Nou',
      city: 'Barcelona',
      attendance: 97218,
      capacity: 99354,
    },
    referee: {
      name: 'Jesús Gil Manzano',
      nation: 'ESP',
    },
    scorers: {
      home: [
        { name: 'Yamal', minute: "19'", playerId: 'lamine-yamal' },
        { name: 'Lewandowski', minute: "51'" },
      ],
      away: [{ name: 'Mbappé', minute: "34'" }],
    },
    lineups: {
      home: {
        starting: [
          xi(1, 'ter Stegen', 'GK'),
          xi(3, 'Balde', 'LB'),
          xi(2, 'Cubarsí', 'CB'),
          xi(4, 'Araújo', 'CB', { captain: true }),
          xi(23, 'Koundé', 'RB'),
          xi(17, 'Casadó', 'DM'),
          xi(8, 'Pedri', 'CM'),
          xi(11, 'Raphinha', 'LW'),
          xi(20, 'Olmo', 'AM'),
          xi(10, 'Yamal', 'RW', { playerId: 'lamine-yamal' }),
          xi(9, 'Lewandowski', 'ST'),
        ],
        bench: [
          xi(13, 'Peña', 'GK'),
          xi(5, 'I. Martínez', 'CB'),
          xi(21, 'de Jong', 'CM'),
          xi(6, 'Gavi', 'CM'),
          xi(7, 'F. Torres', 'FW'),
          xi(16, 'Fermín', 'AM'),
          xi(19, 'P. Víctor', 'ST'),
        ],
      },
      away: {
        starting: [
          xi(1, 'Courtois', 'GK'),
          xi(23, 'Mendy', 'LB'),
          xi(22, 'Rüdiger', 'CB'),
          xi(35, 'Asencio', 'CB'),
          xi(2, 'Carvajal', 'RB', { captain: true }),
          xi(14, 'Tchouaméni', 'DM'),
          xi(8, 'Valverde', 'CM'),
          xi(5, 'Bellingham', 'CM'),
          xi(7, 'Vinícius', 'LW', { playerId: 'vinicius-junior' }),
          xi(9, 'Mbappé', 'ST'),
          xi(11, 'Rodrygo', 'RW'),
        ],
        bench: [
          xi(13, 'Lunin', 'GK'),
          xi(4, 'Alaba', 'CB'),
          xi(15, 'Güler', 'AM', { playerId: 'arda-guler' }),
          xi(19, 'Ceballos', 'CM'),
          xi(16, 'Endrick', 'ST'),
          xi(21, 'Díaz', 'FW'),
          xi(18, 'Camavinga', 'CM'),
        ],
      },
    },
    stats: [
      { key: 'possession', label: 'Possession %', home: 61, away: 39, unit: '%', higher: 'home' },
      { key: 'xg', label: 'xG (Expected Goals)', home: 1.92, away: 1.14, unit: '', higher: 'home', decimals: 2 },
      { key: 'shots', label: 'Total Shots', home: 14, away: 8, unit: '', higher: 'home' },
      { key: 'sot', label: 'Shots on Target', home: 6, away: 3, unit: '', higher: 'home' },
      { key: 'freekicks', label: 'Freekicks', home: 12, away: 9, unit: '', higher: 'home' },
      { key: 'corners', label: 'Corners', home: 5, away: 3, unit: '', higher: 'home' },
      { key: 'bigChances', label: 'Big Chances Created', home: 4, away: 2, unit: '', higher: 'home' },
    ],
    events: [
      event(12, 'yellow', 'away', { player: 'Tchouaméni', detail: 'Late tackle' }),
      event(19, 'goal', 'home', { player: 'Yamal', assist: 'Pedri', score: '1-0', playerId: 'lamine-yamal' }),
      event(28, 'yellow', 'home', { player: 'Araújo', detail: 'Foul' }),
      event(34, 'goal', 'away', { player: 'Mbappé', assist: 'Vinícius', score: '1-1', assistId: 'vinicius-junior' }),
      event(41, 'yellow', 'home', { player: 'Casadó', detail: 'Dissent' }),
      event(45, 'ht', 'neutral', { detail: 'Half-time' }),
      event(51, 'goal', 'home', { player: 'Lewandowski', assist: 'Yamal', score: '2-1', assistId: 'lamine-yamal' }),
      event(58, 'sub', 'away', { playerIn: 'Güler', playerOut: 'Rodrygo', playerInId: 'arda-guler' }),
      event(63, 'yellow', 'away', { player: 'Rüdiger', detail: 'Tactical foul' }),
      event(66, 'sub', 'home', { playerIn: 'Gavi', playerOut: 'Casadó' }),
    ],
  },

  'psg-monaco': {
    id: 'psg-monaco',
    league: 'Ligue 1',
    leagueCode: 'LI1',
    matchday: 27,
    status: 'ft',
    clock: null,
    home: {
      name: 'Paris Saint-Germain',
      short: 'PSG',
      clubId: 'psg',
      score: 4,
      formation: '4-3-3',
      manager: 'Luis Enrique',
    },
    away: {
      name: 'AS Monaco',
      short: 'ASM',
      clubId: null,
      score: 0,
      formation: '4-2-3-1',
      manager: 'Adi Hütter',
    },
    venue: {
      stadium: 'Parc des Princes',
      city: 'Paris',
      attendance: 47122,
      capacity: 47929,
    },
    referee: {
      name: 'Clément Turpin',
      nation: 'FRA',
    },
    scorers: {
      home: [
        { name: 'Dembélé', minute: "12'" },
        { name: 'Doué', minute: "33'", playerId: 'desire-doue' },
        { name: 'Ramos', minute: "61'" },
        { name: 'Barcola', minute: "84'" },
      ],
      away: [],
    },
    lineups: {
      home: {
        starting: [
          xi(1, 'Donnarumma', 'GK'),
          xi(25, 'Mendes', 'LB'),
          xi(51, 'Pacho', 'CB'),
          xi(5, 'Marquinhos', 'CB', { captain: true }),
          xi(2, 'Hakimi', 'RB'),
          xi(87, 'Neves', 'CM'),
          xi(17, 'Vitinha', 'CM'),
          xi(14, 'Doué', 'CM', { playerId: 'desire-doue' }),
          xi(7, 'Kvaratskhelia', 'LW'),
          xi(9, 'Ramos', 'ST'),
          xi(10, 'Dembélé', 'RW'),
        ],
        bench: [
          xi(80, 'Tenas', 'GK'),
          xi(8, 'Fabián', 'CM'),
          xi(29, 'Barcola', 'FW'),
          xi(19, 'Lee', 'FW'),
          xi(3, 'Beraldo', 'CB'),
        ],
      },
      away: {
        starting: [
          xi(16, 'Köhn', 'GK'),
          xi(12, 'Caio Henrique', 'LB'),
          xi(5, 'Kehrer', 'CB'),
          xi(22, 'Salisu', 'CB'),
          xi(2, 'Vanderson', 'RB'),
          xi(6, 'Zakaria', 'DM'),
          xi(8, 'Camara', 'DM'),
          xi(18, 'Minamino', 'AM'),
          xi(7, 'Golovin', 'AM', { captain: true }),
          xi(10, 'Ben Seghir', 'AM'),
          xi(9, 'Embolo', 'ST'),
        ],
        bench: [
          xi(1, 'Majecki', 'GK'),
          xi(4, 'Singo', 'CB'),
          xi(11, 'Akliouche', 'AM'),
          xi(14, 'Balogun', 'ST'),
          xi(17, 'Magassa', 'CM'),
        ],
      },
    },
    stats: [
      { key: 'possession', label: 'Possession %', home: 67, away: 33, unit: '%', higher: 'home' },
      { key: 'xg', label: 'xG (Expected Goals)', home: 3.12, away: 0.41, unit: '', higher: 'home', decimals: 2 },
      { key: 'shots', label: 'Total Shots', home: 22, away: 5, unit: '', higher: 'home' },
      { key: 'sot', label: 'Shots on Target', home: 11, away: 1, unit: '', higher: 'home' },
      { key: 'freekicks', label: 'Freekicks', home: 16, away: 8, unit: '', higher: 'home' },
      { key: 'corners', label: 'Corners', home: 9, away: 2, unit: '', higher: 'home' },
      { key: 'bigChances', label: 'Big Chances Created', home: 7, away: 1, unit: '', higher: 'home' },
    ],
    events: [
      event(12, 'goal', 'home', { player: 'Dembélé', assist: 'Hakimi', score: '1-0' }),
      event(21, 'yellow', 'away', { player: 'Zakaria', detail: 'Foul' }),
      event(33, 'goal', 'home', { player: 'Doué', assist: 'Vitinha', score: '2-0', playerId: 'desire-doue' }),
      event(45, 'ht', 'neutral', { detail: 'Half-time' }),
      event(52, 'sub', 'away', { playerIn: 'Balogun', playerOut: 'Embolo' }),
      event(61, 'goal', 'home', { player: 'Ramos', assist: 'Doué', score: '3-0', assistId: 'desire-doue' }),
      event(68, 'yellow', 'away', { player: 'Salisu', detail: 'Tactical foul' }),
      event(72, 'sub', 'home', { playerIn: 'Barcola', playerOut: 'Kvaratskhelia' }),
      event(84, 'goal', 'home', { player: 'Barcola', assist: 'Dembélé', score: '4-0' }),
      event(90, 'ft', 'neutral', { detail: 'Full time · 4-0' }),
    ],
  },
}

/* ------------------------------------------------------------------ */
/*  Lightweight navigable match stubs (homepage + nation fixtures)     */
/* ------------------------------------------------------------------ */

function liteXI(prefix) {
  const slots = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW']
  return slots.map((pos, i) => xi(i + 1, `${prefix} ${pos}`, pos))
}

/**
 * Compact MatchCenter-valid dossier for scores that must deep-link.
 */
export function makeLiteMatch({
  id,
  league,
  leagueCode,
  matchday = 1,
  status = 'ft',
  clock = null,
  kickoff = null,
  home,
  away,
  homeScore = 0,
  awayScore = 0,
  venue,
  referee,
}) {
  const played = status !== 'upcoming'
  const scoreStr = `${homeScore}-${awayScore}`
  return {
    id,
    league,
    leagueCode,
    matchday,
    status,
    clock,
    kickoff,
    home: {
      name: home.name,
      short: home.short,
      clubId: home.clubId ?? null,
      score: played ? homeScore : null,
      formation: home.formation || '4-3-3',
      manager: home.manager || '—',
    },
    away: {
      name: away.name,
      short: away.short,
      clubId: away.clubId ?? null,
      score: played ? awayScore : null,
      formation: away.formation || '4-3-3',
      manager: away.manager || '—',
    },
    venue: venue || {
      stadium: 'Stadium',
      city: '—',
      attendance: played ? 42000 : 0,
      capacity: 50000,
    },
    referee: referee || { name: 'TBD', nation: '—' },
    scorers: {
      home: played && homeScore > 0 ? [{ name: home.short, minute: "1'" }] : [],
      away: played && awayScore > 0 ? [{ name: away.short, minute: "2'" }] : [],
    },
    lineups: {
      home: { starting: liteXI(home.short), bench: [] },
      away: { starting: liteXI(away.short), bench: [] },
    },
    stats: played
      ? [
          { key: 'possession', label: 'Possession %', home: 54, away: 46, unit: '%', higher: 'home' },
          { key: 'xg', label: 'xG (Expected Goals)', home: 1.4, away: 1.1, unit: '', higher: 'home', decimals: 2 },
          { key: 'shots', label: 'Total Shots', home: 12, away: 9, unit: '', higher: 'home' },
          { key: 'sot', label: 'Shots on Target', home: 5, away: 3, unit: '', higher: 'home' },
          { key: 'freekicks', label: 'Freekicks', home: 10, away: 9, unit: '', higher: 'home' },
          { key: 'corners', label: 'Corners', home: 6, away: 4, unit: '', higher: 'home' },
          { key: 'bigChances', label: 'Big Chances Created', home: 3, away: 2, unit: '', higher: 'home' },
        ]
      : [],
    events: played
      ? [
          event(1, 'goal', homeScore >= awayScore ? 'home' : 'away', {
            player: 'Opener',
            score: homeScore >= 1 ? '1-0' : '0-1',
          }),
          event(90, 'ft', 'neutral', { detail: `Full time · ${scoreStr}` }),
        ]
      : [event(0, 'kickoff', 'neutral', { detail: 'Kick-off pending' })],
    catalogStub: true,
  }
}

const MATCH_STUBS = {
  'juventus-inter': makeLiteMatch({
    id: 'juventus-inter',
    league: 'Serie A',
    leagueCode: 'SEA',
    matchday: 29,
    status: 'live',
    clock: "54'",
    home: { name: 'Juventus', short: 'JUV', clubId: 'juventus' },
    away: { name: 'Inter', short: 'INT' },
    homeScore: 1,
    awayScore: 1,
  }),
  'chelsea-arsenal': makeLiteMatch({
    id: 'chelsea-arsenal',
    league: 'Premier League',
    leagueCode: 'PRL',
    matchday: 30,
    status: 'live',
    clock: "23'",
    home: { name: 'Chelsea', short: 'CHE' },
    away: { name: 'Arsenal', short: 'ARS' },
    homeScore: 0,
    awayScore: 0,
  }),
  'atletico-sevilla': makeLiteMatch({
    id: 'atletico-sevilla',
    league: 'La Liga',
    leagueCode: 'LAL',
    matchday: 30,
    status: 'upcoming',
    kickoff: '21:00',
    home: { name: 'Atlético Madrid', short: 'ATM' },
    away: { name: 'Sevilla', short: 'SEV' },
    homeScore: 0,
    awayScore: 0,
  }),
  'liverpool-man-city': makeLiteMatch({
    id: 'liverpool-man-city',
    league: 'Premier League',
    leagueCode: 'PRL',
    matchday: 30,
    status: 'upcoming',
    kickoff: '21:00',
    home: { name: 'Liverpool', short: 'LIV' },
    away: { name: 'Man City', short: 'MCI' },
    homeScore: 0,
    awayScore: 0,
  }),
  /* Nation / international fixture deep-links */
  'france-netherlands': makeLiteMatch({
    id: 'france-netherlands',
    league: 'International Friendly',
    leagueCode: 'INT',
    status: 'ft',
    home: { name: 'France', short: 'FRA' },
    away: { name: 'Netherlands', short: 'NED' },
    homeScore: 2,
    awayScore: 1,
    venue: { stadium: 'Stade de France', city: 'Saint-Denis', attendance: 78000, capacity: 81338 },
    referee: { name: 'M. Oliver', nation: 'ENG' },
  }),
  'italy-france': makeLiteMatch({
    id: 'italy-france',
    league: 'UEFA Nations League',
    leagueCode: 'UNL',
    status: 'ft',
    home: { name: 'Italy', short: 'ITA' },
    away: { name: 'France', short: 'FRA' },
    homeScore: 1,
    awayScore: 3,
    venue: { stadium: 'San Siro', city: 'Milan', attendance: 72000, capacity: 75923 },
  }),
  'france-israel': makeLiteMatch({
    id: 'france-israel',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'France', short: 'FRA' },
    away: { name: 'Israel', short: 'ISR' },
    homeScore: 4,
    awayScore: 0,
  }),
  'france-ukraine': makeLiteMatch({
    id: 'france-ukraine',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'France', short: 'FRA' },
    away: { name: 'Ukraine', short: 'UKR' },
    homeScore: 3,
    awayScore: 1,
  }),
  'turkiye-hungary': makeLiteMatch({
    id: 'turkiye-hungary',
    league: 'International Friendly',
    leagueCode: 'INT',
    status: 'ft',
    home: { name: 'Türkiye', short: 'TUR' },
    away: { name: 'Hungary', short: 'HUN' },
    homeScore: 2,
    awayScore: 0,
  }),
  'wales-turkiye': makeLiteMatch({
    id: 'wales-turkiye',
    league: 'UEFA Nations League',
    leagueCode: 'UNL',
    status: 'ft',
    home: { name: 'Wales', short: 'WAL' },
    away: { name: 'Türkiye', short: 'TUR' },
    homeScore: 0,
    awayScore: 2,
  }),
  'turkiye-iceland': makeLiteMatch({
    id: 'turkiye-iceland',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Türkiye', short: 'TUR' },
    away: { name: 'Iceland', short: 'ISL' },
    homeScore: 3,
    awayScore: 1,
  }),
  'turkiye-montenegro': makeLiteMatch({
    id: 'turkiye-montenegro',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Türkiye', short: 'TUR' },
    away: { name: 'Montenegro', short: 'MNE' },
    homeScore: 1,
    awayScore: 0,
  }),
  'brazil-colombia': makeLiteMatch({
    id: 'brazil-colombia',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Brazil', short: 'BRA' },
    away: { name: 'Colombia', short: 'COL' },
    homeScore: 2,
    awayScore: 1,
  }),
  'argentina-brazil': makeLiteMatch({
    id: 'argentina-brazil',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Argentina', short: 'ARG' },
    away: { name: 'Brazil', short: 'BRA' },
    homeScore: 1,
    awayScore: 0,
  }),
  'brazil-peru': makeLiteMatch({
    id: 'brazil-peru',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Brazil', short: 'BRA' },
    away: { name: 'Peru', short: 'PER' },
    homeScore: 3,
    awayScore: 0,
  }),
  'chile-brazil': makeLiteMatch({
    id: 'chile-brazil',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Chile', short: 'CHI' },
    away: { name: 'Brazil', short: 'BRA' },
    homeScore: 0,
    awayScore: 2,
  }),
  'spain-denmark': makeLiteMatch({
    id: 'spain-denmark',
    league: 'UEFA Nations League',
    leagueCode: 'UNL',
    status: 'ft',
    home: { name: 'Spain', short: 'ESP' },
    away: { name: 'Denmark', short: 'DEN' },
    homeScore: 2,
    awayScore: 0,
  }),
  'spain-serbia': makeLiteMatch({
    id: 'spain-serbia',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Spain', short: 'ESP' },
    away: { name: 'Serbia', short: 'SRB' },
    homeScore: 3,
    awayScore: 0,
  }),
  'georgia-spain': makeLiteMatch({
    id: 'georgia-spain',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Georgia', short: 'GEO' },
    away: { name: 'Spain', short: 'ESP' },
    homeScore: 0,
    awayScore: 2,
  }),
  'germany-italy': makeLiteMatch({
    id: 'germany-italy',
    league: 'International Friendly',
    leagueCode: 'INT',
    status: 'ft',
    home: { name: 'Germany', short: 'GER' },
    away: { name: 'Italy', short: 'ITA' },
    homeScore: 1,
    awayScore: 1,
  }),
  'germany-netherlands': makeLiteMatch({
    id: 'germany-netherlands',
    league: 'UEFA Nations League',
    leagueCode: 'UNL',
    status: 'ft',
    home: { name: 'Germany', short: 'GER' },
    away: { name: 'Netherlands', short: 'NED' },
    homeScore: 2,
    awayScore: 1,
  }),
  'germany-n-ireland': makeLiteMatch({
    id: 'germany-n-ireland',
    league: 'WC Qualifier',
    leagueCode: 'WCQ',
    status: 'ft',
    home: { name: 'Germany', short: 'GER' },
    away: { name: 'N. Ireland', short: 'NIR' },
    homeScore: 4,
    awayScore: 0,
  }),
}

Object.assign(MATCHES_DETAIL, MATCH_STUBS)

/** Homepage code pairs → MatchCenter ids */
export const HOME_MATCH_IDS = {
  'BAR-RMA': 'barcelona-real-madrid',
  'JUV-INT': 'juventus-inter',
  'CHE-ARS': 'chelsea-arsenal',
  'FCB-B04': 'bayern-leverkusen',
  'PSG-ASM': 'psg-monaco',
  'ATM-SEV': 'atletico-sevilla',
  'LIV-MCI': 'liverpool-man-city',
}

/** Matches involving a club profile (by clubId or short code) */
export function matchesForClub(club) {
  if (!club) return []
  return Object.values(MATCHES_DETAIL).filter(
    (m) =>
      m.home.clubId === club.id ||
      m.away.clubId === club.id ||
      m.home.short === club.short ||
      m.away.short === club.short,
  )
}

/** Matches tagged to a competition */
export function matchesForLeague(league) {
  if (!league) return []
  return Object.values(MATCHES_DETAIL).filter(
    (m) =>
      m.leagueCode === league.code ||
      m.league === league.name ||
      m.league === league.fullName,
  )
}
