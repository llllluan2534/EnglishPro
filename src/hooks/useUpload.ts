'use client'

import { useCallback, type ChangeEvent } from 'react'
import { type UploadFolder } from '@/lib/r2'

type UseUploadReturn = {
  upload: (file: File, folder?: UploadFolder) => Promise<string>
}

/**
 * Hook tiện ích để upload file lên R2 qua pre-signed URL.
 * Trả về public URL của file sau khi upload.
 */
export function useUpload(): UseUploadReturn {
  const upload = useCallback(async (file: File, folder: UploadFolder = 'images'): Promise<string> => {
    // 1. Lấy pre-signed URL từ API của mình
    const presignRes = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, mimeType: file.type, folder }),
    })

    if (!presignRes.ok) {
      const { error } = await presignRes.json()
      throw new Error(error ?? 'Không thể tạo URL upload')
    }

    const { presignedUrl, publicUrl } = await presignRes.json() as {
      presignedUrl: string
      publicUrl: string
      key: string
    }

    // 2. Upload trực tiếp lên R2 bằng pre-signed URL (không qua server của mình)
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadRes.ok) {
      throw new Error('Upload lên cloud thất bại')
    }

    return publicUrl
  }, [])

  return { upload }
}
