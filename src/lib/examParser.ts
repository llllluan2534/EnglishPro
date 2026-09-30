import zlib from 'zlib'

export interface ParsedOption {
  text: string
  isCorrect: boolean
  order: number
}

export interface ParsedQuestion {
  order: number
  skill: 'READING' | 'LISTENING' | 'GRAMMAR' | 'VOCABULARY' | 'WRITING'
  type: 'MULTIPLE_CHOICE'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  points: number
  text: string
  passage?: string
  options: ParsedOption[]
  explanation?: string
}

/**
 * Trích xuất text từ Buffer file .docx
 * Sử dụng thuần Node.js builtin (zlib + Buffer) giải nén file ZIP và đọc word/document.xml
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    let offset = 0
    let documentXmlBuffer: Buffer | null = null

    // Duyệt qua Local File Headers trong file ZIP
    // Header signature: 0x04034b50 (PK\x03\x04)
    while (offset < buffer.length - 30) {
      const sig = buffer.readUInt32LE(offset)
      if (sig !== 0x04034b50) {
        offset++
        continue
      }

      const compressionMethod = buffer.readUInt16LE(offset + 8)
      const compressedSize = buffer.readUInt32LE(offset + 18)
      const fileNameLen = buffer.readUInt16LE(offset + 26)
      const extraLen = buffer.readUInt16LE(offset + 28)

      const fileNameStart = offset + 30
      const fileNameEnd = fileNameStart + fileNameLen
      const fileName = buffer.toString('utf8', fileNameStart, fileNameEnd)

      const dataStart = fileNameEnd + extraLen
      const dataEnd = dataStart + compressedSize

      if (fileName === 'word/document.xml') {
        const compressedData = buffer.subarray(dataStart, dataEnd)
        if (compressionMethod === 8) {
          // Deflate
          documentXmlBuffer = zlib.inflateRawSync(compressedData)
        } else if (compressionMethod === 0) {
          // Stored (no compression)
          documentXmlBuffer = compressedData
        }
        break
      }

      // Nhảy tới file tiếp theo
      offset = dataEnd
    }

    if (!documentXmlBuffer) {
      throw new Error('Không tìm thấy tệp word/document.xml trong file Word .docx')
    }

    const xml = documentXmlBuffer.toString('utf8')

    // Parse XML sang text theo từng dòng đoạn văn <w:p>
    let cleaned = xml
      .replace(/<w:br[^>]*>/gi, '\n')
      .replace(/<w:cr[^>]*>/gi, '\n')
      .replace(/<w:tab[^>]*>/gi, '\t')
      .replace(/<\/w:p>/gi, '\n')

    // Trích xuất text từ các thẻ <w:t>
    const textPieces: string[] = []
    const tagRegex = /<w:t(?:[\s\S]*?)>([\s\S]*?)<\/w:t>|(\n)/gi
    let match: RegExpExecArray | null

    while ((match = tagRegex.exec(cleaned)) !== null) {
      if (match[1] !== undefined) {
        textPieces.push(match[1])
      } else if (match[2] !== undefined) {
        textPieces.push('\n')
      }
    }

    let fullText = textPieces.join('')

    // Giải mã XML / HTML entities
    fullText = fullText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))

    return fullText
  } catch (err: any) {
    throw new Error(`Lỗi khi đọc file Word (.docx): ${err.message}`)
  }
}

/**
 * Trích xuất text từ Buffer file .pdf
 * Quét các stream FlateDecode và lấy text từ toán tử Tj / TJ
 */
export function extractTextFromPdf(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1')
    const textBlocks: string[] = []

    // Tìm các stream trong PDF
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
    let streamMatch: RegExpExecArray | null

    while ((streamMatch = streamRegex.exec(raw)) !== null) {
      const streamData = streamMatch[1]
      let decompressed = ''

      try {
        const streamBuf = Buffer.from(streamData, 'latin1')
        const uncompressed = zlib.inflateSync(streamBuf)
        decompressed = uncompressed.toString('latin1')
      } catch {
        decompressed = streamData
      }

      // Tìm các chuỗi văn bản trong toán tử Tj: (Văn bản) Tj
      const tjRegex = /\(([^)]*)\)\s*Tj/g
      let tjMatch: RegExpExecArray | null
      while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
        textBlocks.push(tjMatch[1])
      }

      // Tìm trong mảng TJ: [(Văn bản 1) -10 (Văn bản 2)] TJ
      const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g
      let tjArrayMatch: RegExpExecArray | null
      while ((tjArrayMatch = tjArrayRegex.exec(decompressed)) !== null) {
        const inner = tjArrayMatch[1]
        const strRegex = /\(([^)]*)\)/g
        let strMatch: RegExpExecArray | null
        const parts: string[] = []
        while ((strMatch = strRegex.exec(inner)) !== null) {
          parts.push(strMatch[1])
        }
        if (parts.length > 0) {
          textBlocks.push(parts.join(''))
        }
      }
    }

    if (textBlocks.length === 0) {
      const fallbackStrings = raw.match(/\(([^)]{2,})\)/g)
      if (fallbackStrings && fallbackStrings.length > 0) {
        return fallbackStrings.map(s => s.slice(1, -1)).join('\n')
      }
      throw new Error('Không thể trích xuất văn bản từ PDF (file có thể là bản scan dạng ảnh)')
    }

    return textBlocks.join('\n')
  } catch (err: any) {
    throw new Error(`Lỗi khi đọc file PDF: ${err.message}`)
  }
}

/**
 * Trích xuất bảng đáp án ở cuối đề thi nếu có
 * Dạng: "BẢNG ĐÁP ÁN: 1.A 2.B 3.C 4.D" hoặc "1-A, 2-B, 3-C" hoặc "1A 2B 3C"
 */
function extractAnswerKeyMap(text: string): Map<number, string> {
  const answerMap = new Map<number, string>()

  const keyHeaderMatch = text.match(/(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+CHI\s+TIẾT|ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM|ĐÁP\s+ÁN|KEY)([\s\S]*)$/i)
  const searchText = keyHeaderMatch ? keyHeaderMatch[1] : text

  const pairRegex = /(?:Câu\s+)?(\d+)[\.\:\-\s]*([A-D])\b/gi
  let match: RegExpExecArray | null

  while ((match = pairRegex.exec(searchText)) !== null) {
    const qNum = parseInt(match[1], 10)
    const ans = match[2].toUpperCase()
    if (qNum > 0 && qNum <= 150) {
      answerMap.set(qNum, ans)
    }
  }

  return answerMap
}

/**
 * Phân tích văn bản đề thi và bóc tách thành danh sách câu hỏi chuẩn hóa
 */
export function parseExamText(rawText: string): ParsedQuestion[] {
  if (!rawText || !rawText.trim()) {
    return []
  }

  // 1. Lấy bảng đáp án tổng hợp (nếu có ở cuối đề)
  const answerKeyMap = extractAnswerKeyMap(rawText)

  // 2. Tách dòng
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)

  // 3. Gom cụm các dòng theo từng câu hỏi
  // Nhận diện dòng bắt đầu câu hỏi:
  // "Câu 1:", "Câu 1. ...", "Question 1: ...", "1. ...", "1) ...", "1/ ..."
  const questionStartRegex = /^(?:(?:Câu|Question|Bài|Item)\s*)?(\d+)[\.\:\)\/\-\s]\s*(.*)/i

  const rawQuestions: { num: number; header: string; contentLines: string[] }[] = []
  let currentQ: { num: number; header: string; contentLines: string[] } | null = null

  for (const line of lines) {
    const qMatch = line.match(questionStartRegex)
    if (qMatch) {
      const qNum = parseInt(qMatch[1], 10)
      const afterText = qMatch[2] ? qMatch[2].trim() : ''
      const hasPrefix = /^(?:Câu|Question|Bài|Item)/i.test(line)

      if (qNum > 0 && qNum <= 250 && (hasPrefix || afterText.length > 2)) {
        if (currentQ) {
          rawQuestions.push(currentQ)
        }
        currentQ = {
          num: qNum,
          header: afterText,
          contentLines: afterText ? [afterText] : []
        }
        continue
      }
    }

    if (currentQ) {
      // Kiểm tra xem đã đến phần BẢNG ĐÁP ÁN ở cuối chưa
      if (/^(?:BẢNG\s+ĐÁP\s+ÁN|ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM|ĐÁP\s+ÁN\s+ĐỀ)/i.test(line)) {
        rawQuestions.push(currentQ)
        currentQ = null
      } else {
        if (!currentQ.header && line) {
          currentQ.header = line
        }
        currentQ.contentLines.push(line)
      }
    }
  }

  if (currentQ) {
    rawQuestions.push(currentQ)
  }

  // 4. Phân tích chi tiết từng khối câu hỏi
  const questions: ParsedQuestion[] = []

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const rawQ = rawQuestions[idx]
    const fullBlock = rawQ.contentLines.join('\n')

    // Bóc tách Lời giải / Hướng dẫn giải
    let explanation = ''
    const expMatch = fullBlock.match(/(?:Lời\s*giải(?:\s*chi\s*tiết)?|Giải\s*thích|Hướng\s*dẫn\s*giải|Explanation)\s*[\:\-]\s*([\s\S]*?)$/i)
    if (expMatch) {
      explanation = expMatch[1].trim()
    }

    // Bóc tách Đáp án đúng đi kèm trong câu
    let detectedCorrectLetter = answerKeyMap.get(rawQ.num) || ''
    const ansInlineMatch = fullBlock.match(/(?:Đáp\s*án(?:\s*đúng)?|Key|Ans|Correct)\s*[\:\-\=\.]\s*([A-D])\b/i)
    if (ansInlineMatch) {
      detectedCorrectLetter = ansInlineMatch[1].toUpperCase()
    }

    // Giới hạn vùng tìm options: Trước phần Đáp án hoặc Lời giải
    const stopIndexMatch = fullBlock.search(/(?:^|[\s\t\n])(?:Đáp\s*án|Key|Ans|Correct|Lời\s*giải|Giải\s*thích|Explanation)\s*[\:\-\=\.]/i)
    const optionsSearchBlock = stopIndexMatch !== -1 ? fullBlock.substring(0, stopIndexMatch) : fullBlock

    // Tìm các vị trí xuất hiện của marker phương án: A., B., C., D. (hoặc A), (A), [A], A/...)
    const markerRegex = /(?:^|[\s\t\r\n])(?:\*|\()?([A-D])[\.\)\:\/\-\]]\s+/gi
    const markers: { letter: string; isStarred: boolean; matchIndex: number; textStart: number }[] = []

    let m: RegExpExecArray | null
    while ((m = markerRegex.exec(optionsSearchBlock)) !== null) {
      markers.push({
        letter: m[1].toUpperCase(),
        isStarred: m[0].includes('*'),
        matchIndex: m.index,
        textStart: m.index + m[0].length
      })
    }

    let questionText = ''
    const optionMap: { [key: string]: string } = {}

    if (markers.length > 0) {
      questionText = optionsSearchBlock.substring(0, markers[0].matchIndex).trim()

      for (let i = 0; i < markers.length; i++) {
        const cur = markers[i]
        const nextStart = (i + 1 < markers.length) ? markers[i + 1].matchIndex : optionsSearchBlock.length
        const optText = optionsSearchBlock.substring(cur.textStart, nextStart).trim().replace(/\n+/g, ' ')
        optionMap[cur.letter] = optText
        if (cur.isStarred) {
          detectedCorrectLetter = cur.letter
        }
      }
    } else {
      questionText = optionsSearchBlock.trim()
    }

    // Làm sạch questionText
    questionText = questionText
      .replace(/^(?:Câu|Question|Bài)\s*\d+[\.\:\/\s\-]+/i, '')
      .trim()

    // Danh sách 4 phương án A, B, C, D
    const letters = ['A', 'B', 'C', 'D']
    const options: ParsedOption[] = letters.map((letter, oIdx) => {
      const optText = optionMap[letter] || ''
      const isCorrect = detectedCorrectLetter === letter

      return {
        text: optText,
        isCorrect,
        order: oIdx,
      }
    })

    const validOptions = options.filter(o => o.text.trim().length > 0)
    const finalOptions = validOptions.length >= 2 ? validOptions : [
      { text: optionMap['A'] || 'Lựa chọn A', isCorrect: detectedCorrectLetter === 'A', order: 0 },
      { text: optionMap['B'] || 'Lựa chọn B', isCorrect: detectedCorrectLetter === 'B', order: 1 },
      { text: optionMap['C'] || 'Lựa chọn C', isCorrect: detectedCorrectLetter === 'C', order: 2 },
      { text: optionMap['D'] || 'Lựa chọn D', isCorrect: detectedCorrectLetter === 'D', order: 3 },
    ]

    // Nếu chưa có đáp án đúng, tạm chọn phương án đầu tiên
    if (!finalOptions.some(o => o.isCorrect)) {
      finalOptions[0].isCorrect = true
    }

    // Phỏng đoán kỹ năng
    let skill: 'READING' | 'LISTENING' | 'GRAMMAR' | 'VOCABULARY' | 'WRITING' = 'READING'
    const lowerQ = questionText.toLowerCase()
    if (lowerQ.includes('pronunciation') || lowerQ.includes('stress') || lowerQ.includes('underlined part') || lowerQ.includes('closest in meaning') || lowerQ.includes('opposite in meaning')) {
      skill = 'VOCABULARY'
    } else if (lowerQ.includes('listen') || lowerQ.includes('audio') || lowerQ.includes('conversation')) {
      skill = 'LISTENING'
    } else if (lowerQ.includes('grammatical') || lowerQ.includes('tense') || lowerQ.includes('clause') || lowerQ.includes('fill in the blank')) {
      skill = 'GRAMMAR'
    }

    questions.push({
      order: idx + 1,
      skill,
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      points: 1,
      text: questionText || `Câu hỏi số ${idx + 1}`,
      options: finalOptions,
      explanation: explanation || undefined,
    })
  }

  return questions
}
