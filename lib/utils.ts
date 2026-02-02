import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export boyutları
export const EXPORT_SIZES = {
  '1:1_HD': { width: 1080, height: 1080, label: '1:1 HD (1080x1080)' },
  '1:1_4K': { width: 2160, height: 2160, label: '1:1 4K (2160x2160)' },
  '16:9_HD': { width: 1920, height: 1080, label: '16:9 HD (1920x1080)' },
  '16:9_4K': { width: 3840, height: 2160, label: '16:9 4K (3840x2160)' },
  'YT_THUMBNAIL': { width: 1280, height: 720, label: 'YouTube Thumbnail (1280x720)' },
} as const

// Süper Lig takımları
export const SUPER_LIG_TEAMS = [
  { id: 'fenerbahce', name: 'Fenerbahçe', shortName: 'FB', colors: { primary: '#00235D', secondary: '#FFED00' } },
  { id: 'galatasaray', name: 'Galatasaray', shortName: 'GS', colors: { primary: '#C8102E', secondary: '#FDB913' } },
  { id: 'besiktas', name: 'Beşiktaş', shortName: 'BJK', colors: { primary: '#000000', secondary: '#FFFFFF' } },
  { id: 'trabzonspor', name: 'Trabzonspor', shortName: 'TS', colors: { primary: '#6B1D36', secondary: '#00AEEF' } },
  { id: 'basaksehir', name: 'Başakşehir', shortName: 'IBB', colors: { primary: '#F37021', secondary: '#1E3A5F' } },
  { id: 'antalyaspor', name: 'Antalyaspor', shortName: 'ANT', colors: { primary: '#D0021B', secondary: '#FFFFFF' } },
  { id: 'alanyaspor', name: 'Alanyaspor', shortName: 'ALN', colors: { primary: '#F26522', secondary: '#006838' } },
  { id: 'konyaspor', name: 'Konyaspor', shortName: 'KON', colors: { primary: '#006B3F', secondary: '#FFFFFF' } },
  { id: 'sivasspor', name: 'Sivasspor', shortName: 'SVS', colors: { primary: '#D91A2A', secondary: '#FFFFFF' } },
  { id: 'kasimpasa', name: 'Kasımpaşa', shortName: 'KAS', colors: { primary: '#1E3A8A', secondary: '#FFFFFF' } },
  { id: 'kayserispor', name: 'Kayserispor', shortName: 'KYS', colors: { primary: '#FFD700', secondary: '#D32F2F' } },
  { id: 'ankaragucu', name: 'Ankaragücü', shortName: 'AG', colors: { primary: '#1E3A5F', secondary: '#FFD700' } },
  { id: 'samsunspor', name: 'Samsunspor', shortName: 'SAM', colors: { primary: '#E03A3E', secondary: '#FFFFFF' } },
  { id: 'rizespor', name: 'Rizespor', shortName: 'RZS', colors: { primary: '#0068B3', secondary: '#5EAC24' } },
  { id: 'hatayspor', name: 'Hatayspor', shortName: 'HTY', colors: { primary: '#8B0000', secondary: '#FFFFFF' } },
  { id: 'gaziantep', name: 'Gaziantep FK', shortName: 'GFK', colors: { primary: '#D32F2F', secondary: '#000000' } },
  { id: 'adanademirspor', name: 'Adana Demirspor', shortName: 'ADS', colors: { primary: '#1565C0', secondary: '#FF6F00' } },
  { id: 'pendikspor', name: 'Pendikspor', shortName: 'PEN', colors: { primary: '#9C27B0', secondary: '#FFFFFF' } },
  { id: 'istanbulspor', name: 'İstanbulspor', shortName: 'IST', colors: { primary: '#FFD700', secondary: '#000000' } },
]

// Format tarihi
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Kısa tarih
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}
