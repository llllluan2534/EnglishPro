'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import AudioUploader from '@/components/teacher/AudioUploader'
import { 
  BookOpen, Save, Eye, Music, FileVideo, Globe,
  CheckCircle2, Loader2, Sparkles, Mic
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy load vì TipTap chỉ chạy ở client
const RichTextEditor = dynamic(() => import('@/components/teacher/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-[1.25rem] bg-slate-50 flex items-center justify-center" style={{ minHeight: 300 }}>
      <Loader2 className="animate-spin text-slate-400" size={28} />
    </div>
  ),
})

type SkillType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY'
type DifficultyType = 'EASY' | 'MEDIUM' | 'HARD'

interface FormData {
  title: string
  description: string
  skill: SkillType
  difficulty: DifficultyType
  order: number
  // content blocks
  htmlContent: string   // block type="text"
  audioUrl: string | null  // block type="audio"
  videoUrl: string      // block type="video"
}

const SKILLS: { id: SkillType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'READING',    label: 'Đọc (Reading)',    icon: <BookOpen size={18} />,  color: 'blue' },
  { id: 'LISTENING',  label: 'Nghe (Listening)', icon: <Music size={18} />,     color: 'purple' },
  { id: 'SPEAKING',   label: 'Nói (Speaking)',   icon: <Mic size={18} />,       color: 'orange' },
  { id: 'WRITING',    label: 'Viết (Writing)',   icon: <Globe size={18} />,     color: 'emerald' },
  { id: 'GRAMMAR',    label: 'Ngữ pháp',         icon: <BookOpen size={18} />,  color: 'indigo' },
  { id: 'VOCABULARY', label: 'Từ vựng',           icon: <FileVideo size={18} />, color: 'rose' },
]

const DIFFICULTIES: { id: DifficultyType; label: string; color: string }[] = [
  { id: 'EASY',   label: 'Dễ',    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'MEDIUM', label: 'Trung bình', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'HARD',   label: 'Khó',   color: 'text-red-600 bg-red-50 border-red-200' },
]

const SKILL_COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-300 bg-blue-50 text-blue-700',
  purple: 'border-purple-300 bg-purple-50 text-purple-700',
  orange: 'border-orange-300 bg-orange-50 text-orange-700',
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-700',
  rose: 'border-rose-300 bg-rose-50 text-rose-700',
}

export default function LessonCreateForm({ topicId }: { topicId: string }) {
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    skill: 'READING',
    difficulty: 'MEDIUM',
    order: 1,
    htmlContent: '',
    audioUrl: null,
    videoUrl: '',
  })
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentSkill = SKILLS.find(s => s.id === form.skill)!

  const buildBlocks = () => {
    const blocks = []
    if (form.htmlContent) blocks.push({ order: 0, type: 'text', content: { html: form.htmlContent } })
    if (form.audioUrl && form.skill === 'LISTENING') blocks.push({ order: 1, type: 'audio', content: { url: form.audioUrl, transcript: '' } })
    if (form.videoUrl) blocks.push({ order: 2, type: 'video', content: { url: form.videoUrl } })
    return blocks
  }

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề bài học.'); return }
    if (!topicId) { setError('Bài học phải thuộc một chủ đề. Vui lòng chọn chủ đề trước.'); return }
    setError(null); setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          title: form.title,
          description: form.description,
          skill: form.skill,
          difficulty: form.difficulty,
          order: form.order,
          status,
          blocks: buildBlocks(),
        }),
      })
      if (!res.ok) { const { error } = await res.json(); throw new Error(error ?? 'Lưu thất bại') }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-500" size={26} /> Soạn bài học mới
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Nháp cho đến khi bấm "Xuất bản".</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => setPreview(!preview)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Eye size={16} /> {preview ? 'Chỉnh sửa' : 'Xem trước'}
          </button>
          <button type="button" onClick={() => handleSave('DRAFT')} disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu nháp
          </button>
          <button type="button" onClick={() => handleSave('PUBLISHED')} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} />Đã xuất bản!</> 
              : saving ? <><Loader2 size={16} className="animate-spin" />Đang lưu…</> 
              : <><Sparkles size={16} />Xuất bản</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-medium text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Tiêu đề *</span>
              <input type="text" value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="VD: Lesson 1 – Greetings"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all text-sm font-medium" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Mô tả ngắn</span>
              <textarea rows={3} value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Giới thiệu ngắn về bài học này…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all text-sm font-medium resize-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Thứ tự bài</span>
              <input type="number" min={1} value={form.order}
                onChange={(e) => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all text-sm font-medium" />
            </label>
          </div>

          {/* Kỹ năng */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">Kỹ năng (Skill)</span>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((s) => (
                <button key={s.id} type="button" onClick={() => setForm(f => ({ ...f, skill: s.id }))}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all',
                    form.skill === s.id ? SKILL_COLOR_MAP[s.color] : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  )}>
                  {s.icon}
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Độ khó */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">Độ khó</span>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d.id} type="button" onClick={() => setForm(f => ({ ...f, difficulty: d.id }))}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all',
                    form.difficulty === d.id ? d.color : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  )}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Nội dung bài học</span>
              <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold', SKILL_COLOR_MAP[currentSkill.color])}>
                {currentSkill.icon} {currentSkill.label}
              </span>
            </div>
            {preview ? (
              <div className="prose prose-slate max-w-none px-2 py-4 min-h-[300px] border border-slate-100 rounded-xl"
                dangerouslySetInnerHTML={{ __html: form.htmlContent || '<p class="text-slate-400 italic">Chưa có nội dung.</p>' }} />
            ) : (
              <RichTextEditor
                content={form.htmlContent}
                placeholder="Bắt đầu soạn thảo nội dung bài học..."
                onChange={(html) => setForm(f => ({ ...f, htmlContent: html }))}
                minHeight={320}
              />
            )}
          </div>

          {form.skill === 'LISTENING' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">File Audio bài nghe 🎧</span>
              <AudioUploader value={form.audioUrl} onChange={(url) => setForm(f => ({ ...f, audioUrl: url }))} />
            </div>
          )}

          {(form.skill === 'READING' || form.skill === 'GRAMMAR') && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">URL Video bổ trợ (tuỳ chọn)</span>
                <input type="url" value={form.videoUrl}
                  onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all text-sm font-medium" />
              </label>
              {form.videoUrl && (
                <iframe src={form.videoUrl.replace('watch?v=', 'embed/')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="w-full aspect-video rounded-2xl border border-slate-200" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
