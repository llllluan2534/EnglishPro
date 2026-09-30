import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { extractTextFromDocx, extractTextFromPdf, parseExamText } from '@/lib/examParser'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Không có quyền truy cập tính năng này' }, { status: 403 })
    }

    const contentType = req.headers.get('content-type') || ''
    let rawText = ''
    let fileName = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'Vui lòng chọn file đề thi (.docx, .pdf hoặc .txt)' }, { status: 400 })
      }

      fileName = file.name
      const ext = fileName.split('.').pop()?.toLowerCase() || ''
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (ext === 'docx') {
        rawText = extractTextFromDocx(buffer)
      } else if (ext === 'pdf') {
        rawText = extractTextFromPdf(buffer)
      } else if (ext === 'txt') {
        rawText = buffer.toString('utf-8')
      } else {
        return NextResponse.json({
          error: `Định dạng .${ext} chưa được hỗ trợ. Vui lòng tải file Word (.docx), PDF (.pdf) hoặc file văn bản (.txt)`
        }, { status: 400 })
      }
    } else {
      // Dán text trực tiếp qua JSON payload
      const body = await req.json()
      rawText = body.text || ''
    }

    if (!rawText.trim()) {
      return NextResponse.json({
        error: 'Tệp tải lên không chứa văn bản có thể đọc được hoặc nội dung bị trống'
      }, { status: 400 })
    }

    // Bóc tách đề thi thông minh
    const questions = parseExamText(rawText)

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        warning: 'Không thể tự động nhận diện câu hỏi từ tệp này. Bạn có thể sao chép văn bản và dán trực tiếp vào ô nhập đề.',
        rawTextPreview: rawText.slice(0, 1000),
        questions: []
      })
    }

    return NextResponse.json({
      success: true,
      fileName,
      totalParsed: questions.length,
      questions,
      rawTextPreview: rawText.slice(0, 500)
    })
  } catch (error: any) {
    console.error('Scan exam document error:', error)
    return NextResponse.json({
      error: error.message || 'Lỗi khi phân tích tệp đề thi. Vui lòng thử lại hoặc dán trực tiếp văn bản.'
    }, { status: 500 })
  }
}
