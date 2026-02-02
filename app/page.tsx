'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  TrendingUp,
  Users,
  Trophy,
  Palette,
  Zap,
  ChevronRight,
  Sparkles,
  BarChart3,
  FileText,
  Target,
} from 'lucide-react'

const QUICK_ACTIONS = [
  {
    id: 'analyze',
    title: 'Maç Analizi',
    description: 'Detaylı maç analizi yap',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    href: '/chat?action=analyze'
  },
  {
    id: 'predict',
    title: 'Tahmin',
    description: 'Maç tahmini al',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    href: '/chat?action=predict'
  },
  {
    id: 'compare',
    title: 'Karşılaştır',
    description: 'Oyuncu karşılaştır',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    href: '/chat?action=compare'
  },
  {
    id: 'script',
    title: 'Video Script',
    description: 'YouTube scripti yaz',
    icon: FileText,
    color: 'from-orange-500 to-red-500',
    href: '/chat?action=script'
  },
]

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Asistan',
    description: 'Futbol hakkında her şeyi sor'
  },
  {
    icon: TrendingUp,
    title: 'Canlı Veriler',
    description: 'FBref & daha fazlası'
  },
  {
    icon: Palette,
    title: '4K Grafikler',
    description: 'Profesyonel görseller'
  },
]

const SUPPORTED_LEAGUES = [
  { name: 'Süper Lig', flag: '🇹🇷' },
  { name: 'Şampiyonlar Ligi', flag: '🏆' },
  { name: 'Avrupa Ligi', flag: '🏆' },
  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', flag: '🇪🇸' },
  { name: 'Serie A', flag: '🇮🇹' },
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
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Futbol AI Asistan</h1>
                <p className="text-xs text-gray-400">Analiz • Tahmin • Grafik</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/chat" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Chat
              </Link>
              <Link href="/standings" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Puan Durumu
              </Link>
              <Link href="/editor" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Grafik
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Yapay Zeka Destekli
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Futbol Analizinin
            <span className="block text-primary">Yeni Çağı</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Maç analizleri, oyuncu karşılaştırmaları, tahminler ve profesyonel grafikler.
            Tüm futbol ihtiyaçların için tek asistan.
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
            href="/chat"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 text-lg"
          >
            <MessageSquare className="w-5 h-5" />
            Asistana Sor
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-card/30">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Ne Yapmak İstersin?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="group bg-background-card rounded-2xl p-6 border border-gray-800 hover:border-primary/50 transition-all duration-300 card-hover"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{action.title}</h4>
                <p className="text-sm text-gray-400">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Example Prompts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Örnek Sorular
          </h3>

          <div className="grid gap-4">
            {[
              "Fenerbahçe - Galatasaray derbisini analiz et",
              "Icardi vs Dzeko karşılaştırması yap",
              "Şampiyonlar Ligi'nde Türk takımlarının şansı nedir?",
              "FB-GS maçı için YouTube video scripti yaz",
              "Süper Lig'de gol krallığı yarışını değerlendir",
            ].map((prompt, i) => (
              <Link
                key={i}
                href={`/chat?q=${encodeURIComponent(prompt)}`}
                className="flex items-center gap-4 bg-background-card p-4 rounded-xl border border-gray-800 hover:border-primary/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-background-hover flex items-center justify-center text-primary">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  "{prompt}"
                </span>
                <ChevronRight className="w-5 h-5 text-gray-600 ml-auto group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Leagues */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background-card/30">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Desteklenen Ligler
          </h3>
          <p className="text-gray-400 mb-8">
            Tüm büyük liglerin verileri ve analizleri
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {SUPPORTED_LEAGUES.map((league) => (
              <div
                key={league.name}
                className="flex items-center gap-2 bg-background-card px-4 py-2 rounded-lg border border-gray-800"
              >
                <span className="text-xl">{league.flag}</span>
                <span className="text-sm font-medium text-gray-300">{league.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl p-8 border border-primary/30">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Grafik Oluşturmaya Hazır mısın?
            </h3>
            <p className="text-gray-400 mb-6">
              Maç kartları, puan durumu grafikleri, oyuncu karşılaştırmaları ve daha fazlası
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-white text-background font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Palette className="w-5 h-5" />
              Grafik Stüdyosuna Git
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Futbol AI Asistan &copy; 2024 - YouTube içerik üreticileri için
          </p>
        </div>
      </footer>
    </div>
  )
}
