import fs from 'fs'

// --- players ---
let data = fs.readFileSync('src/data.js', 'utf8')
const playerPatches = [
  [
    "clubShort: 'BAR',\n    league: 'La Liga',\n    position: 'Right Winger',",
    "clubShort: 'BAR',\n    clubId: 'fc-barcelona',\n    nationId: 'spain',\n    league: 'La Liga',\n    position: 'Right Winger',",
  ],
  [
    "clubShort: 'RMA',\n    league: 'La Liga',\n    position: 'Left Winger',",
    "clubShort: 'RMA',\n    clubId: 'real-madrid',\n    nationId: 'brazil',\n    league: 'La Liga',\n    position: 'Left Winger',",
  ],
  [
    "clubShort: 'JUV',\n    league: 'Serie A',",
    "clubShort: 'JUV',\n    clubId: 'juventus',\n    nationId: 'turkiye',\n    league: 'Serie A',",
  ],
  [
    "clubShort: 'RMA',\n    league: 'La Liga',\n    position: 'Attacking Midfield',",
    "clubShort: 'RMA',\n    clubId: 'real-madrid',\n    nationId: 'turkiye',\n    league: 'La Liga',\n    position: 'Attacking Midfield',",
  ],
  [
    "clubShort: 'PSG',\n    league: 'Ligue 1',",
    "clubShort: 'PSG',\n    clubId: 'psg',\n    nationId: 'france',\n    league: 'Ligue 1',",
  ],
  [
    "clubShort: 'FCB',\n    league: 'Bundesliga',\n    position: 'Right Winger',",
    "clubShort: 'FCB',\n    clubId: 'bayern-munich',\n    nationId: 'france',\n    league: 'Bundesliga',\n    position: 'Right Winger',",
  ],
  [
    "clubShort: 'FCB',\n    league: 'Bundesliga',\n    position: 'Attacking Midfield',",
    "clubShort: 'FCB',\n    clubId: 'bayern-munich',\n    nationId: 'germany',\n    league: 'Bundesliga',\n    position: 'Attacking Midfield',",
  ],
]
for (const [a, b] of playerPatches) {
  if (data.includes(a) && !data.includes(b)) data = data.replace(a, b)
}
fs.writeFileSync('src/data.js', data)

// --- clubs managers ---
let clubs = fs.readFileSync('src/clubData.js', 'utf8')
const clubPatches = [
  ["name: 'Hansi Flick',\n      nation: 'GER',", "name: 'Hansi Flick',\n      managerId: 'flick',\n      nation: 'GER',"],
  ["name: 'Carlo Ancelotti',\n      nation: 'ITA',", "name: 'Carlo Ancelotti',\n      managerId: 'ancelotti',\n      nation: 'ITA',"],
  ["name: 'Vincent Kompany',\n      nation: 'BEL',", "name: 'Vincent Kompany',\n      managerId: 'kompany',\n      nation: 'BEL',"],
  ["name: 'Luis Enrique',\n      nation: 'ESP',", "name: 'Luis Enrique',\n      managerId: 'luis-enrique',\n      nation: 'ESP',"],
]
for (const [a, b] of clubPatches) {
  if (clubs.includes(a) && !clubs.includes(b)) clubs = clubs.replace(a, b)
}
fs.writeFileSync('src/clubData.js', clubs)

console.log('players clubId', data.includes("clubId: 'fc-barcelona'"))
console.log('managers', clubs.includes("managerId: 'flick'"))
