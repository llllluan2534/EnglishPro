# BÁO CÁO SCAN TIẾN ĐỘ VÀ CÁC NỘI DUNG CÒN THIẾU

Chào ông, tui đã scan toàn bộ codebase của dự án **EnglishPro** và so sánh với @[ANTIGRAVITY-MASTER-PLAN.md]. Dưới đây là danh sách các phần còn thiếu hoặc đang để trống (placeholder), tui liệt kê thành các "issue" để mình dễ theo dõi và xử lý.

---

## 🛑 1. CRITICAL BUG: Lỗi Auth 404 (Cần ưu tiên xử lý)
- **Hiện tượng:** Truy cập `/api/auth/session` trả về 404, dẫn đến lỗi `ClientFetchError` trên trình duyệt.
- **Nguyên nhân dự kiến:** Route handler `api/auth/[...nextauth]/route.ts` chưa xử lý đúng hoặc do version NextAuth v5 cấu hình chưa khớp với middleware (`proxy.ts`).
- **Nhiệm vụ:** Fix lại route handler và cấu hình `AUTH_TRUST_HOST`, `AUTH_URL` trong `.env`.

---

## 🛠️ 2. PHASE 1 - FOUNDATION & MVP (Cần hoàn thiện)

### [ISSUE #1] Hoàn thiện Logic Gamification
- **File:** `src/lib/gamification.ts` (Hiện đang trống).
- **Yêu cầu:** 
  - Cài đặt logic tính XP theo hành động (Flashcard đúng, Hoàn thành bài học, Thi đạt...).
  - Cài đặt công thức tính Level: `level = floor(sqrt(totalXP / 50))`.
  - Logic cấp phát huy hiệu (Badge logic).

### [ISSUE #2] API Cập nhật Trạng thái Học tập
- **File:** `src/app/api/progress/route.ts` (Cần kiểm tra/hoàn thiện).
- **Yêu cầu:** API lưu tiến độ bài học (`LessonProgress`) và cộng XP mỗi khi hoàn thành.

---

## 🏗️ 3. PHASE 2 - CMS (TEACHER) & KIỂM TRA (Hầu hết đang trống)

### [ISSUE #3] Dashboard Giáo viên
- **File:** `src/app/(teacher)/teacher/dashboard/page.tsx` (Hiện đang trống).
- **Yêu cầu:** Hiển thị thống kê lớp học, số bài học đã tạo, số câu hỏi trong ngân hàng.

### [ISSUE #4] Hệ thống CMS & Rich Text Editor
- **Component:** `src/components/cms/RichTextEditor.tsx` (Chưa có).
- **Yêu cầu:** Tích hợp **TipTap Editor** để giáo viên soạn nội dung bài học phong phú.

### [ISSUE #5] Question Builder & Exam Template
- **Component:** `src/components/cms/QuestionBuilder.tsx`, `ExamBuilder.tsx` (Chưa có).
- **Yêu cầu:** UI cho phép giáo viên tạo câu hỏi theo nhiều format (Multiple Choice, Fill in Blank...) và kéo thả vào đề thi.

---

## 🎙️ 4. PHASE 3 - MEDIA & AI ASSISTANT

### [ISSUE #6] Tích hợp OpenAI Whisper (Speech Assessment)
- **File:** `src/lib/whisper.ts` (Hiện đang trống).
- **API:** `src/app/api/speech/assess/route.ts` (Chưa có).
- **Yêu cầu:** Nhận audio blob → gửi OpenAI Whisper → so sánh text → trả về điểm phát âm.

### [ISSUE #7] Media Storage (Cloudflare R2)
- **File:** `src/lib/r2.ts` (Mới chỉ có khung, cần hoàn thiện logic upload/delete).
- **Yêu cầu:** Xử lý upload audio luyện listening và ảnh cho flashcards.

---

## 📊 5. PHASE 4 - ANALYTICS & ADMIN

### [ISSUE #8] Dashboard Admin & Quản lý User
- **Folder:** `src/app/(admin)/` (Hầu hết các file `page.tsx` đang trống).
- **Yêu cầu:**
  - Trang CRUD người dùng.
  - Trang duyệt nội dung từ giáo viên.
  - Báo cáo tổng thể hệ thống (sử dụng Recharts).

---

## 📝 TỔNG KẾT
Hiện tại dự án đã có bộ khung UI cho Student khá tốt, nhưng **Logic Backend (lib)** và **Module CMS (Teacher/Admin)** hầu như chưa được triển khai code bên trong. 

> [!TIP]
> Tui đề xuất mình xử lý dứt điểm **Lỗi Auth 404** trước, sau đó tui sẽ bắt đầu coding **Logic Gamification (#1)** và **CMS (#4, #5)**. Ông muốn tui làm cái nào trước?
