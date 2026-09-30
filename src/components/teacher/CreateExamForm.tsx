'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Trash2, CheckCircle2, 
  HelpCircle, BookOpen, Clock, Award, Save 
} from 'lucide-react'

interface QuestionSummary {
  id: string
  skill: string
  type: string
  difficulty: string
  text: string
  points: number
}

interface CreateExamFormProps {
  availableQuestions: QuestionSummary[]
}

export default function CreateExamForm({ availableQuestions }: CreateExamFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('NATIONAL_MOCK')
  const [grade, setGrade] = useState('12')
  const [duration, setDuration] = useState('50')
  const [passingScore, setPassingScore] = useState('5')
  const [status, setStatus] = useState('PUBLISHED')

  // Selected questions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL')

  const toggleQuestion = (qId: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    )
  }

  const selectAllFiltered = () => {
    const idsToAdd = filteredQuestions.map(q => q.id)
    setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...idsToAdd])))
  }

  const deselectAllFiltered = () => {
    const idsToRemove = new Set(filteredQuestions.map(q => q.id))
    setSelectedQuestionIds(prev => prev.filter(id => !idsToRemove.has(id)))
  }

  const filteredQuestions = availableQuestions.filter(q => {
    const matchesSkill = selectedSkillFilter === 'ALL' || q.skill === selectedSkillFilter
    const matchesSearch = searchQuery === '' || q.text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSkill && matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đề thi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          grade: parseInt(grade),
          duration: parseInt(duration),
          passingScore: parseFloat(passingScore),
          status,
          questionIds: selectedQuestionIds,
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo đề thi')
      }

      router.push('/teacher/exams')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể tạo đề thi')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {error && (
        <div className="p-4 bg-[#F3DAD3] border-2 border-[#C1432E] text-[#C1432E] font-bold text-xs flex items-center gap-2">
          <HelpCircle size={16} />
          {error}
        </div>
      )}

      {/* Basic Info Box */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
            1. Thông tin chung của đề thi
          </h2>
          <p className="text-xs text-[#6B7A94] mt-1">
            Thiết lập tiêu đề, khối lớp, phân loại và thời gian làm bài theo quy chuẩn
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Tiêu đề đề thi <span className="text-[#C1432E]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử THPT Quốc Gia năm 2026 - Đợt 2"
              className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-sm font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Mô tả / Hướng dẫn đề thi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả cấu trúc đề thi, phạm vi kiến thức hoặc dặn dò thí sinh trước khi làm bài..."
              className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-sm font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
                Dạng đề thi
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
              >
                <option value="NATIONAL_MOCK">Thi thử THPT Quốc Gia</option>
                <option value="MID_TERM">Thi giữa học kỳ</option>
                <option value="FINAL_EXAM">Thi cuối học kỳ</option>
                <option value="MINI_TEST">Kiểm tra 15 phút</option>
                <option value="SKILL_PRACTICE">Luyện tập kỹ năng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
                Khối lớp áp dụng
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
              >
                <option value="12">Lớp 12 (Trọng tâm THPT)</option>
                <option value="11">Lớp 11</option>
                <option value="10">Lớp 10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
                Thời gian làm bài
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-[#6B7A94]">Phút</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
                Trạng thái xuất bản
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
              >
                <option value="PUBLISHED">Xuất bản ngay (Học sinh làm được)</option>
                <option value="DRAFT">Lưu bản nháp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Select Questions from Bank */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
              2. Chọn câu hỏi từ Ngân hàng câu hỏi
            </h2>
            <p className="text-xs text-[#6B7A94] mt-1">
              Đã chọn: <strong className="text-[#C1432E] font-mono text-sm">{selectedQuestionIds.length}</strong> câu hỏi vào đề thi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-3 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-mono font-bold border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[2px_2px_0_#1D2B4F]"
            >
              Chọn tất cả đang lọc ({filteredQuestions.length})
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="px-3 py-1.5 bg-[#FFFDF7] text-[#6B7A94] text-xs font-mono font-bold border-2 border-[#E7DEC9] hover:border-[#1D2B4F]"
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm nội dung câu hỏi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] font-mono shadow-[2px_2px_0_#1D2B4F]"
          />

          <select
            value={selectedSkillFilter}
            onChange={e => setSelectedSkillFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-mono font-bold text-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F]"
          >
            <option value="ALL">Tất cả kỹ năng</option>
            <option value="READING">Reading (Đọc hiểu)</option>
            <option value="LISTENING">Listening (Luyện nghe)</option>
            <option value="GRAMMAR">Grammar (Ngữ pháp)</option>
            <option value="VOCABULARY">Vocabulary (Từ vựng)</option>
          </select>
        </div>

        {/* Question Cards List */}
        <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-2">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7A94] font-mono">
              Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isSelected = selectedQuestionIds.includes(q.id)

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`p-4 border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#DCE9E3] border-[#4C7A6B] shadow-[2px_2px_0_#4C7A6B]'
                      : 'bg-[#FFFDF7] border-[#E7DEC9] hover:border-[#1D2B4F]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1D2B4F]">#{idx + 1}</span>
                      <span
                        className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#1D2B4F] text-white"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {q.skill}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FBF6EC] text-[#6B7A94] border border-[#E7DEC9]">
                        {q.type}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B7A94]">Độ khó: {q.difficulty}</span>
                    </div>

                    <p className="text-xs text-[#1D2B4F] line-clamp-2 leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`w-6 h-6 border-2 flex items-center justify-center font-bold text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#4C7A6B] border-[#4C7A6B] text-white'
                          : 'bg-[#FFFDF7] border-[#1D2B4F]'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Submit Sticky / Bottom Bar */}
      <div className="flex items-center justify-between gap-4 p-6 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
        <Link
          href="/teacher/exams"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FFFDF7] text-[#1D2B4F] font-bold text-xs font-mono border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[2px_2px_0_#1D2B4F]"
        >
          <ArrowLeft size={16} /> HỦY BỎ
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2.5 px-8 py-3 bg-[#C1432E] text-white font-bold text-sm font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:bg-[#A83724] disabled:opacity-50 transition-all"
        >
          <Save size={18} />
          {loading ? 'ĐANG LƯU ĐỀ THI...' : `LƯU VÀ XUẤT BẢN ĐỀ THI (${selectedQuestionIds.length} CÂU)`}
        </button>
      </div>
    </form>
  )
}
