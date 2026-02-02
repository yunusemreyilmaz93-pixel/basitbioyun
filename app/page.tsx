'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Palette,
  Trophy,
  Users,
  Table2,
  ArrowRightLeft,
  Sparkles,
  ChevronRight,
  Zap,
  Download,
  Layers
} from 'lucide-react'

const TEMPLATE_CATEGORIES = [
  {
    id: 'match',
    title: 'Maç Kartı',
    description: 'Maç öncesi ve sonrası grafikleri',
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
    templates: ['Maç Önizleme', 'Skor Kartı', 'Maç Sonu']
  },
  {
    id: 'lineup',
    title: 'Kadro / 11',
    description: 'İlk 11 ve kadro grafikleri',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    templates: ['İlk 11', 'Kadro Listesi', 'Oyuncu Karşılaştırma']
  },
  {
    id: 'table',
    title: 'Puan Durumu',
    description: 'Lig tablosu ve sıralama',
    icon: Table2,
    color: 'from-blue-500 to-cyan-500',
    templates: ['Puan Tablosu', 'İlk 5', 'Düşme Hattı']
  },
  {
    id: 'transfer',
    title: 'Transfer',
    description: 'Transfer duyuru grafikleri',
    icon: ArrowRightLeft,
    color: 'from-purple-500 to-pink-500',
    templates: ['Hoş Geldin', 'Resmi Açıklama', 'Transfer Özeti']
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: '4K Kalite',
    description: '3840x2160 çözünürlükte profesyonel grafikler'
  },
  {
    icon: Download,
    title: 'Hızlı Export',
    description: 'PNG, JPG formatlarında anında indirme'
  },
  {
    icon: Layers,
    title: 'Çoklu Boyut',
    description: '1:1 ve 16:9 formatlarında export'
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Futbol Grafik Stüdyosu</h1>
                <p className="text-xs text-gray-400">Süper Lig Edition</p>
              </div>
            </div>
            <Link
              href="/editor"
              className="btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Yeni Grafik
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Profesyonel Futbol Grafikleri
            <span className="block text-primary">Saniyeler İçinde</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Süper Lig maçları için profesyonel grafikler oluştur.
            Maç kartları, puan durumu, transfer duyuruları ve daha fazlası.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-2 text-gray-300">
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{feature.title}</span>
              </div>
            ))}
          </div>

          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg"
          >
            Grafik Oluşturmaya Başla
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-card/30">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Şablon Kategorileri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/editor?template=${category.id}`}
                className="group bg-background-card rounded-2xl p-6 border border-gray-800 hover:border-primary/50 transition-all duration-300 card-hover"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{category.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.templates.map((template) => (
                    <span
                      key={template}
                      className="text-xs bg-background-hover px-2 py-1 rounded-md text-gray-300"
                    >
                      {template}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Teams Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Tüm Süper Lig Takımları
          </h3>
          <p className="text-gray-400 mb-8">
            19 takımın logoları ve renkleri hazır
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {['Fenerbahçe', 'Galatasaray', 'Beşiktaş', 'Trabzonspor', 'Başakşehir'].map((team) => (
              <div
                key={team}
                className="bg-background-card px-4 py-2 rounded-lg border border-gray-800"
              >
                <span className="text-sm font-medium text-gray-300">{team}</span>
              </div>
            ))}
            <div className="bg-background-card px-4 py-2 rounded-lg border border-gray-800">
              <span className="text-sm font-medium text-gray-500">+14 takım daha</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Futbol Grafik Stüdyosu &copy; 2024 - YouTube içerik üreticileri için
          </p>
        </div>
      </footer>
    </div>
  )
}
