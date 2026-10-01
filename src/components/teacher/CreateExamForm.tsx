'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, HelpCircle,
  FileText, Upload, Sparkles, BookOpen, Clock, Award,
  Save, AlertCircle, Copy, ChevronDown, ChevronUp,
  FileUp, Check, X, RefreshCw
} from 'lucide-react'

interface QuestionSummary {
  id: string
  skill: string
  type: string
  difficulty: string
  text: string
  points: number
}

interface OptionItem {
  text: string
  isCorrect: boolean
  order: number
}

interface ExamQuestionItem {
  id?: string // nếu có sẵn từ ngân hàng
  tempId: string
  skill: 'READING' | 'LISTENING' | 'GRAMMAR' | 'VOCABULARY' | 'WRITING'
  type: 'MULTIPLE_CHOICE'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  points: number
  text: string
  passage?: string
  options: OptionItem[]
  explanation?: string
  isFromBank?: boolean
}

interface CreateExamFormProps {
  availableQuestions: QuestionSummary[]
}

export default function CreateExamForm({ availableQuestions }: CreateExamFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form chung
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('NATIONAL_MOCK')
  const [grade, setGrade] = useState('12')
  const [duration, setDuration] = useState('50')
  const [passingScore, setPassingScore] = useState('5')
  const [status, setStatus] = useState('PUBLISHED')

  // Danh sách câu hỏi trong đề
  const [questions, setQuestions] = useState<ExamQuestionItem[]>([])

  // Chế độ nhập đề: 'FILE' | 'PASTE' | 'BANK'
  const [importMode, setImportMode] = useState<'FILE' | 'PASTE' | 'BANK'>('FILE')
  const [isScanning, setIsScanning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [scanResultNotice, setScanResultNotice] = useState<string | null>(null)
  const [showSampleGuide, setShowSampleGuide] = useState(false)
  const [rawExtractedPreview, setRawExtractedPreview] = useState<string | null>(null)
  const [showExtractedModal, setShowExtractedModal] = useState(false)

  // Bank selection state
  const [bankSearch, setBankSearch] = useState('')
  const [bankSkillFilter, setBankSkillFilter] = useState('ALL')
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([])

  // Collapsed questions state (thu gọn/mở rộng từng câu)
  const [collapsedMap, setCollapsedMap] = useState<{ [key: string]: boolean }>({})

  // ==========================================
  // XỬ LÝ SCAN TỰ ĐỘNG TỪ FILE HOẶC TEXT
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setScanResultNotice(null)
      setError(null)
    }
  }

  const handleScanFile = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file Word (.docx), PDF (.pdf) hoặc Text (.txt)')
      return
    }

    setIsScanning(true)
    setError(null)
    setScanResultNotice(null)

    const ext = selectedFile.name.split('.').pop()?.toLowerCase()

    try {
      let extractedText = ''

      // 1. Nếu là file PDF: Dùng Mozilla PDF.js trích xuất trực tiếp
      if (ext === 'pdf') {
        const getPdfJs = async () => {
          if ((window as any).pdfjsLib) return (window as any).pdfjsLib
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = '/vendor/pdfjs/pdf.min.js'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Không thể tải bộ đọc PDF. Vui lòng thử lại.'))
            document.head.appendChild(script)
          })
          return (window as any).pdfjsLib
        }

        const pdfjsLib = await getPdfJs()
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js'

        const arrayBuffer = await selectedFile.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()

          let lastY: number | null = null
          let pageText = ''
          for (const item of textContent.items as any[]) {
            if (!item.str) continue
            // Nếu tọa độ Y thay đổi > 6px -> ngắt dòng mới
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 6) {
              pageText += '\n'
            } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
              pageText += ' '
            }
            pageText += item.str
            lastY = item.transform[5]
          }
          extractedText += pageText + '\n\n'
        }

        if (!extractedText.trim() || extractedText.trim().length < 30) {
          throw new Error('Tệp PDF này là bản scan hình ảnh (không chứa văn bản có thể trích xuất). Bạn vui lòng dùng file Word (.docx) hoặc sao chép và dán trực tiếp nội dung vào tab "Dán nhanh văn bản".')
        }
      } else if (ext === 'docx') {
        // 2. Nếu là file Word: Dùng Mammoth browser nếu có sẵn
        const getMammoth = async () => {
          if ((window as any).mammoth) return (window as any).mammoth
          try {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script')
              script.src = '/vendor/mammoth/mammoth.browser.min.js'
              script.onload = () => resolve()
              script.onerror = () => reject()
              document.head.appendChild(script)
            })
            return (window as any).mammoth
          } catch {
            return null
          }
        }

        const mammoth = await getMammoth()
        if (mammoth) {
          const arrayBuffer = await selectedFile.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          extractedText = result.value || ''
        }
      }

      let res: Response
      if (extractedText.trim()) {
        // Gửi text đã giải nén Unicode sạch sẽ
        res = await fetch('/api/teacher/exams/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText, fileName: selectedFile.name }),
        })
      } else {
        // Fallback gửi file nguyên bản
        const formData = new FormData()
        formData.append('file', selectedFile)
        res = await fetch('/api/teacher/exams/scan', {
          method: 'POST',
          body: formData,
        })
      }

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Quét file đề thi không thành công')
      }

      if (!data.questions || data.questions.length === 0) {
        // Nếu có text nhưng chưa nhận diện được câu hỏi: Đưa text vào tab dán nhanh để giáo viên xem
        if (extractedText.trim()) {
          setPasteText(extractedText)
        }
        setError(data.warning || 'Không tìm thấy câu hỏi nào hợp lệ trong tệp. Nội dung đã được chuyển sang tab "Dán nhanh văn bản" để bạn xem và chỉnh sửa.')
        setIsScanning(false)
        return
      }

      // Chuyển đổi sang format của danh sách câu hỏi
      const newItems: ExamQuestionItem[] = data.questions.map((q: any, idx: number) => ({
        tempId: 'scanned_' + Date.now() + '_' + idx,
        skill: q.skill || 'READING',
        type: 'MULTIPLE_CHOICE',
        difficulty: q.difficulty || 'MEDIUM',
        points: q.points || 1,
        text: q.text,
        passage: q.passage,
        options: q.options || [],
        explanation: q.explanation || '',
      }))

      setQuestions(prev => [...prev, ...newItems])
      setRawExtractedPreview(extractedText || data.rawTextPreview || null)
      setScanResultNotice(`Đã quét thành công ${newItems.length} câu hỏi từ tệp "${selectedFile.name}"!`)

      // Tự động gợi ý tiêu đề đề thi nếu chưa có
      if (!title.trim()) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        setTitle(cleanName)
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi quét file đề thi')
    } finally {
      setIsScanning(false)
    }
  }

  const handleScanPasteText = async () => {
    if (!pasteText.trim()) {
      setError('Vui lòng dán nội dung đề thi vào ô văn bản')
      return
    }

    setIsScanning(true)
    setError(null)
    setScanResultNotice(null)

    try {
      const res = await fetch('/api/teacher/exams/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Quét nội dung không thành công')
      }

      if (!data.questions || data.questions.length === 0) {
        setError(data.warning || 'Không nhận diện được câu hỏi nào từ văn bản đã dán')
        setIsScanning(false)
        return
      }

      const newItems: ExamQuestionItem[] = data.questions.map((q: any, idx: number) => ({
        tempId: 'paste_' + Date.now() + '_' + idx,
        skill: q.skill || 'READING',
        type: 'MULTIPLE_CHOICE',
        difficulty: q.difficulty || 'MEDIUM',
        points: q.points || 1,
        text: q.text,
        passage: q.passage,
        options: q.options || [],
        explanation: q.explanation || '',
      }))

      setQuestions(prev => [...prev, ...newItems])
      setRawExtractedPreview(pasteText)
      setScanResultNotice(`Đã quét thành công ${newItems.length} câu hỏi từ văn bản dán!`)
      setPasteText('')
    } catch (err: any) {
      setError(err.message || 'Lỗi khi quét văn bản đề thi')
    } finally {
      setIsScanning(false)
    }
  }

  // ==========================================
  // THAO TÁC CÂU HỎI TRỰC TIẾP
  // ==========================================
  const handleAddNewQuestion = () => {
    const newItem: ExamQuestionItem = {
      tempId: 'manual_' + Date.now(),
      skill: 'READING',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      points: 1,
      text: '',
      options: [
        { text: '', isCorrect: true, order: 0 },
        { text: '', isCorrect: false, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
      ],
      explanation: '',
    }
    setQuestions(prev => [...prev, newItem])
  }

  const handleUpdateQuestion = (index: number, field: keyof ExamQuestionItem, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const newOpts = q.options.map((opt, oIdx) => ({
        ...opt,
        isCorrect: oIdx === optIndex,
      }))
      return { ...q, options: newOpts }
    }))
  }

  const handleUpdateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const newOpts = q.options.map((opt, oIdx) => oIdx === optIndex ? { ...opt, text } : opt)
      return { ...q, options: newOpts }
    }))
  }

  const handleAddOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      if (q.options.length >= 6) return q
      return {
        ...q,
        options: [...q.options, { text: '', isCorrect: false, order: q.options.length }]
      }
    }))
  }

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      if (q.options.length <= 2) return q
      const filtered = q.options.filter((_, oIdx) => oIdx !== optIndex)
      // Nếu phương án bị xóa là phương án đúng, gán lại phương án đầu tiên
      if (!filtered.some(o => o.isCorrect)) {
        filtered[0].isCorrect = true
      }
      return { ...q, options: filtered }
    }))
  }

  const handleDeleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index]
    const dup: ExamQuestionItem = {
      ...target,
      tempId: 'dup_' + Date.now(),
      text: target.text + ' (Bản sao)',
      options: target.options.map(o => ({ ...o })),
    }
    const nextList = [...questions]
    nextList.splice(index + 1, 0, dup)
    setQuestions(nextList)
  }

  const handleClearAllQuestions = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ câu hỏi trong đề này?')) {
      setQuestions([])
      setSelectedBankIds([])
    }
  }

  // ==========================================
  // THÊM TỪ NGÂN HÀNG CÂU HỎI
  // ==========================================
  const handleAddFromBank = () => {
    const selectedItems = availableQuestions.filter(q => selectedBankIds.includes(q.id))
    const mapped: ExamQuestionItem[] = selectedItems.map(q => ({
      id: q.id,
      tempId: 'bank_' + q.id,
      skill: q.skill as any,
      type: 'MULTIPLE_CHOICE',
      difficulty: q.difficulty as any,
      points: q.points || 1,
      text: q.text,
      options: [
        { text: 'Phương án A', isCorrect: true, order: 0 },
        { text: 'Phương án B', isCorrect: false, order: 1 },
      ],
      isFromBank: true,
    }))

    // Tránh trùng lặp
    const existingBankIds = new Set(questions.filter(q => q.isFromBank && q.id).map(q => q.id))
    const toAdd = mapped.filter(m => !existingBankIds.has(m.id))

    setQuestions(prev => [...prev, ...toAdd])
    setScanResultNotice(`Đã thêm ${toAdd.length} câu hỏi từ Ngân hàng vào đề thi!`)
    setSelectedBankIds([])
  }

  // ==========================================
  // LƯU VÀ XUẤT BẢN ĐỀ THI
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đề thi')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (questions.length === 0) {
      setError('Đề thi cần có ít nhất 1 câu hỏi. Vui lòng quét từ file, dán văn bản hoặc thêm câu hỏi thủ công.')
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }

    // Kiểm tra tính hợp lệ của từng câu
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.isFromBank) {
        if (!q.text.trim()) {
          setError(`Câu số ${i + 1} chưa có nội dung câu hỏi`)
          return
        }
        const hasOptions = q.options.filter(o => o.text.trim()).length >= 2
        if (!hasOptions) {
          setError(`Câu số ${i + 1} phải có ít nhất 2 phương án trả lời`)
          return
        }
        const hasCorrect = q.options.some(o => o.isCorrect && o.text.trim())
        if (!hasCorrect) {
          setError(`Câu số ${i + 1} chưa được chọn đáp án đúng`)
          return
        }
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Phân loại: câu hỏi mới tự soạn/quét và câu hỏi lấy từ ngân hàng
      const newQuestions = questions.filter(q => !q.isFromBank).map(q => ({
        skill: q.skill,
        type: q.type,
        difficulty: q.difficulty,
        points: q.points,
        text: q.text,
        passage: q.passage,
        options: q.options.map(o => ({
          text: o.text,
          isCorrect: o.isCorrect,
          order: o.order,
        })),
        explanation: q.explanation,
      }))

      const questionIds = questions.filter(q => q.isFromBank && q.id).map(q => q.id!)

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
          newQuestions,
          questionIds,
        }),
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <form onSubmit={handleSubmit} className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Thông báo lỗi */}
      {error && (
        <div className="p-4 bg-[#F3DAD3] border-2 border-[#C1432E] text-[#C1432E] font-bold text-xs flex items-center justify-between gap-3 shadow-[3px_3px_0_#C1432E]">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-[#C1432E] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thông báo thành công từ scan */}
      {scanResultNotice && (
        <div className="p-4 bg-[#DCE9E3] border-2 border-[#4C7A6B] text-[#4C7A6B] font-bold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[3px_3px_0_#4C7A6B]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{scanResultNotice}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {rawExtractedPreview && (
              <button
                type="button"
                onClick={() => setShowExtractedModal(true)}
                className="px-2.5 py-1 bg-white border border-[#4C7A6B] text-[#4C7A6B] text-[11px] font-mono hover:bg-[#4C7A6B] hover:text-white transition-colors"
              >
                👁️ Xem văn bản đã đọc
              </button>
            )}
            <button type="button" onClick={() => setScanResultNotice(null)} className="p-1 hover:bg-[#4C7A6B] hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal xem trước văn bản gốc đã trích xuất */}
      {showExtractedModal && rawExtractedPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[8px_8px_0_#1D2B4F] max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="p-4 bg-[#FBF6EC] border-b-2 border-[#1D2B4F] flex items-center justify-between">
              <div className="font-bold font-serif text-base text-[#1D2B4F]">
                Văn bản gốc trích xuất từ file ({rawExtractedPreview.length} ký tự)
              </div>
              <button
                type="button"
                onClick={() => setShowExtractedModal(false)}
                className="p-1 hover:bg-[#C1432E] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-[#1D2B4F] whitespace-pre-wrap leading-relaxed bg-[#FBF6EC]">
              {rawExtractedPreview}
            </div>
            <div className="p-4 bg-[#FFFDF7] border-t-2 border-[#1D2B4F] flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-[#6B7A94]">
                Bạn có thể sao chép văn bản này hoặc chuyển sang tab &quot;Dán nhanh văn bản&quot; để tự sửa.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasteText(rawExtractedPreview)
                    setImportMode('PASTE')
                    setShowExtractedModal(false)
                  }}
                  className="px-3 py-1.5 bg-[#1D2B4F] text-white text-xs font-mono font-bold hover:bg-[#2A3C6B]"
                >
                  Chuyển sang tab Dán nhanh
                </button>
                <button
                  type="button"
                  onClick={() => setShowExtractedModal(false)}
                  className="px-3 py-1.5 border border-[#1D2B4F] text-xs font-mono font-bold hover:bg-[#E7DEC9]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. THÔNG TIN CHUNG CỦA ĐỀ THI */}
      {/* ======================================================== */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
            1. Thông tin chung của đề thi
          </h2>
          <p className="text-xs text-[#6B7A94] mt-1">
            Thiết lập tiêu đề, phân loại, khối lớp và thời gian làm bài theo quy chuẩn
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
              placeholder="VD: Đề thi thử THPT Quốc Gia môn Tiếng Anh 2026 - Mã đề 101"
              className="w-full px-4 py-3 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-sm font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1.5">
              Mô tả / Hướng dẫn làm bài
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ghi chú về cấu trúc đề, thang điểm, hoặc lưu ý dặn dò thí sinh trước khi bấm bắt đầu làm bài..."
              className="w-full px-4 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-[#1D2B4F] text-xs font-medium focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F]"
            />
          </div>

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

      {/* ======================================================== */}
      {/* 2. CÔNG CỤ NHẬP & QUÉT ĐỀ THI TỰ ĐỘNG (DOCX, PDF, TEXT) */}
      {/* ======================================================== */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#C1432E]" />
              <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                2. Nạp câu hỏi vào đề thi
              </h2>
            </div>
            <p className="text-xs text-[#6B7A94] mt-1">
              Tải file Word/PDF để tự động scan, dán văn bản nhanh hoặc chọn từ Ngân hàng câu hỏi
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSampleGuide(!showSampleGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#1D2B4F] border border-[#1D2B4F] bg-[#FBF6EC] hover:bg-[#E7DEC9] self-start sm:self-auto"
          >
            <HelpCircle size={14} />
            {showSampleGuide ? 'Đóng hướng dẫn mẫu' : 'Xem định dạng đề chuẩn'}
          </button>
        </div>

        {/* Hướng dẫn định dạng mẫu */}
        {showSampleGuide && (
          <div className="p-4 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs space-y-3 font-mono">
            <div className="font-bold text-[#C1432E] uppercase flex items-center gap-2">
              <CheckCircle2 size={15} /> Định dạng đề thi hệ thống hỗ trợ nhận diện tự động:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
              <div className="p-3 bg-white border border-[#E7DEC9]">
                <div className="font-bold text-[#1D2B4F] mb-1.5 underline">Kiểu 1: Đáp án & Lời giải đi liền câu</div>
                <pre className="whitespace-pre-wrap text-[#6B7A94]">
{`Câu 1: He was tired ______ he went to bed early.
A. so       B. but       C. although       D. because
Đáp án: A
Lời giải: Mệnh đề chỉ kết quả dùng liên từ "so".

Question 2: She has lived here ______ 2020.
A. for
B. since
C. in
D. at
Đáp án đúng: B`}
                </pre>
              </div>

              <div className="p-3 bg-white border border-[#E7DEC9]">
                <div className="font-bold text-[#1D2B4F] mb-1.5 underline">Kiểu 2: Bảng đáp án tổng hợp ở cuối đề</div>
                <pre className="whitespace-pre-wrap text-[#6B7A94]">
{`Câu 1: What is the main idea?
A. Text 1   B. Text 2   C. Text 3   D. Text 4
Câu 2: The word "it" refers to...
A. Dog      B. Cat      C. Bird     D. Fish

------------------------
BẢNG ĐÁP ÁN:
1.A   2.B   3.C   4.D`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b-2 border-[#1D2B4F] gap-2">
          <button
            type="button"
            onClick={() => setImportMode('FILE')}
            className={`px-4 py-2.5 font-mono text-xs font-bold border-t-2 border-l-2 border-r-2 transition-all flex items-center gap-2 ${
              importMode === 'FILE'
                ? 'bg-[#1D2B4F] text-white border-[#1D2B4F] -mb-[2px] shadow-[2px_0_0_#1D2B4F]'
                : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#E7DEC9] hover:bg-[#E7DEC9]'
            }`}
          >
            <FileUp size={16} /> TẢI FILE ĐỀ THI (.DOCX / .PDF / .TXT)
          </button>

          <button
            type="button"
            onClick={() => setImportMode('PASTE')}
            className={`px-4 py-2.5 font-mono text-xs font-bold border-t-2 border-l-2 border-r-2 transition-all flex items-center gap-2 ${
              importMode === 'PASTE'
                ? 'bg-[#1D2B4F] text-white border-[#1D2B4F] -mb-[2px] shadow-[2px_0_0_#1D2B4F]'
                : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#E7DEC9] hover:bg-[#E7DEC9]'
            }`}
          >
            <FileText size={16} /> DÁN NHANH VĂN BẢN
          </button>

          <button
            type="button"
            onClick={() => setImportMode('BANK')}
            className={`px-4 py-2.5 font-mono text-xs font-bold border-t-2 border-l-2 border-r-2 transition-all flex items-center gap-2 ${
              importMode === 'BANK'
                ? 'bg-[#1D2B4F] text-white border-[#1D2B4F] -mb-[2px] shadow-[2px_0_0_#1D2B4F]'
                : 'bg-[#FBF6EC] text-[#1D2B4F] border-[#E7DEC9] hover:bg-[#E7DEC9]'
            }`}
          >
            <BookOpen size={16} /> CHỌN TỪ NGÂN HÀNG ({availableQuestions.length})
          </button>
        </div>

        {/* TAB 1: UPLOAD FILE DOCX / PDF */}
        {importMode === 'FILE' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1D2B4F] bg-[#FBF6EC] p-8 text-center cursor-pointer hover:bg-[#F3ECE0] transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto mb-3 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[3px_3px_0_#1D2B4F] flex items-center justify-center text-[#1D2B4F] group-hover:scale-105 transition-transform">
                <Upload size={24} />
              </div>

              <div className="font-bold text-sm text-[#1D2B4F]">
                {selectedFile ? (
                  <span className="text-[#4C7A6B] flex items-center justify-center gap-1.5 font-mono">
                    <CheckCircle2 size={16} /> Đã chọn tệp: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  'Nhấp chuột hoặc kéo thả file đề thi vào đây'
                )}
              </div>
              <p className="text-xs text-[#6B7A94] mt-1 font-mono">
                Hỗ trợ tệp Microsoft Word (.docx), Adobe Acrobat (.pdf) hoặc tệp văn bản thuần (.txt)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between gap-3 p-4 bg-[#FFFDF7] border-2 border-[#1D2B4F]">
                <div className="text-xs font-mono text-[#1D2B4F]">
                  Tệp sẵn sàng: <strong>{selectedFile.name}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="px-3 py-1.5 border border-[#1D2B4F] text-xs font-mono font-bold hover:bg-[#F3DAD3] text-[#C1432E]"
                  >
                    Hủy tệp
                  </button>

                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleScanFile}
                    className="flex items-center gap-2 px-5 py-2 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#A83724] disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        ĐANG QUÉT VÀ BÓC TÁCH CÂU HỎI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        QUÉT & TỰ ĐỘNG ĐIỀN VÀO ĐỀ THI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PASTE TEXT */}
        {importMode === 'PASTE' && (
          <div className="space-y-4">
            <textarea
              rows={8}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Dán toàn bộ văn bản đề thi của bạn vào đây (bao gồm Câu hỏi, A. B. C. D., Đáp án, Lời giải)..."
              className="w-full p-4 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-mono focus:outline-none focus:bg-white shadow-[2px_2px_0_#1D2B4F] leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-[#6B7A94]">
                Hệ thống sẽ tự nhận diện câu hỏi, 4 phương án, đáp án đúng và lời giải chi tiết.
              </span>

              <button
                type="button"
                disabled={isScanning || !pasteText.trim()}
                onClick={handleScanPasteText}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C1432E] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#A83724] disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    ĐANG PHÂN TÍCH VĂN BẢN...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    QUÉT VĂN BẢN VÀO ĐỀ THI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CHỌN TỪ NGÂN HÀNG CÂU HỎI */}
        {importMode === 'BANK' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi trong ngân hàng..."
                value={bankSearch}
                onChange={e => setBankSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3.5 py-2 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs text-[#1D2B4F] font-mono shadow-[2px_2px_0_#1D2B4F]"
              />

              <select
                value={bankSkillFilter}
                onChange={e => setBankSkillFilter(e.target.value)}
                className="px-3 py-2 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-mono font-bold text-[#1D2B4F]"
              >
                <option value="ALL">Tất cả kỹ năng</option>
                <option value="READING">Reading</option>
                <option value="LISTENING">Listening</option>
                <option value="GRAMMAR">Grammar</option>
                <option value="VOCABULARY">Vocabulary</option>
              </select>

              <button
                type="button"
                disabled={selectedBankIds.length === 0}
                onClick={handleAddFromBank}
                className="px-4 py-2 bg-[#4C7A6B] text-white font-mono font-bold text-xs border-2 border-[#1D2B4F] shadow-[2px_2px_0_#1D2B4F] hover:bg-[#3C6457] disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus size={14} /> THÊM {selectedBankIds.length} CÂU ĐÃ CHỌN
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 border-2 border-[#E7DEC9] p-2 bg-[#FBF6EC]">
              {availableQuestions
                .filter(q => (bankSkillFilter === 'ALL' || q.skill === bankSkillFilter) && (!bankSearch || q.text.toLowerCase().includes(bankSearch.toLowerCase())))
                .map(q => {
                  const isChecked = selectedBankIds.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedBankIds(prev => isChecked ? prev.filter(id => id !== q.id) : [...prev, q.id])
                      }}
                      className={`p-3 border cursor-pointer transition-colors flex items-start justify-between gap-3 text-xs ${
                        isChecked ? 'bg-[#DCE9E3] border-[#4C7A6B]' : 'bg-white border-[#E7DEC9] hover:border-[#1D2B4F]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#1D2B4F] text-white">{q.skill}</span>
                          <span className="font-mono text-[10px] text-[#6B7A94]">{q.difficulty}</span>
                          <span className="font-mono text-[10px] text-[#E3A73B] font-bold">{q.points} điểm</span>
                        </div>
                        <p className="line-clamp-2 text-[#1D2B4F]">{q.text}</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#4C7A6B] mt-1"
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. DANH SÁCH CÂU HỎI TRONG ĐỀ THI (LIVE QUESTION BUILDER) */}
      {/* ======================================================== */}
      <div className="bg-[#FFFDF7] border-2 border-[#1D2B4F] p-6 md:p-8 shadow-[6px_6px_0_#1D2B4F] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#E7DEC9] pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-serif text-[#1D2B4F]" style={{ fontFamily: "'Fraunces', serif" }}>
                3. Danh sách câu hỏi của Đề thi
              </h2>
              <span
                className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#C1432E] text-white border border-[#1D2B4F]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {questions.length} CÂU
              </span>
            </div>
            <p className="text-xs text-[#6B7A94] mt-1">
              Bạn có thể trực tiếp sửa nội dung, đổi đáp án đúng, thêm lời giải hoặc bổ sung câu hỏi mới
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddNewQuestion}
              className="px-3.5 py-2 bg-[#4C7A6B] text-white text-xs font-mono font-bold border-2 border-[#1D2B4F] hover:bg-[#3C6457] shadow-[2px_2px_0_#1D2B4F] flex items-center gap-1.5"
            >
              <Plus size={15} /> THÊM CÂU THỦ CÔNG
            </button>

            {questions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllQuestions}
                className="px-3 py-2 bg-white text-[#C1432E] text-xs font-mono font-bold border-2 border-[#E7DEC9] hover:border-[#C1432E] flex items-center gap-1"
              >
                <Trash2 size={14} /> Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        {questions.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#E7DEC9] bg-[#FBF6EC] space-y-3">
            <BookOpen size={36} className="mx-auto text-[#6B7A94] opacity-50" />
            <div className="font-serif text-lg font-bold text-[#1D2B4F]">Đề thi hiện chưa có câu hỏi nào</div>
            <p className="text-xs text-[#6B7A94] font-mono max-w-md mx-auto">
              Hãy tải lên tệp .docx/.pdf đề thi ở Mục 2 để hệ thống tự động bóc tách, dán văn bản hoặc bấm "Thêm câu thủ công".
            </p>
            <button
              type="button"
              onClick={handleAddNewQuestion}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#1D2B4F] text-white text-xs font-mono font-bold hover:bg-[#2A3C6B]"
            >
              <Plus size={14} /> THÊM CÂU HỎI ĐẦU TIÊN
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const isCollapsed = collapsedMap[q.tempId] || false
              const correctOpt = q.options.find(o => o.isCorrect)

              return (
                <div
                  key={q.tempId}
                  className="border-2 border-[#1D2B4F] bg-[#FFFDF7] shadow-[4px_4px_0_#1D2B4F] transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-[#FBF6EC] border-b-2 border-[#1D2B4F] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm bg-[#1D2B4F] text-white px-2.5 py-0.5">
                        Câu {qIdx + 1}
                      </span>

                      {/* Select Kỹ năng */}
                      <select
                        value={q.skill}
                        onChange={e => handleUpdateQuestion(qIdx, 'skill', e.target.value)}
                        className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-[#1D2B4F] text-[#1D2B4F]"
                      >
                        <option value="READING">Reading</option>
                        <option value="LISTENING">Listening</option>
                        <option value="GRAMMAR">Grammar</option>
                        <option value="VOCABULARY">Vocabulary</option>
                        <option value="WRITING">Writing</option>
                      </select>

                      {/* Select Độ khó */}
                      <select
                        value={q.difficulty}
                        onChange={e => handleUpdateQuestion(qIdx, 'difficulty', e.target.value)}
                        className="px-2 py-0.5 text-xs font-mono bg-white border border-[#1D2B4F] text-[#6B7A94]"
                      >
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                      </select>

                      {/* Điểm số */}
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="text-[#6B7A94]">Điểm:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={q.points}
                          onChange={e => handleUpdateQuestion(qIdx, 'points', parseFloat(e.target.value) || 1)}
                          className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold bg-white border border-[#1D2B4F] text-center"
                        />
                      </div>

                      {q.isFromBank && (
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-[#E7DEC9] text-[#1D2B4F] font-bold">
                          Từ ngân hàng
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Nhân bản câu này"
                        onClick={() => handleDuplicateQuestion(qIdx)}
                        className="p-1.5 text-[#1D2B4F] hover:bg-[#E7DEC9] border border-transparent hover:border-[#1D2B4F]"
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        type="button"
                        title="Xóa câu hỏi này"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="p-1.5 text-[#C1432E] hover:bg-[#F3DAD3] border border-transparent hover:border-[#C1432E]"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setCollapsedMap(prev => ({ ...prev, [q.tempId]: !isCollapsed }))}
                        className="p-1.5 text-[#1D2B4F] hover:bg-[#E7DEC9] border border-transparent hover:border-[#1D2B4F]"
                      >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  {!isCollapsed && (
                    <div className="p-4 md:p-6 space-y-4">
                      {/* Nội dung câu hỏi */}
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1">
                          Nội dung câu hỏi <span className="text-[#C1432E]">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={q.text}
                          onChange={e => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                          placeholder="Nhập câu hỏi (VD: Choose the word whose underlined part is pronounced differently...)"
                          className="w-full px-3.5 py-2.5 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-medium focus:outline-none focus:bg-white leading-relaxed"
                        />
                      </div>

                      {/* Đoạn văn đọc hiểu nếu có */}
                      {(q.skill === 'READING' || q.passage) && (
                        <div className="p-3 bg-[#F4EFE6] border-2 border-[#1D2B4F] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono font-bold uppercase text-[#1D2B4F] flex items-center gap-1.5">
                              <BookOpen size={14} className="text-[#C1432E]" />
                              Đoạn văn bài đọc hiểu (Reading Passage)
                              {q.passage && (
                                <span className="px-2 py-0.5 text-[10px] bg-[#4C7A6B] text-white font-mono font-bold">
                                  ĐÃ GẮN BÀI ĐỌC ({q.passage.length} ký tự)
                                </span>
                              )}
                            </label>
                            {q.passage && (
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(qIdx, 'passage', '')}
                                className="text-[11px] font-mono text-[#C1432E] hover:underline"
                              >
                                Xóa bài đọc khỏi câu này
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={q.passage ? 4 : 2}
                            value={q.passage || ''}
                            onChange={e => handleUpdateQuestion(qIdx, 'passage', e.target.value)}
                            placeholder="Đoạn văn đọc hiểu sẽ được tự động điền khi quét đề thi, hoặc bạn có thể dán bài đọc vào đây..."
                            className="w-full px-3 py-2 bg-white border border-[#1D2B4F] text-xs font-mono focus:outline-none leading-relaxed"
                          />
                        </div>
                      )}

                      {/* Các phương án A, B, C, D */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F]">
                            Các phương án trả lời <span className="text-[#C1432E]">*</span> (Chọn chấm tròn ở đáp án đúng)
                          </label>

                          {q.options.length < 6 && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIdx)}
                              className="text-[11px] font-mono font-bold text-[#4C7A6B] hover:underline flex items-center gap-1"
                            >
                              <Plus size={13} /> Thêm phương án ({letters[q.options.length]})
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const letter = letters[optIdx] || `${optIdx + 1}`

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 border-2 transition-all ${
                                  opt.isCorrect
                                    ? 'bg-[#DCE9E3] border-[#4C7A6B] shadow-[2px_2px_0_#4C7A6B]'
                                    : 'bg-[#FBF6EC] border-[#1D2B4F]'
                                }`}
                              >
                                {/* Radio chọn đáp án đúng */}
                                <button
                                  type="button"
                                  onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                                  className={`w-7 h-7 shrink-0 font-mono font-bold text-xs flex items-center justify-center border-2 transition-transform hover:scale-105 ${
                                    opt.isCorrect
                                      ? 'bg-[#4C7A6B] border-[#4C7A6B] text-white shadow-sm'
                                      : 'bg-white border-[#1D2B4F] text-[#1D2B4F]'
                                  }`}
                                  title="Đánh dấu đáp án đúng"
                                >
                                  {letter}
                                </button>

                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={e => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                                  placeholder={`Nội dung phương án ${letter}...`}
                                  className="flex-1 bg-transparent px-2 py-1 text-xs text-[#1D2B4F] font-medium focus:outline-none"
                                />

                                {opt.isCorrect && (
                                  <span className="text-[10px] font-mono font-bold text-[#4C7A6B] px-1.5 py-0.5 bg-white border border-[#4C7A6B] shrink-0">
                                    ĐÚNG
                                  </span>
                                )}

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    className="p-1 text-[#6B7A94] hover:text-[#C1432E] shrink-0"
                                    title="Xóa lựa chọn này"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Lời giải chi tiết / Hướng dẫn giải */}
                      <div className="pt-1">
                        <label className="block text-xs font-mono font-bold uppercase text-[#1D2B4F] mb-1">
                          Lời giải chi tiết / Hướng dẫn giải (Hiển thị khi học sinh xem kết quả)
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation || ''}
                          onChange={e => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          placeholder="Giải thích lý do chọn đáp án này, kiến thức ngữ pháp hoặc từ vựng trọng tâm..."
                          className="w-full px-3 py-2 bg-[#FBF6EC] border-2 border-[#1D2B4F] text-xs font-medium focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. SUBMIT / BOTTOM BAR CỐ ĐỊNH */}
      {/* ======================================================== */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-5 bg-[#FFFDF7] border-2 border-[#1D2B4F] shadow-[6px_6px_0_#1D2B4F]">
        <Link
          href="/teacher/exams"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FFFDF7] text-[#1D2B4F] font-bold text-xs font-mono border-2 border-[#1D2B4F] hover:bg-[#E7DEC9] shadow-[2px_2px_0_#1D2B4F]"
        >
          <ArrowLeft size={16} /> HỦY BỎ
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right font-mono text-xs">
            <span className="text-[#6B7A94]">Tổng cộng: </span>
            <strong className="text-[#1D2B4F] font-bold text-sm">{questions.length}</strong> câu hỏi
            <span className="mx-2 text-[#E7DEC9]">|</span>
            <span className="text-[#6B7A94]">Tổng điểm: </span>
            <strong className="text-[#C1432E] font-bold text-sm">
              {questions.reduce((acc, q) => acc + (q.points || 1), 0).toFixed(1)}
            </strong>
          </div>

          <button
            type="submit"
            disabled={loading || questions.length === 0}
            className="flex items-center gap-2.5 px-8 py-3 bg-[#C1432E] text-white font-bold text-sm font-mono border-2 border-[#1D2B4F] shadow-[4px_4px_0_#1D2B4F] hover:bg-[#A83724] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save size={18} />
            {loading ? 'ĐANG LƯU ĐỀ THI...' : `LƯU VÀ XUẤT BẢN ĐỀ THI (${questions.length} CÂU)`}
          </button>
        </div>
      </div>
    </form>
  )
}
