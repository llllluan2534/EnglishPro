'use client'

import { useCallback, useRef, useState } from 'react'
import { useUpload } from '@/hooks/useUpload'
import { Music, Upload, X, Loader2, Play, Pause, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioUploaderProps {
  value?: string | null      // URL file audio hiện tại
  onChange?: (url: string | null) => void
  className?: string
}

export default function AudioUploader({ value, onChange, className }: AudioUploaderProps) {
  const { upload } = useUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      setUploading(true)
      try {
        const url = await upload(file, 'audio')
        onChange?.(url)
      } catch (err: any) {
        setError(err.message ?? 'Upload thất bại')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [upload, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('audio/')) handleFile(file)
    },
    [handleFile]
  )

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-6 transition-all',
          value
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer'
        )}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm font-medium text-slate-600">Đang upload lên cloud…</p>
          </div>
        )}

        {value ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay() }}
              className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors shrink-0"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                File Audio đã upload
              </p>
              <p className="text-xs text-slate-500 truncate mt-1">{value}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange?.(null) }}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors ml-2 shrink-0"
            >
              <X size={14} />
            </button>
            <audio
              ref={audioRef}
              src={value}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Music className="text-slate-400" size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Kéo thả file audio vào đây</p>
              <p className="text-xs text-slate-500 mt-1">hoặc bấm để chọn file (MP3, WAV, OGG) — tối đa 50 MB</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Upload size={16} />
              Chọn file
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 px-1">
          <X size={12} className="shrink-0" /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
