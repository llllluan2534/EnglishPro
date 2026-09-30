import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { answerText, instruction } = await req.json()

    if (!answerText) {
      return NextResponse.json({ error: 'Missing answer text' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key is not configured' }, { status: 500 })
    }

    // Call Groq Llama 3 for evaluation
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert English teacher. Evaluate the student's short essay.
Instructions for the essay: "${instruction || 'Write a short paragraph in English.'}"
Evaluate based on Grammar, Vocabulary, and Task Fulfillment.
Respond STRICTLY in JSON format matching exactly this structure:
{
  "score": <number 0-100>,
  "feedback": "<General encouraging feedback in Vietnamese>",
  "corrections": [
    { "original": "<wrong word/phrase>", "suggestion": "<correct word/phrase>", "explanation": "<short explanation in Vietnamese>" }
  ]
}`
          },
          {
            role: 'user',
            content: `Student's essay:\n\n${answerText}`
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API Error:', errorText)
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('Empty AI response')
    }

    const parsed = JSON.parse(content)

    return NextResponse.json({
      score: parsed.score || 0,
      feedback: parsed.feedback || "Bài viết được ghi nhận.",
      corrections: parsed.corrections || []
    })

  } catch (error) {
    console.error('Writing eval error:', error)
    return NextResponse.json({ error: 'Failed to evaluate writing' }, { status: 500 })
  }
}
