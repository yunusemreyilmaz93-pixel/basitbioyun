"""
Futbol AI Asistan - Grok (xAI) Entegrasyonu
"""

import httpx
from typing import Optional, List, Dict, Any
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Grok API ayarları
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_API_URL = "https://api.x.ai/v1/chat/completions"

# Sistem promptu
SYSTEM_PROMPT = """Sen profesyonel bir futbol analisti ve asistanısın. Türkçe konuşuyorsun.

Uzmanlık alanların:
- Süper Lig, Şampiyonlar Ligi ve Avrupa Ligi maç analizleri
- Oyuncu performans değerlendirmeleri
- Takım taktik analizleri
- Maç tahminleri ve öngörüleri
- İstatistik yorumlama (xG, xA, pas başarısı vb.)
- YouTube video içerikleri için metin yazma

Önemli kurallar:
1. Her zaman verilere dayalı, objektif analizler yap
2. Tahminlerde istatistikleri referans göster
3. Türk futbol kültürüne uygun, samimi bir dil kullan
4. Fenerbahçe ve Galatasaray gibi büyük takımlar hakkında tarafsız ol
5. Video içeriği yazarken dikkat çekici ve akıcı bir dil kullan

Eğer sana futbol verileri sağlanırsa, bu verileri analiz et ve yorumla.
"""


async def chat_with_grok(
    message: str,
    context: Optional[List[Dict[str, str]]] = None,
    football_data: Optional[Dict[str, Any]] = None
) -> str:
    """
    Grok AI ile sohbet et

    Args:
        message: Kullanıcı mesajı
        context: Önceki mesajlar (opsiyonel)
        football_data: Ek futbol verileri (opsiyonel)

    Returns:
        AI yanıtı
    """
    if not GROK_API_KEY:
        return "API anahtarı yapılandırılmamış. Lütfen GROK_API_KEY ortam değişkenini ayarlayın."

    # Mesaj geçmişini oluştur
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Önceki mesajları ekle
    if context:
        messages.extend(context)

    # Futbol verisi varsa mesaja ekle
    user_message = message
    if football_data:
        user_message += f"\n\n--- İLGİLİ VERİLER ---\n{json.dumps(football_data, ensure_ascii=False, indent=2)}"

    messages.append({"role": "user", "content": user_message})

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GROK_API_URL,
                headers={
                    "Authorization": f"Bearer {GROK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-beta",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 2000
                }
            )

            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"API Hatası: {response.status_code} - {response.text}"

    except httpx.TimeoutException:
        return "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
    except Exception as e:
        return f"Bir hata oluştu: {str(e)}"


async def analyze_match(
    home_team: str,
    away_team: str,
    match_data: Optional[Dict] = None,
    team_stats: Optional[Dict] = None
) -> str:
    """Maç analizi yap"""
    prompt = f"""
{home_team} vs {away_team} maçını analiz et.

Analiz şunları içermeli:
1. Her iki takımın form durumu
2. Güçlü ve zayıf yönleri
3. Anahtar oyuncular
4. Taktiksel beklentiler
5. Skor tahmini ve gerekçesi
"""

    football_data = {}
    if match_data:
        football_data["match_info"] = match_data
    if team_stats:
        football_data["team_stats"] = team_stats

    return await chat_with_grok(prompt, football_data=football_data if football_data else None)


async def compare_players(
    player1: str,
    player2: str,
    player1_stats: Optional[Dict] = None,
    player2_stats: Optional[Dict] = None
) -> str:
    """İki oyuncuyu karşılaştır"""
    prompt = f"""
{player1} ve {player2} oyuncularını karşılaştır.

Karşılaştırma kriterleri:
1. Genel performans
2. Gol/asist katkısı
3. Oyun tarzı
4. Güçlü yönler
5. Hangisi daha etkili ve neden?
"""

    football_data = {}
    if player1_stats:
        football_data["player1_stats"] = player1_stats
    if player2_stats:
        football_data["player2_stats"] = player2_stats

    return await chat_with_grok(prompt, football_data=football_data if football_data else None)


async def generate_video_script(
    topic: str,
    duration_minutes: int = 10,
    style: str = "analiz"
) -> str:
    """YouTube video scripti oluştur"""
    prompt = f"""
Aşağıdaki konu için {duration_minutes} dakikalık bir YouTube video scripti yaz:

Konu: {topic}
Stil: {style}

Script formatı:
1. Dikkat çekici giriş (hook)
2. Konu tanıtımı
3. Ana içerik (alt başlıklarla)
4. Özet ve kapanış
5. İzleyiciye soru/etkileşim

Dil tarzı: Enerjik, bilgilendirici, samimi
"""

    return await chat_with_grok(prompt)


async def predict_match(
    home_team: str,
    away_team: str,
    h2h_data: Optional[Dict] = None,
    form_data: Optional[Dict] = None
) -> str:
    """Maç tahmini yap"""
    prompt = f"""
{home_team} vs {away_team} maçı için detaylı tahmin yap.

Tahmin içeriği:
1. Maç sonucu tahmini (1X2)
2. Skor tahmini
3. İlk yarı/maç sonu
4. Gol sayısı tahmini (alt/üst)
5. Her iki takım gol atar mı?
6. Tahmin güven oranı (%)
7. Risk faktörleri
"""

    football_data = {}
    if h2h_data:
        football_data["head_to_head"] = h2h_data
    if form_data:
        football_data["form"] = form_data

    return await chat_with_grok(prompt, football_data=football_data if football_data else None)
