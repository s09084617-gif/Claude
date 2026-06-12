import React, { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import {
  QrCode,
  ScanLine,
  Download,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { api, Workout, NutritionPlan, Episode } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

type Tab = 'scan' | 'generate'
type GenerateType = 'workout' | 'episode' | 'nutrition' | 'custom'

// ── Generate tab ─────────────────────────────────────────────────────────────

function GenerateTab() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [type, setType] = useState<GenerateType>('workout')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // Fetch lists when type changes
  useEffect(() => {
    setSelectedId('')
    setLoading(true)
    const load = async () => {
      try {
        if (type === 'workout') {
          const res = await api.getWorkouts(user?.id)
          setWorkouts(res.data)
        } else if (type === 'episode') {
          const res = await api.getEpisodes(user?.id)
          setEpisodes(res.data)
        } else if (type === 'nutrition') {
          const res = await api.getNutritionPlans()
          setPlans(res.data)
        }
      } catch {
        // silently ignore — items list will be empty
      } finally {
        setLoading(false)
      }
    }
    if (type !== 'custom') load()
    else setLoading(false)
  }, [type, user?.id])

  // Build the QR payload string
  const qrValue = (() => {
    if (type === 'custom') return customText.trim()
    if (!selectedId) return ''
    const base = `${window.location.origin}/iblitz`
    if (type === 'workout') {
      const w = workouts.find((x) => x.id === selectedId)
      return w
        ? `${base}/workout/${w.id}?program=${encodeURIComponent(w.program)}&goal=${encodeURIComponent(w.details?.goal ?? '')}`
        : ''
    }
    if (type === 'episode') {
      const ep = episodes.find((x) => x.id === selectedId)
      return ep ? `${base}/episode/${ep.id}?name=${encodeURIComponent(ep.name)}` : ''
    }
    if (type === 'nutrition') {
      const pl = plans.find((x) => x.id === selectedId)
      return pl ? `${base}/nutrition/${pl.id}?title=${encodeURIComponent(pl.title)}` : ''
    }
    return ''
  })()

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iblitz-qr-${type}-${selectedId || 'custom'}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast('QR code downloaded')
  }

  const handleCopy = async () => {
    if (!qrValue) return
    await navigator.clipboard.writeText(qrValue)
    toast('QR content copied to clipboard')
  }

  const typeOptions: { value: GenerateType; label: string }[] = [
    { value: 'workout', label: 'Workout Plan' },
    { value: 'episode', label: 'Assessment Episode' },
    { value: 'nutrition', label: 'Nutrition Plan' },
    { value: 'custom', label: 'Custom Text / URL' },
  ]

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                type === opt.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item selector or custom input */}
      {type === 'custom' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text or URL to encode
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Enter any text, URL, or data to encode as a QR code…"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select {typeOptions.find((o) => o.value === type)?.label}
          </label>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
              <Loader2 size={14} className="animate-spin" />
              Loading…
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">— select an item —</option>
              {type === 'workout' &&
                workouts.map((w) => (
                  <option key={w.id} value={w.id}>
                    #{w.id} · {w.program} ({w.details?.goal ?? 'no goal'})
                  </option>
                ))}
              {type === 'episode' &&
                episodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    #{ep.id} · {ep.name}
                  </option>
                ))}
              {type === 'nutrition' &&
                plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} · {p.title}
                  </option>
                ))}
            </select>
          )}
        </div>
      )}

      {/* QR Output */}
      {qrValue ? (
        <div className="flex flex-col items-center gap-5 pt-2">
          <div
            ref={qrRef}
            className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm inline-flex"
          >
            <QRCodeSVG
              value={qrValue}
              size={220}
              bgColor="#ffffff"
              fgColor="#1e3a8a"
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 font-mono break-all text-center mb-3 line-clamp-2">
              {qrValue}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={15} />
                Download SVG
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Copy size={15} />
                Copy
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
          <QrCode size={56} className="mb-2" />
          <p className="text-sm text-gray-400">
            {type === 'custom' ? 'Enter text above to preview QR' : 'Select an item to generate a QR code'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Scan tab ─────────────────────────────────────────────────────────────────

type ScanMode = 'camera' | 'image'

function ScanTab() {
  const { toast } = useToast()
  const [mode, setMode] = useState<ScanMode>('camera')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load camera list
  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devs) => {
        setCameras(devs)
        if (devs.length > 0) setSelectedCamera(devs[0].deviceId)
      })
      .catch(() => {})
  }, [])

  const stopCamera = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setScanning(false)
  }, [])

  // Stop camera when switching modes or unmounting
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  useEffect(() => {
    if (mode !== 'camera') stopCamera()
  }, [mode, stopCamera])

  const startCamera = async () => {
    setError(null)
    setResult(null)
    if (!videoRef.current) return
    try {
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      setScanning(true)
      await reader.decodeFromVideoDevice(
        selectedCamera || undefined,
        videoRef.current,
        (res, err) => {
          if (res) {
            setResult(res.getText())
            toast('QR code detected!')
            stopCamera()
          }
          if (err && !(err.message?.includes('No MultiFormat'))) {
            // suppress continuous "not found" errors from the scanner
          }
        },
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Camera access denied or unavailable.'
      setError(msg)
      setScanning(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setResult(null)
    try {
      const url = URL.createObjectURL(file)
      const reader = new BrowserMultiFormatReader()
      const res = await reader.decodeFromImageUrl(url)
      URL.revokeObjectURL(url)
      setResult(res.getText())
      toast('QR code decoded from image!')
    } catch {
      setError('No QR code found in the image. Try a clearer photo.')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    toast('Result copied to clipboard')
  }

  const openResult = () => {
    if (!result) return
    try {
      const url = new URL(result)
      window.open(url.toString(), '_blank', 'noopener')
    } catch {
      toast('Result is not a URL', 'info')
    }
  }

  const isUrl = (s: string) => {
    try { new URL(s); return true } catch { return false }
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['camera', 'image'] as ScanMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
              mode === m
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50'
            }`}
          >
            {m === 'camera' ? <Camera size={15} /> : <Upload size={15} />}
            {m === 'camera' ? 'Live Camera' : 'Upload Image'}
          </button>
        ))}
      </div>

      {/* Camera panel */}
      {mode === 'camera' && (
        <div className="space-y-3">
          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Camera size={40} className="text-gray-500" />
                <p className="text-gray-400 text-sm">Camera preview</p>
              </div>
            )}
            {/* Scan overlay */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/60 rounded-lg relative">
                  <span className="absolute -top-px -left-px w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-md" />
                  <span className="absolute -top-px -right-px w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-md" />
                  <span className="absolute -bottom-px -left-px w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-md" />
                  <span className="absolute -bottom-px -right-px w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-md" />
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand-400/70 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!scanning ? (
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ScanLine size={16} />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw size={16} className="animate-spin" />
                Stop Camera
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image upload panel */}
      {mode === 'image' && (
        <div>
          <label className="flex flex-col items-center justify-center gap-3 w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
            <Upload size={36} className="text-gray-300" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Click to upload a QR code image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — any image containing a QR code</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-5 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-green-600" />
            <p className="font-semibold text-gray-900 text-sm">QR Code Decoded</p>
          </div>
          <p className="text-sm text-gray-800 font-mono break-all bg-white rounded-lg p-3 border border-green-100 mb-3">
            {result}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Copy size={13} />
              Copy
            </button>
            {isUrl(result) && (
              <button
                onClick={openResult}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Open URL
              </button>
            )}
            <button
              onClick={() => { setResult(null); setError(null); if (fileRef.current) fileRef.current.value = '' }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors ml-auto"
            >
              <RefreshCw size={13} />
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function QRScanner() {
  const [tab, setTab] = useState<Tab>('scan')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
        <p className="text-gray-500 mt-1">
          Scan QR codes with your camera or an image, or generate QR codes for your plans.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {([
            { key: 'scan', label: 'Scan QR Code', icon: <ScanLine size={16} /> },
            { key: 'generate', label: 'Generate QR Code', icon: <QrCode size={16} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/40'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'scan' ? <ScanTab /> : <GenerateTab />}
        </div>
      </div>
    </div>
  )
}
