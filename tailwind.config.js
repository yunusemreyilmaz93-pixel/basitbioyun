/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ana Renkler
        primary: {
          DEFAULT: '#6366F1', // Mor/Mavi vurgu
          dark: '#4F46E5',
          light: '#818CF8',
        },
        // Arka Plan Renkleri
        background: {
          DEFAULT: '#0F172A', // Koyu arka plan
          card: '#1E293B',    // Kart arka planı
          hover: '#334155',   // Hover durumu
        },
        // Yeşil (Çim)
        pitch: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#4ADE80',
        },
        // Altın (Önemli/Highlight)
        gold: {
          DEFAULT: '#EAB308',
          dark: '#CA8A04',
          light: '#FACC15',
        },
        // Takım Renkleri
        team: {
          fenerbahce: {
            yellow: '#FFED00',
            blue: '#00235D',
          },
          galatasaray: {
            yellow: '#FDB913',
            red: '#C8102E',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
