/**
 * Supabase-backed loaders — same shapes dataLayer expects after normalize*.
 * Falls back is handled by dataLayer when mode is mock or fetch fails.
 */
import { supabase } from './supabase.js'

function snakeToCamelPlayer(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    pos: row.pos,
    posGroup: row.pos_group,
    foot: row.foot,
    club: row.club,
    clubId: row.club_id,
    clubShort: row.club_short,
    nation: row.nation,
    value: row.value,
    form: row.form,
    goals: row.goals,
    assists: row.assists,
    contractUntil: row.contract_until,
    status: row.status,
    loan: row.loan,
    height: row.height,
    agent: row.agent,
    joined: row.joined,
    outfitter: row.outfitter,
    seasonStats: row.season_stats,
    smv: row.smv,
    valueHistory: row.value_history,
    transfers: row.transfers,
    positions: row.positions,
    externalIds: row.external_ids,
  }
}

function snakeToCamelClub(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    league: row.league,
    leagueCode: row.league_code,
    leagueId: row.league_id,
    country: row.country,
    founded: row.founded,
    squadSize: row.squad_size,
    avgAge: row.avg_age,
    foreignersPct: row.foreigners_pct,
    squadValue: row.squad_value,
    stadium: row.stadium,
    formation: row.formation,
    manager: row.manager,
    squad: row.squad,
    startingXI: row.starting_xi,
    standings: row.standings,
    transfers: row.transfers,
    lastResults: row.last_results,
    nextFixtures: row.next_fixtures,
    externalIds: row.external_ids,
  }
}

function snakeToCamelLeague(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    code: row.code,
    country: row.country,
    confederation: row.confederation,
    teams: row.teams,
    players: row.players,
    foreignersPct: row.foreigners_pct,
    avgAge: row.avg_age,
    totalValue: row.total_value,
    seasonId: row.season_id,
    zones: row.zones,
    standings: row.standings,
    allTime: row.all_time,
    leaders: row.leaders,
    bestXi: row.best_xi,
  }
}

function snakeToCamelNation(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    confederation: row.confederation,
    fifaRank: row.fifa_rank,
    squadValue: row.squad_value,
    association: row.association,
    stadium: row.stadium,
    coach: row.coach,
    colors: row.colors,
    squad: row.squad,
    fixtures: row.fixtures,
    trophies: row.trophies,
    legends: row.legends,
    rankingHistory: row.ranking_history,
    externalIds: row.external_ids,
  }
}

function snakeToCamelManager(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    nation: row.nation,
    club: row.club,
    clubId: row.club_id,
    clubCode: row.club_code,
    employed: row.employed,
    formation: row.formation,
    formationLabel: row.formation_label,
    matches: row.matches,
    winPct: row.win_pct,
    ppg: row.ppg,
    contractUntil: row.contract_until,
    licence: row.licence,
    style: row.style,
    career: row.career,
    talents: row.talents,
    metrics: row.metrics,
    externalIds: row.external_ids,
  }
}

function snakeToCamelMatch(row) {
  if (!row) return null
  return {
    id: row.id,
    seasonId: row.season_id,
    league: row.league,
    leagueCode: row.league_code,
    leagueId: row.league_id,
    status: row.status,
    kickoff: row.kickoff,
    clock: row.clock,
    md: row.md,
    attendance: row.attendance,
    referee: row.referee,
    home: row.home,
    away: row.away,
    stats: row.stats,
    events: row.events,
    momentum: row.momentum,
    externalIds: row.external_ids,
  }
}

function toRecord(rows, mapFn) {
  const out = {}
  for (const row of rows || []) {
    const m = mapFn(row)
    if (m?.id) out[m.id] = m
  }
  return out
}

export async function fetchSupabaseBundle() {
  if (!supabase) throw new Error('Supabase not configured')

  const [
    playersRes,
    detailsRes,
    clubsRes,
    leaguesRes,
    nationsRes,
    managersRes,
    matchesRes,
  ] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('player_details').select('*'),
    supabase.from('clubs').select('*'),
    supabase.from('leagues').select('*'),
    supabase.from('nations').select('*'),
    supabase.from('managers').select('*'),
    supabase.from('matches').select('*'),
  ])

  for (const res of [
    playersRes,
    detailsRes,
    clubsRes,
    leaguesRes,
    nationsRes,
    managersRes,
    matchesRes,
  ]) {
    if (res.error) throw res.error
  }

  const details = {}
  for (const d of detailsRes.data || []) {
    details[d.player_id] = {
      competitions: d.competitions,
      career: d.career,
      injuries: d.injuries,
      nationalTeam: d.national_team,
      smart: d.smart,
      trophies: d.trophies,
    }
  }

  return {
    players: toRecord(playersRes.data, snakeToCamelPlayer),
    details,
    clubs: toRecord(clubsRes.data, snakeToCamelClub),
    leagues: toRecord(leaguesRes.data, snakeToCamelLeague),
    nations: toRecord(nationsRes.data, snakeToCamelNation),
    managers: toRecord(managersRes.data, snakeToCamelManager),
    matches: toRecord(matchesRes.data, snakeToCamelMatch),
  }
}
