"""
Futbol AI Asistan - Python Backend
soccerdata entegrasyonu ile futbol verileri API'si
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import soccerdata as sd
import pandas as pd
from datetime import datetime, timedelta
from cachetools import TTLCache
import os
from dotenv import load_dotenv

# AI asistan modülü
from ai_assistant import (
    chat_with_grok,
    analyze_match,
    compare_players,
    generate_video_script,
    predict_match
)

# API-Football modülü
from api_football import (
    get_live_matches,
    get_standings as apif_get_standings,
    get_fixtures as apif_get_fixtures,
    get_head_to_head as apif_get_h2h,
    get_team_statistics,
    get_top_scorers as apif_get_scorers,
    get_top_assists,
    get_today_matches,
    get_team_next_match,
    get_team_last_matches,
    get_fixture_statistics,
    get_fixture_lineups,
    get_fixture_events,
    get_predictions,
    search_team,
    search_player,
    LEAGUE_IDS,
    TURKISH_TEAMS,
    get_league_id,
    get_team_id,
)

load_dotenv()


# Request modelleri
class ChatRequest(BaseModel):
    message: str
    context: Optional[List[Dict[str, str]]] = None

class MatchAnalysisRequest(BaseModel):
    home_team: str
    away_team: str
    include_stats: bool = True

class PlayerCompareRequest(BaseModel):
    player1: str
    player2: str
    league: Optional[str] = None

class VideoScriptRequest(BaseModel):
    topic: str
    duration_minutes: int = 10
    style: str = "analiz"

class MatchPredictionRequest(BaseModel):
    home_team: str
    away_team: str
    league: str = "super_lig"

app = FastAPI(
    title="Futbol AI Asistan API",
    description="Süper Lig, Şampiyonlar Ligi ve Avrupa Ligi verileri",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da spesifik domain yaz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache (1 saat TTL)
cache = TTLCache(maxsize=100, ttl=3600)

# Desteklenen ligler
LEAGUES = {
    "super_lig": "TUR-Süper Lig",
    "premier_league": "ENG-Premier League",
    "la_liga": "ESP-La Liga",
    "bundesliga": "GER-Bundesliga",
    "serie_a": "ITA-Serie A",
    "ligue_1": "FRA-Ligue 1",
    "champions_league": "INT-Champions League",
    "europa_league": "INT-Europa League",
}

# Mevcut sezon
CURRENT_SEASON = "2425"


def get_fbref_scraper(leagues: List[str], seasons: List[str] = None):
    """FBref scraper oluştur"""
    if seasons is None:
        seasons = [CURRENT_SEASON]
    return sd.FBref(leagues=leagues, seasons=seasons)


@app.get("/")
async def root():
    """API durum kontrolü"""
    return {
        "status": "active",
        "message": "Futbol AI Asistan API",
        "version": "1.0.0",
        "endpoints": [
            "/leagues",
            "/standings/{league}",
            "/fixtures/{league}",
            "/team/{team_name}/stats",
            "/match/{match_id}",
            "/player/{player_name}/stats",
            "/head-to-head",
        ]
    }


@app.get("/leagues")
async def get_leagues():
    """Desteklenen ligleri listele"""
    return {
        "leagues": [
            {"id": "super_lig", "name": "Süper Lig", "country": "Türkiye"},
            {"id": "premier_league", "name": "Premier League", "country": "İngiltere"},
            {"id": "la_liga", "name": "La Liga", "country": "İspanya"},
            {"id": "bundesliga", "name": "Bundesliga", "country": "Almanya"},
            {"id": "serie_a", "name": "Serie A", "country": "İtalya"},
            {"id": "ligue_1", "name": "Ligue 1", "country": "Fransa"},
            {"id": "champions_league", "name": "Şampiyonlar Ligi", "country": "UEFA"},
            {"id": "europa_league", "name": "Avrupa Ligi", "country": "UEFA"},
        ]
    }


@app.get("/standings/{league}")
async def get_standings(league: str, season: str = CURRENT_SEASON):
    """Lig puan durumunu getir"""
    cache_key = f"standings_{league}_{season}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        fbref = get_fbref_scraper([LEAGUES[league]], [season])
        standings = fbref.read_league_table()

        # DataFrame'i JSON'a çevir
        result = standings.reset_index().to_dict(orient="records")

        response = {
            "league": league,
            "season": season,
            "standings": result,
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/fixtures/{league}")
async def get_fixtures(league: str, season: str = CURRENT_SEASON):
    """Lig fikstürünü getir"""
    cache_key = f"fixtures_{league}_{season}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        fbref = get_fbref_scraper([LEAGUES[league]], [season])
        schedule = fbref.read_schedule()

        # DataFrame'i JSON'a çevir
        schedule_reset = schedule.reset_index()
        result = schedule_reset.to_dict(orient="records")

        response = {
            "league": league,
            "season": season,
            "fixtures": result,
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/team/{team_name}/stats")
async def get_team_stats(
    team_name: str,
    league: str = Query(default="super_lig"),
    season: str = Query(default=CURRENT_SEASON),
    stat_type: str = Query(default="standard")
):
    """Takım istatistiklerini getir"""
    cache_key = f"team_{team_name}_{league}_{season}_{stat_type}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        fbref = get_fbref_scraper([LEAGUES[league]], [season])

        # Takım sezon istatistikleri
        team_stats = fbref.read_team_season_stats(stat_type=stat_type)

        # Belirli takımı filtrele
        team_data = team_stats[team_stats.index.get_level_values('team').str.contains(team_name, case=False)]

        if team_data.empty:
            raise HTTPException(status_code=404, detail=f"Takım bulunamadı: {team_name}")

        result = team_data.reset_index().to_dict(orient="records")

        response = {
            "team": team_name,
            "league": league,
            "season": season,
            "stat_type": stat_type,
            "stats": result,
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/team/{team_name}/players")
async def get_team_players(
    team_name: str,
    league: str = Query(default="super_lig"),
    season: str = Query(default=CURRENT_SEASON)
):
    """Takım kadrosunu ve oyuncu istatistiklerini getir"""
    cache_key = f"players_{team_name}_{league}_{season}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        fbref = get_fbref_scraper([LEAGUES[league]], [season])

        # Oyuncu istatistikleri
        player_stats = fbref.read_player_season_stats(stat_type="standard")

        # Takıma göre filtrele
        team_players = player_stats[
            player_stats.index.get_level_values('team').str.contains(team_name, case=False)
        ]

        result = team_players.reset_index().to_dict(orient="records")

        response = {
            "team": team_name,
            "league": league,
            "season": season,
            "players": result,
            "player_count": len(result),
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/player/{player_name}/stats")
async def get_player_stats(
    player_name: str,
    league: str = Query(default=None),
    season: str = Query(default=CURRENT_SEASON)
):
    """Oyuncu istatistiklerini getir"""
    cache_key = f"player_{player_name}_{league}_{season}"

    if cache_key in cache:
        return cache[cache_key]

    try:
        leagues_to_search = [LEAGUES[league]] if league and league in LEAGUES else list(LEAGUES.values())[:5]
        fbref = get_fbref_scraper(leagues_to_search, [season])

        # Oyuncu istatistikleri
        player_stats = fbref.read_player_season_stats(stat_type="standard")

        # Oyuncuyu bul
        player_data = player_stats[
            player_stats.index.get_level_values('player').str.contains(player_name, case=False)
        ]

        if player_data.empty:
            raise HTTPException(status_code=404, detail=f"Oyuncu bulunamadı: {player_name}")

        result = player_data.reset_index().to_dict(orient="records")

        response = {
            "player": player_name,
            "season": season,
            "stats": result,
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/head-to-head")
async def get_head_to_head(
    team1: str = Query(..., description="Birinci takım"),
    team2: str = Query(..., description="İkinci takım"),
    league: str = Query(default="super_lig"),
    seasons: str = Query(default="2425,2324,2223", description="Virgülle ayrılmış sezonlar")
):
    """İki takım arasındaki geçmiş maçları getir"""
    cache_key = f"h2h_{team1}_{team2}_{league}_{seasons}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        season_list = seasons.split(",")
        fbref = get_fbref_scraper([LEAGUES[league]], season_list)

        # Tüm maçları al
        schedule = fbref.read_schedule()
        schedule_reset = schedule.reset_index()

        # İki takım arasındaki maçları filtrele
        h2h_matches = schedule_reset[
            ((schedule_reset['home_team'].str.contains(team1, case=False)) &
             (schedule_reset['away_team'].str.contains(team2, case=False))) |
            ((schedule_reset['home_team'].str.contains(team2, case=False)) &
             (schedule_reset['away_team'].str.contains(team1, case=False)))
        ]

        result = h2h_matches.to_dict(orient="records")

        # İstatistik özeti
        team1_wins = 0
        team2_wins = 0
        draws = 0

        for match in result:
            home_score = match.get('home_score', 0) or 0
            away_score = match.get('away_score', 0) or 0
            home_team = match.get('home_team', '')

            if home_score > away_score:
                if team1.lower() in home_team.lower():
                    team1_wins += 1
                else:
                    team2_wins += 1
            elif away_score > home_score:
                if team1.lower() in home_team.lower():
                    team2_wins += 1
                else:
                    team1_wins += 1
            else:
                draws += 1

        response = {
            "team1": team1,
            "team2": team2,
            "matches": result,
            "summary": {
                "total_matches": len(result),
                "team1_wins": team1_wins,
                "team2_wins": team2_wins,
                "draws": draws
            },
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/top-scorers/{league}")
async def get_top_scorers(
    league: str,
    season: str = Query(default=CURRENT_SEASON),
    limit: int = Query(default=20)
):
    """Gol krallığı listesi"""
    cache_key = f"scorers_{league}_{season}"

    if cache_key in cache:
        return cache[cache_key]

    if league not in LEAGUES:
        raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

    try:
        fbref = get_fbref_scraper([LEAGUES[league]], [season])

        # Oyuncu istatistikleri
        player_stats = fbref.read_player_season_stats(stat_type="standard")
        player_stats_reset = player_stats.reset_index()

        # Gole göre sırala
        if 'Gls' in player_stats_reset.columns:
            top_scorers = player_stats_reset.nlargest(limit, 'Gls')
        elif 'goals' in player_stats_reset.columns:
            top_scorers = player_stats_reset.nlargest(limit, 'goals')
        else:
            raise HTTPException(status_code=500, detail="Gol kolonu bulunamadı")

        result = top_scorers.to_dict(orient="records")

        response = {
            "league": league,
            "season": season,
            "top_scorers": result,
            "updated_at": datetime.now().isoformat()
        }

        cache[cache_key] = response
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# AI ASİSTAN ENDPOİNT'LERİ
# ============================================

@app.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """AI asistan ile sohbet"""
    try:
        response = await chat_with_grok(
            message=request.message,
            context=request.context
        )
        return {
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze-match")
async def ai_analyze_match(request: MatchAnalysisRequest):
    """AI ile maç analizi"""
    try:
        # İstatistikleri çek (opsiyonel)
        team_stats = None
        if request.include_stats:
            try:
                fbref = get_fbref_scraper(list(LEAGUES.values())[:3], [CURRENT_SEASON])
                stats = fbref.read_team_season_stats(stat_type="standard")
                stats_reset = stats.reset_index()

                home_stats = stats_reset[
                    stats_reset['team'].str.contains(request.home_team, case=False)
                ].to_dict(orient="records")

                away_stats = stats_reset[
                    stats_reset['team'].str.contains(request.away_team, case=False)
                ].to_dict(orient="records")

                team_stats = {
                    "home": home_stats,
                    "away": away_stats
                }
            except:
                pass

        analysis = await analyze_match(
            home_team=request.home_team,
            away_team=request.away_team,
            team_stats=team_stats
        )

        return {
            "home_team": request.home_team,
            "away_team": request.away_team,
            "analysis": analysis,
            "stats_included": team_stats is not None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/compare-players")
async def ai_compare_players(request: PlayerCompareRequest):
    """AI ile oyuncu karşılaştırması"""
    try:
        # Oyuncu istatistiklerini çek
        player1_stats = None
        player2_stats = None

        try:
            leagues = [LEAGUES[request.league]] if request.league and request.league in LEAGUES else list(LEAGUES.values())[:3]
            fbref = get_fbref_scraper(leagues, [CURRENT_SEASON])
            stats = fbref.read_player_season_stats(stat_type="standard")
            stats_reset = stats.reset_index()

            p1_data = stats_reset[
                stats_reset['player'].str.contains(request.player1, case=False)
            ]
            if not p1_data.empty:
                player1_stats = p1_data.to_dict(orient="records")

            p2_data = stats_reset[
                stats_reset['player'].str.contains(request.player2, case=False)
            ]
            if not p2_data.empty:
                player2_stats = p2_data.to_dict(orient="records")
        except:
            pass

        comparison = await compare_players(
            player1=request.player1,
            player2=request.player2,
            player1_stats=player1_stats,
            player2_stats=player2_stats
        )

        return {
            "player1": request.player1,
            "player2": request.player2,
            "comparison": comparison,
            "stats_included": player1_stats is not None or player2_stats is not None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/video-script")
async def ai_video_script(request: VideoScriptRequest):
    """YouTube video scripti oluştur"""
    try:
        script = await generate_video_script(
            topic=request.topic,
            duration_minutes=request.duration_minutes,
            style=request.style
        )

        return {
            "topic": request.topic,
            "duration": f"{request.duration_minutes} dakika",
            "style": request.style,
            "script": script,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/predict-match")
async def ai_predict_match(request: MatchPredictionRequest):
    """Maç tahmini yap"""
    try:
        # Head-to-head verileri çek
        h2h_data = None
        try:
            if request.league in LEAGUES:
                fbref = get_fbref_scraper([LEAGUES[request.league]], ["2425", "2324", "2223"])
                schedule = fbref.read_schedule()
                schedule_reset = schedule.reset_index()

                h2h = schedule_reset[
                    ((schedule_reset['home_team'].str.contains(request.home_team, case=False)) &
                     (schedule_reset['away_team'].str.contains(request.away_team, case=False))) |
                    ((schedule_reset['home_team'].str.contains(request.away_team, case=False)) &
                     (schedule_reset['away_team'].str.contains(request.home_team, case=False)))
                ]

                if not h2h.empty:
                    h2h_data = h2h.to_dict(orient="records")
        except:
            pass

        prediction = await predict_match(
            home_team=request.home_team,
            away_team=request.away_team,
            h2h_data=h2h_data
        )

        return {
            "home_team": request.home_team,
            "away_team": request.away_team,
            "prediction": prediction,
            "h2h_included": h2h_data is not None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# API-FOOTBALL ENDPOİNT'LERİ (Canlı Veriler)
# ============================================

@app.get("/live/matches")
async def live_matches(league: Optional[str] = None):
    """Canlı maçları getir"""
    try:
        league_id = get_league_id(league) if league else None
        data = await get_live_matches(league_id)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "matches": data.get("response", []),
            "count": data.get("results", 0),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/standings/{league}")
async def live_standings(league: str, season: int = 2024):
    """API-Football'dan canlı puan durumu"""
    try:
        league_id = get_league_id(league)
        if not league_id:
            raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

        data = await apif_get_standings(league_id, season)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        standings = []
        if data.get("response") and len(data["response"]) > 0:
            league_data = data["response"][0].get("league", {})
            standings_data = league_data.get("standings", [[]])[0]
            standings = standings_data

        return {
            "league": league,
            "season": season,
            "standings": standings,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/fixtures/{league}")
async def live_fixtures(
    league: str,
    season: int = 2024,
    next: Optional[int] = None,
    last: Optional[int] = None
):
    """API-Football'dan fikstür"""
    try:
        league_id = get_league_id(league)
        if not league_id:
            raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

        data = await apif_get_fixtures(league_id, season, next, last)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "league": league,
            "season": season,
            "fixtures": data.get("response", []),
            "count": data.get("results", 0),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/today")
async def today_matches(league: Optional[str] = None):
    """Bugünün maçlarını getir"""
    try:
        league_id = get_league_id(league) if league else None
        data = await get_today_matches(league_id)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "matches": data.get("response", []),
            "count": data.get("results", 0),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/team/{team_name}/stats")
async def live_team_stats(team_name: str, league: str = "super_lig", season: int = 2024):
    """Takım istatistiklerini getir (API-Football)"""
    try:
        team_id = get_team_id(team_name)
        league_id = get_league_id(league)

        if not team_id:
            # Takım bulunamadıysa arama yap
            search_result = await search_team(team_name)
            if search_result.get("response"):
                team_id = search_result["response"][0]["team"]["id"]
            else:
                raise HTTPException(status_code=404, detail=f"Takım bulunamadı: {team_name}")

        if not league_id:
            raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

        data = await get_team_statistics(team_id, league_id, season)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "team": team_name,
            "league": league,
            "season": season,
            "statistics": data.get("response", {}),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/team/{team_name}/next")
async def team_next_match(team_name: str):
    """Takımın bir sonraki maçını getir"""
    try:
        team_id = get_team_id(team_name)

        if not team_id:
            search_result = await search_team(team_name)
            if search_result.get("response"):
                team_id = search_result["response"][0]["team"]["id"]
            else:
                raise HTTPException(status_code=404, detail=f"Takım bulunamadı: {team_name}")

        data = await get_team_next_match(team_id)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "team": team_name,
            "next_match": data.get("response", [{}])[0] if data.get("response") else None,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/team/{team_name}/last")
async def team_last_matches(team_name: str, count: int = 5):
    """Takımın son maçlarını getir"""
    try:
        team_id = get_team_id(team_name)

        if not team_id:
            search_result = await search_team(team_name)
            if search_result.get("response"):
                team_id = search_result["response"][0]["team"]["id"]
            else:
                raise HTTPException(status_code=404, detail=f"Takım bulunamadı: {team_name}")

        data = await get_team_last_matches(team_id, count)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "team": team_name,
            "matches": data.get("response", []),
            "count": len(data.get("response", [])),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/h2h")
async def live_head_to_head(
    team1: str = Query(..., description="Birinci takım"),
    team2: str = Query(..., description="İkinci takım"),
    last: int = 10
):
    """İki takım arasındaki son maçlar (API-Football)"""
    try:
        team1_id = get_team_id(team1)
        team2_id = get_team_id(team2)

        if not team1_id:
            search_result = await search_team(team1)
            if search_result.get("response"):
                team1_id = search_result["response"][0]["team"]["id"]

        if not team2_id:
            search_result = await search_team(team2)
            if search_result.get("response"):
                team2_id = search_result["response"][0]["team"]["id"]

        if not team1_id or not team2_id:
            raise HTTPException(status_code=404, detail="Takımlardan biri bulunamadı")

        data = await apif_get_h2h(team1_id, team2_id, last)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "team1": team1,
            "team2": team2,
            "matches": data.get("response", []),
            "count": len(data.get("response", [])),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/scorers/{league}")
async def live_top_scorers(league: str, season: int = 2024):
    """Gol krallığı listesi (API-Football)"""
    try:
        league_id = get_league_id(league)
        if not league_id:
            raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

        data = await apif_get_scorers(league_id, season)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "league": league,
            "season": season,
            "top_scorers": data.get("response", []),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/assists/{league}")
async def live_top_assists(league: str, season: int = 2024):
    """Asist krallığı listesi (API-Football)"""
    try:
        league_id = get_league_id(league)
        if not league_id:
            raise HTTPException(status_code=404, detail=f"Lig bulunamadı: {league}")

        data = await get_top_assists(league_id, season)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "league": league,
            "season": season,
            "top_assists": data.get("response", []),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live/predictions/{fixture_id}")
async def live_predictions(fixture_id: int):
    """Maç tahminlerini getir (API-Football)"""
    try:
        data = await get_predictions(fixture_id)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "fixture_id": fixture_id,
            "predictions": data.get("response", [{}])[0] if data.get("response") else None,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search/team")
async def api_search_team(name: str):
    """Takım ara"""
    try:
        data = await search_team(name)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "query": name,
            "results": data.get("response", []),
            "count": len(data.get("response", [])),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search/player")
async def api_search_player(name: str):
    """Oyuncu ara"""
    try:
        data = await search_player(name)

        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])

        return {
            "query": name,
            "results": data.get("response", []),
            "count": len(data.get("response", [])),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Sağlık kontrolü
@app.get("/health")
async def health_check():
    """API sağlık kontrolü"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "soccerdata": "active",
            "api_football": "active",
            "grok_ai": "active"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
