import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl, type UploadFolder } from '@/lib/r2'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_SIZE_MB = { images: 5, audio: 50, video: 500 }

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { fileName, mimeType, folder } = await req.json() as {
    fileName: string
    mimeType: string
    folder: UploadFolder
  }

  if (!fileName || !mimeType || !folder) {
    return NextResponse.json({ error: 'Thiếu thông tin file' }, { status: 400 })
  }

  // Validate mime type theo folder
  const allowedTypes: Record<UploadFolder, string[]> = {
    images: ALLOWED_IMAGE_TYPES,
    audio: ALLOWED_AUDIO_TYPES,
    video: ALLOWED_VIDEO_TYPES,
  }

  if (!allowedTypes[folder]?.includes(mimeType)) {
    return NextResponse.json(
      { error: `Loại file "${mimeType}" không được phép trong thư mục "${folder}"` },
      { status: 400 }
    )
  }

  try {
    const result = await getPresignedUploadUrl(fileName, mimeType, folder)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[R2_PRESIGN_ERROR]', err?.message ?? err)

    // Giúp GV biết rõ nguyên nhân thay vì "Failed to fetch" mù quáng
    const isConfigError =
      err?.message?.includes('chưa được cấu hình') ||
      err?.message?.includes('Thiếu biến môi trường')

    return NextResponse.json(
      {
        error: isConfigError
          ? '⚙️ R2 Storage chưa được cấu hình. Hãy điền các biến R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY thật vào file .env'
          : 'Không thể tạo URL upload. Vui lòng thử lại.'
      },
      { status: isConfigError ? 503 : 500 }
    )
  }
}
