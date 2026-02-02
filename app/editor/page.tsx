'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Download,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Layers,
  Settings,
  ChevronDown,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Save,
  Eye,
} from 'lucide-react'
import { EXPORT_SIZES, SUPER_LIG_TEAMS, cn } from '@/lib/utils'

// Canvas boyutları
const CANVAS_PRESETS = {
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
}

interface CanvasObject {
  id: string
  type: 'text' | 'image' | 'rect' | 'circle' | 'team-logo'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  content?: string
  fill?: string
  fontSize?: number
  fontWeight?: string
  teamId?: string
  src?: string
}

export default function EditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasRatio, setCanvasRatio] = useState<'1:1' | '16:9'>('16:9')
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0.5)
  const [backgroundColor, setBackgroundColor] = useState('#0F172A')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showTeamSelector, setShowTeamSelector] = useState(false)

  const canvasSize = CANVAS_PRESETS[canvasRatio]
  const displayWidth = canvasSize.width * zoom
  const displayHeight = canvasSize.height * zoom

  // Canvas'ı çiz
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas boyutunu ayarla
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    // Arka plan
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Nesneleri çiz
    objects.forEach((obj) => {
      ctx.save()

      // Transform
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2)
      ctx.rotate((obj.rotation * Math.PI) / 180)
      ctx.translate(-(obj.x + obj.width / 2), -(obj.y + obj.height / 2))

      if (obj.type === 'text') {
        ctx.fillStyle = obj.fill || '#FFFFFF'
        ctx.font = `${obj.fontWeight || 'bold'} ${obj.fontSize || 48}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(obj.content || 'Metin', obj.x + obj.width / 2, obj.y + obj.height / 2)
      } else if (obj.type === 'rect') {
        ctx.fillStyle = obj.fill || '#6366F1'
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
      } else if (obj.type === 'circle') {
        ctx.fillStyle = obj.fill || '#22C55E'
        ctx.beginPath()
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Seçili nesne çerçevesi
      if (selectedId === obj.id) {
        ctx.strokeStyle = '#6366F1'
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.strokeRect(obj.x - 5, obj.y - 5, obj.width + 10, obj.height + 10)
      }

      ctx.restore()
    })
  }, [objects, selectedId, backgroundColor, canvasSize])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Nesne ekle
  const addObject = (type: CanvasObject['type']) => {
    const newObj: CanvasObject = {
      id: `obj_${Date.now()}`,
      type,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 50,
      width: type === 'text' ? 400 : 200,
      height: type === 'text' ? 60 : 200,
      rotation: 0,
      fill: type === 'text' ? '#FFFFFF' : type === 'rect' ? '#6366F1' : '#22C55E',
      content: type === 'text' ? 'Metin Ekle' : undefined,
      fontSize: 48,
      fontWeight: 'bold',
    }
    setObjects([...objects, newObj])
    setSelectedId(newObj.id)
  }

  // Seçili nesneyi sil
  const deleteSelected = () => {
    if (!selectedId) return
    setObjects(objects.filter((o) => o.id !== selectedId))
    setSelectedId(null)
  }

  // Export fonksiyonu
  const exportCanvas = (sizeKey: keyof typeof EXPORT_SIZES) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const size = EXPORT_SIZES[sizeKey]
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = size.width
    exportCanvas.height = size.height

    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    // Orijinal canvas'ı ölçekle
    ctx.drawImage(canvas, 0, 0, size.width, size.height)

    // İndir
    const link = document.createElement('a')
    link.download = `futbol-grafik-${sizeKey}-${Date.now()}.png`
    link.href = exportCanvas.toDataURL('image/png', 1.0)
    link.click()

    setShowExportMenu(false)
  }

  // Seçili nesne
  const selectedObject = objects.find((o) => o.id === selectedId)

  // Nesne güncelle
  const updateObject = (updates: Partial<CanvasObject>) => {
    if (!selectedId) return
    setObjects(objects.map((o) => (o.id === selectedId ? { ...o, ...updates } : o)))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 bg-background-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <span className="font-semibold text-white">Editör</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Canvas Ratio */}
          <div className="flex bg-background rounded-lg p-1">
            <button
              onClick={() => setCanvasRatio('1:1')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                canvasRatio === '1:1' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              1:1
            </button>
            <button
              onClick={() => setCanvasRatio('16:9')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                canvasRatio === '16:9' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              16:9
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-background rounded-lg px-2 py-1">
            <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-1 hover:bg-background-hover rounded">
              <ZoomOut className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-sm text-gray-300 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1, zoom + 0.1))} className="p-1 hover:bg-background-hover rounded">
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-background-card border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 min-w-[200px]">
                {Object.entries(EXPORT_SIZES).map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() => exportCanvas(key as keyof typeof EXPORT_SIZES)}
                    className="w-full px-4 py-3 text-left hover:bg-background-hover transition-colors"
                  >
                    <span className="text-sm font-medium text-white">{size.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <aside className="w-16 border-r border-gray-800 bg-background-card flex flex-col items-center py-4 gap-2">
          <button
            onClick={() => addObject('text')}
            className="w-10 h-10 rounded-lg hover:bg-background-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            title="Metin Ekle"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={() => addObject('rect')}
            className="w-10 h-10 rounded-lg hover:bg-background-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            title="Dikdörtgen"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => addObject('circle')}
            className="w-10 h-10 rounded-lg hover:bg-background-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            title="Daire"
          >
            <Circle className="w-5 h-5" />
          </button>

          <div className="w-8 h-px bg-gray-800 my-2" />

          <button
            onClick={() => setShowTeamSelector(!showTeamSelector)}
            className="w-10 h-10 rounded-lg hover:bg-background-hover flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            title="Takım Logosu"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button
            onClick={deleteSelected}
            disabled={!selectedId}
            className="w-10 h-10 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30"
            title="Sil"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 overflow-auto bg-background p-8 flex items-center justify-center">
          <div
            className="relative canvas-container rounded-lg overflow-hidden"
            style={{ width: displayWidth, height: displayHeight }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: displayWidth,
                height: displayHeight,
              }}
              className="cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / zoom
                const y = (e.clientY - rect.top) / zoom

                // Tıklanan nesneyi bul
                const clicked = [...objects].reverse().find((obj) => {
                  return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height
                })
                setSelectedId(clicked?.id || null)
              }}
            />
          </div>
        </main>

        {/* Right Panel - Properties */}
        <aside className="w-72 border-l border-gray-800 bg-background-card overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Özellikler
            </h3>

            {/* Background Color */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-2">Arka Plan Rengi</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 bg-background border border-gray-700 rounded-lg px-3 text-sm text-white"
                />
              </div>
              {/* Preset Colors */}
              <div className="flex gap-2 mt-2">
                {['#0F172A', '#1E293B', '#000000', '#1a1a2e', '#16213e'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className="w-8 h-8 rounded-lg border-2 border-gray-700 hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Selected Object Properties */}
            {selectedObject && (
              <>
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Seçili: {selectedObject.type === 'text' ? 'Metin' : selectedObject.type === 'rect' ? 'Dikdörtgen' : 'Daire'}
                  </h4>

                  {/* Position */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.x)}
                        onChange={(e) => updateObject({ x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.y)}
                        onChange={(e) => updateObject({ y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Size */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Genişlik</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.width)}
                        onChange={(e) => updateObject({ width: parseInt(e.target.value) || 100 })}
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Yükseklik</label>
                      <input
                        type="number"
                        value={Math.round(selectedObject.height)}
                        onChange={(e) => updateObject({ height: parseInt(e.target.value) || 100 })}
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Color */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1">Renk</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedObject.fill || '#FFFFFF'}
                        onChange={(e) => updateObject({ fill: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={selectedObject.fill || '#FFFFFF'}
                        onChange={(e) => updateObject({ fill: e.target.value })}
                        className="flex-1 bg-background border border-gray-700 rounded-lg px-3 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Text specific */}
                  {selectedObject.type === 'text' && (
                    <>
                      <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Metin</label>
                        <input
                          type="text"
                          value={selectedObject.content || ''}
                          onChange={(e) => updateObject({ content: e.target.value })}
                          className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Font Boyutu</label>
                        <input
                          type="number"
                          value={selectedObject.fontSize || 48}
                          onChange={(e) => updateObject({ fontSize: parseInt(e.target.value) || 48 })}
                          className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Rotation */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1">Rotasyon: {selectedObject.rotation}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedObject.rotation}
                      onChange={(e) => updateObject({ rotation: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Team Colors Quick Access */}
            <div className="border-t border-gray-800 pt-4 mt-4">
              <h4 className="text-sm font-medium text-white mb-3">Takım Renkleri</h4>
              <div className="space-y-2">
                {SUPER_LIG_TEAMS.slice(0, 4).map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">{team.shortName}</span>
                    <button
                      onClick={() => selectedId && updateObject({ fill: team.colors.primary })}
                      className="w-6 h-6 rounded border border-gray-700"
                      style={{ backgroundColor: team.colors.primary }}
                      title={`${team.name} Ana`}
                    />
                    <button
                      onClick={() => selectedId && updateObject({ fill: team.colors.secondary })}
                      className="w-6 h-6 rounded border border-gray-700"
                      style={{ backgroundColor: team.colors.secondary }}
                      title={`${team.name} İkincil`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Team Selector Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTeamSelector(false)}>
          <div className="bg-background-card rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Takım Seç</h3>
            <div className="grid grid-cols-3 gap-3">
              {SUPER_LIG_TEAMS.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    // Takım renkleriyle bir nesne ekle
                    const newObj: CanvasObject = {
                      id: `obj_${Date.now()}`,
                      type: 'rect',
                      x: canvasSize.width / 2 - 75,
                      y: canvasSize.height / 2 - 75,
                      width: 150,
                      height: 150,
                      rotation: 0,
                      fill: team.colors.primary,
                      teamId: team.id,
                    }
                    setObjects([...objects, newObj])
                    setSelectedId(newObj.id)
                    setShowTeamSelector(false)
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-background-hover transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-700"
                    style={{
                      background: `linear-gradient(135deg, ${team.colors.primary} 50%, ${team.colors.secondary} 50%)`,
                    }}
                  />
                  <span className="text-xs text-gray-300">{team.shortName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
