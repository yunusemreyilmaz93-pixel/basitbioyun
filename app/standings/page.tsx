'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Trophy,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { SUPER_LIG_TEAMS } from '@/lib/utils'

interface TeamStanding {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
}

// Demo veri (Backend bağlandığında gerçek veri gelecek)
const DEMO_STANDINGS: TeamStanding[] = [
  { position: 1, team: 'Galatasaray', played: 20, won: 15, drawn: 3, lost: 2, goalsFor: 45, goalsAgainst: 15, goalDifference: 30, points: 48, form: ['W', 'W', 'D', 'W', 'W'] },
  { position: 2, team: 'Fenerbahçe', played: 20, won: 14, drawn: 4, lost: 2, goalsFor: 42, goalsAgainst: 14, goalDifference: 28, points: 46, form: ['W', 'D', 'W', 'W', 'D'] },
  { position: 3, team: 'Beşiktaş', played: 20, won: 11, drawn: 5, lost: 4, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 38, form: ['L', 'W', 'W', 'D', 'W'] },
  { position: 4, team: 'Trabzonspor', played: 20, won: 10, drawn: 5, lost: 5, goalsFor: 30, goalsAgainst: 22, goalDifference: 8, points: 35, form: ['W', 'L', 'D', 'W', 'L'] },
  { position: 5, team: 'Başakşehir', played: 20, won: 9, drawn: 6, lost: 5, goalsFor: 28, goalsAgainst: 20, goalDifference: 8, points: 33, form: ['D', 'W', 'W', 'L', 'D'] },
  { position: 6, team: 'Antalyaspor', played: 20, won: 8, drawn: 7, lost: 5, goalsFor: 25, goalsAgainst: 22, goalDifference: 3, points: 31, form: ['W', 'D', 'D', 'L', 'W'] },
  { position: 7, team: 'Konyaspor', played: 20, won: 8, drawn: 5, lost: 7, goalsFor: 24, goalsAgainst: 25, goalDifference: -1, points: 29, form: ['L', 'W', 'D', 'W', 'L'] },
  { position: 8, team: 'Alanyaspor', played: 20, won: 7, drawn: 7, lost: 6, goalsFor: 26, goalsAgainst: 24, goalDifference: 2, points: 28, form: ['D', 'D', 'W', 'L', 'W'] },
]

const LEAGUES = [
  { id: 'super_lig', name: 'Süper Lig', flag: '🇹🇷' },
  { id: 'champions_league', name: 'Şampiyonlar Ligi', flag: '🏆' },
  { id: 'europa_league', name: 'Avrupa Ligi', flag: '🏆' },
  { id: 'premier_league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'la_liga', name: 'La Liga', flag: '🇪🇸' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function StandingsPage() {
  const [selectedLeague, setSelectedLeague] = useState('super_lig')
  const [standings, setStandings] = useState<TeamStanding[]>(DEMO_STANDINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStandings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/standings/${selectedLeague}`)
      if (response.ok) {
        const data = await response.json()
        // API'den gelen veriyi dönüştür
        if (data.standings && data.standings.length > 0) {
          setStandings(data.standings.map((s: any, i: number) => ({
            position: i + 1,
            team: s.team || s.Squad || 'Bilinmiyor',
            played: s.MP || s.played || 0,
            won: s.W || s.won || 0,
            drawn: s.D || s.drawn || 0,
            lost: s.L || s.lost || 0,
            goalsFor: s.GF || s.goalsFor || 0,
            goalsAgainst: s.GA || s.goalsAgainst || 0,
            goalDifference: s.GD || s.goalDifference || 0,
            points: s.Pts || s.points || 0,
            form: []
          })))
        }
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.log('API bağlantısı yok, demo veri kullanılıyor')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [selectedLeague])

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">G</div>
      case 'D':
        return <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">B</div>
      case 'L':
        return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">M</div>
      default:
        return null
    }
  }

  const getTeamColors = (teamName: string) => {
    const team = SUPER_LIG_TEAMS.find(t =>
      teamName.toLowerCase().includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(teamName.toLowerCase())
    )
    return team?.colors || { primary: '#6366F1', secondary: '#FFFFFF' }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-semibold text-white">Puan Durumu</span>
              </div>
            </div>

            <button
              onClick={fetchStandings}
              disabled={isLoading}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Güncelle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* League Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLeague === league.id
                  ? 'bg-primary text-white'
                  : 'bg-background-card text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span>{league.flag}</span>
              <span>{league.name}</span>
            </button>
          ))}
        </div>

        {/* Standings Table */}
        <div className="bg-background-card rounded-2xl border border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Takım</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">O</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">G</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">B</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">M</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">A</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Y</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">AV</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">P</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => {
                    const colors = getTeamColors(team.team)
                    return (
                      <tr
                        key={team.team}
                        className={`border-b border-gray-800/50 hover:bg-background-hover transition-colors ${
                          index < 4 ? 'bg-green-500/5' : index >= standings.length - 3 ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <span className={`text-sm font-bold ${
                            index < 4 ? 'text-green-400' : index >= standings.length - 3 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {team.position}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border-2"
                              style={{
                                background: `linear-gradient(135deg, ${colors.primary} 50%, ${colors.secondary} 50%)`,
                                borderColor: colors.primary
                              }}
                            />
                            <span className="text-sm font-medium text-white">{team.team}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-300">{team.played}</td>
                        <td className="px-4 py-4 text-center text-sm text-green-400 font-medium">{team.won}</td>
                        <td className="px-4 py-4 text-center text-sm text-yellow-400">{team.drawn}</td>
                        <td className="px-4 py-4 text-center text-sm text-red-400">{team.lost}</td>
                        <td className="px-4 py-4 text-center text-sm text-gray-300">{team.goalsFor}</td>
                        <td className="px-4 py-4 text-center text-sm text-gray-300">{team.goalsAgainst}</td>
                        <td className="px-4 py-4 text-center text-sm">
                          <span className={team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}>
                            {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-lg font-bold text-white">{team.points}</span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1 justify-center">
                            {team.form.map((result, i) => (
                              <div key={i}>{getFormIcon(result)}</div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/30" />
            <span>Şampiyonlar Ligi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/30" />
            <span>Küme Düşme</span>
          </div>
          {lastUpdated && (
            <div className="ml-auto">
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
