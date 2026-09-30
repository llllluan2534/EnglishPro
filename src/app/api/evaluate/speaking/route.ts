import { NextResponse } from 'next/server'

// Evaluates an audio file against a target text using Groq Whisper API
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob
    const targetText = formData.get('targetText') as string

    if (!audioFile || !targetText) {
      return NextResponse.json({ error: 'Missing audio or target text' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key is not configured' }, { status: 500 })
    }

    // Prepare FormData for Groq API
    const groqData = new FormData()
    groqData.append('file', audioFile, 'audio.webm')
    groqData.append('model', 'whisper-large-v3-turbo')
    groqData.append('response_format', 'json')
    groqData.append('language', 'en')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: groqData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API Error:', errorText)
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
    }

    const data = await response.json()
    const transcript = data.text || ''

    // Basic scoring based on word matching
    const cleanTarget = targetText.toLowerCase().replace(/[^\w\s]/gi, '')
    const cleanTranscript = transcript.toLowerCase().replace(/[^\w\s]/gi, '')
    
    const targetWords = cleanTarget.split(/\s+/)
    const transcriptWords = cleanTranscript.split(/\s+/)
    
    let matches = 0
    const originalWords = targetText.split(/\s+/)
    const wordResults = originalWords.map(originalWord => {
      const cleanWord = originalWord.toLowerCase().replace(/[^\w\s]/gi, '')
      // Bỏ qua nếu là khoảng trắng rỗng (do nhiều dấu cách)
      if (!cleanWord) return { word: originalWord, isCorrect: true } 
      const isCorrect = transcriptWords.includes(cleanWord)
      if (isCorrect) matches++
      return { word: originalWord, isCorrect }
    })
    
    // Calculate total valid target words
    const validTargetWordsCount = originalWords.filter(w => w.toLowerCase().replace(/[^\w\s]/gi, '')).length

    const rawScore = validTargetWordsCount > 0 ? Math.round((matches / validTargetWordsCount) * 100) : 0
    // Adjust score to not be too harsh if they captured the gist
    const pronunciationScore = Math.min(100, rawScore + 10)

    let feedback = 'Excellent pronunciation!'
    if (pronunciationScore < 50) feedback = 'Please try speaking louder and clearer.'
    else if (pronunciationScore < 80) feedback = 'Good effort, but some words were missed.'

    return NextResponse.json({
      transcript,
      pronunciationScore,
      feedback,
      wordResults
    })

  } catch (error) {
    console.error('Speaking eval error:', error)
    return NextResponse.json({ error: 'Failed to evaluate speaking' }, { status: 500 })
  }
}
