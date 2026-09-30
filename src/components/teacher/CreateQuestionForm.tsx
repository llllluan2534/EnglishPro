'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Trash2, CheckCircle2, 
  HelpCircle, Save, Music, BookOpen, PenTool 
} from 'lucide-react'

interface OptionState {
  text: string
  isCorrect: boolean
}

export default function CreateQuestionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Question fields
  const [skill, setSkill] = useState('READING')
  const [type, setType] = useState('MULTIPLE_CHOICE')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [points, setPoints] = useState(1)

  const [questionText, setQuestionText] = useState('')
  const [passageTitle, setPassageTitle] = useState('')
  const [passage, setPassage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [explanation, setExplanation] = useState('')

  // 4 Default options
  const [options, setOptions] = useState<OptionState[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  const setCorrectOption = (index: number) => {
    setOptions(prev => prev.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    })))
  }

  const updateOptionText = (index: number, val: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, text: val } : opt))
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions(prev => [...prev, { text: '', isCorrect: false }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi')
      return
    }

    const filledOptions = options.filter(o => o.text.trim())
    if (filledOptions.length < 2) {
      setError('Vui lòng nhập ít nhất 2 phương án trả lời')
      return
    }

    const hasCorrect = filledOptions.some(o => o.isCorrect)
    if (!hasCorrect) {
      setError('Vui lòng chọn ít nhất 1 đáp án đúng')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teacher/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          type,
          difficulty,
          points: Number(points),
          content: {
            text: questionText.trim(),
            ...(passage.trim() ? { passage: passage.trim(), passageTitle: passageTitle.trim() } : {}),
            ...(audioUrl.trim() ? { audioUrl: audioUrl.trim() } : {}),
          },
          options: filledOptions.map((o, idx) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
            order: idx,
          })),
          explanation: explanation.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo câu hỏi')
      }

      router.push('/teacher/questions')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Không thể tạo câu hỏi')
      setLoading(false)
    }
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {error && (
        <div className="p-4 bg-[#F3DAD3] border-2 border-[#C1432E] text-[#C1432E] font-bold text-xs flex items-center gap-2">
          <HelpCircle size={16} />
          {error}
        </div>
      )}

      {/* Meta Configuration Box */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
            1. Phân loại & Thiết lập kỹ năng
          </h2>
          <p className="text-xs text-[#6B7A94] mt-1">
            Xác định kỹ năng mục tiêu, định dạng câu hỏi và mức độ phân hóa học sinh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Kỹ năng chính <span className="text-[#C1432E]">*</span>
            </label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
            >
              <option value="READING">Reading (Đọc hiểu)</option>
              <option value="LISTENING">Listening (Luyện nghe)</option>
              <option value="GRAMMAR">Grammar (Ngữ pháp)</option>
              <option value="VOCABULARY">Vocabulary (Từ vựng)</option>
              <option value="SPEAKING">Speaking (Phát âm AI)</option>
              <option value="WRITING">Writing (Viết câu/luận)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Dạng câu hỏi
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
            >
              <option value="MULTIPLE_CHOICE">Trắc nghiệm 1 đáp án (A-D)</option>
              <option value="READING_COMPREHENSION">Đọc hiểu kèm bài đọc</option>
              <option value="FILL_IN_BLANK">Điền từ vào chỗ trống</option>
              <option value="ORDERING">Sắp xếp câu thành đoạn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Độ khó
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
            >
              <option value="EASY">Dễ (Nhận biết)</option>
              <option value="MEDIUM">Trung bình (Thông hiểu & Vận dụng)</option>
              <option value="HARD">Khó (Vận dụng cao - Phân hóa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Điểm số câu
            </label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={points}
              onChange={e => setPoints(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-mono font-bold shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>
        </div>
      </div>

      {/* Reading Passage or Audio (Conditional) */}
      {(skill === 'READING' || type === 'READING_COMPREHENSION') && (
        <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-4">
          <div className="border-b-2 border-dashed border-[#E7DEC9] pb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-[#1D2B4F]" />
            <h3 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
              Đoạn văn đọc hiểu (Passage - Tùy chọn)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Tiêu đề bài đọc
            </label>
            <input
              type="text"
              value={passageTitle}
              onChange={e => setPassageTitle(e.target.value)}
              placeholder="VD: The Future of Artificial Intelligence in Education"
              className="w-full px-4 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] font-mono shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Nội dung đoạn văn
            </label>
            <textarea
              rows={6}
              value={passage}
              onChange={e => setPassage(e.target.value)}
              placeholder="Dán toàn bộ văn bản bài đọc vào đây để học sinh đối chiếu khi làm câu hỏi..."
              className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] font-serif leading-relaxed shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>
        </div>
      )}

      {skill === 'LISTENING' && (
        <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-4">
          <div className="border-b-2 border-dashed border-[#E7DEC9] pb-3 flex items-center gap-2">
            <Music size={18} className="text-[#6B46C1]" />
            <h3 className="text-xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
              Tệp âm thanh bài nghe (Audio File)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Đường dẫn tệp Audio (URL hoặc /audio/...)
            </label>
            <input
              type="text"
              value={audioUrl}
              onChange={e => setAudioUrl(e.target.value)}
              placeholder="VD: https://... hoặc /audio/listen_in/unit1.mp3"
              className="w-full px-4 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] font-mono shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>
        </div>
      )}

      {/* Question Prompt */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-4">
        <div className="border-b-2 border-dashed border-[#E7DEC9] pb-3">
          <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
            2. Nội dung câu hỏi <span className="text-[#C1432E]">*</span>
          </h2>
        </div>

        <textarea
          rows={3}
          required
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          placeholder="VD: According to paragraph 2, what is the primary benefit of renewable energy?"
          className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-sm text-[#1D2B4F] font-medium leading-relaxed shadow-[2px_2px_0_#1D2B4F]"
        />
      </div>

      {/* Answer Options */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
              3. Các phương án trả lời & Đáp án đúng
            </h2>
            <p className="text-xs text-[#6B7A94] mt-1">
              Nhấp vào biểu tượng tròn để đánh dấu phương án là <strong className="text-[#4C7A6B]">Đáp án đúng</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 6}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF7] text-[#1D2B4F] text-xs font-mono font-bold border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[2px_2px_0_#1D2B4F] disabled:opacity-40"
          >
            <Plus size={14} /> Thêm phương án
          </button>
        </div>

        <div className="space-y-3">
          {options.map((opt, idx) => {
            const letter = letters[idx] || String(idx + 1)
            const isCorrect = opt.isCorrect

            return (
              <div
                key={idx}
                className={`p-3 border-2 flex items-center gap-3 transition-all ${
                  isCorrect
                    ? 'bg-[#DCE9E3] border-[#4C7A6B] shadow-[2px_2px_0_#4C7A6B]'
                    : 'bg-[#FBF6EC] border-[#1D2B4F]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCorrectOption(idx)}
                  className={`w-7 h-7 flex items-center justify-center font-mono font-bold text-xs border-2 transition-all ${
                    isCorrect
                      ? 'bg-[#4C7A6B] border-[#4C7A6B] text-white shadow-[1px_1px_0_#1D2B4F]'
                      : 'bg-white border-[#1D2B4F] text-[#1D2B4F] hover:bg-[#E7DEC9]'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {letter}
                </button>

                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={e => updateOptionText(idx, e.target.value)}
                  placeholder={`Nội dung phương án ${letter}...`}
                  className="flex-1 px-3 py-2 bg-white border border-[#1D2B4F] text-xs text-[#1D2B4F] font-medium focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectOption(idx)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-bold border ${
                      isCorrect
                        ? 'bg-[#4C7A6B] text-white border-[#4C7A6B]'
                        : 'bg-white text-[#6B7A94] border-[#E7DEC9] hover:border-[#1D2B4F]'
                    }`}
                  >
                    {isCorrect ? '✓ ĐÁP ÁN ĐÚNG' : 'Chọn đúng'}
                  </button>

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1 text-[#6B7A94] hover:text-[#C1432E]"
                      title="Xóa phương án này"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-4">
        <div className="border-b-2 border-dashed border-[#E7DEC9] pb-3">
          <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
            4. Lời giải thích chi tiết (Explanation)
          </h2>
          <p className="text-xs text-[#6B7A94] mt-1">
            Hiển thị cho học sinh sau khi nộp bài để đối chiếu kiến thức và tự khắc phục lỗi sai
          </p>
        </div>

        <textarea
          rows={4}
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="VD: Dựa vào đoạn 2, dòng 3: 'Solar energy creates no direct greenhouse gas emissions...' do đó phương án A là chính xác."
          className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] leading-relaxed shadow-[2px_2px_0_#1D2B4F]"
        />
      </div>

      {/* Sticky Bottom Actions */}
      <div className="flex items-center justify-between gap-4 p-6 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
        <Link
          href="/teacher/questions"
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
          {loading ? 'ĐANG LƯU CÂU HỎI...' : 'LƯU VÀO NGÂN HÀNG CÂU HỎI'}
        </button>
      </div>
    </form>
  )
}
