'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Send,
  ArrowLeft,
  Zap,
  Loader2,
  User,
  Bot,
  Sparkles,
  BarChart3,
  Target,
  Users,
  FileText,
  RefreshCw,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { icon: BarChart3, text: "Fenerbahçe'nin son performansını analiz et", color: 'text-blue-400' },
  { icon: Target, text: 'GS - BJK maçı için tahmin yap', color: 'text-purple-400' },
  { icon: Users, text: 'Icardi vs Dzeko karşılaştır', color: 'text-green-400' },
  { icon: FileText, text: 'Derbi için video scripti yaz', color: 'text-orange-400' },
]

// Backend API URL (Railway'de deploy edildikten sonra güncellenecek)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ChatPageClient() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // URL'den gelen soru varsa otomatik gönder
  useEffect(() => {
    const query = searchParams.get('q')
    if (query && messages.length === 0) {
      setInput(query)
      // Küçük bir gecikme ile gönder
      setTimeout(() => {
        handleSend(query)
      }, 500)
    }
  }, [searchParams])

  // Otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // AI API'ye istek at
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('API yanıt vermedi')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response || 'Bir hata oluştu, lütfen tekrar deneyin.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Hata durumunda demo yanıt
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: `**Demo Mod** - Backend henüz bağlı değil.\n\nSorunuz: "${text}"\n\nBackend Railway'de deploy edildikten sonra gerçek AI yanıtları alacaksınız. Şimdilik uygulamanın arayüzünü test edebilirsiniz.\n\n**Yapılacaklar:**\n1. Railway hesabı aç\n2. Backend'i deploy et\n3. API URL'ini güncelle`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-background-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white">AI Asistan</span>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yeni Sohbet
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Futbol AI Asistan</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Maç analizleri, oyuncu karşılaştırmaları, tahminler ve video scriptleri için bana sor!
            </p>

            {/* Quick Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-3 bg-background-card p-4 rounded-xl border border-gray-800 hover:border-primary/50 transition-colors text-left group"
                >
                  <prompt.icon className={`w-5 h-5 ${prompt.color}`} />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {prompt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-background-card border border-gray-800 text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-light' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-background-card border border-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Düşünüyor...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-background-card p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Futbol hakkında bir şey sor..."
              className="flex-1 bg-background border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Süper Lig, Şampiyonlar Ligi ve Avrupa Ligi verileri destekleniyor
          </p>
        </div>
      </div>
    </div>
  )
}

