/* ------------------------------------------------------------------ */
/*  National football ecosystem archives (mock)                        */
/* ------------------------------------------------------------------ */

function sp(shirt, name, age, club, clubCode, value, opts = {}) {
  return {
    shirt,
    name,
    age,
    club,
    clubCode,
    clubId: opts.clubId ?? null,
    playerId: opts.playerId ?? null,
    foreign: !!opts.foreign,
    contract: opts.contract ?? 'Jun 2028',
  }
}

function legend(rank, name, value, playerId = null) {
  return { rank, name, value, playerId }
}

function fixture(date, competition, home, away, score, venue, referee, status = 'ft', matchId = null) {
  return { date, competition, home, away, score, venue, referee, status, matchId }
}

function trophy(name, years, code) {
  return { name, years, code, count: years.length }
}

function buildNation(base) {
  return base
}

/* Elite coaches live in managerData.js */
export { MANAGERS } from './managerData.js'

export const NATIONS = {
  france: buildNation({
    id: 'france',
    name: 'France',
    code: 'FRA',
    confederation: 'UEFA',
    association: {
      name: 'Fédération Française de Football',
      short: 'FFF',
      founded: 1919,
      address: '87 Boulevard de Grenelle, 75015 Paris, France',
      colors: { primary: '#002395', secondary: '#ED2939', tertiary: '#FFFFFF' },
    },
    fifaRank: 2,
    rankingHistory: [
      { year: 2021, rank: 3 },
      { year: 2022, rank: 4 },
      { year: 2023, rank: 2 },
      { year: 2024, rank: 2 },
      { year: 2025, rank: 2 },
      { year: 2026, rank: 2 },
    ],
    squadValue: 1.23, // €bn
    stadium: { name: 'Stade de France', capacity: 81338, city: 'Saint-Denis' },
    coach: { name: 'Didier Deschamps', managerId: 'deschamps', since: 2012 },
    squad: {
      GK: [
        sp(1, 'Mike Maignan', 30, 'Milan', 'MIL', 45, { foreign: true, contract: 'Jun 2026' }),
        sp(16, 'Brice Samba', 32, 'Lens', 'RCL', 12, { contract: 'Jun 2027' }),
        sp(23, 'Alphonse Areola', 33, 'West Ham', 'WHU', 8, { foreign: true, contract: 'Jun 2027' }),
      ],
      DEF: [
        sp(2, 'Benjamin Pavard', 30, 'Inter', 'INT', 25, { foreign: true, contract: 'Jun 2028' }),
        sp(3, 'Lucas Hernández', 30, 'PSG', 'PSG', 30, { clubId: 'psg', contract: 'Jun 2028' }),
        sp(4, 'William Saliba', 25, 'Arsenal', 'ARS', 80, { foreign: true, contract: 'Jun 2027' }),
        sp(5, 'Jules Koundé', 27, 'Barcelona', 'BAR', 60, { foreign: true, clubId: 'fc-barcelona', contract: 'Jun 2027' }),
        sp(17, 'Dayot Upamecano', 27, 'Bayern', 'FCB', 35, { foreign: true, clubId: 'bayern-munich', contract: 'Jun 2026' }),
        sp(21, 'Theo Hernández', 28, 'Milan', 'MIL', 50, { foreign: true, contract: 'Jun 2026' }),
        sp(22, 'Ibrahima Konaté', 27, 'Liverpool', 'LIV', 45, { foreign: true, contract: 'Jun 2026' }),
      ],
      MID: [
        sp(6, 'Aurélien Tchouaméni', 26, 'Real Madrid', 'RMA', 70, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2028' }),
        sp(8, 'Aurélien Nkunku', 28, 'Chelsea', 'CHE', 40, { foreign: true, contract: 'Jun 2029' }),
        sp(13, 'N’Golo Kanté', 35, 'Al-Ittihad', 'ITT', 8, { foreign: true, contract: 'Jun 2026' }),
        sp(14, 'Adrien Rabiot', 31, 'Marseille', 'OM', 18, { contract: 'Jun 2027' }),
        sp(18, 'Warren Zaïre-Emery', 20, 'PSG', 'PSG', 55, { clubId: 'psg', contract: 'Jun 2029' }),
        sp(19, 'Youssouf Fofana', 27, 'Milan', 'MIL', 35, { foreign: true, contract: 'Jun 2028' }),
      ],
      FWD: [
        sp(7, 'Antoine Griezmann', 35, 'Atlético', 'ATM', 18, { foreign: true, contract: 'Jun 2026' }),
        sp(9, 'Olivier Giroud', 39, 'LAFC', 'LAFC', 2, { foreign: true, contract: 'Dec 2025' }),
        sp(10, 'Kylian Mbappé', 27, 'Real Madrid', 'RMA', 160, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2029' }),
        sp(11, 'Ousmane Dembélé', 28, 'PSG', 'PSG', 70, { clubId: 'psg', contract: 'Jun 2028' }),
        sp(12, 'Randal Kolo Muani', 27, 'Juventus', 'JUV', 35, { foreign: true, clubId: 'juventus', contract: 'Jun 2028' }),
        sp(15, 'Michael Olise', 24, 'Bayern', 'FCB', 110, { foreign: true, clubId: 'bayern-munich', playerId: 'michael-olise', contract: 'Jun 2029' }),
        sp(20, 'Désiré Doué', 21, 'PSG', 'PSG', 90, { clubId: 'psg', playerId: 'desire-doue', contract: 'Jun 2029' }),
        sp(25, 'Bradley Barcola', 23, 'PSG', 'PSG', 60, { clubId: 'psg', contract: 'Jun 2028' }),
      ],
    },
    legends: {
      caps: [
        legend(1, 'Hugo Lloris', 145),
        legend(2, 'Lilian Thuram', 142),
        legend(3, 'Olivier Giroud', 137),
        legend(4, 'Thierry Henry', 123),
        legend(5, 'Marcel Desailly', 116),
      ],
      goals: [
        legend(1, 'Olivier Giroud', 57),
        legend(2, 'Thierry Henry', 51),
        legend(3, 'Kylian Mbappé', 48),
        legend(4, 'Antoine Griezmann', 44),
        legend(5, 'Michel Platini', 41),
      ],
      youngestDebut: { name: 'Eduardo Camavinga', age: '17y 290d', year: 2020 },
      oldestPlayer: { name: 'Larbi Benbarek', age: '41y 0d', year: 1954 },
    },
    fixtures: [
      fixture('Mar 21, 2026', 'Friendly', 'France', 'Netherlands', '2–1', 'Stade de France', 'M. Oliver', 'ft', 'france-netherlands'),
      fixture('Nov 14, 2025', 'Nations League', 'Italy', 'France', '1–3', 'San Siro', 'F. Zwayer', 'ft', 'italy-france'),
      fixture('Oct 10, 2025', 'WC Qualifier', 'France', 'Israel', '4–0', 'Stade de France', 'C. Turpin', 'ft', 'france-israel'),
      fixture('Sep 6, 2025', 'WC Qualifier', 'France', 'Ukraine', '3–1', 'Groupama Stadium', 'A. Taylor', 'ft', 'france-ukraine'),
      fixture('Jun 5, 2026', 'Friendly', 'France', 'Spain', null, 'Stade Vélodrome', 'TBD', 'upcoming'),
      fixture('Jun 15, 2026', 'World Cup', 'France', 'TBD', null, 'MetLife Stadium', 'TBD', 'upcoming'),
    ],
    trophies: [
      trophy('FIFA World Cup', ['1998', '2018'], 'WC'),
      trophy('UEFA EURO', ['1984', '2000'], 'EUR'),
      trophy('UEFA Nations League', ['2021'], 'UNL'),
      trophy('Olympic Gold', ['1984'], 'OLY'),
      trophy('Confederations Cup', ['2001', '2003'], 'CC'),
    ],
  }),

  turkiye: buildNation({
    id: 'turkiye',
    name: 'Türkiye',
    code: 'TUR',
    confederation: 'UEFA',
    association: {
      name: 'Türkiye Futbol Federasyonu',
      short: 'TFF',
      founded: 1923,
      address: 'Hasan Doğan Milli Takımlar Kampı, Riva, İstanbul',
      colors: { primary: '#E30A17', secondary: '#FFFFFF', tertiary: '#000000' },
    },
    fifaRank: 26,
    rankingHistory: [
      { year: 2021, rank: 39 },
      { year: 2022, rank: 42 },
      { year: 2023, rank: 38 },
      { year: 2024, rank: 28 },
      { year: 2025, rank: 27 },
      { year: 2026, rank: 26 },
    ],
    squadValue: 0.42,
    stadium: { name: 'Atatürk Olimpiyat Stadı', capacity: 74753, city: 'İstanbul' },
    coach: { name: 'Vincenzo Montella', managerId: 'montella', since: 2023 },
    squad: {
      GK: [
        sp(1, 'Uğurcan Çakır', 30, 'Trabzonspor', 'TS', 8, { contract: 'Jun 2027' }),
        sp(12, 'Mert Günok', 37, 'Beşiktaş', 'BJK', 1, { contract: 'Jun 2026' }),
        sp(23, 'Altay Bayındır', 28, 'Man United', 'MUN', 12, { foreign: true, contract: 'Jun 2027' }),
      ],
      DEF: [
        sp(2, 'Zeki Çelik', 29, 'Roma', 'ROM', 12, { foreign: true, contract: 'Jun 2027' }),
        sp(3, 'Merih Demiral', 28, 'Al-Ahli', 'AHL', 15, { foreign: true, contract: 'Jun 2027' }),
        sp(4, 'Çağlar Söyüncü', 30, 'Fenerbahçe', 'FB', 10, { contract: 'Jun 2027' }),
        sp(13, 'Abdülkerim Bardakcı', 31, 'Galatasaray', 'GS', 8, { contract: 'Jun 2027' }),
        sp(18, 'Ferdi Kadıoğlu', 26, 'Brighton', 'BHA', 28, { foreign: true, contract: 'Jun 2028' }),
        sp(20, 'Samet Akaydın', 32, 'Panathinaikos', 'PAO', 4, { foreign: true, contract: 'Jun 2026' }),
      ],
      MID: [
        sp(5, 'Salih Özcan', 28, 'Trabzonspor', 'TS', 8, { contract: 'Jun 2027' }),
        sp(6, 'Orkun Kökçü', 25, 'Benfica', 'SLB', 35, { foreign: true, contract: 'Jun 2028' }),
        sp(8, 'Hakan Çalhanoğlu', 32, 'Inter', 'INT', 28, { foreign: true, contract: 'Jun 2027' }),
        sp(10, 'Kenan Yıldız', 21, 'Juventus', 'JUV', 75, { foreign: true, clubId: 'juventus', playerId: 'kenan-yildiz', contract: 'Jun 2029' }),
        sp(15, 'İsmail Yüksek', 27, 'Fenerbahçe', 'FB', 12, { contract: 'Jun 2028' }),
        sp(16, 'Kaan Ayhan', 31, 'Galatasaray', 'GS', 5, { contract: 'Jun 2026' }),
      ],
      FWD: [
        sp(7, 'Kerem Aktürkoğlu', 27, 'Benfica', 'SLB', 25, { foreign: true, contract: 'Jun 2029' }),
        sp(9, 'Cenk Tosun', 34, 'Fenerbahçe', 'FB', 3, { contract: 'Jun 2026' }),
        sp(11, 'Yunus Akgün', 25, 'Galatasaray', 'GS', 15, { contract: 'Jun 2028' }),
        sp(14, 'Arda Güler', 21, 'Real Madrid', 'RMA', 60, { foreign: true, clubId: 'real-madrid', playerId: 'arda-guler', contract: 'Jun 2029' }),
        sp(17, 'Barış Alper Yılmaz', 26, 'Galatasaray', 'GS', 30, { contract: 'Jun 2028' }),
        sp(19, 'Enes Ünal', 28, 'Bournemouth', 'BOU', 18, { foreign: true, contract: 'Jun 2027' }),
      ],
    },
    legends: {
      caps: [
        legend(1, 'Rüştü Reçber', 120),
        legend(2, 'Hakan Şükür', 112),
        legend(3, 'Bülent Korkmaz', 102),
        legend(4, 'Tugay Kerimoğlu', 94),
        legend(5, 'Arda Turan', 100),
      ],
      goals: [
        legend(1, 'Hakan Şükür', 51),
        legend(2, 'Tuncay Şanlı', 22),
        legend(3, 'Lefter Küçükandonyadis', 21),
        legend(4, 'Cenk Tosun', 20),
        legend(5, 'Burak Yılmaz', 31),
      ],
      youngestDebut: { name: 'Emre Mor', age: '18y 289d', year: 2016 },
      oldestPlayer: { name: 'Rüştü Reçber', age: '39y 134d', year: 2012 },
    },
    fixtures: [
      fixture('Mar 23, 2026', 'Friendly', 'Türkiye', 'Hungary', '2–0', 'Atatürk Olimpiyat', 'S. Marciniak', 'ft', 'turkiye-hungary'),
      fixture('Nov 16, 2025', 'Nations League', 'Wales', 'Türkiye', '0–2', 'Cardiff City Stadium', 'A. Taylor', 'ft', 'wales-turkiye'),
      fixture('Oct 11, 2025', 'WC Qualifier', 'Türkiye', 'Iceland', '3–1', 'Konya Büyükşehir', 'D. Orsato', 'ft', 'turkiye-iceland'),
      fixture('Sep 7, 2025', 'WC Qualifier', 'Türkiye', 'Montenegro', '1–0', 'Başakşehir Fatih Terim', 'C. Turpin', 'ft', 'turkiye-montenegro'),
      fixture('Jun 8, 2026', 'Friendly', 'Türkiye', 'Italy', null, 'Rams Park', 'TBD', 'upcoming'),
      fixture('Jun 18, 2026', 'World Cup', 'Türkiye', 'TBD', null, 'TBD', 'TBD', 'upcoming'),
    ],
    trophies: [
      trophy('UEFA EURO (semi-final)', ['2008'], 'EUR'),
      trophy('FIFA World Cup (3rd)', ['2002'], 'WC'),
      trophy('Mediterranean Games Gold', ['1987', '1993', '2013'], 'MED'),
      trophy('U21 Toulon Tournament', ['2012'], 'U21'),
    ],
  }),

  brazil: buildNation({
    id: 'brazil',
    name: 'Brazil',
    code: 'BRA',
    confederation: 'CONMEBOL',
    association: {
      name: 'Confederação Brasileira de Futebol',
      short: 'CBF',
      founded: 1914,
      address: 'Avenida Luís Carlos Prestes 130, Barra da Tijuca, Rio de Janeiro',
      colors: { primary: '#009C3B', secondary: '#FFDF00', tertiary: '#002776' },
    },
    fifaRank: 5,
    rankingHistory: [
      { year: 2021, rank: 2 },
      { year: 2022, rank: 1 },
      { year: 2023, rank: 3 },
      { year: 2024, rank: 4 },
      { year: 2025, rank: 5 },
      { year: 2026, rank: 5 },
    ],
    squadValue: 1.48,
    stadium: { name: 'Maracanã', capacity: 78838, city: 'Rio de Janeiro' },
    coach: { name: 'Carlo Ancelotti', managerId: 'ancelotti-bra', since: 2025 },
    squad: {
      GK: [
        sp(1, 'Alisson', 33, 'Liverpool', 'LIV', 45, { foreign: true, contract: 'Jun 2027' }),
        sp(12, 'Ederson', 32, 'Man City', 'MCI', 35, { foreign: true, contract: 'Jun 2026' }),
        sp(23, 'Bento', 27, 'Al-Nassr', 'NAS', 15, { foreign: true, contract: 'Jun 2028' }),
      ],
      DEF: [
        sp(2, 'Danilo', 34, 'Juventus', 'JUV', 4, { foreign: true, clubId: 'juventus', contract: 'Jun 2026' }),
        sp(3, 'Marquinhos', 31, 'PSG', 'PSG', 40, { foreign: true, clubId: 'psg', contract: 'Jun 2028' }),
        sp(4, 'Gabriel Magalhães', 28, 'Arsenal', 'ARS', 55, { foreign: true, contract: 'Jun 2029' }),
        sp(6, 'Alex Sandro', 35, 'Flamengo', 'FLA', 3, { contract: 'Dec 2026' }),
        sp(13, 'Éder Militão', 28, 'Real Madrid', 'RMA', 50, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2028' }),
        sp(16, 'Guilherme Arana', 28, 'Atlético-MG', 'CAM', 18, { contract: 'Dec 2027' }),
      ],
      MID: [
        sp(5, 'Casemiro', 34, 'Man United', 'MUN', 18, { foreign: true, contract: 'Jun 2026' }),
        sp(8, 'Bruno Guimarães', 28, 'Newcastle', 'NEW', 70, { foreign: true, contract: 'Jun 2028' }),
        sp(15, 'João Gomes', 25, 'Wolves', 'WOL', 40, { foreign: true, contract: 'Jun 2028' }),
        sp(17, 'Andreas Pereira', 30, 'Fulham', 'FUL', 18, { foreign: true, contract: 'Jun 2027' }),
        sp(18, 'Lucas Paquetá', 28, 'West Ham', 'WHU', 50, { foreign: true, contract: 'Jun 2027' }),
      ],
      FWD: [
        sp(7, 'Vinícius Júnior', 26, 'Real Madrid', 'RMA', 140, { foreign: true, clubId: 'real-madrid', playerId: 'vinicius-junior', contract: 'Jun 2027' }),
        sp(9, 'Richarlison', 29, 'Tottenham', 'TOT', 35, { foreign: true, contract: 'Jun 2027' }),
        sp(10, 'Rodrygo', 25, 'Real Madrid', 'RMA', 90, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2028' }),
        sp(11, 'Raphinha', 29, 'Barcelona', 'BAR', 65, { foreign: true, clubId: 'fc-barcelona', contract: 'Jun 2027' }),
        sp(19, 'Endrick', 19, 'Real Madrid', 'RMA', 55, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2030' }),
        sp(20, 'Savinho', 22, 'Man City', 'MCI', 50, { foreign: true, contract: 'Jun 2029' }),
        sp(21, 'Gabriel Martinelli', 24, 'Arsenal', 'ARS', 60, { foreign: true, contract: 'Jun 2027' }),
      ],
    },
    legends: {
      caps: [
        legend(1, 'Cafu', 142),
        legend(2, 'Roberto Carlos', 125),
        legend(3, 'Dani Alves', 126),
        legend(4, 'Neymar', 128),
        legend(5, 'Lúcio', 105),
      ],
      goals: [
        legend(1, 'Neymar', 79),
        legend(2, 'Pelé', 77),
        legend(3, 'Ronaldo', 62),
        legend(4, 'Romário', 55),
        legend(5, 'Zico', 48),
      ],
      youngestDebut: { name: 'Pelé', age: '16y 257d', year: 1957 },
      oldestPlayer: { name: 'Djalma Santos', age: '39y 289d', year: 1968 },
    },
    fixtures: [
      fixture('Mar 20, 2026', 'WC Qualifier', 'Brazil', 'Colombia', '2–1', 'Maracanã', 'W. Roldán', 'ft', 'brazil-colombia'),
      fixture('Nov 19, 2025', 'WC Qualifier', 'Argentina', 'Brazil', '1–0', 'Monumental', 'A. Matonte', 'ft', 'argentina-brazil'),
      fixture('Oct 15, 2025', 'WC Qualifier', 'Brazil', 'Peru', '3–0', 'Neo Química Arena', 'J. Valenzuela', 'ft', 'brazil-peru'),
      fixture('Sep 10, 2025', 'WC Qualifier', 'Chile', 'Brazil', '0–2', 'Nacional', 'F. Tello', 'ft', 'chile-brazil'),
      fixture('Jun 3, 2026', 'Friendly', 'Brazil', 'Spain', null, 'Hard Rock Stadium', 'TBD', 'upcoming'),
      fixture('Jun 14, 2026', 'World Cup', 'Brazil', 'TBD', null, 'TBD', 'TBD', 'upcoming'),
    ],
    trophies: [
      trophy('FIFA World Cup', ['1958', '1962', '1970', '1994', '2002'], 'WC'),
      trophy('Copa América', ['1919', '1922', '1949', '1989', '1997', '1999', '2004', '2007', '2019'], 'CA'),
      trophy('Confederations Cup', ['1997', '2005', '2009', '2013'], 'CC'),
      trophy('Olympic Gold', ['2016', '2020'], 'OLY'),
    ],
  }),

  spain: buildNation({
    id: 'spain',
    name: 'Spain',
    code: 'ESP',
    confederation: 'UEFA',
    association: {
      name: 'Real Federación Española de Fútbol',
      short: 'RFEF',
      founded: 1909,
      address: 'Ramón y Cajal s/n, 28230 Las Rozas, Madrid',
      colors: { primary: '#AA151B', secondary: '#F1BF00', tertiary: '#FFFFFF' },
    },
    fifaRank: 3,
    rankingHistory: [
      { year: 2021, rank: 7 },
      { year: 2022, rank: 6 },
      { year: 2023, rank: 8 },
      { year: 2024, rank: 3 },
      { year: 2025, rank: 3 },
      { year: 2026, rank: 3 },
    ],
    squadValue: 1.35,
    stadium: { name: 'Santiago Bernabéu', capacity: 81044, city: 'Madrid' },
    coach: { name: 'Luis de la Fuente', managerId: 'de-la-fuente', since: 2022 },
    squad: {
      GK: [
        sp(1, 'Unai Simón', 28, 'Athletic', 'ATH', 30, { contract: 'Jun 2029' }),
        sp(13, 'David Raya', 30, 'Arsenal', 'ARS', 35, { foreign: true, contract: 'Jun 2028' }),
        sp(23, 'Álex Remiro', 31, 'Real Sociedad', 'RSO', 18, { contract: 'Jun 2027' }),
      ],
      DEF: [
        sp(2, 'Dani Carvajal', 34, 'Real Madrid', 'RMA', 8, { clubId: 'real-madrid', contract: 'Jun 2026' }),
        sp(3, 'Alejandro Balde', 22, 'Barcelona', 'BAR', 55, { clubId: 'fc-barcelona', contract: 'Jun 2028' }),
        sp(4, 'Aymeric Laporte', 32, 'Al-Nassr', 'NAS', 12, { foreign: true, contract: 'Jun 2026' }),
        sp(5, 'Pau Cubarsí', 19, 'Barcelona', 'BAR', 50, { clubId: 'fc-barcelona', contract: 'Jun 2029' }),
        sp(14, 'Aymeric', 27, 'Atlético', 'ATM', 40, { contract: 'Jun 2028' }),
        sp(24, 'Marc Cucurella', 27, 'Chelsea', 'CHE', 30, { foreign: true, contract: 'Jun 2028' }),
      ],
      MID: [
        sp(6, 'Mikel Merino', 29, 'Arsenal', 'ARS', 40, { foreign: true, contract: 'Jun 2028' }),
        sp(8, 'Fabián Ruiz', 29, 'PSG', 'PSG', 35, { foreign: true, clubId: 'psg', contract: 'Jun 2027' }),
        sp(16, 'Rodri', 29, 'Man City', 'MCI', 100, { foreign: true, contract: 'Jun 2027' }),
        sp(18, 'Martín Zubimendi', 27, 'Arsenal', 'ARS', 55, { foreign: true, contract: 'Jun 2029' }),
        sp(20, 'Pedri', 23, 'Barcelona', 'BAR', 100, { clubId: 'fc-barcelona', contract: 'Jun 2030' }),
        sp(22, 'Gavi', 21, 'Barcelona', 'BAR', 70, { clubId: 'fc-barcelona', contract: 'Jun 2030' }),
      ],
      FWD: [
        sp(7, 'Álvaro Morata', 33, 'Milan', 'MIL', 12, { foreign: true, contract: 'Jun 2026' }),
        sp(9, 'Joselu', 36, 'Al-Gharafa', 'GHF', 2, { foreign: true, contract: 'Jun 2026' }),
        sp(10, 'Lamine Yamal', 18, 'Barcelona', 'BAR', 180, { clubId: 'fc-barcelona', playerId: 'lamine-yamal', contract: 'Jun 2031' }),
        sp(11, 'Ferran Torres', 26, 'Barcelona', 'BAR', 35, { clubId: 'fc-barcelona', contract: 'Jun 2027' }),
        sp(17, 'Nico Williams', 23, 'Athletic', 'ATH', 80, { contract: 'Jun 2028' }),
        sp(19, 'Dani Olmo', 27, 'Barcelona', 'BAR', 55, { clubId: 'fc-barcelona', contract: 'Jun 2030' }),
      ],
    },
    legends: {
      caps: [
        legend(1, 'Sergio Ramos', 180),
        legend(2, 'Iker Casillas', 167),
        legend(3, 'Xavi Hernández', 133),
        legend(4, 'Andrés Iniesta', 131),
        legend(5, 'Sergio Busquets', 143),
      ],
      goals: [
        legend(1, 'David Villa', 59),
        legend(2, 'Raúl', 44),
        legend(3, 'Fernando Torres', 38),
        legend(4, 'Fernando Hierro', 29),
        legend(5, 'Álvaro Morata', 36),
      ],
      youngestDebut: { name: 'Lamine Yamal', age: '16y 57d', year: 2023, playerId: 'lamine-yamal' },
      oldestPlayer: { name: 'Jesús Navas', age: '38y 0d', year: 2024 },
    },
    fixtures: [
      fixture('Mar 20, 2026', 'Friendly', 'Spain', 'Brazil', null, 'Metropolitano', 'TBD', 'upcoming'),
      fixture('Nov 15, 2025', 'Nations League', 'Spain', 'Denmark', '2–0', 'Benito Villamarín', 'F. Zwayer', 'ft', 'spain-denmark'),
      fixture('Oct 12, 2025', 'WC Qualifier', 'Spain', 'Serbia', '3–0', 'Carlos Tartiere', 'M. Oliver', 'ft', 'spain-serbia'),
      fixture('Sep 5, 2025', 'WC Qualifier', 'Georgia', 'Spain', '0–2', 'Batumi', 'D. Siebert', 'ft', 'georgia-spain'),
      fixture('Jun 5, 2026', 'Friendly', 'France', 'Spain', null, 'Stade Vélodrome', 'TBD', 'upcoming'),
      fixture('Jun 16, 2026', 'World Cup', 'Spain', 'TBD', null, 'TBD', 'TBD', 'upcoming'),
    ],
    trophies: [
      trophy('FIFA World Cup', ['2010'], 'WC'),
      trophy('UEFA EURO', ['1964', '2008', '2012', '2024'], 'EUR'),
      trophy('UEFA Nations League', ['2023'], 'UNL'),
      trophy('Olympic Gold', ['1992'], 'OLY'),
    ],
  }),

  germany: buildNation({
    id: 'germany',
    name: 'Germany',
    code: 'GER',
    confederation: 'UEFA',
    association: {
      name: 'Deutscher Fußball-Bund',
      short: 'DFB',
      founded: 1900,
      address: 'Otto-Fleck-Schneise 6, 60528 Frankfurt am Main',
      colors: { primary: '#000000', secondary: '#DD0000', tertiary: '#FFCE00' },
    },
    fifaRank: 5,
    rankingHistory: [
      { year: 2021, rank: 12 },
      { year: 2022, rank: 11 },
      { year: 2023, rank: 16 },
      { year: 2024, rank: 10 },
      { year: 2025, rank: 6 },
      { year: 2026, rank: 5 },
    ],
    squadValue: 1.05,
    stadium: { name: 'Olympiastadion Berlin', capacity: 74475, city: 'Berlin' },
    coach: { name: 'Julian Nagelsmann', managerId: 'nagelsmann', since: 2023 },
    squad: {
      GK: [
        sp(1, 'Manuel Neuer', 39, 'Bayern', 'FCB', 4, { clubId: 'bayern-munich', contract: 'Jun 2026' }),
        sp(12, 'Marc-André ter Stegen', 34, 'Barcelona', 'BAR', 18, { foreign: true, clubId: 'fc-barcelona', contract: 'Jun 2028' }),
        sp(22, 'Alexander Nübel', 29, 'Stuttgart', 'VFB', 12, { contract: 'Jun 2027' }),
      ],
      DEF: [
        sp(2, 'Antonio Rüdiger', 33, 'Real Madrid', 'RMA', 18, { foreign: true, clubId: 'real-madrid', contract: 'Jun 2026' }),
        sp(3, 'David Raum', 28, 'RB Leipzig', 'RBL', 25, { contract: 'Jun 2027' }),
        sp(4, 'Jonathan Tah', 29, 'Bayern', 'FCB', 40, { clubId: 'bayern-munich', contract: 'Jun 2029' }),
        sp(15, 'Nico Schlotterbeck', 26, 'Dortmund', 'BVB', 45, { contract: 'Jun 2027' }),
        sp(16, 'Waldemar Anton', 28, 'Dortmund', 'BVB', 22, { contract: 'Jun 2028' }),
      ],
      MID: [
        sp(6, 'Joshua Kimmich', 31, 'Bayern', 'FCB', 45, { clubId: 'bayern-munich', contract: 'Jun 2026' }),
        sp(8, 'Toni Kroos', 36, 'Retired', '—', 0, { contract: '—' }),
        sp(17, 'Florian Wirtz', 23, 'Leverkusen', 'B04', 130, { contract: 'Jun 2027' }),
        sp(18, 'Aleksandar Pavlović', 21, 'Bayern', 'FCB', 45, { clubId: 'bayern-munich', contract: 'Jun 2029' }),
        sp(21, 'İlkay Gündoğan', 35, 'Man City', 'MCI', 12, { foreign: true, contract: 'Jun 2026' }),
      ],
      FWD: [
        sp(7, 'Kai Havertz', 27, 'Arsenal', 'ARS', 55, { foreign: true, contract: 'Jun 2028' }),
        sp(9, 'Niclas Füllkrug', 33, 'West Ham', 'WHU', 15, { foreign: true, contract: 'Jun 2027' }),
        sp(10, 'Jamal Musiala', 23, 'Bayern', 'FCB', 125, { clubId: 'bayern-munich', playerId: 'jamal-musiala', contract: 'Jun 2030' }),
        sp(11, 'Leroy Sané', 30, 'Bayern', 'FCB', 40, { clubId: 'bayern-munich', contract: 'Jun 2026' }),
        sp(19, 'Leroy', 24, 'Stuttgart', 'VFB', 25, { contract: 'Jun 2028' }),
        sp(20, 'Serge Gnabry', 30, 'Bayern', 'FCB', 30, { clubId: 'bayern-munich', contract: 'Jun 2026' }),
      ],
    },
    legends: {
      caps: [
        legend(1, 'Lothar Matthäus', 150),
        legend(2, 'Miroslav Klose', 137),
        legend(3, 'Lukas Podolski', 130),
        legend(4, 'Bastian Schweinsteiger', 121),
        legend(5, 'Philipp Lahm', 113),
      ],
      goals: [
        legend(1, 'Miroslav Klose', 71),
        legend(2, 'Gerd Müller', 68),
        legend(3, 'Lukas Podolski', 49),
        legend(4, 'Rudi Völler', 47),
        legend(5, 'Jürgen Klinsmann', 47),
      ],
      youngestDebut: { name: 'Jamal Musiala', age: '18y 115d', year: 2021, playerId: 'jamal-musiala' },
      oldestPlayer: { name: 'Lothar Matthäus', age: '39y 91d', year: 2000 },
    },
    fixtures: [
      fixture('Mar 23, 2026', 'Friendly', 'Germany', 'Italy', '1–1', 'Allianz Arena', 'C. Turpin', 'ft', 'germany-italy'),
      fixture('Nov 16, 2025', 'Nations League', 'Germany', 'Netherlands', '2–1', 'Signal Iduna Park', 'A. Taylor', 'ft', 'germany-netherlands'),
      fixture('Oct 11, 2025', 'WC Qualifier', 'Germany', 'N. Ireland', '4–0', 'Mercedes-Benz Arena', 'S. Marciniak', 'ft', 'germany-n-ireland'),
      fixture('Jun 10, 2026', 'Friendly', 'Germany', 'England', null, 'Wembley', 'TBD', 'upcoming'),
      fixture('Jun 17, 2026', 'World Cup', 'Germany', 'TBD', null, 'TBD', 'TBD', 'upcoming'),
    ],
    trophies: [
      trophy('FIFA World Cup', ['1954', '1974', '1990', '2014'], 'WC'),
      trophy('UEFA EURO', ['1972', '1980', '1996'], 'EUR'),
      trophy('Confederations Cup', ['2017'], 'CC'),
      trophy('Olympic Silver', ['2016'], 'OLY'),
    ],
  }),

  /* Lightweight shells for remaining links */
  england: {
    id: 'england',
    name: 'England',
    code: 'ENG',
    confederation: 'UEFA',
    association: {
      name: 'The Football Association',
      short: 'FA',
      founded: 1863,
      address: 'Wembley Stadium, London HA9 0WS',
      colors: { primary: '#FFFFFF', secondary: '#000066', tertiary: '#C8102E' },
    },
    fifaRank: 4,
    rankingHistory: [
      { year: 2022, rank: 5 },
      { year: 2023, rank: 4 },
      { year: 2024, rank: 4 },
      { year: 2025, rank: 4 },
      { year: 2026, rank: 4 },
    ],
    squadValue: 1.4,
    stadium: { name: 'Wembley Stadium', capacity: 90000, city: 'London' },
    coach: { name: 'Thomas Tuchel', managerId: null, since: 2025 },
    squad: { GK: [], DEF: [], MID: [], FWD: [] },
    legends: {
      caps: [legend(1, 'Peter Shilton', 125)],
      goals: [legend(1, 'Harry Kane', 68)],
      youngestDebut: { name: 'Theo Walcott', age: '17y 75d', year: 2006 },
      oldestPlayer: { name: 'Stanley Matthews', age: '42y 103d', year: 1957 },
    },
    fixtures: [],
    trophies: [trophy('FIFA World Cup', ['1966'], 'WC'), trophy('UEFA EURO (final)', ['2021', '2024'], 'EUR')],
  },

  italy: {
    id: 'italy',
    name: 'Italy',
    code: 'ITA',
    confederation: 'UEFA',
    association: {
      name: 'Federazione Italiana Giuoco Calcio',
      short: 'FIGC',
      founded: 1898,
      address: 'Via Gregorio Allegri 14, 00198 Roma',
      colors: { primary: '#009246', secondary: '#FFFFFF', tertiary: '#CE2B37' },
    },
    fifaRank: 9,
    rankingHistory: [
      { year: 2022, rank: 6 },
      { year: 2024, rank: 9 },
      { year: 2026, rank: 9 },
    ],
    squadValue: 0.85,
    stadium: { name: 'Stadio Olimpico', capacity: 70634, city: 'Rome' },
    coach: { name: 'Luciano Spalletti', managerId: null, since: 2023 },
    squad: { GK: [], DEF: [], MID: [], FWD: [] },
    legends: {
      caps: [legend(1, 'Gianluigi Buffon', 176)],
      goals: [legend(1, 'Luigi Riva', 35)],
      youngestDebut: { name: 'Gianluigi Donnarumma', age: '17y 189d', year: 2016 },
      oldestPlayer: { name: 'Dino Zoff', age: '41y 86d', year: 1983 },
    },
    fixtures: [],
    trophies: [
      trophy('FIFA World Cup', ['1934', '1938', '1982', '2006'], 'WC'),
      trophy('UEFA EURO', ['1968', '2020'], 'EUR'),
    ],
  },

  uefa: {
    id: 'uefa',
    name: 'UEFA',
    code: 'EUR',
    confederation: 'UEFA',
    association: {
      name: 'Union of European Football Associations',
      short: 'UEFA',
      founded: 1954,
      address: 'Route de Genève 46, 1260 Nyon, Switzerland',
      colors: { primary: '#1A2B4A', secondary: '#FFFFFF', tertiary: '#E8B923' },
    },
    fifaRank: null,
    rankingHistory: [],
    squadValue: 0,
    stadium: { name: '—', capacity: 0, city: 'Nyon' },
    coach: { name: '—', managerId: null, since: null },
    squad: { GK: [], DEF: [], MID: [], FWD: [] },
    legends: {
      caps: [],
      goals: [],
      youngestDebut: { name: '—', age: '—', year: '—' },
      oldestPlayer: { name: '—', age: '—', year: '—' },
    },
    fixtures: [],
    trophies: [],
  },
}
