"""
API-Football Entegrasyonu
https://www.api-football.com/

Süper Lig dahil tüm liglerin canlı verileri
"""

import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import os
from dotenv import load_dotenv
from cachetools import TTLCache

load_dotenv()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_FOOTBALL_URL = "https://v3.football.api-sports.io"

# Cache (15 dakika TTL)
cache = TTLCache(maxsize=100, ttl=900)

# Lig ID'leri
LEAGUE_IDS = {
    "super_lig": 203,           # Türkiye Süper Lig
    "champions_league": 2,       # UEFA Şampiyonlar Ligi
    "europa_league": 3,          # UEFA Avrupa Ligi
    "conference_league": 848,    # UEFA Konferans Ligi
    "premier_league": 39,        # İngiltere Premier Lig
    "la_liga": 140,              # İspanya La Liga
    "bundesliga": 78,            # Almanya Bundesliga
    "serie_a": 135,              # İtalya Serie A
    "ligue_1": 61,               # Fransa Ligue 1
}

# Türk takımları ID'leri
TURKISH_TEAMS = {
    "fenerbahce": 611,
    "galatasaray": 645,
    "besiktas": 549,
    "trabzonspor": 607,
    "basaksehir": 567,
    "antalyaspor": 560,
    "alanyaspor": 3563,
    "konyaspor": 3557,
    "sivasspor": 3574,
    "kasimpasa": 3561,
    "kayserispor": 3558,
    "ankaragucu": 556,
    "samsunspor": 3570,
    "rizespor": 3569,
    "hatayspor": 3581,
    "gaziantep": 3564,
    "adana_demirspor": 3573,
    "pendikspor": 3596,
}


async def api_request(endpoint: str, params: Dict[str, Any] = None) -> Dict:
    """API-Football'a istek gönder"""
    if not API_FOOTBALL_KEY:
        return {"error": "API key yapılandırılmamış"}

    cache_key = f"{endpoint}_{str(params)}"
    if cache_key in cache:
        return cache[cache_key]

    headers = {
        "x-apisports-key": API_FOOTBALL_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{API_FOOTBALL_URL}/{endpoint}",
                headers=headers,
                params=params
            )

            if response.status_code == 200:
                data = response.json()
                cache[cache_key] = data
                return data
            else:
                return {"error": f"API Hatası: {response.status_code}"}

    except Exception as e:
        return {"error": str(e)}


async def get_live_matches(league_id: int = None) -> Dict:
    """Canlı maçları getir"""
    params = {"live": "all"}
    if league_id:
        params["league"] = league_id

    return await api_request("fixtures", params)


async def get_standings(league_id: int, season: int = 2024) -> Dict:
    """Lig puan durumunu getir"""
    params = {
        "league": league_id,
        "season": season
    }
    return await api_request("standings", params)


async def get_fixtures(league_id: int, season: int = 2024, next_matches: int = None, last_matches: int = None) -> Dict:
    """Fikstür getir"""
    params = {
        "league": league_id,
        "season": season
    }

    if next_matches:
        params["next"] = next_matches
    if last_matches:
        params["last"] = last_matches

    return await api_request("fixtures", params)


async def get_fixture_by_id(fixture_id: int) -> Dict:
    """Maç detayını getir"""
    params = {"id": fixture_id}
    return await api_request("fixtures", params)


async def get_head_to_head(team1_id: int, team2_id: int, last: int = 10) -> Dict:
    """İki takım arasındaki geçmiş maçları getir"""
    params = {
        "h2h": f"{team1_id}-{team2_id}",
        "last": last
    }
    return await api_request("fixtures/headtohead", params)


async def get_team_info(team_id: int) -> Dict:
    """Takım bilgilerini getir"""
    params = {"id": team_id}
    return await api_request("teams", params)


async def get_team_statistics(team_id: int, league_id: int, season: int = 2024) -> Dict:
    """Takım istatistiklerini getir"""
    params = {
        "team": team_id,
        "league": league_id,
        "season": season
    }
    return await api_request("teams/statistics", params)


async def get_player_statistics(player_id: int = None, team_id: int = None, league_id: int = None, season: int = 2024) -> Dict:
    """Oyuncu istatistiklerini getir"""
    params = {"season": season}

    if player_id:
        params["id"] = player_id
    if team_id:
        params["team"] = team_id
    if league_id:
        params["league"] = league_id

    return await api_request("players", params)


async def get_top_scorers(league_id: int, season: int = 2024) -> Dict:
    """Gol krallığı listesi"""
    params = {
        "league": league_id,
        "season": season
    }
    return await api_request("players/topscorers", params)


async def get_top_assists(league_id: int, season: int = 2024) -> Dict:
    """Asist krallığı listesi"""
    params = {
        "league": league_id,
        "season": season
    }
    return await api_request("players/topassists", params)


async def get_fixture_statistics(fixture_id: int) -> Dict:
    """Maç istatistiklerini getir"""
    params = {"fixture": fixture_id}
    return await api_request("fixtures/statistics", params)


async def get_fixture_lineups(fixture_id: int) -> Dict:
    """Maç kadrolarını getir"""
    params = {"fixture": fixture_id}
    return await api_request("fixtures/lineups", params)


async def get_fixture_events(fixture_id: int) -> Dict:
    """Maç olaylarını getir (goller, kartlar vs.)"""
    params = {"fixture": fixture_id}
    return await api_request("fixtures/events", params)


async def get_predictions(fixture_id: int) -> Dict:
    """Maç tahminlerini getir"""
    params = {"fixture": fixture_id}
    return await api_request("predictions", params)


async def search_team(name: str) -> Dict:
    """Takım ara"""
    params = {"search": name}
    return await api_request("teams", params)


async def search_player(name: str) -> Dict:
    """Oyuncu ara"""
    params = {"search": name}
    return await api_request("players", params)


# Yardımcı fonksiyonlar
def get_league_id(league_name: str) -> Optional[int]:
    """Lig adından ID'yi bul"""
    return LEAGUE_IDS.get(league_name.lower().replace(" ", "_"))


def get_team_id(team_name: str) -> Optional[int]:
    """Takım adından ID'yi bul"""
    team_key = team_name.lower().replace(" ", "_").replace("ş", "s").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ö", "o").replace("ç", "c")
    return TURKISH_TEAMS.get(team_key)


async def get_today_matches(league_id: int = None) -> Dict:
    """Bugünün maçlarını getir"""
    today = date.today().strftime("%Y-%m-%d")
    params = {"date": today}

    if league_id:
        params["league"] = league_id

    return await api_request("fixtures", params)


async def get_team_next_match(team_id: int) -> Dict:
    """Takımın bir sonraki maçını getir"""
    params = {
        "team": team_id,
        "next": 1
    }
    return await api_request("fixtures", params)


async def get_team_last_matches(team_id: int, count: int = 5) -> Dict:
    """Takımın son maçlarını getir"""
    params = {
        "team": team_id,
        "last": count
    }
    return await api_request("fixtures", params)
